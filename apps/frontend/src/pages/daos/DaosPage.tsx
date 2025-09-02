import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGovernancePlatforms,
  useAddGovernancePlatform,
} from '@/lib/aoClient';
import { DaoCard } from '@/components/daos/DaoCard';
import { AddPlatformDialog } from '@/components/daos/AddPlatformDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Grid3X3, List, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

export default function DaosPage() {
  const navigate = useNavigate();
  const { data: platforms, isLoading } = useGovernancePlatforms();
  const addPlatformMutation = useAddGovernancePlatform();
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Ensure platforms is always an array for safety
  const safePlatforms = Array.isArray(platforms) ? platforms : [];

  // Filter platforms based on search and filters
  const filteredPlatforms = useMemo(() => {
    if (!safePlatforms.length) return [];

    return safePlatforms.filter((platform: any) => {
      const matchesSearch =
        platform.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        platform.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlatform =
        platformFilter === 'all' || platform.type === platformFilter;
      const matchesStatus =
        statusFilter === 'all' || platform.status === statusFilter;

      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [safePlatforms, searchQuery, platformFilter, statusFilter]);

  const handleAddPlatform = async (platformData: {
    name: string;
    governanceId: string;
    url: string;
  }) => {
    try {
      console.log('Adding platform:', platformData);

      // Use the mutation hook to add the platform
      await addPlatformMutation.mutateAsync({
        name: platformData.name,
        url: platformData.url,
        id: platformData.governanceId,
        type: 'governoralpha',
        chainId: '1',
      });

      // Success is handled by the mutation hook's onSuccess callback
      setShowAddDialog(false);
    } catch (error) {
      console.error('Failed to add platform:', error);
      // Error is handled by the mutation hook's onError callback
    }
  };

  const handleCardClick = (platformId: string) => {
    navigate(`/proposals?dao=${platformId}`);
  };

  const handleRunScrape = async (platformId: string) => {
    // TODO: Implement scrape logic
    console.log('Running scrape for platform:', platformId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className="h-48 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Tracked Governance Platforms
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage and monitor DAOs and governance platforms
            </p>
          </div>

          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search DAO platforms..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Add Platform Button */}
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Platform
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                View:
              </span>
              <div className="flex bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-l-md transition-colors',
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-r-md transition-colors',
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center space-x-4 mb-6">
          <div className="relative">
            <Button
              variant="outline"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              All Platforms
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="relative">
            <Button
              variant="outline"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              All Status
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Platform Grid */}
        {filteredPlatforms.length > 0 ? (
          <div
            className={cn(
              'grid gap-6',
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            )}
          >
            {filteredPlatforms.map(platform => (
              <DaoCard
                key={platform.id}
                platform={platform}
                viewMode={viewMode}
                onClick={() => handleCardClick(platform.id)}
                onRunScrape={() => handleRunScrape(platform.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || platformFilter !== 'all' || statusFilter !== 'all'
                ? 'No platforms match your filters'
                : 'No platforms found'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredPlatforms.length > 0 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {filteredPlatforms.length} of {platforms?.length || 0}{' '}
              platforms
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                ←
              </Button>
              {[1, 2, 3, 4, 5].map(page => (
                <Button
                  key={page}
                  variant={page === 1 ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    page === 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  )}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Platform Dialog */}
      <AddPlatformDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddPlatform}
      />
    </div>
  );
}
