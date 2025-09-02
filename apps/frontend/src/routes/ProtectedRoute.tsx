import { ReactNode } from 'react';
import { useWallet } from '@/wallet/WalletContext';
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton';
import { env } from '@/config/env';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isConnected } = useWallet();

  // Allow bypass for development/demo mode
  const requireWallet = env.REQUIRE_WALLET !== false;

  if (!requireWallet || isConnected) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center space-y-8 px-4">
        {/* Lock Icon */}
        <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-100">
            🔐 Please connect your wallet to continue
          </h1>
          <p className="text-gray-400">
            Genie-Proposal-Summarizer requires a wallet connection to access the
            application.
          </p>
        </div>

        {/* Connect Button */}
        <div className="flex justify-center">
          <ConnectWalletButton />
        </div>

        {/* Additional Info */}
        <div className="text-sm text-gray-500 space-y-2">
          <p>Supported wallets:</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <span className="px-2 py-1 bg-gray-800 rounded">Wander.app</span>
            <span className="px-2 py-1 bg-gray-800 rounded">Arweave.app</span>
            <span className="px-2 py-1 bg-gray-800 rounded">
              Browser Wallets
            </span>
            <span className="px-2 py-1 bg-gray-800 rounded">AO-Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}
