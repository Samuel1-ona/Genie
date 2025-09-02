# Tally API Integration Guide

This guide explains how to use the Tally API integration in the Genie Proposal Summarizer frontend.

## Overview

The Tally API integration provides a complete set of React hooks and utilities for interacting with the Tally governance platform. It follows the pattern you provided and includes proper error handling, retry logic, and TypeScript support.

## Setup

### 1. Environment Configuration

Add your Tally API key to your `.env` file:

```env
# Tally API Configuration
VITE_TALLY_API_KEY=your_tally_api_key_here
VITE_TALLY_BASE_URL=https://api.tally.xyz/query
```

### 2. API Key

You can get your Tally API key from:

- Tally Developer Portal
- Your Tally account settings
- Contact Tally support

## Available Hooks

### Organization Hooks

#### `useOrganization(organizationId)`

Fetches organization details.

```typescript
import { useOrganization } from '@/hooks/useTally';

const { organization, loading, error } = useOrganization('org-id');
```

#### `useOrganizationUsers(organizationId)`

Fetches organization users.

```typescript
import { useOrganizationUsers } from '@/hooks/useTally';

const { users, loading, error } = useOrganizationUsers('org-id');
```

#### `useOrganizationProposals(organizationId)`

Fetches organization proposals.

```typescript
import { useOrganizationProposals } from '@/hooks/useTally';

const { proposals, loading, error } = useOrganizationProposals('org-id');
```

#### `useOrganizationSearch(query)`

Searches for organizations with debounced input.

```typescript
import { useOrganizationSearch } from '@/hooks/useTally';

const { organizations, loading, error } = useOrganizationSearch('search query');
```

### Proposal Hooks

#### `useProposal(proposalId)`

Fetches proposal details.

```typescript
import { useProposal } from '@/hooks/useTally';

const { proposal, loading, error } = useProposal('proposal-id');
```

#### `useProposalVotes(proposalId)`

Fetches proposal votes.

```typescript
import { useProposalVotes } from '@/hooks/useTally';

const { votes, loading, error } = useProposalVotes('proposal-id');
```

### User Hooks

#### `useUser(userId)`

Fetches user details.

```typescript
import { useUser } from '@/hooks/useTally';

const { user, loading, error } = useUser('user-id');
```

#### `useUserOrganizations(userId)`

Fetches user's organizations.

```typescript
import { useUserOrganizations } from '@/hooks/useTally';

const { organizations, loading, error } = useUserOrganizations('user-id');
```

### Governance Hooks

#### `useGovernanceTokens(organizationId)`

Fetches governance tokens.

```typescript
import { useGovernanceTokens } from '@/hooks/useTally';

const { tokens, loading, error } = useGovernanceTokens('org-id');
```

#### `useDelegates(organizationId)`

Fetches delegates.

```typescript
import { useDelegates } from '@/hooks/useTally';

const { delegates, loading, error } = useDelegates('org-id');
```

## Usage Examples

### Basic Organization Display

```typescript
import React from 'react';
import { useOrganization, useOrganizationProposals } from '@/hooks/useTally';
import { LoadingState, ErrorState } from '@/components/common';

const OrganizationPage: React.FC<{ orgId: string }> = ({ orgId }) => {
  const { organization, loading: orgLoading, error: orgError } = useOrganization(orgId);
  const { proposals, loading: proposalsLoading, error: proposalsError } = useOrganizationProposals(orgId);

  if (orgLoading) return <LoadingState />;
  if (orgError) return <ErrorState error={orgError.message} />;

  return (
    <div>
      <h1>{organization?.name}</h1>
      <p>{organization?.description}</p>

      <h2>Proposals</h2>
      {proposalsLoading ? (
        <LoadingState />
      ) : proposalsError ? (
        <ErrorState error={proposalsError.message} />
      ) : (
        <div>
          {proposals.map(proposal => (
            <div key={proposal.id}>
              <h3>{proposal.title}</h3>
              <p>{proposal.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Search with Debouncing

```typescript
import React, { useState } from 'react';
import { useOrganizationSearch } from '@/hooks/useTally';
import { Input } from '@/components/ui/input';

const OrganizationSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const { organizations, loading, error } = useOrganizationSearch(query);

  return (
    <div>
      <Input
        placeholder="Search organizations..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <div>Searching...</div>}
      {error && <div>Error: {error.message}</div>}

      <div>
        {organizations.map(org => (
          <div key={org.id}>
            <h3>{org.name}</h3>
            <p>{org.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Proposal Details with Votes

```typescript
import React from 'react';
import { useProposal, useProposalVotes } from '@/hooks/useTally';

const ProposalPage: React.FC<{ proposalId: string }> = ({ proposalId }) => {
  const { proposal, loading: proposalLoading, error: proposalError } = useProposal(proposalId);
  const { votes, loading: votesLoading, error: votesError } = useProposalVotes(proposalId);

  if (proposalLoading) return <LoadingState />;
  if (proposalError) return <ErrorState error={proposalError.message} />;

  return (
    <div>
      <h1>{proposal?.title}</h1>
      <p>{proposal?.description}</p>

      <h2>Votes</h2>
      {votesLoading ? (
        <LoadingState />
      ) : votesError ? (
        <ErrorState error={votesError.message} />
      ) : (
        <div>
          {votes.map(vote => (
            <div key={vote.id}>
              <span>{vote.voter}</span>
              <span>{vote.choice}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## Direct API Usage

You can also use the Tally API client directly for more complex scenarios:

```typescript
import { tallyApi, tallyRequestWithRetry } from '@/lib/tallyClient';

// Direct API call
const fetchData = async () => {
  try {
    const users = await tallyApi.getOrganizationUsers('org-id');
    console.log(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
};

// With retry logic
const fetchDataWithRetry = async () => {
  try {
    const users = await tallyRequestWithRetry(() =>
      tallyApi.getOrganizationUsers('org-id')
    );
    console.log(users);
  } catch (error) {
    console.error('Failed to fetch users after retries:', error);
  }
};
```

## Error Handling

All hooks include comprehensive error handling:

### Error Types

- **Network Errors**: Connection issues, timeouts
- **API Errors**: 4xx/5xx responses from Tally
- **Authentication Errors**: Invalid API key
- **Rate Limit Errors**: Too many requests

### Error States

```typescript
const { data, loading, error } = useOrganization('org-id');

if (loading) return <LoadingState />;
if (error) {
  // error is a TallyApiError instance
  return <ErrorState error={error.message} />;
}
```

### Custom Error Handling

```typescript
const { data, loading, error } = useOrganization('org-id');

useEffect(() => {
  if (error) {
    // Custom error handling
    toast.error('Failed to load organization', error.message);

    // Log error for debugging
    console.error('Organization fetch error:', error);
  }
}, [error]);
```

## Retry Logic

The integration includes automatic retry logic with exponential backoff:

- **Max Retries**: 3 attempts
- **Base Delay**: 1 second
- **Backoff**: Exponential (1s, 2s, 4s)
- **Smart Retry**: Skips retries for client errors (4xx)

## Performance Optimization

### Debounced Search

The `useOrganizationSearch` hook includes built-in debouncing:

```typescript
// Search is automatically debounced by 300ms
const { organizations } = useOrganizationSearch('search query');
```

### Conditional Fetching

Hooks only fetch data when required parameters are provided:

```typescript
// Won't fetch until organizationId is provided
const { users } = useOrganizationUsers(organizationId);
```

## TypeScript Support

All hooks and API methods include TypeScript types:

```typescript
import { TallyApiError } from '@/lib/tallyClient';

// Error handling with proper typing
const handleError = (error: TallyApiError) => {
  console.log(error.status); // number | undefined
  console.log(error.message); // string
};
```

## Testing

### Mocking Tally API

For testing, you can mock the Tally API:

```typescript
// In your test file
vi.mock('@/hooks/useTally', () => ({
  useOrganization: vi.fn(() => ({
    organization: { id: 'test', name: 'Test Org' },
    loading: false,
    error: null,
  })),
}));
```

### Testing Error States

```typescript
// Test error handling
vi.mocked(useOrganization).mockReturnValue({
  organization: null,
  loading: false,
  error: new TallyApiError('Not found', 404),
});
```

## Best Practices

### 1. Error Boundaries

Wrap your components with error boundaries:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<ErrorState error="Something went wrong" />}>
  <OrganizationPage orgId={orgId} />
</ErrorBoundary>
```

### 2. Loading States

Always provide loading states:

```typescript
if (loading) return <LoadingState />;
```

### 3. Empty States

Handle empty data gracefully:

```typescript
if (!data || data.length === 0) {
  return <EmptyState message="No data found" />;
}
```

### 4. Error Recovery

Provide ways to retry failed requests:

```typescript
const { data, loading, error, refetch } = useOrganization(orgId);

if (error) {
  return (
    <div>
      <ErrorState error={error.message} />
      <Button onClick={refetch}>Retry</Button>
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **API Key Not Set**
   - Ensure `VITE_TALLY_API_KEY` is set in your `.env` file
   - Check that the API key is valid

2. **Rate Limiting**
   - The retry logic handles rate limiting automatically
   - Consider implementing request caching for frequently accessed data

3. **Network Issues**
   - Check your internet connection
   - Verify Tally API is accessible from your network

4. **CORS Issues**
   - Tally API should handle CORS properly
   - Check browser console for CORS errors

### Debug Mode

Enable debug mode to see detailed logs:

```env
VITE_ENABLE_DEBUG_MODE=1
```

This will log all API requests, responses, and errors to the console.

## Support

For issues with the Tally API integration:

1. Check the browser console for error messages
2. Verify your API key is correct
3. Test with the example component
4. Check Tally API documentation for endpoint changes
5. Contact the development team with detailed error logs
