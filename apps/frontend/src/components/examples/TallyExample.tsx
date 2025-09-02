/**
 * Tally API Example Component
 * Demonstrates how to use the Tally API hooks
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import {
  useOrganizationUsers,
  useOrganization,
  useOrganizationProposals,
  useProposal,
  useOrganizationSearch,
} from '@/hooks/useTally';

export const TallyExample: React.FC = () => {
  const [organizationId, setOrganizationId] = useState<string>('');
  const [proposalId, setProposalId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Organization hooks
  const {
    organization,
    loading: orgLoading,
    error: orgError,
  } = useOrganization(organizationId || null);
  const {
    users,
    loading: usersLoading,
    error: usersError,
  } = useOrganizationUsers(organizationId || null);
  const {
    proposals,
    loading: proposalsLoading,
    error: proposalsError,
  } = useOrganizationProposals(organizationId || null);

  // Proposal hook
  const {
    proposal,
    loading: proposalLoading,
    error: proposalError,
  } = useProposal(proposalId || null);

  // Search hook
  const {
    organizations,
    loading: searchLoading,
    error: searchError,
  } = useOrganizationSearch(searchQuery || null);

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Tally API Integration Example</h1>

        {/* Organization Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />

              {searchLoading && <LoadingState />}
              {searchError && <ErrorState error={searchError.message} />}

              {organizations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Search Results:</h3>
                  {organizations.map(org => (
                    <div
                      key={org.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => setOrganizationId(org.id)}
                    >
                      <div className="font-medium">{org.name}</div>
                      <div className="text-sm text-gray-600">
                        {org.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Organization Details */}
        {organizationId && (
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent>
              {orgLoading && <LoadingState />}
              {orgError && <ErrorState error={orgError.message} />}

              {organization && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{organization.name}</h3>
                    <p className="text-gray-600">{organization.description}</p>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {organization.proposalsCount || 0} Proposals
                    </Badge>
                    <Badge variant="outline">
                      {organization.membersCount || 0} Members
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Organization Users */}
        {organizationId && (
          <Card>
            <CardHeader>
              <CardTitle>Organization Users</CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading && <LoadingState />}
              {usersError && <ErrorState error={usersError.message} />}

              {users.length > 0 ? (
                <div className="space-y-2">
                  {users.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !usersLoading && <EmptyState message="No users found" />
              )}
            </CardContent>
          </Card>
        )}

        {/* Organization Proposals */}
        {organizationId && (
          <Card>
            <CardHeader>
              <CardTitle>Organization Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              {proposalsLoading && <LoadingState />}
              {proposalsError && <ErrorState error={proposalsError.message} />}

              {proposals.length > 0 ? (
                <div className="space-y-2">
                  {proposals.map(prop => (
                    <div
                      key={prop.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => setProposalId(prop.id)}
                    >
                      <div className="font-medium">{prop.title}</div>
                      <div className="text-sm text-gray-600">
                        {prop.description}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge
                          variant={
                            prop.status === 'active' ? 'default' : 'secondary'
                          }
                        >
                          {prop.status}
                        </Badge>
                        <Badge variant="outline">
                          {prop.votesCount || 0} votes
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !proposalsLoading && <EmptyState message="No proposals found" />
              )}
            </CardContent>
          </Card>
        )}

        {/* Proposal Details */}
        {proposalId && (
          <Card>
            <CardHeader>
              <CardTitle>Proposal Details</CardTitle>
            </CardHeader>
            <CardContent>
              {proposalLoading && <LoadingState />}
              {proposalError && <ErrorState error={proposalError.message} />}

              {proposal && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{proposal.title}</h3>
                    <p className="text-gray-600 mt-2">{proposal.description}</p>
                  </div>

                  <div className="flex gap-2">
                    <Badge
                      variant={
                        proposal.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {proposal.status}
                    </Badge>
                    <Badge variant="outline">
                      {proposal.votesCount || 0} votes
                    </Badge>
                  </div>

                  {proposal.choices && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Choices:</h4>
                      {proposal.choices.map((choice: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span>{choice}</span>
                          <Badge variant="outline">
                            {proposal.votes?.[choice] || 0}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
