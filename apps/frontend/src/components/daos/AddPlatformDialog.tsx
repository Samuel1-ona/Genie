import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface AddPlatformDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (platformData: {
    name: string;
    governanceId: string;
    url: string;
  }) => void;
}

export function AddPlatformDialog({
  isOpen,
  onClose,
  onAdd,
}: AddPlatformDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    governanceId: '',
    url: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.governanceId || !formData.url) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onAdd(formData);
      setFormData({ name: '', governanceId: '', url: '' });
      onClose();
    } catch (error) {
      console.error('Failed to add platform:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: '', governanceId: '', url: '' });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Platform
          </DialogTitle>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Platform Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Uniswap, Aave, MakerDAO"
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                required
                disabled={isSubmitting}
                className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>

            <div>
              <Label
                htmlFor="governanceId"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Governance ID
              </Label>
              <Input
                id="governanceId"
                type="text"
                placeholder="e.g., dao-uniswap, dao-aave"
                value={formData.governanceId}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    governanceId: e.target.value,
                  }))
                }
                required
                disabled={isSubmitting}
                className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Unique identifier for the governance platform
              </p>
            </div>

            <div>
              <Label
                htmlFor="url"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Platform URL
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                value={formData.url}
                onChange={e =>
                  setFormData(prev => ({ ...prev, url: e.target.value }))
                }
                required
                disabled={isSubmitting}
                className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                URL to the governance platform (Tally, Snapshot, etc.)
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.name ||
                !formData.governanceId ||
                !formData.url
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Adding...' : 'Add Platform'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
