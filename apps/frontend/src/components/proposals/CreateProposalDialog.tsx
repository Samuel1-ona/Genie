import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import type { Proposal } from '@/types';

interface CreateProposalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proposalData: Partial<Proposal>) => Promise<void>;
  platforms?: Array<{ id: string; name: string }>;
}

export function CreateProposalDialog({
  isOpen,
  onClose,
  onSubmit,
  platforms = [],
}: CreateProposalDialogProps) {
  const [formData, setFormData] = useState<Partial<Proposal>>({
    title: '',
    description: '',
    content: '',
    platform: '',
    governance_platform_id: '',
    status: 'active',
    type: 'proposal',
    url: '',
    category: 'general',
    deadline: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days from now
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a unique ID for the proposal
      const proposalData = {
        ...formData,
        id: `proposal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
      };

      await onSubmit(proposalData);
      handleClose();
    } catch (error) {
      console.error('Failed to create proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        description: '',
        content: '',
        platform: '',
        governance_platform_id: '',
        status: 'active',
        type: 'proposal',
        url: '',
        category: 'general',
        deadline: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      });
      onClose();
    }
  };

  const handleInputChange = (field: keyof Proposal, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Proposal
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Add a new governance proposal to the system. Fill in the required
            fields below.
          </DialogDescription>
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
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder="Enter proposal title"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={value => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="governance">Governance</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="parameter">Parameter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Enter a brief description of the proposal"
                required
                rows={3}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                Detailed Content
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={e => handleInputChange('content', e.target.value)}
                placeholder="Enter detailed content and reasoning for the proposal"
                rows={4}
                className="w-full"
              />
            </div>
          </div>

          {/* Platform & Governance */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Platform & Governance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform" className="text-sm font-medium">
                  Platform
                </Label>
                <Input
                  id="platform"
                  value={formData.platform}
                  onChange={e => handleInputChange('platform', e.target.value)}
                  placeholder="e.g., Uniswap, Aave, Compound"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="governance_platform_id"
                  className="text-sm font-medium"
                >
                  Governance Platform ID
                </Label>
                <Select
                  value={formData.governance_platform_id}
                  onValueChange={value =>
                    handleInputChange('governance_platform_id', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map(platform => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-medium">
                Proposal URL
              </Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={e => handleInputChange('url', e.target.value)}
                placeholder="https://example.com/proposal"
                className="w-full"
              />
            </div>
          </div>

          {/* Metadata & Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Metadata & Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={value => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="governance">Governance</SelectItem>
                    <SelectItem value="treasury">Treasury</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={value => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="executed">Executed</SelectItem>
                    <SelectItem value="defeated">Defeated</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-sm font-medium">
                Deadline (Unix Timestamp)
              </Label>
              <Input
                id="deadline"
                type="number"
                value={formData.deadline}
                onChange={e =>
                  handleInputChange('deadline', parseInt(e.target.value) || 0)
                }
                placeholder="Unix timestamp for proposal deadline"
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Current value:{' '}
                {formData.deadline
                  ? new Date(formData.deadline * 1000).toLocaleString()
                  : 'Not set'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="bg-gray-800 dark:bg-gray-700 text-white border-gray-600 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || !formData.title || !formData.description
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Proposal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
