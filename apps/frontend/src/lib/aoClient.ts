/**
 * AO Client Hooks for Genie Proposal Summarizer
 * React Query + Arweave Wallet Kit integration
 * - Robust READ handler (supports dryrun Output + empty Messages)
 * - Robust MUTATION handler (supports Output + Error + Messages)
 * - Optional polling helper for late CU results
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  dryrun,
  message,
  result,
  // Newer aoconnect versions export createSigner; older only have createDataItemSigner
  // @ts-ignore - guarded at runtime
  createSigner as _createSigner,
  createDataItemSigner,
} from '@permaweb/aoconnect';
import { GENIE_PROCESS } from '@/constants/genie_process';
import { toast } from '@/lib/toast';

// Note: arweaveWallet is declared elsewhere in the project

// -----------------------------------------------------------------------------
// Query Keys
// -----------------------------------------------------------------------------
export const QUERY_KEYS = {
  proposals: ['proposals'],
  proposal: (id: string) => ['proposal', id],
  platforms: ['governance-platforms'],
  subscribers: ['subscribers'],
  balances: ['balances'],
  errors: ['error-logs'],
  systemInfo: ['system-info'],
} as const;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
interface ProposalData {
  title: string;
  description: string;
  platformId: string;
  [key: string]: any;
}

interface PlatformData {
  name: string;
  url: string;
  apiEndpoint?: string;
  [key: string]: any;
}

interface SubscriberData {
  type: string;
  active?: boolean;
  webhook_url?: string; // Discord
  bot_token?: string; // Telegram
  chat_id?: string; // Telegram
  [key: string]: any;
}

type AOBaseResult = {
  Messages?: any[];
  Spawns?: any[];
  Output?: string | null;
  Error?: string | null;
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function getSigner(wallet: any) {
  const hasCreateSigner = typeof _createSigner === 'function';
  return hasCreateSigner ? _createSigner(wallet) : createDataItemSigner(wallet);
}

/**
 * Send a message to the AO process and wait for result
 */
export async function aoSend<T = any>(
  action: string,
  data?: any,
  tags?: Array<{ name: string; value: string }>
): Promise<T> {
  try {
    // Get wallet from window.arweaveWallet
    const wallet = (window as any).arweaveWallet;
    if (!wallet) {
      throw new Error('Arweave wallet not connected');
    }

    const signer = getSigner(wallet);

    // Prepare tags - filter out tags without values
    const messageTags = [
      { name: 'Action', value: action },
      ...(tags || []).filter(tag => tag.value !== undefined),
    ];

    // Send message
    const messageId = await message({
      process: GENIE_PROCESS,
      tags: messageTags,
      data: data ? JSON.stringify(data) : undefined,
      signer,
    });

    // Wait for result
    const result = await waitForResult({
      process: GENIE_PROCESS,
      message: messageId,
    });

    // Parse response
    if (result.Error) {
      throw new Error(result.Error);
    }

    // Try to parse Output as JSON, fallback to raw Output
    if (result.Output) {
      try {
        return JSON.parse(result.Output);
      } catch {
        return result.Output as T;
      }
    }

    // Fallback to Messages data
    if (result.Messages && result.Messages.length > 0) {
      const lastMessage = result.Messages[result.Messages.length - 1];
      if (lastMessage.Data) {
        try {
          return JSON.parse(lastMessage.Data);
        } catch {
          return lastMessage.Data as T;
        }
      }
    }

    return result as T;
  } catch (error) {
    console.error(`aoSend error for action ${action}:`, error);
    throw error;
  }
}

/**
 * Send an admin message to the AO process and wait for result
 */
export async function aoSendAdmin<T = any>(
  action: string,
  data?: any,
  tags?: Array<{ name: string; value: string }>
): Promise<T> {
  try {
    // Get wallet from window.arweaveWallet
    const wallet = (window as any).arweaveWallet;
    if (!wallet) {
      throw new Error('Arweave wallet not connected');
    }

    const signer = getSigner(wallet);

    // Prepare tags with admin flag - filter out tags without values
    const messageTags = [
      { name: 'Action', value: action },
      { name: 'Admin', value: 'true' },
      ...(tags || []).filter(tag => tag.value !== undefined),
    ];

    // Send message
    const messageId = await message({
      process: GENIE_PROCESS,
      tags: messageTags,
      data: data ? JSON.stringify(data) : undefined,
      signer,
    });

    // Wait for result
    const result = await waitForResult({
      process: GENIE_PROCESS,
      message: messageId,
    });

    // Parse response
    if (result.Error) {
      throw new Error(result.Error);
    }

    // Try to parse Output as JSON, fallback to raw Output
    if (result.Output) {
      try {
        return JSON.parse(result.Output);
      } catch {
        return result.Output as T;
      }
    }

    // Fallback to Messages data
    if (result.Messages && result.Messages.length > 0) {
      const lastMessage = result.Messages[result.Messages.length - 1];
      if (lastMessage.Data) {
        try {
          return JSON.parse(lastMessage.Data);
        } catch {
          return lastMessage.Data as T;
        }
      }
    }

    return result as T;
  } catch (error) {
    console.error(`aoSendAdmin error for action ${action}:`, error);
    throw error;
  }
}

function parseJsonIfPossible<T = any>(val: any): T | string {
  if (typeof val !== 'string') return val as T;
  try {
    return JSON.parse(val) as T;
  } catch {
    return val; // keep as plain text
  }
}

/**
 * Robust READ response handler for dryrun()
 * - Honors explicit Error
 * - Prefers Output if present (JSON or plain)
 * - Falls back to Messages (expectedAction match → last message → tags)
 */
function handleAOReadResponse(res: AOBaseResult, expectedAction?: string): any {
  if (!res) throw new Error('Empty response from AO');

  // 1) Explicit error field
  if (res.Error && String(res.Error).trim()) {
    throw new Error(
      typeof res.Error === 'string' ? res.Error : JSON.stringify(res.Error)
    );
  }

  // 2) Prefer Output if present (common for some CUs)
  if (res.Output && String(res.Output).trim()) {
    return parseJsonIfPossible(res.Output);
  }

  // 3) Inspect Messages
  const messages = res.Messages ?? [];
  if (messages.length === 0) {
    // No Output and no Messages
    throw new Error('No messages in response');
  }

  // Any Error tag?
  const errMsg = messages.find(m =>
    m?.Tags?.some((t: any) => t.name === 'Error' && t.value)
  );
  if (errMsg) {
    const tag = errMsg.Tags.find((t: any) => t.name === 'Error');
    throw new Error(tag?.value || 'Operation failed');
  }

  // Match expectedAction first
  if (expectedAction) {
    const byAction = messages.find(m =>
      m?.Tags?.some(
        (t: any) => t.name === 'Action' && t.value === expectedAction
      )
    );
    if (byAction) {
      if (byAction.Data) return parseJsonIfPossible(byAction.Data);
      const obj: Record<string, string> = {};
      byAction.Tags?.forEach((t: any) => {
        if (t.name !== 'Action') obj[t.name] = t.value;
      });
      if (Object.keys(obj).length) return obj;
    }
  }

  // Fallback to last message
  const last = messages[messages.length - 1];
  if (last?.Data) return parseJsonIfPossible(last.Data);

  // tags → object
  const tagObj: Record<string, string> = {};
  last?.Tags?.forEach((t: any) => {
    if (t.name !== 'Action') tagObj[t.name] = t.value;
  });
  if (Object.keys(tagObj).length) return tagObj;

  throw new Error('No parseable data in AO response');
}

/**
 * Robust MUTATION handler for result()
 * - Supports Output, Error, Messages
 */
function handleAOMutationResponse(res: AOBaseResult): any {
  const messages = res?.Messages ?? [];
  const output = res?.Output ?? null;
  const error = res?.Error ?? null;

  // 1) Explicit error field
  if (error && String(error).trim()) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }

  // 2) Prefer Output when present
  if (output && String(output).trim()) {
    try {
      return JSON.parse(output);
    } catch {
      const okHints = [
        'success',
        'ok',
        'queued',
        'added',
        'updated',
        'deleted',
        'done',
        'accepted',
      ];
      const errHints = ['error', 'fail', 'invalid', 'denied'];
      const outLc = String(output).toLowerCase();
      if (okHints.some(h => outLc.includes(h))) return output;
      if (errHints.some(h => outLc.includes(h))) throw new Error(output);
      return output; // neutral text
    }
  }

  // 3) Inspect Messages
  if (messages.length > 0) {
    const errMsg = messages.find((m: any) =>
      m?.Tags?.some((t: any) => t.name === 'Error' && t.value)
    );
    if (errMsg) {
      const tag = errMsg.Tags.find((t: any) => t.name === 'Error');
      throw new Error(tag?.value || 'Operation failed');
    }

    const last = messages[messages.length - 1];

    if (last?.Data) {
      try {
        return JSON.parse(last.Data);
      } catch {
        return last.Data;
      }
    }

    // If Action indicates success, accept the message
    const actionTag = last?.Tags?.find((t: any) => t.name === 'Action');
    if (actionTag?.value) {
      const okHints = [
        'Success',
        'Response',
        'Queued',
        'Added',
        'Updated',
        'Deleted',
      ];
      if (okHints.some(h => actionTag.value.includes(h))) return last;
    }

    // tags → object fallback
    const tagObj: Record<string, string> = {};
    last?.Tags?.forEach((t: any) => {
      if (t.name !== 'Action') tagObj[t.name] = t.value;
    });
    if (Object.keys(tagObj).length) return tagObj;
  }

  throw new Error('No valid response received from AO process');
}

/** Enhanced error normalization used across queries/mutations */
function handleAOError(error: any, operation?: string): never {
  console.error(`AO Error ${operation ? `for ${operation}` : ''}:`, error);

  let message = 'An error occurred';

  if (error?.message) {
    const errorMsg = String(error.message).toLowerCase();
    if (errorMsg.includes('cors')) {
      message = 'Network access blocked. Please check your connection.';
    } else if (errorMsg.includes('wallet')) {
      message = 'Please connect your Arweave wallet first.';
    } else if (errorMsg.includes('timeout')) {
      message = 'Request timed out. Please try again.';
    } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
      message = 'Network error. Please check your connection.';
    } else {
      message = error.message;
    }
  }

  throw new Error(message);
}

/** Poll result() until Output/Messages/Error available or timeout */
async function waitForResult(
  params: { process: string; message: string },
  opts: { maxMs?: number; intervalMs?: number } = {}
): Promise<AOBaseResult> {
  const maxMs = opts.maxMs ?? 15000;
  const intervalMs = opts.intervalMs ?? 500;
  const start = Date.now();

  while (true) {
    const r = (await result(params)) as AOBaseResult;
    const has =
      (r?.Messages && r.Messages.length > 0) ||
      (r?.Output && String(r.Output).trim()) ||
      (r?.Error && String(r.Error).trim());

    if (has) return r;
    if (Date.now() - start > maxMs) return r; // return best-effort
    await new Promise(res => setTimeout(res, intervalMs));
  }
}

// -----------------------------------------------------------------------------
// READ HOOKS (dryrun)
// -----------------------------------------------------------------------------
export function useProposals() {
  return useQuery({
    queryKey: QUERY_KEYS.proposals,
    queryFn: async () => {
      try {
        const dryrunResult = await dryrun({
          process: GENIE_PROCESS,
          tags: [{ name: 'Action', value: 'GetAllProposals' }],
        });

        console.log('GetAllProposals dryrun:', dryrunResult);

        const data = handleAOReadResponse(
          dryrunResult as AOBaseResult,
          'GetAllProposals-Response'
        );

        console.log('useProposals - raw data:', data);
        console.log('useProposals - data type:', typeof data);
        console.log('useProposals - isArray(data):', Array.isArray(data));
        console.log('useProposals - data.Proposals:', (data as any)?.Proposals);
        console.log(
          'useProposals - isArray(data.Proposals):',
          Array.isArray((data as any)?.Proposals)
        );

        // Handle case where AO returns terminal prompt instead of data
        if (
          data &&
          typeof data === 'object' &&
          data.prompt &&
          data.data === ''
        ) {
          console.log(
            'useProposals - AO returned terminal prompt, returning empty array'
          );
          return [];
        }

        let result;
        if (Array.isArray((data as any)?.Proposals)) {
          result = (data as any).Proposals;
        } else if (Array.isArray(data)) {
          result = data;
        } else {
          result = [];
        }

        console.log('useProposals - final result:', result);
        console.log('useProposals - result type:', typeof result);
        console.log('useProposals - isArray(result):', Array.isArray(result));

        return result;
      } catch (error) {
        handleAOError(error, 'fetching proposals');
      }
    },
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useProposal(proposalId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.proposal(proposalId),
    queryFn: async () => {
      try {
        const dryrunResult = await dryrun({
          process: GENIE_PROCESS,
          tags: [
            { name: 'Action', value: 'GetProposal' },
            { name: 'ProposalId', value: proposalId },
          ],
        });

        console.log('GetProposal dryrun:', dryrunResult);

        const data = handleAOReadResponse(
          dryrunResult as AOBaseResult,
          'GetProposal-Response'
        );
        return data ?? null;
      } catch (error) {
        handleAOError(error, 'fetching proposal');
      }
    },
    enabled: !!proposalId,
    staleTime: 60000,
  });
}

export function useGovernancePlatforms() {
  return useQuery({
    queryKey: QUERY_KEYS.platforms,
    queryFn: async () => {
      try {
        const dryrunResult = await dryrun({
          process: GENIE_PROCESS,
          tags: [{ name: 'Action', value: 'GetGovernancePlatforms' }],
        });

        console.log('GetGovernancePlatforms dryrun:', dryrunResult);

        const data = handleAOReadResponse(
          dryrunResult as AOBaseResult,
          'GetGovernancePlatforms-Response'
        );

        // Handle case where AO returns terminal prompt instead of data
        if (
          data &&
          typeof data === 'object' &&
          data.prompt &&
          data.data === ''
        ) {
          console.log(
            'useGovernancePlatforms - AO returned terminal prompt, returning empty array'
          );
          return [];
        }

        if (Array.isArray((data as any)?.Platforms))
          return (data as any).Platforms;
        if (Array.isArray(data)) return data;
        return data ?? [];
      } catch (error) {
        handleAOError(error, 'fetching platforms');
      }
    },
    staleTime: 300000,
  });
}

export function useSubscribers() {
  return useQuery({
    queryKey: QUERY_KEYS.subscribers,
    queryFn: async () => {
      try {
        const dryrunResult = await dryrun({
          process: GENIE_PROCESS,
          tags: [{ name: 'Action', value: 'GetSubscribers' }],
        });

        console.log('GetSubscribers dryrun:', dryrunResult);

        const data = handleAOReadResponse(
          dryrunResult as AOBaseResult,
          'GetSubscribers-Response'
        );

        // Handle case where AO returns terminal prompt instead of data
        if (
          data &&
          typeof data === 'object' &&
          data.prompt &&
          data.data === ''
        ) {
          console.log(
            'useSubscribers - AO returned terminal prompt, returning empty array'
          );
          return [];
        }

        if (Array.isArray((data as any)?.Subscribers))
          return (data as any).Subscribers;
        if (Array.isArray(data)) return data;
        return data ?? [];
      } catch (error) {
        handleAOError(error, 'fetching subscribers');
      }
    },
    staleTime: 120000,
  });
}

export function useBalances() {
  return useQuery({
    queryKey: QUERY_KEYS.balances,
    queryFn: async () => {
      try {
        const dryrunResult = await dryrun({
          process: GENIE_PROCESS,
          tags: [{ name: 'Action', value: 'GetAllBalances' }],
        });

        console.log('GetAllBalances dryrun:', dryrunResult);

        const data = handleAOReadResponse(
          dryrunResult as AOBaseResult,
          'GetAllBalances-Response'
        );

        // Handle case where AO returns terminal prompt instead of data
        if (
          data &&
          typeof data === 'object' &&
          data.prompt &&
          data.data === ''
        ) {
          console.log(
            'useBalances - AO returned terminal prompt, returning empty object'
          );
          return {};
        }

        if ((data as any)?.Balances) return (data as any).Balances;
        return data ?? {};
      } catch (error) {
        handleAOError(error, 'fetching balances');
      }
    },
    staleTime: 60000,
  });
}

export function useSystemInfo() {
  return useQuery({
    queryKey: QUERY_KEYS.systemInfo,
    queryFn: async () => {
      try {
        const dryrunResult = await dryrun({
          process: GENIE_PROCESS,
          tags: [{ name: 'Action', value: 'Info' }],
        });

        console.log('Info dryrun:', dryrunResult);

        const data = handleAOReadResponse(
          dryrunResult as AOBaseResult,
          'Info-Response'
        );
        return data ?? {};
      } catch (error) {
        handleAOError(error, 'fetching system info');
      }
    },
    staleTime: 600000,
  });
}

export function useErrorLogs() {
  return useQuery({
    queryKey: QUERY_KEYS.errors,
    queryFn: async () => {
      try {
        const dryrunResult = await dryrun({
          process: GENIE_PROCESS,
          tags: [{ name: 'Action', value: 'GetErrorLogs' }],
        });

        console.log('GetErrorLogs dryrun:', dryrunResult);

        const data = handleAOReadResponse(
          dryrunResult as AOBaseResult,
          'GetErrorLogs-Response'
        );

        // Handle case where AO returns terminal prompt instead of data
        if (
          data &&
          typeof data === 'object' &&
          data.prompt &&
          data.data === ''
        ) {
          console.log(
            'useErrorLogs - AO returned terminal prompt, returning empty array'
          );
          return [];
        }

        if (Array.isArray((data as any)?.ErrorLogs))
          return (data as any).ErrorLogs;
        if (Array.isArray(data)) return data;
        return data ?? [];
      } catch (error) {
        handleAOError(error, 'fetching error logs');
      }
    },
    staleTime: 30000,
  });
}

// -----------------------------------------------------------------------------
// WRITE HOOKS (message + result)
// -----------------------------------------------------------------------------
export function useAddProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalData: ProposalData) => {
      try {
        if (!window.arweaveWallet)
          throw new Error('Arweave wallet not connected');

        const messageId = await message({
          process: GENIE_PROCESS,
          tags: [{ name: 'Action', value: 'AddProposal' }],
          data: JSON.stringify(proposalData),
          signer: getSigner(window.arweaveWallet),
        });

        console.log('AddProposal message sent, ID:', messageId);

        const messageResult = await waitForResult({
          process: GENIE_PROCESS,
          message: messageId,
        });

        console.log('AddProposal result:', messageResult);
        return handleAOMutationResponse(messageResult);
      } catch (error) {
        handleAOError(error, 'adding proposal');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals });
      toast.success('Success', 'Proposal added successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to Add Proposal', error.message);
    },
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: proposalData,
    }: {
      id: string;
      data: Partial<ProposalData>;
    }) => {
      try {
        if (!window.arweaveWallet)
          throw new Error('Arweave wallet not connected');

        const messageId = await message({
          process: GENIE_PROCESS,
          tags: [
            { name: 'Action', value: 'UpdateProposal' },
            { name: 'ProposalId', value: id },
          ],
          data: JSON.stringify(proposalData),
          signer: getSigner(window.arweaveWallet),
        });

        console.log('UpdateProposal message sent, ID:', messageId);

        const messageResult = await waitForResult({
          process: GENIE_PROCESS,
          message: messageId,
        });

        console.log('UpdateProposal result:', messageResult);
        return handleAOMutationResponse(messageResult);
      } catch (error) {
        handleAOError(error, 'updating proposal');
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.proposal(variables.id),
      });
      toast.success('Success', 'Proposal updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to Update Proposal', error.message);
    },
  });
}

export function useDeleteProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: string) => {
      try {
        if (!window.arweaveWallet)
          throw new Error('Arweave wallet not connected');

        const messageId = await message({
          process: GENIE_PROCESS,
          tags: [
            { name: 'Action', value: 'DeleteProposal' },
            { name: 'ProposalId', value: proposalId },
          ],
          signer: getSigner(window.arweaveWallet),
        });

        console.log('DeleteProposal message sent, ID:', messageId);

        const messageResult = await waitForResult({
          process: GENIE_PROCESS,
          message: messageId,
        });

        console.log('DeleteProposal result:', messageResult);
        return handleAOMutationResponse(messageResult);
      } catch (error) {
        handleAOError(error, 'deleting proposal');
      }
    },
    onSuccess: (_data, proposalId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.proposal(proposalId) });
      toast.success('Success', 'Proposal deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to Delete Proposal', error.message);
    },
  });
}

export function useAddGovernancePlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (platformData: PlatformData) => {
      try {
        if (!window.arweaveWallet)
          throw new Error('Arweave wallet not connected');

        const messageId = await message({
          process: GENIE_PROCESS,
          tags: [{ name: 'Action', value: 'AddGovernancePlatform' }],
          data: JSON.stringify(platformData),
          signer: getSigner(window.arweaveWallet),
        });

        console.log('AddGovernancePlatform message sent, ID:', messageId);

        const messageResult = await waitForResult({
          process: GENIE_PROCESS,
          message: messageId,
        });

        console.log('AddGovernancePlatform result:', messageResult);
        return handleAOMutationResponse(messageResult);
      } catch (error) {
        handleAOError(error, 'adding platform');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.platforms });
      toast.success('Success', 'Platform added successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to Add Platform', error.message);
    },
  });
}

export function useAddSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriberData: SubscriberData) => {
      try {
        if (!window.arweaveWallet)
          throw new Error('Arweave wallet not connected');

        if (!subscriberData.type)
          throw new Error('Subscriber type is required');

        const tags = [
          { name: 'Action', value: 'AddSubscriber' },
          { name: 'SubscriberType', value: subscriberData.type },
          { name: 'Subscriber-Type', value: subscriberData.type },
          { name: 'subscriber_type', value: subscriberData.type },
          { name: 'subscriberType', value: subscriberData.type },
          { name: 'SUBSCRIBER_TYPE', value: subscriberData.type },
          { name: 'Service', value: subscriberData.type },
          { name: 'Platform', value: subscriberData.type },
          {
            name: 'SubscriberActive',
            value: subscriberData.active !== false ? 'true' : 'false',
          },
          {
            name: 'Active',
            value: subscriberData.active !== false ? 'true' : 'false',
          },
        ];

        if (subscriberData.webhook_url?.trim()) {
          tags.push({
            name: 'WebhookUrl',
            value: subscriberData.webhook_url.trim(),
          });
          tags.push({
            name: 'Webhook-Url',
            value: subscriberData.webhook_url.trim(),
          });
          tags.push({
            name: 'webhook_url',
            value: subscriberData.webhook_url.trim(),
          });
        }
        if (subscriberData.bot_token?.trim()) {
          tags.push({
            name: 'BotToken',
            value: subscriberData.bot_token.trim(),
          });
          tags.push({
            name: 'bot_token',
            value: subscriberData.bot_token.trim(),
          });
        }
        if (subscriberData.chat_id?.trim()) {
          tags.push({ name: 'ChatId', value: subscriberData.chat_id.trim() });
          tags.push({ name: 'chat_id', value: subscriberData.chat_id.trim() });
        }

        const messageId = await message({
          process: GENIE_PROCESS,
          tags,
          data: JSON.stringify({
            type: subscriberData.type,
            webhook_url: subscriberData.webhook_url,
            bot_token: subscriberData.bot_token,
            chat_id: subscriberData.chat_id,
            active: subscriberData.active !== false,
          }),
          signer: getSigner(window.arweaveWallet),
        });

        console.log('AddSubscriber message sent, ID:', messageId);

        const messageResult = await waitForResult({
          process: GENIE_PROCESS,
          message: messageId,
        });

        console.log('AddSubscriber result:', messageResult);
        return handleAOMutationResponse(messageResult);
      } catch (error) {
        handleAOError(error, 'adding subscriber');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscribers });
      toast.success('Success', 'Subscriber added successfully');
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to Add Subscriber', msg);
    },
  });
}

export function useBroadcastNotification() {
  return useMutation({
    mutationFn: async (notificationData: {
      message: string;
      recipients?: string[];
    }) => {
      try {
        if (!window.arweaveWallet)
          throw new Error('Arweave wallet not connected');

        const messageId = await message({
          process: GENIE_PROCESS,
          tags: [{ name: 'Action', value: 'BroadcastNotification' }],
          data: JSON.stringify(notificationData),
          signer: getSigner(window.arweaveWallet),
        });

        console.log('BroadcastNotification message sent, ID:', messageId);

        const messageResult = await waitForResult({
          process: GENIE_PROCESS,
          message: messageId,
        });

        console.log('BroadcastNotification result:', messageResult);
        return handleAOMutationResponse(messageResult);
      } catch (error) {
        handleAOError(error, 'broadcasting notification');
      }
    },
    onSuccess: () => {
      toast.success('Success', 'Notification sent successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to Send Notification', error.message);
    },
  });
}

export function useExecuteProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: string) => {
      try {
        if (!window.arweaveWallet)
          throw new Error('Arweave wallet not connected');

        const messageId = await message({
          process: GENIE_PROCESS,
          tags: [
            { name: 'Action', value: 'ExecuteProposal' },
            { name: 'ProposalId', value: proposalId },
          ],
          signer: getSigner(window.arweaveWallet),
        });

        console.log('ExecuteProposal message sent, ID:', messageId);

        const messageResult = await waitForResult({
          process: GENIE_PROCESS,
          message: messageId,
        });

        console.log('ExecuteProposal result:', messageResult);
        return handleAOMutationResponse(messageResult);
      } catch (error) {
        handleAOError(error, 'executing proposal');
      }
    },
    onSuccess: (_data, proposalId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.proposal(proposalId),
      });
      toast.success('Success', 'Proposal executed successfully');
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to Execute Proposal', msg);
    },
  });
}

// -----------------------------------------------------------------------------
// Utility Hooks
// -----------------------------------------------------------------------------
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health-check'],
    queryFn: async () => {
      try {
        const dryrunResult = await dryrun({
          process: GENIE_PROCESS,
          tags: [{ name: 'Action', value: 'Info' }],
        });

        console.log('Health check dryrun:', dryrunResult);

        const data = handleAOReadResponse(
          dryrunResult as AOBaseResult,
          'Info-Response'
        );
        return { status: 'healthy', ...data };
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : 'Unknown error occurred';
        return { status: 'unhealthy', error: msg };
      }
    },
    refetchInterval: 60000,
    retry: false,
  });
}

export function useWalletConnection() {
  return useQuery({
    queryKey: ['wallet-connection'],
    queryFn: () => {
      return {
        connected: !!window.arweaveWallet,
        // Many wallets return address via async method; keep null unless you resolve it elsewhere
        address: window.arweaveWallet?.getActiveAddress?.() || null,
      };
    },
    refetchInterval: 5000,
  });
}
