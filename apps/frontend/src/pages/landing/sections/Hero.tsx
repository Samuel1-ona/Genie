import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/common/AppLogo';
import { Badge } from '@/components/ui/badge';
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton';
import { WalletStatusChip } from '@/components/wallet/WalletStatusChip';
import { useWallet } from '@/wallet/WalletContext';

export function Hero() {
  const navigate = useNavigate();
  const { isConnected } = useWallet();

  // Mock AO connection status - in real app this would ping the AO agent
  const isAOConnected = true; // TODO: Replace with actual AO ping

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />

      <div className="relative max-w-5xl mx-auto px-4 py-24 sm:py-32">
        <div className="text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <AppLogo size="lg" />
          </div>

          {/* Main headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Genie—Governance, Simplified.
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Track DAO proposals across platforms, get real-time updates, and
              manage notifications—on Arweave AO.
            </p>
          </div>

          {/* Status chips */}
          <div className="flex justify-center gap-3">
            <Badge
              variant="outline"
              className="bg-gray-900/50 border-gray-700 text-gray-300"
            >
              AO Agent: {isAOConnected ? 'Connected' : 'Unknown'}
            </Badge>
            <WalletStatusChip />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isConnected ? (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate('/app')}
                  className="px-8 py-3 text-lg"
                >
                  Enter App
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => navigate('/app/proposals')}
                    className="text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    View Proposals
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    asChild
                    className="text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <a
                      href="https://www.ao.link/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Learn More (AO)
                    </a>
                  </Button>
                </div>
              </>
            ) : (
              <ConnectWalletButton />
            )}
          </div>

          {/* Meta line */}
          <p className="text-sm text-gray-500">
            Built for DAO ops • Runs on Arweave AO
          </p>

          {/* Hidden wallet connect for future use */}
          {/* 
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => {
              // TODO: Implement wallet connection modal
              console.log('Connect wallet clicked');
            }}
            className="text-gray-300 border-gray-600 hover:bg-gray-800"
          >
            Connect Wallet
          </Button>
          */}
        </div>
      </div>
    </section>
  );
}
