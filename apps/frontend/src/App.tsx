import { AppRoutes } from './routes';
import { WalletProvider } from './wallet/WalletContext';

function App() {
  return (
    <WalletProvider>
      <AppRoutes />
    </WalletProvider>
  );
}

export default App;
