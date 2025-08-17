import type { Request, Response } from 'express';

const REQUIRED_ENVS = ['AO_RELAY_URL'];
REQUIRED_ENVS.forEach(k => {
  if (!process.env[k]) throw new Error(`Missing ${k}`);
});

const AO_RELAY_URL = process.env.AO_RELAY_URL!;
const AO_API_KEY = process.env.AO_API_KEY; // optional

// Allowlist of permitted actions
const ALLOWLIST = new Set([
  'Info',
  'GetAllProposals',
  'GetProposal',
  'SearchProposals',
  'GetProposalsByPlatform',
  'GetGovernancePlatforms',
  'GetSubscribers',
  'BroadcastNotification',
  'AddSubscriber',
  'GetScrapingHistory',
  'GetApiRateLimits',
  'GetCachedData',
  'GetApiCallCounts',
  'GetErrorLogs',
  'ClearCache',
  'ResetRateLimits',
  'ScrapeGovernance',
  'GetAllBalances',
  'GetBalance',
  'AddBalance',
  'AdjustBalance',
]);

// Sensitive actions that may require admin auth (for step 2)
const SENSITIVE_ACTIONS = new Set([
  'ClearCache',
  'ResetRateLimits',
  'ScrapeGovernance',
  'AdjustBalance',
]);

interface AOEnvelope {
  Target: string;
  Action: string;
  Data?: string;
  Tags?: Record<string, string>;
}

interface BridgeResponse {
  ok: boolean;
  data?: any;
  error?: string;
}

export async function aoBridge(req: Request, res: Response): Promise<void> {
  try {
    const { Target, Action, Data, Tags } = req.body ?? {};

    // Validate required fields
    if (!Target || !Action) {
      return res.status(400).json({
        ok: false,
        error: 'Missing Target or Action in request body',
      } as BridgeResponse);
    }

    // Check action allowlist
    if (!ALLOWLIST.has(Action)) {
      return res.status(403).json({
        ok: false,
        error: `Action '${Action}' is not allowed`,
      } as BridgeResponse);
    }

    // TODO: Add admin auth for sensitive actions (step 2)
    // if (SENSITIVE_ACTIONS.has(Action) && !isAdmin(req)) {
    //   return res.status(401).json({
    //     ok: false,
    //     error: 'Unauthorized: Admin access required for this action'
    //   } as BridgeResponse);
    // }

    const payload: AOEnvelope = { Target, Action, Data, Tags };

    // Forward to AO relay with retries and timeout
    let lastErr: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        const response = await fetch(AO_RELAY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(AO_API_KEY ? { Authorization: `Bearer ${AO_API_KEY}` } : {}),
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(
            `Relay HTTP ${response.status}: ${response.statusText}`
          );
        }

        const json = await response.json();
        return res.json({ ok: true, data: json } as BridgeResponse);
      } catch (error) {
        lastErr = error;
        clearTimeout(timeout);

        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          break;
        }

        // Exponential backoff for retries
        if (attempt < 2) {
          await new Promise(resolve =>
            setTimeout(resolve, 300 * (attempt + 1))
          );
        }
      }
    }

    // All retries failed
    return res.status(502).json({
      ok: false,
      error: `Relay failure after 3 attempts: ${String(lastErr)}`,
    } as BridgeResponse);
  } catch (error: any) {
    console.error('AO Bridge error:', error);
    return res.status(500).json({
      ok: false,
      error: error?.message ?? 'Internal bridge error',
    } as BridgeResponse);
  }
}

// Export for different server environments
export default aoBridge;
