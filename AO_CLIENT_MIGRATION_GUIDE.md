# AO Client Migration Guide

## Overview

You've updated `aoClient.ts` with a new approach that uses React Query hooks directly instead of wrapper functions. This guide helps you migrate the entire application to work with your new syntax.

## Key Changes in Your New aoClient.ts

### ✅ **What's New:**

1. **Direct AO Connect Usage**: Using `dryrun`, `message`, `result` directly
2. **React Query Hooks**: All operations are now React Query hooks (`useQuery`, `useMutation`)
3. **Simplified Error Handling**: Direct error handling without retry logic
4. **New Response Parsing**: `parseAOResponse` function
5. **No Retry Logic**: Removed exponential backoff retry mechanism

### ❌ **What's Removed:**

1. `aoDryrun` and `aoMessage` wrapper functions
2. `retryWithBackoff` logic
3. `aoSend` helper function
4. Complex error mapping

## Migration Steps

### 1. Update Import Statements

**Before:**

```typescript
import { useProposals, useGovernancePlatforms } from "@/hooks/useAOClient";
```

**After:**

```typescript
import { useProposals, useGovernancePlatforms } from "@/lib/aoClient";
```

### 2. Update Mutation Usage

**Before:**

```typescript
const result = await governanceApi.addPlatform(platformData);
if (result.ok) {
    // handle success
}
```

**After:**

```typescript
const addPlatformMutation = useAddGovernancePlatform();
await addPlatformMutation.mutateAsync(platformData);
// Success/error handled by mutation hook callbacks
```

### 3. Available Hooks in New aoClient.ts

#### **Query Hooks (Read Operations):**

- `useProposals()` - Fetch all proposals
- `useProposal(id)` - Fetch single proposal
- `useGovernancePlatforms()` - Fetch governance platforms
- `useSubscribers()` - Fetch subscribers
- `useBalances()` - Fetch balances
- `useSystemInfo()` - Fetch system information
- `useErrorLogs()` - Fetch error logs
- `useHealthCheck()` - Health check
- `useWalletConnection()` - Wallet connection status

#### **Mutation Hooks (Write Operations):**

- `useAddProposal()` - Add new proposal
- `useUpdateProposal()` - Update proposal
- `useDeleteProposal()` - Delete proposal
- `useAddGovernancePlatform()` - Add governance platform
- `useAddSubscriber()` - Add subscriber
- `useBroadcastNotification()` - Broadcast notification
- `useExecuteProposal()` - Execute proposal

## Files Updated

### ✅ **Completed Updates:**

1. `apps/frontend/src/pages/daos/DaosPage.tsx`
2. `apps/frontend/src/pages/notifications/NotificationsPage.tsx`
3. `apps/frontend/src/pages/proposals/ProposalsPage.tsx`
4. `apps/frontend/src/pages/balances/BalancesPage.tsx`
5. `apps/frontend/src/pages/runtime/RuntimePage.tsx`
6. `apps/frontend/src/pages/proposals/ProposalDetail.tsx`
7. `apps/frontend/src/components/notifications/TestBroadcast.tsx`
8. `apps/frontend/src/components/daos/AddPlatformDialog.tsx`

### ⚠️ **Files Needing Attention:**

1. `apps/frontend/src/pages/Overview.tsx` - Has some TypeScript errors to resolve
2. Any components using old API functions from `@/api/` directory

## Migration Patterns

### Pattern 1: Query Hooks

```typescript
// Before
const { data: proposals, isLoading, error } = useProposals();

// After (same syntax, different import)
import { useProposals } from "@/lib/aoClient";
const { data: proposals, isLoading, error } = useProposals();
```

### Pattern 2: Mutation Hooks

```typescript
// Before
const result = await apiFunction(data);
if (result.ok) {
    toast.success("Success");
}

// After
const mutation = useMutationHook();
await mutation.mutateAsync(data);
// Success/error handled by mutation callbacks
```

### Pattern 3: Error Handling

```typescript
// Before
try {
    const result = await apiFunction(data);
    if (result.ok) {
        // success
    }
} catch (error) {
    toast.error("Error message");
}

// After
const mutation = useMutationHook();
try {
    await mutation.mutateAsync(data);
    // Success toast handled by mutation
} catch (error) {
    // Error toast handled by mutation
}
```

## Benefits of New Approach

1. **Simpler Code**: Direct React Query usage
2. **Better TypeScript**: Proper typing with React Query
3. **Automatic Caching**: React Query handles caching
4. **Built-in Loading States**: `isLoading`, `isError` states
5. **Automatic Refetching**: React Query handles refetching
6. **Optimistic Updates**: Built-in optimistic update support

## Testing

After migration, test the following functionality:

1. ✅ Platform addition (DaosPage)
2. ✅ Subscriber addition (NotificationsPage)
3. ✅ Proposal viewing (ProposalsPage)
4. ✅ Balance viewing (BalancesPage)
5. ✅ System info (RuntimePage)

## Next Steps

1. **Resolve TypeScript Errors**: Fix remaining type issues in Overview.tsx
2. **Remove Old API Files**: Consider removing unused API files
3. **Update Tests**: Update any tests that use old API functions
4. **Documentation**: Update any documentation referencing old patterns

## Troubleshooting

### Common Issues:

1. **Import Errors**: Make sure to import from `@/lib/aoClient`
2. **Type Errors**: The new hooks return proper React Query types
3. **Missing Hooks**: Some hooks might need to be added to aoClient.ts

### Getting Help:

- Check the new `aoClient.ts` file for available hooks
- Use React Query DevTools for debugging
- Check browser console for error messages
