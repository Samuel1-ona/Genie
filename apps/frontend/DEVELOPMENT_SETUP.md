# 🛠️ Development Setup Guide

## Current Issues & Solutions

### 1. **CORS and Network Issues**

The main issue you're experiencing is **CORS policy blocking** when trying to connect directly to AO testnet URLs from the browser. This is a common issue in development.

#### **Error:**

```
Access to fetch at 'https://cu16.ao-testnet.xyz/dry-run?process-id=...'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

#### **Solutions:**

##### **Option A: Use Mock Mode (Recommended for Development)**

```bash
# Add to your .env file
VITE_MOCK=1
```

This will use mock data instead of trying to connect to AO testnet, avoiding CORS issues entirely.

##### **Option B: Use a CORS Proxy**

If you need to test with real AO data, you can set up a proxy:

```bash
# Install a CORS proxy
npm install -g cors-anywhere

# Start the proxy
cors-anywhere
```

Then configure AO Connect to use the proxy URL.

##### **Option C: Use AO Connect with Different Configuration**

Update the AO Connect configuration to use different endpoints:

```typescript
// In aoClient.ts, you can configure different endpoints
const AO_CONFIG = {
  process: AO_PROCESS_ID,
  // Use different endpoints that support CORS
  // or configure with proxy settings
};
```

### 2. **Wallet Connection Issues**

#### **Error:**

```
Could not establish connection. Receiving end does not exist.
[Arweave Wallet Kit] Failed to fetch ArNS profile
```

#### **Solutions:**

1. **Install a Compatible Wallet Extension**
   - Install **Wander.app** extension
   - Or **Arweave.app** extension
   - Or any other Arweave-compatible wallet

2. **Check Wallet Permissions**
   - Ensure the wallet extension is enabled
   - Grant necessary permissions when prompted

3. **Use Mock Wallet for Development**
   - The wallet connection errors are non-critical for development
   - The app will still work with mock data

### 3. **Query Data Undefined Errors**

#### **Error:**

```
Query data cannot be undefined. Please make sure to return a value other than undefined from your query function.
```

#### **Solution:**

This has been fixed in the updated code. The functions now return empty arrays/objects instead of `undefined` when no data is available.

## 🚀 **Quick Start for Development**

### 1. **Enable Mock Mode**

```bash
# Add to .env file
VITE_MOCK=1
VITE_REQUIRE_WALLET=0  # Optional: disable wallet requirement for development
```

### 2. **Start Development Server**

```bash
npm run dev
```

### 3. **Test the Application**

- Navigate to `http://localhost:5173`
- The app should work with mock data
- No CORS or network errors should appear

## 🔧 **Environment Configuration**

### **Development (.env)**

```bash
# AO Configuration
VITE_AO_TARGET_ID=qLhP9Lql6lsw4jucFrxVrco_09E8cb5wjd2PTKnjxJM
VITE_AO_RELAY_URL=https://arweave.net/meta
VITE_AO_API_KEY=test_api_key

# Feature Flags
VITE_MOCK=1                    # Use mock data (development)
VITE_REQUIRE_WALLET=0          # Disable wallet requirement (development)

# Admin Authentication
VITE_ADMIN_HMAC_SECRET=test_admin_secret_key_for_development
```

### **Production (.env.production)**

```bash
# AO Configuration
VITE_AO_TARGET_ID=your_real_process_id
VITE_AO_RELAY_URL=https://arweave.net/meta
VITE_AO_API_KEY=your_real_api_key

# Feature Flags
VITE_MOCK=0                    # Use real AO data
VITE_REQUIRE_WALLET=1          # Require wallet connection

# Admin Authentication
VITE_ADMIN_HMAC_SECRET=your_real_admin_secret
```

## 🧪 **Testing Different Modes**

### **Mock Mode Testing**

```bash
VITE_MOCK=1 npm run dev
```

- Uses mock data
- No network requests to AO
- Fast development experience
- No CORS issues

### **Real AO Mode Testing**

```bash
VITE_MOCK=0 npm run dev
```

- Uses real AO Connect
- Requires proper CORS configuration
- May have network issues in development
- Tests actual AO interactions

## 🔍 **Troubleshooting**

### **If you still see CORS errors:**

1. Check that `VITE_MOCK=1` is set in your `.env` file
2. Restart the development server
3. Clear browser cache
4. Check browser console for any remaining network requests

### **If wallet connection fails:**

1. Install a compatible Arweave wallet extension
2. Ensure the extension is enabled
3. Grant necessary permissions
4. For development, you can disable wallet requirement with `VITE_REQUIRE_WALLET=0`

### **If queries return undefined:**

1. The updated code should handle this automatically
2. Check that you're using the latest version of the hooks
3. Ensure mock data is properly configured

## 📝 **Next Steps**

1. **For Development**: Use mock mode (`VITE_MOCK=1`)
2. **For Production**: Configure proper AO endpoints and disable mock mode
3. **For Testing**: Set up a proper CORS proxy or use different AO endpoints
4. **For Wallet Integration**: Install and configure a real Arweave wallet

The application should now work smoothly in development mode with mock data, avoiding all the CORS and network issues you were experiencing.
