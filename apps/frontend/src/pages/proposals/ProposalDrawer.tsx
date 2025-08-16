import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/common/StatusChip';
import { TimeAgo } from '@/components/common/TimeAgo';
import { X, ExternalLink, Calendar, Users, Vote } from 'lucide-react';
import type { Proposal } from '@/types';

interface ProposalDrawerProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
}

// Get DAO display name
const getDaoDisplayName = (daoId: string): string => {
  const daoMap: Record<string, string> = {
    'dao-uniswap': 'Uniswap',
    'dao-aave': 'Aave',
    'dao-makerdao': 'MakerDAO',
    'dao-compound': 'Compound',
    'dao-ens': 'ENS',
    'dao-synthetix': 'Synthetix',
  };
  return daoMap[daoId] || daoId;
};

// Calculate participation percentage
const calculateParticipation = (proposal: Proposal): number => {
  if (!proposal.totalVotes || !proposal.quorum) return 0;
  return Math.min((proposal.totalVotes / proposal.quorum) * 100, 100);
};

export function ProposalDrawer({
  proposal,
  isOpen,
  onClose,
}: ProposalDrawerProps) {
  if (!proposal) return null;

  const participation = calculateParticipation(proposal);
  const daoName = getDaoDisplayName(proposal.daoId);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Proposal Details
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-full">
          {/* Title */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {proposal.title}
            </h3>
            <div className="flex items-center space-x-2">
              <StatusChip variant={proposal.status}>
                {proposal.status}
              </StatusChip>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {daoName}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Description
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {proposal.description}
            </p>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Start Date
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(proposal.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  End Date
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(proposal.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Voting Results */}
          {proposal.totalVotes && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Voting Results
              </h4>

              <div className="space-y-3">
                {/* For Votes */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    For
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${((proposal.votesFor || 0) / proposal.totalVotes) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {proposal.votesFor?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>

                {/* Against Votes */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Against
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${((proposal.votesAgainst || 0) / proposal.totalVotes) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      {proposal.votesAgainst?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>

                {/* Abstain Votes */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Abstain
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gray-500 h-2 rounded-full"
                        style={{
                          width: `${((proposal.votesAbstain || 0) / proposal.totalVotes) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {proposal.votesAbstain?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>

                {/* Participation */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Participation
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {participation.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quorum */}
          {proposal.quorum && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Quorum
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {proposal.quorum.toLocaleString()} votes required
              </p>
            </div>
          )}

          {/* Execution Info */}
          {proposal.executionDate && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Execution
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Executed on{' '}
                {new Date(proposal.executionDate).toLocaleDateString()}
                {proposal.executedBy && (
                  <span className="block mt-1">
                    by {proposal.executedBy.slice(0, 6)}...
                    {proposal.executedBy.slice(-4)}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Metadata */}
          {proposal.metadata && Object.keys(proposal.metadata).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Additional Info
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(proposal.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={() => {
              // Handle view details action
              console.log('View details for proposal:', proposal.id);
              onClose();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    </>
  );
}
