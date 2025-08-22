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
import { X, MessageSquare, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddSubscriberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (subscriberData: {
    name: string;
    type: 'discord' | 'telegram';
    endpoint: string;
    active: boolean;
  }) => void;
}

const TYPE_OPTIONS = [
  {
    id: 'discord',
    label: 'Discord',
    icon: MessageSquare,
    description: 'Discord webhook URL',
    placeholder: 'https://discord.com/api/webhooks/...',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: MessageCircle,
    description: 'Telegram chat ID',
    placeholder: '-1001234567890',
  },
] as const;

export function AddSubscriberDialog({
  isOpen,
  onClose,
  onAdd,
}: AddSubscriberDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'discord' as 'discord' | 'telegram',
    endpoint: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedType = TYPE_OPTIONS.find(option => option.id === formData.type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.endpoint) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the data according to the expected structure
      const subscriberData = {
        name: formData.name,
        type: formData.type,
        endpoint: formData.endpoint,
        active: true,
      };

      await onAdd(subscriberData);
      setFormData({ name: '', type: 'discord', endpoint: '' });
      onClose();
    } catch (error) {
      console.error('Failed to add subscriber:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: '', type: 'discord', endpoint: '' });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Subscriber
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
                Subscriber Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Genie Alerts, DAO News Channel"
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
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Platform Type
              </Label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {TYPE_OPTIONS.map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setFormData(prev => ({ ...prev, type: option.id }))
                      }
                      className={cn(
                        'relative flex cursor-pointer rounded-lg border p-4 focus:outline-none',
                        formData.type === option.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center">
                          <div className="text-sm">
                            <Icon className="h-5 w-5 text-gray-900 dark:text-white" />
                            <p className="font-medium text-gray-900 dark:text-white">
                              {option.label}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label
                htmlFor="endpoint"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {selectedType?.label} Endpoint
              </Label>
              <Input
                id="endpoint"
                type="text"
                placeholder={selectedType?.placeholder}
                value={formData.endpoint}
                onChange={e =>
                  setFormData(prev => ({ ...prev, endpoint: e.target.value }))
                }
                required
                disabled={isSubmitting}
                className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.type === 'discord'
                  ? 'Enter your Discord webhook URL from channel settings'
                  : 'Enter your Telegram chat ID (e.g., -1001234567890)'}
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
              disabled={isSubmitting || !formData.name || !formData.endpoint}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Adding...' : 'Add Subscriber'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
