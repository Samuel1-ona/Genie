# Admin Gating for Sensitive Actions

This document describes the admin gating system implemented to protect sensitive actions in the Genie-Proposal-Summarizer application.

## Overview

The admin gating system prevents public users from triggering high-impact actions by requiring HMAC authentication for sensitive operations. This ensures that only authorized administrators can perform actions that could affect system performance, data integrity, or user balances.

## Sensitive Actions

The following actions are considered sensitive and require admin authentication:

- `ScrapeGovernance` - Triggers governance data scraping
- `ClearCache` - Clears system cache
- `ResetRateLimits` - Resets API rate limits
- `AddBalance` - Adds balance to user accounts
- `AdjustBalance` - Adjusts user account balances

## Architecture

### 1. AO Bridge (`/api/ao`)

- **Purpose**: Handles all AO process communication
- **Admin Check**: Verifies HMAC signature for sensitive actions
- **Response**: Returns 401 for unauthorized sensitive actions

### 2. Admin Command Endpoint (`/api/admin/command`)

- **Purpose**: Dedicated endpoint for admin actions
- **Authentication**: Generates HMAC signature internally
- **Forwarding**: Forwards requests to AO bridge with proper headers

### 3. Admin Client (`/src/lib/adminClient.ts`)

- **Purpose**: Frontend client for admin actions
- **Usage**: Used by admin UI components
- **Security**: Never exposes HMAC secret to browser

## Authentication Flow

### HMAC Signature Generation

```javascript
const ts = Date.now().toString();
const payload = `${action}:${ts}`;
const sig = crypto
  .createHmac('sha256', ADMIN_HMAC_SECRET)
  .update(payload)
  .digest('hex');
```

### Headers Required

- `x-admin-sig`: HMAC signature (hex)
- `x-admin-ts`: Timestamp (milliseconds)

### Security Features

- **Timestamp Validation**: Signatures expire after 5 minutes
- **Timing-Safe Comparison**: Prevents timing attacks
- **Replay Protection**: Timestamp prevents replay attacks

## Environment Variables

```bash
# Required for production
ADMIN_HMAC_SECRET=your_secure_random_secret_here

# AO Relay Configuration
AO_RELAY_URL=https://arweave.net/meta
AO_API_KEY=your_ao_api_key_here
```

## Development vs Production

### Development Mode

- If `ADMIN_HMAC_SECRET` is not set, sensitive actions are allowed
- Warning logs indicate missing configuration
- Useful for local development and testing

### Production Mode

- `ADMIN_HMAC_SECRET` must be configured
- All sensitive actions require valid HMAC signature
- Strict validation enforced

## API Usage

### Regular Actions (Public)

```javascript
// These work for all users
await aoSend('GetAllProposals');
await aoSend('GetGovernancePlatforms');
await aoSend('GetSubscribers');
```

### Admin Actions (Protected)

```javascript
// These require admin authentication
await adminScrapeGovernance('platform-id');
await adminClearCache();
await adminResetRateLimits();
await adminAddBalance(address, amount, reason);
await adminAdjustBalance(address, amount, reason);
```

## Frontend Integration

### API Layer Updates

- `balancesApi.add()` - Uses admin client
- `runtimeApi.clearCache()` - Uses admin client
- `runtimeApi.resetLimits()` - Uses admin client
- `governanceApi.scrape()` - Uses admin client

### Hook Updates

- `useAddBalance()` - Uses admin client
- `useClearCache()` - Uses admin client
- `useResetRateLimits()` - Uses admin client
- `useScrapeGovernance()` - Uses admin client

## Testing

### Test Script

```bash
npm run test:admin
```

### Test Coverage

- Regular bridge endpoint functionality
- Sensitive action blocking without auth
- Admin command endpoint functionality
- Non-sensitive action rejection in admin endpoint

### Manual Testing

1. Try to call sensitive actions directly via `/api/ao` → Should return 401
2. Call sensitive actions via `/api/admin/command` → Should work
3. Call non-sensitive actions via `/api/admin/command` → Should return 400

## Security Considerations

### HMAC Secret Management

- Use cryptographically secure random secret
- Rotate secrets periodically
- Never expose in client-side code
- Use environment variables for configuration

### Rate Limiting

- Consider implementing rate limiting on admin endpoints
- Monitor for suspicious activity
- Log all admin actions for audit trail

### Future Enhancements

- Integration with auth providers (Clerk, Auth0)
- Role-based access control
- Audit logging and monitoring
- IP allowlisting for admin endpoints

## Troubleshooting

### Common Issues

1. **401 Unauthorized on sensitive actions**
   - Check if `ADMIN_HMAC_SECRET` is configured
   - Verify timestamp is within 5-minute window
   - Ensure HMAC signature is correctly generated

2. **Admin command endpoint not found**
   - Verify Netlify function is deployed
   - Check redirect configuration in `netlify.toml`
   - Ensure function file exists in `netlify/functions/`

3. **Development mode warnings**
   - Expected when `ADMIN_HMAC_SECRET` is not set
   - Configure secret for production-like testing

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=admin-gating
```

## Migration Guide

### From Direct AO Calls

```javascript
// Before
await aoSend('ClearCache');

// After
await adminClearCache();
```

### From Custom Admin Implementation

```javascript
// Before
const sig = generateHMAC(action, timestamp);
await fetch('/api/ao', {
  headers: { 'x-admin-sig': sig, 'x-admin-ts': timestamp },
});

// After
await adminSend(action, data, tags);
```
