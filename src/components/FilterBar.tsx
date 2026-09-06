import React from 'react';
import type { FilterState, ApplicationStatus, ApplicationSource } from '../types/database';
import { Search, X, SlidersHorizontal, Calendar } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  totalResults: number;
}

const ALL_STATUSES: ApplicationStatus[] = [
  'Interested',
  'Applied',
  'Application Viewed',
  'Replied',
  'HR Call',
  'Interview Scheduled',
  'Interview Completed',
  'Assignment Received',
  'Assignment Submitted',
  'Final Interview',
  'Offer Received',
  'Rejected',
  'Withdrawn',
  'No Response',
];

const ALL_SOURCES: ApplicationSource[] = [
  'LinkedIn',
  'Company Website',
  'Email',
  'WhatsApp',
  'Referral',
  'Recruiter',
  'Other',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  totalResults,
}) => {
  const isFiltered = Boolean(
    filters.search ||
      filters.status ||
      filters.source ||
      filters.appliedDate ||
      filters.interviewDate
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Box */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by company, position, or email..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="">All Statuses</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div className="relative">
            <select
              value={filters.source}
              onChange={(e) => onFilterChange({ source: e.target.value })}
              className="text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="">All Sources</option>
              {ALL_SOURCES.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>

          {/* Applied Date Filter */}
          <div className="relative flex items-center">
            <input
              type="date"
              title="Filter by Applied Date"
              value={filters.appliedDate}
              onChange={(e) => onFilterChange({ appliedDate: e.target.value })}
              className="text-xs font-medium py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors cursor-pointer"
            />
          </div>

          {/* Interview Date Filter */}
          <div className="relative flex items-center">
            <input
              type="date"
              title="Filter by Interview Date"
              value={filters.interviewDate}
              onChange={(e) => onFilterChange({ interviewDate: e.target.value })}
              className="text-xs font-medium py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors cursor-pointer"
            />
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold py-2 px-3 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter summary bar */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Showing <strong className="text-slate-800 font-semibold">{totalResults}</strong>{' '}
            applications
          </span>
          {isFiltered && (
            <span className="ml-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">
              Filtered
            </span>
          )}
        </div>

        {(filters.appliedDate || filters.interviewDate) && (
          <div className="flex items-center gap-3">
            {filters.appliedDate && (
              <span className="flex items-center gap-1 text-slate-600">
                <Calendar className="w-3 h-3 text-slate-400" />
                Applied: {filters.appliedDate}
              </span>
            )}
            {filters.interviewDate && (
              <span className="flex items-center gap-1 text-slate-600">
                <Calendar className="w-3 h-3 text-slate-400" />
                Interview: {filters.interviewDate}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
