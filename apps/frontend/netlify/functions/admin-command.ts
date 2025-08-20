import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import crypto from 'crypto';

const SENSITIVE_ACTIONS = new Set([
  'ScrapeGovernance',
  'ClearCache',
  'ResetRateLimits',
  'AddBalance',
  'AdjustBalance',
]);

const ADMIN_HMAC_SECRET = process.env.ADMIN_HMAC_SECRET;

interface AdminCommandRequest {
  action: string;
  data?: any;
  tags?: Record<string, string>;
}

interface AdminCommandResponse {
  ok: boolean;
  data?: any;
  error?: string;
}

/**
 * Verify admin authorization for sensitive actions
 * Uses HMAC-SHA256 with timestamp to prevent replay attacks
 */
function isAdminAuthorized(req: any, action: string): boolean {
  // If not a sensitive action, allow
  if (!SENSITIVE_ACTIONS.has(action)) return true;

  // If no HMAC secret configured, allow in development
  if (!ADMIN_HMAC_SECRET) {
    console.warn(
      'ADMIN_HMAC_SECRET not configured - allowing sensitive actions in development'
    );
    return true;
  }

  const sig = req.headers['x-admin-sig'];
  const ts = req.headers['x-admin-ts'];

  if (!sig || !ts) {
    console.warn(
      'Missing admin signature headers for sensitive action:',
      action
    );
    return false;
  }

  // Verify timestamp is recent (within 5 minutes)
  const timestamp = parseInt(ts as string, 10);
  const now = Date.now();
  if (isNaN(timestamp) || Math.abs(now - timestamp) > 5 * 60 * 1000) {
    console.warn('Admin signature timestamp expired or invalid');
    return false;
  }

  // Verify HMAC
  const payload = `${action}:${ts}`;
  const expected = crypto
    .createHmac('sha256', ADMIN_HMAC_SECRET)
    .update(payload)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(sig as string, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch (error) {
    console.warn('HMAC verification failed:', error);
    return false;
  }
}

/**
 * Generate HMAC signature for admin action
 */
function generateAdminSignature(action: string): { sig: string; ts: string } {
  if (!ADMIN_HMAC_SECRET) {
    throw new Error('ADMIN_HMAC_SECRET not configured');
  }

  const ts = Date.now().toString();
  const payload = `${action}:${ts}`;
  const sig = crypto
    .createHmac('sha256', ADMIN_HMAC_SECRET)
    .update(payload)
    .digest('hex');

  return { sig, ts };
}

// Mock Express-like request/response for serverless environment
function createMockExpress(req: HandlerEvent): any {
  return {
    body: req.body,
    method: req.httpMethod,
    headers: req.headers,
  };
}

function createMockResponse(): any {
  let statusCode = 200;
  let responseBody: any = null;
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  return {
    status: (code: number) => ({
      json: (data: any) => {
        statusCode = code;
        responseBody = data;
      },
    }),
    json: (data: any) => {
      statusCode = 200;
      responseBody = data;
    },
    getResponse: () => ({
      statusCode,
      body: JSON.stringify(responseBody),
      headers,
    }),
  };
}

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        ok: false,
        error: 'Method not allowed',
      }),
    };
  }

  try {
    const { action, data, tags } = JSON.parse(
      event.body || '{}'
    ) as AdminCommandRequest;

    // Validate required fields
    if (!action) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          ok: false,
          error: 'Missing action in request body',
        }),
      };
    }

    // Check if action is sensitive
    if (!SENSITIVE_ACTIONS.has(action)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          ok: false,
          error: `Action '${action}' is not a sensitive action`,
        }),
      };
    }

    // Generate admin signature
    let adminHeaders: Record<string, string> = {};
    try {
      const { sig, ts } = generateAdminSignature(action);
      adminHeaders = {
        'x-admin-sig': sig,
        'x-admin-ts': ts,
      };
    } catch (error) {
      console.error('Failed to generate admin signature:', error);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          ok: false,
          error: 'Failed to generate admin signature',
        }),
      };
    }

    // Forward to AO bridge with admin headers
    const aoPayload = {
      Target: process.env.AO_TARGET_ID,
      Action: action,
      Data: data ? JSON.stringify(data) : undefined,
      Tags: tags,
    };

    const response = await fetch(process.env.AO_RELAY_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...adminHeaders,
        ...(process.env.AO_API_KEY
          ? { Authorization: `Bearer ${process.env.AO_API_KEY}` }
          : {}),
      },
      body: JSON.stringify(aoPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AO relay error:', response.status, errorText);
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          ok: false,
          error: `AO relay error: ${response.status} ${response.statusText}`,
        }),
      };
    }

    const aoResponse = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        ok: true,
        data: aoResponse,
      }),
    };
  } catch (error: any) {
    console.error('Admin command error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        ok: false,
        error: error?.message ?? 'Internal server error',
      }),
    };
  }
};
