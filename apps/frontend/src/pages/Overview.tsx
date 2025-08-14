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

export default function Overview() {
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
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
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
            <StatusChip variant="success">Healthy</StatusChip>
            <p className="text-xs text-muted-foreground mt-2">
              Last updated <TimeAgo date={new Date()} />
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
            {[
              {
                id: 1,
                title: 'Proposal #123: Update Treasury Management',
                dao: 'Arweave DAO',
                status: 'pending',
                time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
              },
              {
                id: 2,
                title: 'Proposal #122: Community Grant Program',
                dao: 'AO Foundation',
                status: 'success',
                time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
              },
              {
                id: 3,
                title: 'Proposal #121: Technical Infrastructure Upgrade',
                dao: 'Permaweb DAO',
                status: 'error',
                time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
              },
            ].map(activity => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {activity.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.dao}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <StatusChip
                    variant={
                      activity.status === 'success'
                        ? 'success'
                        : activity.status === 'error'
                          ? 'error'
                          : 'pending'
                    }
                  >
                    {activity.status}
                  </StatusChip>
                  <TimeAgo date={activity.time} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
