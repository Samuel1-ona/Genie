import { useState } from 'react';
import { Copy, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useWallet } from '@/wallet/WalletContext';
import { cn } from '@/lib/utils';

export function ConnectWalletButton() {
  const { isConnected, address, connect, disconnect, isLoading } = useWallet();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      // You could add a toast notification here
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const copyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        // You could add a toast notification here
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 bg-gray-900/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <span className="text-sm font-mono">{formatAddress(address)}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isDropdownOpen && 'rotate-180'
            )}
          />
        </Button>

        {isDropdownOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-gray-900 border border-gray-700 shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  Copy Address
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setIsDialogOpen(true)}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-gray-100">
            Connect Your Wallet
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-400">
            Choose your preferred Arweave wallet to connect to
            Genie-Proposal-Summarizer.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>✅ Real Arweave Wallet Kit Integration</p>
            <p>✅ Supports Wander.app, Arweave.app, Browser Wallets</p>
            <p>✅ AO-Sync Strategy Enabled</p>
          </div>
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Connecting...' : 'Connect with Arweave Wallet Kit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
