import { ErrorTestComponent } from '@/components/test/ErrorTestComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Info } from 'lucide-react';

export default function ErrorTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Error Boundary Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the error boundary functionality and see how errors are handled
          </p>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-blue-900 dark:text-blue-100">
                How Error Boundaries Work
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-blue-800 dark:text-blue-200">
            <ul className="space-y-2 text-sm">
              <li>
                • Error boundaries catch JavaScript errors anywhere in their
                child component tree
              </li>
              <li>
                • They log those errors and display a fallback UI instead of the
                crashed component
              </li>
              <li>
                • Error boundaries only catch errors in the components below
                them in the tree
              </li>
              <li>
                • They don't catch errors in event handlers, async code, or
                server-side rendering
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Warning Card */}
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <CardTitle className="text-yellow-900 dark:text-yellow-100">
                Important Notes
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-yellow-800 dark:text-yellow-200">
            <ul className="space-y-2 text-sm">
              <li>
                • Error boundaries only catch errors in the render phase,
                lifecycle methods, and constructors
              </li>
              <li>
                • They don't catch errors in event handlers, async code, or
                server-side rendering
              </li>
              <li>
                • For those cases, use try-catch blocks or error handling in
                async functions
              </li>
              <li>
                • Error boundaries are React components that implement
                componentDidCatch or getDerivedStateFromError
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Test Component */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Error Boundary</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorTestComponent />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Boundary Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  What happens when an error occurs:
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Error is logged to console for debugging</li>
                  <li>
                    • Fallback UI is displayed instead of crashed component
                  </li>
                  <li>• "Try Again" button to reset the error state</li>
                  <li>• "Go Home" button to navigate back to homepage</li>
                  <li>• "Go Back" button to return to previous page</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Error boundary features:
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Catches JavaScript errors in component tree</li>
                  <li>• Logs error information for debugging</li>
                  <li>• Displays user-friendly error message</li>
                  <li>• Provides recovery options</li>
                  <li>• Prevents entire app from crashing</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Test Different Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Synchronous Errors
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Errors thrown during render, constructor, or lifecycle methods
                  are caught by error boundaries.
                </p>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Async Errors
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Errors in async functions, promises, or event handlers are NOT
                  caught by error boundaries.
                </p>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  404 Errors
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Invalid routes show the NotFound page with navigation options
                  to get back on track.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
