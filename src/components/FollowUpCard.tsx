import React from 'react';
import type { Application } from '../types/database';
import { formatDate, isDateOverdue, isDateToday, getInitials, getMonogramColor } from '../lib/utils';
import { Bell, Calendar, ChevronRight, AlertTriangle } from 'lucide-react';

interface FollowUpSectionProps {
  applications: Application[];
  onSelectApplication: (app: Application) => void;
}

export const FollowUpCard: React.FC<FollowUpSectionProps> = ({
  applications,
  onSelectApplication,
}) => {
  const followUpApps = applications
    .filter(
      (app) =>
        Boolean(app.follow_up_date) &&
        app.status !== 'Rejected' &&
        app.status !== 'Withdrawn'
    )
    .sort((a, b) => {
      const dateA = new Date(a.follow_up_date!).getTime();
      const dateB = new Date(b.follow_up_date!).getTime();
      return dateA - dateB;
    });

  if (followUpApps.length === 0) {
    return null;
  }

  const overdueCount = followUpApps.filter((a) => isDateOverdue(a.follow_up_date)).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Upcoming Follow-ups</h2>
            <p className="text-xs text-slate-500">
              Tasks and touchpoints scheduled for your active applications
            </p>
          </div>
        </div>

        {overdueCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            {overdueCount} Overdue
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
        {followUpApps.slice(0, 6).map((app) => {
          const overdue = isDateOverdue(app.follow_up_date);
          const today = isDateToday(app.follow_up_date);
          const monogram = getMonogramColor(app.company_name);

          return (
            <div
              key={app.id}
              onClick={() => onSelectApplication(app)}
              className={`group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                overdue
                  ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300 hover:bg-rose-50/70'
                  : today
                  ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300 hover:bg-amber-50/70'
                  : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {app.company_logo ? (
                  <img
                    src={app.company_logo}
                    alt={app.company_name}
                    className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0 bg-white"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${monogram.bg}`}
                  >
                    {getInitials(app.company_name)}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {app.company_name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{app.position}</div>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2">
                <div className="flex items-center gap-1 text-xs font-medium">
                  {overdue ? (
                    <span className="text-rose-700 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Overdue
                    </span>
                  ) : today ? (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Today
                    </span>
                  ) : (
                    <span className="text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(app.follow_up_date)}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors flex items-center justify-end gap-0.5 mt-0.5">
                  View <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
