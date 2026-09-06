import React, { useState, useRef, useEffect } from 'react';
import type { Application, FilterState } from '../types/database';
import { StatusBadge } from './StatusBadge';
import { LinkedInIcon, FacebookIcon } from './SocialIcons';
import {
  formatDate,
  formatRelativeTime,
  getInitials,
  getMonogramColor,
} from '../lib/utils';
import {
  Globe,
  Share2,
  Mail,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Briefcase,
  ExternalLink,
} from 'lucide-react';

interface ApplicationTableProps {
  applications: Application[];
  filters: FilterState;
  onSort: (column: FilterState['sortBy']) => void;
  onView: (app: Application) => void;
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
  isLoading?: boolean;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  filters,
  onSort,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close 3-dot dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderSortIcon = (column: FilterState['sortBy']) => {
    if (filters.sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />;
    }
    return filters.sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 font-bold" />
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-3 text-sm text-slate-500 font-medium">Loading applications...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
          <Briefcase className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No applications found</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Try adjusting your search criteria or filter options, or add a new job application.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none">
              {/* Company */}
              <th
                onClick={() => onSort('company_name')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/70 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Company</span>
                  {renderSortIcon('company_name')}
                </div>
              </th>

              {/* Position */}
              <th className="py-3.5 px-4">Position</th>

              {/* Company Links */}
              <th className="py-3.5 px-3">Links</th>

              {/* Applied Email */}
              <th className="py-3.5 px-4">Applied Email</th>

              {/* Applied Date */}
              <th
                onClick={() => onSort('applied_date')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/70 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Applied Date</span>
                  {renderSortIcon('applied_date')}
                </div>
              </th>

              {/* Status */}
              <th
                onClick={() => onSort('status')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/70 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>

              {/* Last Updated */}
              <th
                onClick={() => onSort('updated_at')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/70 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Last Updated</span>
                  {renderSortIcon('updated_at')}
                </div>
              </th>

              {/* Actions */}
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {applications.map((app) => {
              const monogram = getMonogramColor(app.company_name);
              const isMenuOpen = activeMenuId === app.id;

              return (
                <tr
                  key={app.id}
                  className="hover:bg-slate-50/80 transition-colors group relative"
                >
                  {/* Company */}
                  <td
                    onClick={() => onView(app)}
                    className="py-3.5 px-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {app.company_logo ? (
                        <img
                          src={app.company_logo}
                          alt={app.company_name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0 bg-white"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${monogram.bg}`}
                        >
                          {getInitials(app.company_name)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors block truncate max-w-[170px]">
                          {app.company_name}
                        </span>
                        {app.application_source && (
                          <span className="text-[11px] text-slate-500 block truncate">
                            via {app.application_source}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Position */}
                  <td
                    onClick={() => onView(app)}
                    className="py-3.5 px-4 cursor-pointer"
                  >
                    <span className="font-medium text-slate-800 line-clamp-1">
                      {app.position}
                    </span>
                    {app.job_posting_url && (
                      <a
                        href={app.job_posting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 mt-0.5"
                      >
                        Posting <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </td>

                  {/* Company Links */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      {app.website ? (
                        <a
                          href={app.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Website: ${app.website}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="p-1.5 text-slate-200">
                          <Globe className="w-4 h-4" />
                        </span>
                      )}

                      {app.linkedin_url ? (
                        <a
                          href={app.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`LinkedIn: ${app.linkedin_url}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <LinkedInIcon className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="p-1.5 text-slate-200">
                          <LinkedInIcon className="w-4 h-4" />
                        </span>
                      )}

                      {app.facebook_url ? (
                        <a
                          href={app.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Facebook: ${app.facebook_url}`}
                          className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <FacebookIcon className="w-4 h-4" />
                        </a>
                      ) : null}

                      {app.other_social_url ? (
                        <a
                          href={app.other_social_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Social: ${app.other_social_url}`}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </a>
                      ) : null}
                    </div>
                  </td>

                  {/* Applied Email */}
                  <td className="py-3.5 px-4">
                    {app.applied_email ? (
                      <a
                        href={`mailto:${app.applied_email}`}
                        className="inline-flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{app.applied_email}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>

                  {/* Applied Date */}
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {formatDate(app.applied_date)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={app.status} size="sm" />
                  </td>

                  {/* Last Updated */}
                  <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                    {formatRelativeTime(app.updated_at)}
                  </td>

                  {/* Actions 3-dot Menu */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : app.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 text-left"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              onView(app);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              onEdit(app);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                            Edit
                          </button>
                          <div className="my-1 border-t border-slate-100"></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              onDelete(app);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
