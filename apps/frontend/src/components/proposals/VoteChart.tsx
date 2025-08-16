import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Minus } from 'lucide-react';
import type { Proposal } from '@/types';

interface VoteChartProps {
  proposal: Proposal;
}

export function VoteChart({ proposal }: VoteChartProps) {
  const totalVotes = proposal.totalVotes || 0;
  const votesFor = proposal.votesFor || 0;
  const votesAgainst = proposal.votesAgainst || 0;
  const votesAbstain = proposal.votesAbstain || 0;
  const quorum = proposal.quorum || 0;

  const forPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
  const againstPercentage =
    totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;
  const abstainPercentage =
    totalVotes > 0 ? (votesAbstain / totalVotes) * 100 : 0;
  const quorumPercentage = quorum > 0 ? (totalVotes / quorum) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Quorum Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Quorum
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {quorumPercentage.toFixed(0)}% of quorum reached
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Target: {quorum.toLocaleString()} UNI (
              {quorum > 0 ? ((quorum / 1000000000) * 100).toFixed(1) : 0}%)
            </span>
            <span>Current: {totalVotes.toLocaleString()} UNI</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(quorumPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Vote Distribution */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Vote Distribution
        </h4>
        <div className="space-y-3">
          {/* For Votes */}
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                For
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-green-600 dark:text-green-400">
                {forPercentage.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {votesFor.toLocaleString()} UNI
              </div>
            </div>
          </div>

          {/* Against Votes */}
          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Against
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-red-600 dark:text-red-400">
                {againstPercentage.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {votesAgainst.toLocaleString()} UNI
              </div>
            </div>
          </div>

          {/* Abstain Votes */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Minus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Abstain
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                {abstainPercentage.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {votesAbstain.toLocaleString()} UNI
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Votes */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Total Votes
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {totalVotes.toLocaleString()} UNI
          </span>
        </div>
      </div>
    </div>
  );
}
