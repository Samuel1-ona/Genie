# ✅ AO Connect Implementation - Proper Data Sending and Receiving

## Overview

This document describes the implementation of proper AO Connect data sending and receiving using `@permaweb/aoconnect` package, following the correct pattern for AO interactions.

## 🎯 Key Changes

### 1. **Proper AO Connect Functions**

- **`dryrun()`** - For read-only operations (queries)
- **`message()`** - For state-modifying operations (mutations)
- **`result()`** - For getting message results
- **`createDataItemSigner()`** - For wallet signing

### 2. **Correct Implementation Pattern**

```typescript
// Read-only operations (queries)
const dryrunResult = await dryrun({
  process: AO_PROCESS_ID,
  tags: [{ name: 'Action', value: 'GetData' }],
  data: JSON.stringify(data),
});

// State-modifying operations (mutations)
const wallet = getWallet();
const signer = createDataItemSigner(wallet);

const messageId = await message({
  process: AO_PROCESS_ID,
  tags: [{ name: 'Action', value: 'UpdateData' }],
  data: JSON.stringify(data),
  signer,
});

const messageResult = await result({
  process: AO_PROCESS_ID,
  message: messageId,
});
```

## 📁 File Structure

```
src/
├── lib/
│   └── aoClient.ts              # ✅ Updated with proper AO Connect
├── hooks/
│   ├── useAOConnect.ts          # 🆕 New AO Connect hooks
│   └── useAOClient.ts           # Legacy hooks (backward compatible)
└── components/
    └── examples/
        └── AOConnectExample.tsx # 🆕 Example components
```

## 🔧 Implementation Details

### 1. **aoClient.ts - Core Functions**

#### `aoDryrun<T>()` - Read-only Operations

```typescript
export async function aoDryrun<T>(
  action: string,
  data?: any,
  tags?: Record<string, string>
): Promise<T> {
  const dryrunResult = await dryrun({
    process: AO_PROCESS_ID,
    tags: [
      { name: 'Action', value: action },
      ...(tags
        ? Object.entries(tags).map(([name, value]) => ({ name, value }))
        : []),
    ],
    data: data ? JSON.stringify(data) : '',
  });

  if (dryrunResult.Messages && dryrunResult.Messages.length > 0) {
    const messageData = dryrunResult.Messages[0].Data;
    if (messageData) {
      return JSON.parse(messageData);
    }
  }

  return undefined as T;
}
```

#### `aoMessage<T>()` - State-modifying Operations

```typescript
export async function aoMessage<T>(
  action: string,
  data?: any,
  tags?: Record<string, string>
): Promise<T> {
  const wallet = getWallet();
  const signer = createDataItemSigner(wallet);

  const messageId = await message({
    process: AO_PROCESS_ID,
    tags: [
      { name: 'Action', value: action },
      ...(tags
        ? Object.entries(tags).map(([name, value]) => ({ name, value }))
        : []),
    ],
    data: data ? JSON.stringify(data) : '',
    signer,
  });

  const messageResult = await result({
    process: AO_PROCESS_ID,
    message: messageId,
  });

  if (messageResult.Messages && messageResult.Messages.length > 0) {
    const messageData = messageResult.Messages[0].Data;
    if (messageData) {
      return JSON.parse(messageData);
    }
  }

  return undefined as T;
}
```

### 2. **useAOConnect.ts - React Hooks**

#### Generic Hooks

```typescript
// For read-only operations
export function useAODryrun<T>(
  queryKey: string[],
  action: string,
  data?: any,
  tags?: Record<string, string>
) {
  return useQuery({
    queryKey,
    queryFn: async (): Promise<T> => {
      return aoDryrun<T>(action, data, tags);
    },
  });
}

// For state-modifying operations
export function useAOMessage<T>(
  mutationKey: string[],
  action: string,
  onSuccess?: (data: T) => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey,
    mutationFn: async (data?: any): Promise<T> => {
      return aoMessage<T>(action, data);
    },
    onSuccess: data => {
      queryClient.invalidateQueries();
      onSuccess?.(data);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message || `Failed to ${action.toLowerCase()}`;
      toast.error('Action Failed', errorMessage);
    },
  });
}
```

#### Specific Action Hooks

```typescript
// Read-only hooks
export function useProposals() {
  return useAODryrun<any[]>(['proposals'], 'GetAllProposals');
}

export function useGovernancePlatforms() {
  return useAODryrun<any[]>(['governance-platforms'], 'GetGovernancePlatforms');
}

// State-modifying hooks
export function useAddSubscriber() {
  return useAOMessage<any>(['add-subscriber'], 'AddSubscriber', () => {
    toast.success('Subscriber Added', 'Subscriber has been added successfully');
  });
}

export function useScrapeGovernance() {
  return useAOMessage<any>(['scrape-governance'], 'ScrapeGovernance', () => {
    toast.success(
      'Governance Scraped',
      'Governance data has been scraped successfully'
    );
  });
}
```

## 🚀 Usage Examples

### 1. **Component Using New Hooks**

```typescript
import { useProposals, useAddSubscriber } from '@/hooks/useAOConnect';

export function ProposalsComponent() {
  const { data: proposals, error, isLoading } = useProposals();
  const addSubscriber = useAddSubscriber();

  const handleAddSubscriber = async () => {
    try {
      await addSubscriber.mutateAsync({
        email: 'test@example.com',
        platform: 'discord',
      });
    } catch (error) {
      console.error('Failed to add subscriber:', error);
    }
  };

  return (
    <div>
      <h2>Proposals: {proposals?.length ?? 0}</h2>
      <button onClick={handleAddSubscriber} disabled={addSubscriber.isPending}>
        {addSubscriber.isPending ? 'Adding...' : 'Add Subscriber'}
      </button>
    </div>
  );
}
```

### 2. **Counter Example (Same as Reference)**

```typescript
import { useAODryrun, useAOMessage } from '@/hooks/useAOConnect';

export function Counter() {
  const { data: counter, error, isLoading } = useAODryrun<number>(
    ['counter'],
    'Info'
  );

  const increaseCounter = useAOMessage<number>(
    ['IncreaseCounter'],
    'IncreaseCounter'
  );

  const resetCounter = useAOMessage<number>(
    ['ResetCounter'],
    'ResetCounter'
  );

  return (
    <div>
      <h2>Counter: {isLoading ? "Loading..." : counter ?? "N/A"}</h2>
      <button onClick={() => increaseCounter.mutateAsync()}>
        +1
      </button>
      <button onClick={() => resetCounter.mutateAsync()}>
        Reset
      </button>
    </div>
  );
}
```

## 🔄 Backward Compatibility

### Legacy Functions Still Work

The old `aoSend()` and `aoSendAdmin()` functions are still available for backward compatibility:

```typescript
// These still work but now use proper AO Connect internally
import { aoSend, aoSendAdmin } from '@/lib/aoClient';

// Read-only (uses dryrun internally)
const proposals = await aoSend<any[]>('GetAllProposals');

// State-modifying (uses message internally)
const result = await aoSendAdmin<any>('AddSubscriber', subscriberData);
```

### Automatic Action Detection

The legacy functions automatically choose between `dryrun` and `message` based on the action:

```typescript
// State-modifying actions use message()
const stateModifyingActions = [
  'AddSubscriber',
  'RemoveSubscriber',
  'AddBalance',
  'AdjustBalance',
  'BroadcastNotification',
  'TestBroadcast',
  'ScrapeGovernance',
  'ClearCache',
  'ResetRateLimits',
];

// All other actions use dryrun()
```

## ✅ Benefits

### 1. **Proper AO Connect Implementation**

- Uses official `@permaweb/aoconnect` functions
- Correct `dryrun`/`message`/`result` pattern
- Proper wallet signing with `createDataItemSigner`

### 2. **Better Performance**

- `dryrun` for read-only operations (faster, no state changes)
- `message` only when state modification is needed
- Automatic query invalidation after mutations

### 3. **Improved Error Handling**

- Proper error mapping from AO responses
- Toast notifications for user feedback
- Automatic retry logic (built into AO Connect)

### 4. **Type Safety**

- Full TypeScript support
- Generic types for different data structures
- Proper error typing

### 5. **React Integration**

- TanStack Query integration
- Automatic loading states
- Optimistic updates support

## 🧪 Testing

### Development Testing

```bash
# Start development server
npm run dev

# The example components are available in development mode
# Navigate to see AOConnectExample and CounterExample components
```

### Mock Mode

```bash
# Set VITE_MOCK=1 in .env to test with mock data
VITE_MOCK=1
```

## 🔍 Troubleshooting

### Common Issues

1. **Wallet Not Available**

   ```typescript
   // Error: Arweave wallet not available
   // Solution: Ensure wallet is connected before calling state-modifying functions
   ```

2. **Process ID Not Set**

   ```typescript
   // Error: Environment variable VITE_AO_TARGET_ID is not set
   // Solution: Set VITE_AO_TARGET_ID in .env file
   ```

3. **Network Issues**
   ```typescript
   // AO Connect handles network retries automatically
   // Check console for detailed error messages
   ```

## 🎉 Result

The implementation now uses the **proper AO Connect pattern** with:

- ✅ **`dryrun()`** for read-only operations
- ✅ **`message()`** for state-modifying operations
- ✅ **`result()`** for getting message results
- ✅ **`createDataItemSigner()`** for wallet signing
- ✅ **Automatic query invalidation**
- ✅ **Proper error handling**
- ✅ **TypeScript support**
- ✅ **Backward compatibility**

This follows the exact same pattern as your reference counter example and provides a robust foundation for AO interactions.
