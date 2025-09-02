# AO Connectivity Guide

This guide helps resolve common AO connectivity issues when developing the Genie Proposal Summarizer frontend.

## Common Issues

### 1. CORS Errors

**Error**: `Access to fetch at 'https://cu.ao-testnet.xyz/dry-run' has been blocked by CORS policy`

**Solution**:

- The Vite dev server now includes CORS headers for all responses
- Use the proxy configuration in `vite.config.ts` for AO testnet requests
- Ensure your browser allows localhost connections

### 2. Network Errors

**Error**: `Failed to fetch` or `503 Service Unavailable`

**Solution**:

- The AO client now includes retry logic with exponential backoff
- Check your internet connection
- Verify the AO testnet is operational
- Try using a different network or VPN

### 3. Wallet Connection Issues

**Error**: `Arweave wallet not available`

**Solution**:

- Install Arweave Wallet Extension
- Connect your wallet to the application
- Ensure the wallet is unlocked
- Check browser console for wallet errors

## Environment Configuration

### Required Variables

```env
# AO Process ID (required)
VITE_AO_TARGET_ID=your_ao_process_id_here

# Network selection (optional, defaults to testnet in dev)
VITE_AO_NETWORK=testnet

# AO Relay URL (optional, defaults based on network)
VITE_AO_RELAY_URL=https://cu.ao-testnet.xyz
```

### Development Settings

```env
# Enable debug mode for detailed logging
VITE_ENABLE_DEBUG_MODE=1

# Disable analytics in development
VITE_ENABLE_ANALYTICS=0
```

## Network Configuration

### Testnet (Development)

- **Relay URL**: `https://cu.ao-testnet.xyz`
- **Gateway**: `https://arweave.net`
- **Use Case**: Development and testing

### Mainnet (Production)

- **Relay URL**: `https://cu.ao.xyz`
- **Gateway**: `https://arweave.net`
- **Use Case**: Production deployment

## Error Handling

The application now includes comprehensive error handling:

### Network Errors

- **CORS**: "Network access blocked. Please check your connection and try again."
- **503**: "AO service temporarily unavailable. Please try again later."
- **Timeout**: "Request timed out. Please try again."
- **Connection**: "Network connection failed. Please check your internet connection."

### Retry Logic

- **Max Retries**: 3 attempts
- **Base Delay**: 1 second
- **Backoff**: Exponential (1s, 2s, 4s)
- **Smart Retry**: Skips retries for wallet errors

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

### 2. Check Network Status

- Open browser console
- Look for AO connection logs
- Verify no CORS errors

### 3. Test AO Connectivity

- Connect Arweave wallet
- Try a simple query (e.g., GetSystemInfo)
- Check for retry attempts in console

### 4. Debug Issues

- Enable debug mode: `VITE_ENABLE_DEBUG_MODE=1`
- Check network tab for failed requests
- Review console logs for detailed error information

## Troubleshooting

### CORS Issues

1. **Clear browser cache**
2. **Disable browser extensions** that might interfere
3. **Try incognito mode**
4. **Check firewall settings**

### Network Issues

1. **Check internet connection**
2. **Try different network** (mobile hotspot, VPN)
3. **Verify AO testnet status**
4. **Check DNS resolution**

### Wallet Issues

1. **Reinstall Arweave Wallet Extension**
2. **Clear wallet cache**
3. **Check wallet permissions**
4. **Verify wallet is unlocked**

### Development Server Issues

1. **Restart development server**
2. **Clear node_modules and reinstall**
3. **Check port conflicts**
4. **Update dependencies**

## Monitoring

### Console Logs

The application logs detailed information:

- AO request attempts
- Retry attempts with delays
- Error details and stack traces
- Network response times

### Network Tab

Monitor in browser DevTools:

- Request/response headers
- CORS preflight requests
- Response status codes
- Request timing

### Error Boundaries

The application includes error boundaries that:

- Catch and display errors gracefully
- Provide user-friendly error messages
- Allow recovery from errors
- Log errors for debugging

## Best Practices

### Development

1. **Use testnet** for development
2. **Enable debug mode** for detailed logging
3. **Test wallet connectivity** early
4. **Monitor console** for errors

### Error Handling

1. **Implement retry logic** for network requests
2. **Provide user feedback** for errors
3. **Log errors** for debugging
4. **Graceful degradation** when services are unavailable

### Network Configuration

1. **Use environment variables** for configuration
2. **Support multiple networks** (testnet/mainnet)
3. **Handle network switching** gracefully
4. **Validate configuration** at startup

## Support

If you continue to experience issues:

1. **Check the AO Discord** for network status
2. **Review AO documentation** for latest changes
3. **Test with a simple AO process** first
4. **Contact the development team** with detailed error logs
