import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProposals } from '@/lib/aoClient';
import { VoteChart } from '@/components/proposals/VoteChart';
import { Timeline } from '@/components/proposals/Timeline';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/common/StatusChip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Download,
  MessageSquare,
  MessageCircle,
  Calendar,
  User,
  Hash,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Proposal } from '@/types';

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

const DAO_COLORS = {
  'dao-uniswap': 'bg-pink-500',
  'dao-aave': 'bg-purple-500',
  'dao-makerdao': 'bg-orange-500',
  'dao-compound': 'bg-green-500',
  'dao-ens': 'bg-blue-500',
  'dao-synthetix': 'bg-blue-600',
};

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: proposals, isLoading } = useProposals();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [relatedProposals, setRelatedProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    if (proposals && id) {
      const foundProposal = proposals.find(p => p.id === id);
      setProposal(foundProposal || null);

      if (foundProposal) {
        const related = proposals
          .filter(
            p => p.daoId === foundProposal.daoId && p.id !== foundProposal.id
          )
          .slice(0, 5);
        setRelatedProposals(related);
      }
    }
  }, [proposals, id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleExportJSON = () => {
    if (!proposal) return;

    const dataStr = JSON.stringify(proposal, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proposal-${proposal.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSubscribe = (platform: 'discord' | 'telegram') => {
    console.log(`Subscribe via ${platform}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="h-64 bg-gray-200 dark:bg-gray-700 rounded"
                  ></div>
                ))}
              </div>
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="h-48 bg-gray-200 dark:bg-gray-700 rounded"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Proposal Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The proposal you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/proposals">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Proposals
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const daoName = getDaoDisplayName(proposal.daoId);
  const daoColor =
    DAO_COLORS[proposal.daoId as keyof typeof DAO_COLORS] || 'bg-gray-500';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/proposals"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Proposals
        </Link>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {proposal.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-4 h-4 rounded-full ${daoColor} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {daoName.charAt(0)}
                  </div>
                  <span>{daoName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Hash className="h-4 w-4" />
                  <span>
                    Proposal ID: #
                    {proposal.proposalId?.slice(-8) || proposal.id}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Created:{' '}
                    {new Date(proposal.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    WAT
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <StatusChip variant={proposal.status}>
                {proposal.status}
              </StatusChip>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Source
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Proposal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Proposer
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {proposal.proposer?.slice(0, 6)}...
                        {proposal.proposer?.slice(-4) || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Platform
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {proposal.governancePlatformId === 'platform-snapshot'
                          ? 'Snapshot'
                          : 'Tally.xyz'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Voting Period
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(proposal.startDate).toLocaleDateString()} -{' '}
                        {new Date(proposal.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Execution Date
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {proposal.executionDate
                          ? new Date(
                              proposal.executionDate
                            ).toLocaleDateString()
                          : new Date(proposal.endDate).toLocaleDateString() +
                            ' (Estimated)'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Proposal Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline proposal={proposal} />
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Related Proposals
                  </CardTitle>
                  <Link
                    to="/proposals"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {relatedProposals.length > 0 ? (
                  <div className="space-y-3">
                    {relatedProposals.map(related => (
                      <div
                        key={related.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {related.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Created:{' '}
                            {new Date(related.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <StatusChip variant={related.status} size="sm">
                            {related.status}
                          </StatusChip>
                          {related.totalVotes && (
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div
                                  className={cn(
                                    'h-2 rounded-full',
                                    related.status === 'passed' ||
                                      related.status === 'executed'
                                      ? 'bg-green-500'
                                      : related.status === 'failed'
                                        ? 'bg-red-500'
                                        : 'bg-yellow-500'
                                  )}
                                  style={{
                                    width: `${Math.min((related.totalVotes / (related.quorum || 1)) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {Math.round(
                                  (related.totalVotes / (related.quorum || 1)) *
                                    100
                                )}
                                %
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No related proposals found
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Voting Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VoteChart proposal={proposal} />
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleSubscribe('discord')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Subscribe via Discord
                </Button>
                <Button
                  onClick={() => handleSubscribe('telegram')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Subscribe via Telegram
                </Button>
                <Button
                  onClick={handleExportJSON}
                  variant="outline"
                  className="w-full bg-gray-800 dark:bg-gray-700 text-white border-gray-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="w-full bg-gray-800 dark:bg-gray-700 text-white border-gray-600"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-gray-800 dark:bg-gray-700 text-white border-gray-600"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on{' '}
                  {proposal.governancePlatformId === 'platform-snapshot'
                    ? 'Snapshot'
                    : 'Tally'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Top Voters
                  </CardTitle>
                  <Link
                    to="/proposals"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {proposal.totalVotes ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {proposal.proposer?.slice(0, 6)}...
                            {proposal.proposer?.slice(-4) || 'Unknown'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {(proposal.votesFor || 0).toLocaleString()} UNI
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            0x7a16...5428
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          4.8M UNI
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            0x9b23...1f4a
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          2.1M UNI
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No votes cast yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
