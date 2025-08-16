import { CheckCircle, Circle, ArrowLeftRight } from 'lucide-react';
import type { Proposal } from '@/types';

interface TimelineProps {
  proposal: Proposal;
}

export function Timeline({ proposal }: TimelineProps) {
  const now = new Date();
  const startDate = new Date(proposal.startDate);
  const endDate = new Date(proposal.endDate);
  const executionDate = proposal.executionDate
    ? new Date(proposal.executionDate)
    : null;

  const isVotingOpen = now >= startDate && now <= endDate;
  const isVotingClosed = now > endDate;
  const isExecuted =
    proposal.status === 'executed' || proposal.status === 'passed';
  const isFailed =
    proposal.status === 'failed' || proposal.status === 'canceled';

  const timelineSteps = [
    {
      id: 'created',
      title: 'Proposal Created',
      date: new Date(proposal.createdAt),
      description:
        'Proposal was submitted by the proposer and published on-chain.',
      icon: CheckCircle,
      status: 'completed',
      color: 'text-green-500',
    },
    {
      id: 'voting-open',
      title: 'Voting Open',
      date: startDate,
      description: 'Voting period started. Token holders can cast their votes.',
      icon: Circle,
      status: isVotingOpen
        ? 'active'
        : isVotingClosed
          ? 'completed'
          : 'pending',
      color: isVotingOpen
        ? 'text-blue-500'
        : isVotingClosed
          ? 'text-green-500'
          : 'text-gray-400',
    },
    {
      id: 'voting-closed',
      title: 'Voting Closed',
      date: endDate,
      description:
        'Voting period will end. No more votes can be cast after this time.',
      icon: Circle,
      status: isVotingClosed ? 'completed' : 'pending',
      color: isVotingClosed ? 'text-green-500' : 'text-gray-400',
    },
    {
      id: 'execution',
      title: 'Execution / Cancellation',
      date: executionDate || endDate,
      description: isExecuted
        ? 'Proposal was executed successfully.'
        : isFailed
          ? 'Proposal was canceled or failed.'
          : 'If passed, proposal will be executed. If failed, proposal will be canceled.',
      icon: ArrowLeftRight,
      status: isExecuted || isFailed ? 'completed' : 'pending',
      color: isExecuted
        ? 'text-green-500'
        : isFailed
          ? 'text-red-500'
          : 'text-gray-400',
    },
  ];

  return (
    <div className="relative">
      {timelineSteps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === timelineSteps.length - 1;

        return (
          <div key={step.id} className="relative flex items-start space-x-3">
            {/* Timeline Line */}
            {!isLast && (
              <div className="absolute left-6 top-8 w-0.5 h-16 bg-gray-200 dark:bg-gray-700"></div>
            )}

            {/* Icon */}
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                step.status === 'completed'
                  ? 'bg-green-500 border-green-500'
                  : step.status === 'active'
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
              }`}
            >
              <Icon
                className={`h-6 w-6 ${
                  step.status === 'completed' || step.status === 'active'
                    ? 'text-white'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-8">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {step.title}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {step.date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  WAT
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {step.description}
              </p>

              {/* Status indicator */}
              {step.status === 'active' && (
                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  Active
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
