import type { Request, Response } from 'express';
import crypto from 'crypto';

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
 * Generate HMAC signature for admin actions
 */
function generateAdminSignature(action: string): { sig: string; ts: string } {
  if (!ADMIN_HMAC_SECRET) {
    throw new Error('ADMIN_HMAC_SECRET not configured');
  }

  const timestamp = Date.now().toString();
  const payload = `${action}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', ADMIN_HMAC_SECRET)
    .update(payload)
    .digest('hex');

  return { sig: signature, ts: timestamp };
}

/**
 * Admin command endpoint that forwards requests to AO bridge with HMAC auth
 */
export async function adminCommand(req: Request, res: Response): Promise<void> {
  try {
    const { action, data, tags } = req.body as AdminCommandRequest;

    // Validate required fields
    if (!action) {
      return res.status(400).json({
        ok: false,
        error: 'Missing action in request body',
      } as AdminCommandResponse);
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
      return res.status(500).json({
        ok: false,
        error: 'Admin authentication not configured',
      } as AdminCommandResponse);
    }

    // Forward to AO bridge with admin headers
    const aoRequest = {
      Target: process.env.VITE_AO_TARGET_ID || 'default-target',
      Action: action,
      Data: data ? JSON.stringify(data) : undefined,
      Tags: tags,
    };

    const response = await fetch(
      `${req.protocol}://${req.get('host')}/api/ao`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...adminHeaders,
        },
        body: JSON.stringify(aoRequest),
      }
    );

    const result = await response.json();

    // Forward the response
    res.status(response.status).json(result);
  } catch (error: any) {
    console.error('Admin command error:', error);
    res.status(500).json({
      ok: false,
      error: error?.message ?? 'Internal server error',
    } as AdminCommandResponse);
  }
}

export default adminCommand;
