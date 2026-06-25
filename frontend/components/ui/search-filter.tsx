'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, X, Filter } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilterChange?: (filters: Record<string, string[]>) => void;
  filters?: Record<string, FilterOption[]>;
  placeholder?: string;
  className?: string;
}

export function SearchFilter({
  onSearch,
  onFilterChange,
  filters,
  placeholder = 'Rechercher...',
  className,
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterToggle = (filterKey: string, value: string) => {
    setSelectedFilters((prev) => {
      const currentFilters = prev[filterKey] || [];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter((v) => v !== value)
        : [...currentFilters, value];

      const updated = {
        ...prev,
        [filterKey]: newFilters,
      };

      onFilterChange?.(updated);
      return updated;
    });
  };

  const clearFilters = () => {
    setSelectedFilters({});
    onFilterChange?.({});
  };

  const hasActiveFilters = Object.values(selectedFilters).some(
    (arr) => arr.length > 0
  );

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors duration-300"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSearch('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        {filters && (
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 transition-colors duration-300"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
            {hasActiveFilters && (
              <span className="ml-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                {Object.values(selectedFilters).reduce((acc, arr) => acc + arr.length, 0)}
              </span>
            )}
          </Button>
        )}
      </div>

      {showFilters && filters && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
              Filtres
            </h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-sm dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                Effacer tout
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {Object.entries(filters).map(([filterKey, options]) => (
              <div key={filterKey}>
                <Label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block transition-colors duration-300">
                  {filterKey}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {options.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        selectedFilters[filterKey]?.includes(option.value)
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => handleFilterToggle(filterKey, option.value)}
                      className={
                        selectedFilters[filterKey]?.includes(option.value)
                          ? 'dark:bg-primary-600 dark:text-white'
                          : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600'
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(selectedFilters).map(([filterKey, values]) =>
            values.map((value) => (
              <div
                key={`${filterKey}-${value}`}
                className="flex items-center gap-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm transition-colors duration-300"
              >
                <span>{value}</span>
                <button
                  onClick={() => handleFilterToggle(filterKey, value)}
                  className="hover:text-primary-900 dark:hover:text-primary-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
