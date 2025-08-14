import { ConnectButton } from 'arweave-wallet-kit';
import Counter from './components/counter';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import aoLogo from '/ao.svg';
import reactLogo from '/react.svg';
import viteLogo from '/vite.svg';

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
              <img src={viteLogo} className="h-8 w-8" alt="Vite logo" />
            </a>
            <a href="https://ao.g8way.io" target="_blank" rel="noreferrer">
              <img src={aoLogo} className="h-8 w-8" alt="AO logo" />
            </a>
            <a href="https://react.dev" target="_blank" rel="noreferrer">
              <img src={reactLogo} className="h-8 w-8" alt="React logo" />
            </a>
          </div>
          <ConnectButton profileModal={true} showBalance={true} />
        </header>

        <main className="space-y-6">
          <h1 className="text-4xl font-bold">Vite + React + AO</h1>
          <p className="text-gray-600 dark:text-gray-400">
            AO Books Process:{' '}
            <a
              href="https://www.ao.link/#/entity/SELF"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              SELF
            </a>
          </p>
          <Card>
            <CardHeader>
              <CardTitle>Counter Component</CardTitle>
              <CardDescription>
                This is a counter component using shadcn/ui styling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Counter />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>UI Components Demo</CardTitle>
              <CardDescription>
                Demonstrating shadcn/ui components with different variants
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button variant="default">Default Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="destructive">Destructive Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="link">Link Button</Button>
            </CardContent>
          </Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Project scaffolded using{' '}
            <a
              href="https://create-ao-dapp.dev"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              create-ao-dapp
            </a>
            . Built with ❤️ by Autonomous Research
          </p>
        </main>
      </div>
    </div>
  );
}

export default App;
