import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useEnrichProposal } from '@/hooks/useAI';
import { toast } from '@/lib/toast';

interface AIEnrichButtonProps {
  proposalId: string;
  mode?: 'short' | 'detailed' | 'both';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  onSuccess?: () => void;
}

export function AIEnrichButton({
  proposalId,
  mode = 'both',
  variant = 'outline',
  size = 'default',
  className = '',
  onSuccess,
}: AIEnrichButtonProps) {
  const enrichMutation = useEnrichProposal(proposalId);

  const handleEnrich = async () => {
    try {
      await enrichMutation.mutateAsync({ mode });
      toast({
        title: 'AI Summary Updated',
        description: 'The proposal has been enriched with AI analysis.',
        variant: 'default',
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Enrichment Failed',
        description:
          error instanceof Error ? error.message : 'Failed to enrich proposal',
        variant: 'destructive',
      });
    }
  };

  const isLoading = enrichMutation.isPending;
  const buttonText = isLoading ? 'Enriching...' : 'Generate Summary';

  return (
    <Button
      onClick={handleEnrich}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`${className}`}
      aria-label={`Generate AI summary for proposal ${proposalId}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4 mr-2" />
      )}
      {buttonText}
    </Button>
  );
}
