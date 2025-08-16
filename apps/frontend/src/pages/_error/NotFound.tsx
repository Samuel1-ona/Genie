import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  Home,
  ArrowLeft,
  FileText,
  Building2,
  Bell,
} from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Search className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick Navigation */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Quick Navigation
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" asChild className="h-auto p-3 flex-col">
                <Link to="/">
                  <Home className="h-5 w-5 mb-1" />
                  <span className="text-xs">Overview</span>
                </Link>
              </Button>

              <Button variant="outline" asChild className="h-auto p-3 flex-col">
                <Link to="/proposals">
                  <FileText className="h-5 w-5 mb-1" />
                  <span className="text-xs">Proposals</span>
                </Link>
              </Button>

              <Button variant="outline" asChild className="h-auto p-3 flex-col">
                <Link to="/daos">
                  <Building2 className="h-5 w-5 mb-1" />
                  <span className="text-xs">DAOs</span>
                </Link>
              </Button>

              <Button variant="outline" asChild className="h-auto p-3 flex-col">
                <Link to="/notifications">
                  <Bell className="h-5 w-5 mb-1" />
                  <span className="text-xs">Notifications</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>

            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
