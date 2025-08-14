import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatusChip } from '@/components/common/StatusChip';
import { TimeAgo } from '@/components/common/TimeAgo';
import { LayoutDashboard, TrendingUp, Users, FileText } from 'lucide-react';
import { useProposals, useRuntimeStats } from '@/hooks/useAOClient';

export default function Overview() {
  const { data: proposals, isLoading: proposalsLoading } = useProposals();
  const { data: runtimeStats, isLoading: statsLoading } = useRuntimeStats();

  const activeProposals = proposals?.filter(p => p.status === 'active') || [];
  const totalProposals = proposals?.length || 0;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Overview
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Welcome to Genie Proposal Summarizer
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Proposals
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proposalsLoading ? '...' : activeProposals.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {proposalsLoading
                ? 'Loading...'
                : `${totalProposals} total proposals`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total DAOs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Runtime Status
            </CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <StatusChip
              variant={
                statsLoading
                  ? 'default'
                  : runtimeStats?.status === 'healthy'
                    ? 'success'
                    : 'error'
              }
            >
              {statsLoading ? 'Loading...' : runtimeStats?.status || 'Unknown'}
            </StatusChip>
            <p className="text-xs text-muted-foreground mt-2">
              {statsLoading ? (
                'Loading...'
              ) : (
                <>
                  Last updated{' '}
                  <TimeAgo
                    date={new Date(runtimeStats?.lastHealthCheck || Date.now())}
                  />
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest proposals and updates from your DAOs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proposalsLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading proposals...
              </div>
            ) : proposals && proposals.length > 0 ? (
              proposals.slice(0, 3).map(proposal => (
                <div
                  key={proposal.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {proposal.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {proposal.daoId}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <StatusChip variant={proposal.status}>
                      {proposal.status}
                    </StatusChip>
                    <TimeAgo date={new Date(proposal.createdAt)} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No proposals found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
