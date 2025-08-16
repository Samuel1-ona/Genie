import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Bug } from 'lucide-react';

interface ErrorTestComponentProps {
  shouldThrow?: boolean;
}

export function ErrorTestComponent({
  shouldThrow = false,
}: ErrorTestComponentProps) {
  const [throwError, setThrowError] = useState(shouldThrow);

  if (throwError) {
    throw new Error(
      'This is a test error to demonstrate error boundary functionality!'
    );
  }

  const handleThrowError = () => {
    setThrowError(true);
  };

  const handleAsyncError = async () => {
    // Simulate an async error
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error('This is an async error!');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Bug className="h-5 w-5 text-orange-500" />
          <CardTitle>Error Boundary Test</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This component is used to test error boundary functionality. Click the
          buttons below to trigger different types of errors.
        </p>

        <div className="space-y-2">
          <Button
            onClick={handleThrowError}
            variant="destructive"
            className="w-full"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Throw Synchronous Error
          </Button>

          <Button
            onClick={handleAsyncError}
            variant="outline"
            className="w-full"
          >
            <Bug className="h-4 w-4 mr-2" />
            Throw Async Error
          </Button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Note: Async errors may not be caught by error boundaries. Use
          try-catch or error handling in async functions.
        </div>
      </CardContent>
    </Card>
  );
}
