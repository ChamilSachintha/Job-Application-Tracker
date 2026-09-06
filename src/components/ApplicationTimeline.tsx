import React, { useState } from 'react';
import type { ApplicationActivity, ActivityType, ActivityFormData } from '../types/database';
import { formatDateTime } from '../lib/utils';
import {
  Plus,
  Mail,
  Phone,
  Calendar,
  FileCheck,
  StickyNote,
  HelpCircle,
  Clock,
  Trash2,
  GitCommit,
  Check,
} from 'lucide-react';

interface ApplicationTimelineProps {
  applicationId: string;
  activities: ApplicationActivity[];
  onAddActivity: (data: ActivityFormData) => Promise<void>;
  onDeleteActivity?: (activityId: string) => Promise<void>;
}

const ACTIVITY_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'Status Change': { icon: GitCommit, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  'Received email': { icon: Mail, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' },
  'Phone call': { icon: Phone, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  'Followed up': { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  'Interview': { icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  'Assignment': { icon: FileCheck, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
  'Personal note': { icon: StickyNote, color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' },
  'Other': { icon: HelpCircle, color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' },
};

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({
  activities,
  onAddActivity,
  onDeleteActivity,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [type, setType] = useState<ActivityType>('Received email');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityDate, setActivityDate] = useState(
    new Date().toISOString().substring(0, 16) // YYYY-MM-DDTHH:mm
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddActivity({
        activity_type: type,
        title: title.trim(),
        description: description.trim() || undefined,
        activity_date: activityDate ? new Date(activityDate).toISOString() : new Date().toISOString(),
      });
      setTitle('');
      setDescription('');
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <span>Application Timeline</span>
          <span className="text-xs font-normal text-slate-400">({activities.length})</span>
        </h4>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          {isAdding ? 'Cancel' : 'Log Activity'}
        </button>
      </div>

      {/* Manual Activity Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Activity Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ActivityType)}
                className="w-full text-xs py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Received email">Received email</option>
                <option value="Phone call">Phone call</option>
                <option value="Followed up">Followed up</option>
                <option value="Interview">Interview</option>
                <option value="Assignment">Assignment</option>
                <option value="Personal note">Personal note</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full text-xs py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Title / Summary *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Discussed take-home task feedback with hiring lead"
              className="w-full text-xs py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Details / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add specifics, key takeaways, next steps..."
              className="w-full text-xs py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              {isSubmitting ? 'Saving...' : 'Add to Timeline'}
            </button>
          </div>
        </form>
      )}

      {/* Vertical Timeline List */}
      {activities.length === 0 ? (
        <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200/60 text-slate-400 text-xs">
          No timeline entries recorded yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {activities.map((act) => {
            const config =
              ACTIVITY_ICONS[act.activity_type] || ACTIVITY_ICONS['Other'];
            const Icon = config.icon;

            return (
              <div key={act.id} className="relative group">
                {/* Node icon */}
                <div
                  className={`absolute -left-6 top-0 w-6 h-6 rounded-full border flex items-center justify-center bg-white shadow-xs ${config.bg} ${config.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Content Box */}
                <div className="bg-white border border-slate-100 group-hover:border-slate-200 p-3 rounded-xl shadow-xs transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800">
                          {act.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {act.activity_type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDateTime(act.activity_date)}
                      </div>
                    </div>

                    {onDeleteActivity && (
                      <button
                        onClick={() => onDeleteActivity(act.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 transition-opacity p-1"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {act.description && (
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-2 rounded-lg border border-slate-100 whitespace-pre-wrap">
                      {act.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
