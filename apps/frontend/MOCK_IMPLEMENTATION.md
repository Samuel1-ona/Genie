# Mock Implementation & Error Handling

This document describes the implementation of the mock flag system and comprehensive error handling for the Genie frontend.

## Overview

The frontend now supports toggling between mock and real data using the `VITE_MOCK` environment variable, with comprehensive error handling, loading states, and user feedback.

## Environment Configuration

### Mock Flag

- **Variable**: `VITE_MOCK`
- **Values**: `0` (real data) or `1` (mock data)
- **Default**: `0` (real data)

### Configuration

```bash
# Use real AO endpoints
VITE_MOCK=0

# Use mock data for development
VITE_MOCK=1
```

## Implementation Details

### 1. aoClient.ts

- **Mock Detection**: Checks `env.MOCK` flag at runtime
- **Conditional Logic**: Uses `mockAo()` when mock is enabled, real endpoints otherwise
- **Error Handling**: Maps HTTP status codes to user-friendly messages
- **Toast Notifications**: Shows success/error messages for all operations

### 2. Error Handling

- **Status Code Mapping**:
  - 429: Rate limit exceeded
  - 500: Server error
  - 502/503/504: Service unavailable
  - 401: Authentication required
  - 403: Access denied
  - 404: Resource not found
- **Retry Logic**: Exponential backoff with 3 attempts
- **User-Friendly Messages**: Clear, actionable error descriptions

### 3. UI Components

#### ErrorState Component

- **Features**: Error display with retry button
- **Props**: title, message, onRetry, isLoading, className
- **Usage**: Shows when API calls fail with retry functionality

#### LoadingState Component

- **Features**: Loading spinner with customizable message
- **Props**: message, showSpinner, className
- **Usage**: Shows during data fetching operations

#### Skeleton Components

- **SkeletonTable**: Table loading skeleton
- **SkeletonCard**: Card loading skeleton
- **Usage**: Shows placeholder content during loading

### 4. Updated Pages

#### ProposalsPage

- ✅ Real data fetching with `useProposals()`
- ✅ Loading states with skeleton
- ✅ Error states with retry
- ✅ Proper error handling

#### BalancesPage

- ✅ Real data fetching with `useBalances()`
- ✅ Loading states with skeleton
- ✅ Error states with retry
- ✅ Proper error handling

#### NotificationsPage

- ✅ Real data fetching with `useSubscribers()`
- ✅ Loading states with skeleton
- ✅ Error states with retry
- ✅ Proper error handling

#### RuntimePage

- ✅ Real data fetching with `useScrapeHistory()` and `useApiRateLimits()`
- ✅ Loading states with skeleton
- ✅ Error states with retry
- ✅ Proper error handling

### 5. Hook Updates

#### useAOClient.ts

- **Query Keys**: Properly organized and typed
- **Mutations**: Success/error toast notifications
- **Cache Invalidation**: Automatic cache updates on mutations
- **Error Handling**: Consistent error handling across all hooks

## Testing

### Test Script

Run the test script to verify implementation:

```bash
node scripts/test-mock-flag.js
```

### Manual Testing

1. Set `VITE_MOCK=1` in `.env` to test mock mode
2. Set `VITE_MOCK=0` in `.env` to test real mode
3. Verify loading states appear during data fetching
4. Verify error states appear with retry buttons
5. Verify toast notifications for success/failure

## Benefits

### 1. Development Experience

- **Mock Mode**: Fast development with predictable data
- **Real Mode**: Test against actual endpoints
- **Runtime Switching**: No rebuild required

### 2. User Experience

- **Loading States**: Clear feedback during operations
- **Error States**: Helpful error messages with retry options
- **Toast Notifications**: Immediate feedback for actions
- **Consistent UI**: Unified error and loading patterns

### 3. Maintainability

- **Centralized Error Handling**: Consistent error messages
- **Reusable Components**: ErrorState and LoadingState components
- **Type Safety**: Proper TypeScript types throughout
- **Test Coverage**: Automated testing of mock flag functionality

## Usage Examples

### Basic Usage

```typescript
const { data, isLoading, error, refetch } = useProposals();

if (isLoading) return <LoadingState message="Loading proposals..." />;
if (error) return <ErrorState message={error.message} onRetry={refetch} />;
return <ProposalsTable proposals={data} />;
```

### Mutation with Toast

```typescript
const addSubscriber = useAddSubscriber();

const handleAdd = async subscriber => {
  await addSubscriber.mutateAsync(subscriber);
  // Toast notification handled automatically
};
```

## Future Enhancements

1. **Offline Support**: Cache data for offline viewing
2. **Progressive Loading**: Load data in chunks
3. **Error Boundaries**: React error boundaries for component errors
4. **Analytics**: Track error rates and user interactions
5. **A/B Testing**: Test different error message formats

