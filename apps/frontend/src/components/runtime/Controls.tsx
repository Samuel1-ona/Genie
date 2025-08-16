import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Play, Trash2, RefreshCw, Wrench, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  confirmVariant?: 'default' | 'destructive';
}

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  confirmVariant = 'default',
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          >
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              confirmVariant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Controls() {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action:
      | 'runScrape'
      | 'clearCache'
      | 'resetRateLimits'
      | 'repairDatabase'
      | null;
  }>({
    isOpen: false,
    action: null,
  });

  const handleRunScrape = async () => {
    // TODO: Implement run scrape API call
    console.log('Running scrape now...');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleClearCache = async () => {
    // TODO: Implement clear cache API call
    console.log('Clearing cache...');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const handleResetRateLimits = async () => {
    // TODO: Implement reset rate limits API call
    console.log('Resetting rate limits...');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleRepairDatabase = async () => {
    // TODO: Implement repair database API call
    console.log('Repairing database...');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
  };

  const openConfirmDialog = (
    action: 'runScrape' | 'clearCache' | 'resetRateLimits' | 'repairDatabase'
  ) => {
    setConfirmDialog({ isOpen: true, action });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, action: null });
  };

  const getDialogConfig = () => {
    switch (confirmDialog.action) {
      case 'runScrape':
        return {
          title: 'Run Scrape Now',
          description:
            'This will immediately start a scraping operation for all active governance platforms. This may take several minutes to complete.',
          confirmText: 'Run Scrape',
          confirmVariant: 'default' as const,
          onConfirm: handleRunScrape,
        };
      case 'clearCache':
        return {
          title: 'Clear Cache',
          description:
            'This will clear all cached data. This action cannot be undone and may temporarily impact performance.',
          confirmText: 'Clear Cache',
          confirmVariant: 'destructive' as const,
          onConfirm: handleClearCache,
        };
      case 'resetRateLimits':
        return {
          title: 'Reset Rate Limits',
          description:
            "This will reset all API rate limit counters. Use this if you're experiencing rate limit issues.",
          confirmText: 'Reset Limits',
          confirmVariant: 'default' as const,
          onConfirm: handleResetRateLimits,
        };
      case 'repairDatabase':
        return {
          title: 'Repair Database',
          description:
            "This will attempt to repair any database inconsistencies. This may take several minutes and should only be used if you're experiencing data issues.",
          confirmText: 'Repair Database',
          confirmVariant: 'destructive' as const,
          onConfirm: handleRepairDatabase,
        };
      default:
        return null;
    }
  };

  const dialogConfig = getDialogConfig();

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            System Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => openConfirmDialog('runScrape')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            Run Scrape Now
          </Button>

          <Button
            onClick={() => openConfirmDialog('clearCache')}
            variant="outline"
            className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>

          <Button
            onClick={() => openConfirmDialog('resetRateLimits')}
            variant="outline"
            className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Rate Limits
          </Button>

          <Button
            onClick={() => openConfirmDialog('repairDatabase')}
            variant="outline"
            className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Wrench className="h-4 w-4 mr-2" />
            Repair Database
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && dialogConfig && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={closeConfirmDialog}
          onConfirm={dialogConfig.onConfirm}
          title={dialogConfig.title}
          description={dialogConfig.description}
          confirmText={dialogConfig.confirmText}
          confirmVariant={dialogConfig.confirmVariant}
        />
      )}
    </>
  );
}
