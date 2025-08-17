# Genie Proposal Summarizer Frontend

A modern React application for monitoring and managing governance proposals across multiple DAOs and platforms.

## 🛠 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**:
  - TanStack Query (server state)
  - Zustand (client state)
- **Routing**: React Router v7
- **Data Tables**: TanStack Table
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date/Time**: dayjs (with Lagos timezone)
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd apps/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📝 Available Scripts

| Script             | Description               |
| ------------------ | ------------------------- |
| `npm run dev`      | Start development server  |
| `npm run build`    | Build for production      |
| `npm run preview`  | Preview production build  |
| `npm run lint`     | Run ESLint                |
| `npm run format`   | Format code with Prettier |
| `npm run test`     | Run tests in watch mode   |
| `npm run test:ui`  | Run tests with UI         |
| `npm run test:run` | Run tests once            |

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory:

```env
# AO Agent Configuration
VITE_AO_TARGET_ID=REPLACE_WITH_AO_AGENT_ID

# AO Relay Configuration (Server-side)
AO_RELAY_URL=https://your-ao-relay-endpoint.com
AO_API_KEY=your-optional-api-key

# API Endpoints
VITE_TALLY_BASE_URL=https://api.tally.xyz/query

# Optional: Development overrides
VITE_USE_MOCK_AO=false
VITE_API_BASE_URL=http://localhost:3000
```

### Environment Variables Explained

- **`VITE_AO_TARGET_ID`**: Your AO agent ID that the frontend will communicate with
- **`AO_RELAY_URL`**: The HTTP endpoint of your AO relay (e.g., ao.link-compatible relay)
- **`AO_API_KEY`**: Optional authentication key for your AO relay (if required)
- **`VITE_TALLY_BASE_URL`**: Base URL for Tally API (governance data)
- **`VITE_USE_MOCK_AO`**: Set to `false` to use the real AO bridge, `true` for mock data
- **`VITE_API_BASE_URL`**: Base URL for your backend API (if different from default)

## 🔗 AO Bridge Integration

The application uses a secure bridge to communicate with AO processes:

### Development

- The AO bridge runs as Vite middleware during development
- All requests go through `/api/ao` endpoint
- No direct browser-to-AO communication

### Production

- Deploy with Netlify Functions (included)
- Serverless function handles AO relay communication
- Environment variables secure sensitive data

### Security Features

- Action allowlist prevents unauthorized operations
- Admin-gated sensitive actions (scrape, clear, reset, balance)
- 10-second timeout with 2 retries
- Robust error handling and logging

## 🔄 Switching from Mock to Real AO

### Current Setup (Real AO Bridge)

The application now uses a production-ready AO bridge:

```typescript
// server/aoBridge.ts
// Forwards requests to AO relay with security and retries
```

### Configuration

1. **Set environment variables**

   ```env
   VITE_USE_MOCK_AO=false
   VITE_AO_TARGET_ID=your-actual-ao-agent-id
   AO_RELAY_URL=https://your-ao-relay-endpoint.com
   AO_API_KEY=your-optional-api-key
   ```

2. **Deploy to production**
   - Netlify Functions automatically handle the bridge
   - No additional configuration needed

### AO Client Implementation

```typescript
// src/lib/aoClient.ts
import { getEnv } from '@/config/env';

type AOEnvelope = {
  Target: string;
  Action: string;
  Data?: string;
  Tags?: Record<string, string>;
};

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export async function aoSend<T>(
  action: string,
  data?: any,
  tags?: Record<string, string>
): Promise<T> {
  const Target = getEnv('VITE_AO_TARGET_ID');
  const body: AOEnvelope = {
    Target,
    Action: action,
    Data: data ? JSON.stringify(data) : undefined,
    Tags: tags,
  };

  let lastError: any;
  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch('/api/ao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`AO HTTP ${res.status}`);
      const json = await res.json();
      if (json.ok === false) throw new Error(json.error || 'AO returned error');
      return json.data as T;
    } catch (e) {
      lastError = e;
      // basic exponential backoff
      await sleep(400 * (attempt + 1));
    }
  }
  throw new Error(`aoSend(${action}) failed: ${String(lastError)}`);
}
```

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (StatusChip, etc.)
│   ├── ui/            # shadcn/ui components
│   ├── proposals/     # Proposal-specific components
│   ├── daos/          # DAO-specific components
│   └── ...
├── pages/              # Page components
│   ├── Overview.tsx   # Dashboard
│   ├── proposals/     # Proposal pages
│   ├── daos/          # DAO pages
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── store/              # Zustand stores
├── types/              # TypeScript type definitions
├── server/             # Mock server (development)
└── test/               # Test setup and utilities
```

## 🧪 Testing

### Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run
```

### Test Structure

- **Unit Tests**: `*.test.ts` files alongside source files
- **Component Tests**: `*.test.tsx` files for React components
- **Test Setup**: `src/test/setup.ts` for global test configuration

### Example Test

```typescript
// src/lib/time.test.ts
import { describe, it, expect } from 'vitest';
import { formatAbsolute } from './time';

describe('Time Utilities', () => {
  it('should format timestamp correctly', () => {
    const result = formatAbsolute(1704067200000);
    expect(result).toMatch(/^[A-Za-z]{3} \d{2}, \d{4} \d{1,2}:\d{2} [AP]M$/);
  });
});
```

## 🎨 UI Components

### Status Chips

The application uses standardized status chips with specific color mappings:

- `active` → blue
- `pending` → gray
- `passed` → green
- `failed` → red
- `executed` → purple
- `canceled` → yellow
- `expired` → slate

```typescript
import { StatusChip } from '@/components/common/StatusChip';

// Automatic status mapping
<StatusChip status="active">Active</StatusChip>
<StatusChip status="passed">Passed</StatusChip>
```

### Loading States

All tables include skeleton loading states:

```typescript
import { ProposalsTableSkeleton } from '@/components/skeleton/TableSkeleton';

{isLoading ? <ProposalsTableSkeleton /> : <ProposalsTable />}
```

## 🔐 Authentication & Permissions

Currently, the application uses mock authentication. To implement real authentication:

1. **Add auth provider** (e.g., Auth0, Clerk, or custom)
2. **Update auth hooks** in `src/hooks/`
3. **Add protected routes** in `src/routes.tsx`
4. **Implement role-based access** in components

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy Options

1. **Vercel**: Connect repository and deploy automatically
2. **Netlify**: Drag and drop `dist` folder
3. **Static Hosting**: Upload `dist` contents to any static host
4. **Docker**: Use provided Dockerfile (if available)

### Environment Variables for Production

Ensure all required environment variables are set in your deployment platform:

- `VITE_AO_TARGET_ID`
- `VITE_TALLY_BASE_URL`
- `VITE_USE_MOCK_AO=false`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use functional components with hooks
- Write tests for new components
- Follow the existing code style
- Update documentation as needed

## 📄 License

[Add your license information here]

## 🆘 Support

For questions or issues:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Contact the development team

---

**Note**: This is a development version. For production use, ensure proper security measures, error handling, and monitoring are in place.
