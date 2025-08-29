import React, { createContext, useContext, useState } from 'react';
import {
  ArweaveWalletKit,
  useConnection,
  useActiveAddress,
} from '@arweave-wallet-kit/react';
import WanderStrategy from '@arweave-wallet-kit/wander-strategy';
import BrowserWalletStrategy from '@arweave-wallet-kit/browser-wallet-strategy';
import WebWalletStrategy from '@arweave-wallet-kit/webwallet-strategy';
import AOSyncStrategy from '@vela-ventures/aosync-strategy';

interface WalletContextType {
  isConnected: boolean;
  address?: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

function WalletProviderInner({ children }: { children: React.ReactNode }) {
  const {
    connect: walletKitConnect,
    disconnect: walletKitDisconnect,
    connected,
  } = useConnection();
  const activeAddress = useActiveAddress();
  const [isLoading, setIsLoading] = useState(false);

  const connect = async () => {
    setIsLoading(true);
    try {
      await walletKitConnect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    setIsLoading(true);
    try {
      await walletKitDisconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: WalletContextType = {
    isConnected: connected,
    address: activeAddress,
    connect,
    disconnect,
    isLoading,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <ArweaveWalletKit
      config={{
        strategies: [
          new WanderStrategy(),
          new BrowserWalletStrategy(),
          new WebWalletStrategy(),
          new AOSyncStrategy(),
        ],
        permissions: ['SIGN_TRANSACTION', 'ACCESS_ADDRESS'],
        ensurePermissions: true,
        appInfo: { name: 'Genie-Proposal-Summarizer' },
      }}
      theme={{
        displayTheme: 'dark',
        accent: { r: 59, g: 130, b: 246 }, // blue-500
        titleHighlight: { r: 59, g: 130, b: 246 }, // blue-500
        radius: 'default',
      }}
    >
      <WalletProviderInner>{children}</WalletProviderInner>
    </ArweaveWalletKit>
  );
}
