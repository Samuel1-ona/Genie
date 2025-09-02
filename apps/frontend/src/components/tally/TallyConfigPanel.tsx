/**
 * Tally Configuration Panel
 * Helps users configure and test their Tally API connection
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ExternalLink,
  CheckCircle,
  XCircle,
  Settings,
  TestTube,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { env } from '@/config/env';
import { tallyApi, tallyRequestWithRetry } from '@/lib/tallyClient';
import { toast } from '@/lib/toast';

interface TallyConfigPanelProps {
  className?: string;
}

export function TallyConfigPanel({ className = '' }: TallyConfigPanelProps) {
  const [apiKey, setApiKey] = useState(env.TALLY_API_KEY || '');
  const [orgId, setOrgId] = useState(env.TALLY_DEFAULT_ORG_ID || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  const hasApiKey = !!env.TALLY_API_KEY;
  const hasChainId = !!env.TALLY_DEFAULT_CHAIN_ID;

  const testConnection = async () => {
    if (!apiKey || !orgId) {
      toast.error('Please provide both API key and organization ID');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Test the connection using the test method first
      console.log('Testing Tally API connection...');

      const proposals = await tallyRequestWithRetry(() =>
        tallyApi.testProposals('eip155:1')
      );

      // Test fetching governors
      const governors = await tallyRequestWithRetry(() =>
        tallyApi.getGovernors(
          ['eip155:1'],
          { limit: 5, offset: 0 },
          { field: 'TOTAL_PROPOSALS', order: 'DESC' }
        )
      );

      setTestResult({
        success: true,
        message: `Successfully connected to Tally GraphQL API! Found ${proposals.length} proposals and ${governors.length} governors on Ethereum mainnet`,
        data: {
          proposals,
          governors,
          proposalCount: proposals.length,
          governorCount: governors.length,
        },
      });

      toast.success('Tally GraphQL API connection successful!');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setTestResult({
        success: false,
        message: `Connection failed: ${errorMessage}`,
        data: { error },
      });
      toast.error('Tally GraphQL API connection failed', errorMessage);
    } finally {
      setIsTesting(false);
    }
  };

  const refreshConfig = () => {
    setApiKey(env.TALLY_API_KEY || '');
    setOrgId(env.TALLY_DEFAULT_CHAIN_ID || '');
    setTestResult(null);
  };

  return (
    <Card
      className={`bg-white dark:bg-gray-800 shadow-sm border-0 ${className}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <span>Tally API Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure your Tally API connection to access existing governance
          proposals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Status:</span>
            {hasApiKey && hasChainId ? (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Configured
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Not Configured
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshConfig}
            className="h-8 px-3"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>

        {/* Configuration Fields */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="tally-api-key" className="text-sm font-medium">
              Tally API Key
            </Label>
            <Input
              id="tally-api-key"
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Enter your Tally API key"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Get your API key from the Tally Developer Portal
            </p>
          </div>

          <div>
            <Label htmlFor="tally-chain-id" className="text-sm font-medium">
              Default Chain ID
            </Label>
            <Input
              id="tally-chain-id"
              value={orgId}
              onChange={e => setOrgId(e.target.value)}
              placeholder="eip155:1 (Ethereum mainnet)"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Default chain ID for proposals. Examples: eip155:1 (Ethereum),
              eip155:137 (Polygon)
            </p>
          </div>
        </div>

        {/* Test Connection */}
        <div className="pt-2">
          <Button
            onClick={testConnection}
            disabled={isTesting || !apiKey || !orgId}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>

        {/* Test Results */}
        {testResult && (
          <Alert
            className={
              testResult.success
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }
          >
            {testResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={testResult.success ? 'text-green-800' : 'text-red-800'}
            >
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Help Information */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              How it works
            </span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p>
              • Tally API provides immediate access to existing governance
              proposals
            </p>
            <p>
              • No need to wait for scraping - proposals are available instantly
            </p>
            <p>• Data is automatically refreshed every 5 minutes</p>
            <p>
              • Combine with AO process for comprehensive governance tracking
            </p>
          </div>
        </div>

        {/* External Links */}
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.open('https://tally.xyz', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Tally.xyz
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
