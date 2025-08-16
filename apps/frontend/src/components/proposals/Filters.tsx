import { useState } from 'react';
import { ChevronDown, Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FiltersProps {
  dao: string;
  status: string;
  dateRange: string;
  searchQuery: string;
  onFiltersChange: (updates: Record<string, string>) => void;
}

const DAO_OPTIONS = [
  { value: 'all', label: 'All DAOs' },
  { value: 'dao-uniswap', label: 'Uniswap' },
  { value: 'dao-aave', label: 'Aave' },
  { value: 'dao-makerdao', label: 'MakerDAO' },
  { value: 'dao-compound', label: 'Compound' },
  { value: 'dao-ens', label: 'ENS' },
  { value: 'dao-synthetix', label: 'Synthetix' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'executed', label: 'Executed' },
];

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export function Filters({
  dao,
  status,
  dateRange,
  searchQuery,
  onFiltersChange,
}: FiltersProps) {
  const [isDaoOpen, setIsDaoOpen] = useState(false);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  const handleDaoChange = (value: string) => {
    onFiltersChange({ dao: value });
    setIsDaoOpen(false);
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ status: value });
  };

  const handleDateRangeChange = (value: string) => {
    onFiltersChange({ dateRange: value });
    setIsDateRangeOpen(false);
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value });
  };

  const selectedDao =
    DAO_OPTIONS.find(option => option.value === dao)?.label || 'All DAOs';
  const selectedDateRange =
    DATE_RANGE_OPTIONS.find(option => option.value === dateRange)?.label ||
    'All Time';

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* DAO Filter */}
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsDaoOpen(!isDaoOpen)}
          className="bg-gray-800 dark:bg-gray-700 text-white border-gray-600 min-w-[140px] justify-between"
        >
          {selectedDao}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>

        {isDaoOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 dark:bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10">
            {DAO_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleDaoChange(option.value)}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors',
                  option.value === dao ? 'bg-blue-600 text-white' : 'text-white'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-1">
        {STATUS_OPTIONS.map(option => (
          <Button
            key={option.value}
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange(option.value)}
            className={cn(
              'bg-gray-800 dark:bg-gray-700 text-white border-gray-600',
              option.value === status
                ? 'bg-blue-600 border-blue-600'
                : 'hover:bg-gray-700 dark:hover:bg-gray-600'
            )}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Date Range Filter */}
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
          className="bg-gray-800 dark:bg-gray-700 text-white border-gray-600 min-w-[140px] justify-between"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {selectedDateRange}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>

        {isDateRangeOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 dark:bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10">
            {DATE_RANGE_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleDateRangeChange(option.value)}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors',
                  option.value === dateRange
                    ? 'bg-blue-600 text-white'
                    : 'text-white'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search proposals..."
          value={searchQuery}
          onChange={e => handleSearchChange(e.target.value)}
          className="pl-10 bg-gray-800 dark:bg-gray-700 text-white border-gray-600 placeholder-gray-400"
        />
      </div>
    </div>
  );
}
