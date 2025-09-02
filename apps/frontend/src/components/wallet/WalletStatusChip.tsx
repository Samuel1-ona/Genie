import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/wallet/WalletContext';

export function WalletStatusChip() {
  const { isConnected, address } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <Badge
        variant="outline"
        className="bg-green-600/20 border-green-500/30 text-green-300"
      >
        Connected • {formatAddress(address)}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-gray-600/20 border-gray-500/30 text-gray-300"
    >
      Not Connected
    </Badge>
  );
}
