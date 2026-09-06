import React, { useState, useEffect } from 'react';
import type {
  Application,
  ApplicationActivity,
  ActivityFormData,
  ApplicationStatus,
} from '../types/database';
import { StatusBadge } from './StatusBadge';
import { ApplicationTimeline } from './ApplicationTimeline';
import { LinkedInIcon, FacebookIcon } from './SocialIcons';
import {
  formatDate,
  isDateOverdue,
  isDateToday,
  getInitials,
  getMonogramColor,
} from '../lib/utils';
import {
  X,
  Edit2,
  Globe,
  Share2,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  ExternalLink,
  DollarSign,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface ApplicationDetailsProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (app: Application) => void;
  onStatusChange: (app: Application, newStatus: ApplicationStatus) => Promise<void>;
  activities: ApplicationActivity[];
  onAddActivity: (data: ActivityFormData) => Promise<void>;
  onDeleteActivity?: (activityId: string) => Promise<void>;
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

export const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({
  application,
  isOpen,
  onClose,
  onEdit,
  onStatusChange,
  activities,
  onAddActivity,
  onDeleteActivity,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline'>('details');

  useEffect(() => {
    setActiveTab('details');
  }, [application?.id]);

  if (!isOpen || !application) return null;

  const monogram = getMonogramColor(application.company_name);
  const isFollowUpOverdue = isDateOverdue(application.follow_up_date);
  const isFollowUpToday = isDateToday(application.follow_up_date);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            {/* Company & Position */}
            <div className="flex items-center gap-4">
              {application.company_logo ? (
                <img
                  src={application.company_logo}
                  alt={application.company_name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-white shrink-0 shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-base shrink-0 border ${monogram.bg} shadow-xs`}
                >
                  {getInitials(application.company_name)}
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {application.company_name}
                </h2>
                <div className="text-sm font-medium text-slate-600 mt-0.5">
                  {application.position}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(application)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                Edit
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status Bar & Changer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Current Status:</span>
              <StatusBadge status={application.status} size="md" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Update to:</span>
              <select
                value={application.status}
                onChange={(e) =>
                  onStatusChange(application, e.target.value as ApplicationStatus)
                }
                className="text-xs font-semibold py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 -mb-6 mt-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Overview & Details
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Application Timeline</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
                {activities.length}
              </span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'details' ? (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Follow-up banner if set */}
              {application.follow_up_date && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                    isFollowUpOverdue
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : isFollowUpToday
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isFollowUpOverdue ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                    <span>
                      Follow-up date scheduled:{' '}
                      <strong>{formatDate(application.follow_up_date)}</strong>
                    </span>
                  </div>
                  {isFollowUpOverdue && (
                    <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-rose-200/60 text-rose-900">
                      Overdue
                    </span>
                  )}
                  {isFollowUpToday && (
                    <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-amber-200/60 text-amber-900">
                      Today
                    </span>
                  )}
                </div>
              )}

              {/* Section: Application & Contact */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3 shadow-xs">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Contact & Links
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Applied Email:</span>
                    {application.applied_email ? (
                      <a
                        href={`mailto:${application.applied_email}`}
                        className="font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {application.applied_email}
                      </a>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Application Source:</span>
                    <span className="font-medium text-slate-800">
                      {application.application_source || 'Not specified'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Applied Date:</span>
                    <span className="font-medium text-slate-800">
                      {formatDate(application.applied_date)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Job Posting:</span>
                    {application.job_posting_url ? (
                      <a
                        href={application.job_posting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        View Posting <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )}
                  </div>
                </div>

                {/* Company Social Links */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-xs text-slate-400">Links:</span>
                  {application.website && (
                    <a
                      href={application.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-xs transition-colors"
                    >
                      <Globe className="w-3 h-3 text-slate-400" /> Website
                    </a>
                  )}
                  {application.linkedin_url && (
                    <a
                      href={application.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-blue-700 rounded text-xs transition-colors"
                    >
                      <LinkedInIcon className="w-3 h-3" /> LinkedIn
                    </a>
                  )}
                  {application.facebook_url && (
                    <a
                      href={application.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-blue-800 rounded text-xs transition-colors"
                    >
                      <FacebookIcon className="w-3 h-3" /> Facebook
                    </a>
                  )}
                  {application.other_social_url && (
                    <a
                      href={application.other_social_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-xs transition-colors"
                    >
                      <Share2 className="w-3 h-3 text-slate-400" /> Social
                    </a>
                  )}
                  {!application.website &&
                    !application.linkedin_url &&
                    !application.facebook_url &&
                    !application.other_social_url && (
                      <span className="text-xs text-slate-400 italic">No links added</span>
                    )}
                </div>
              </div>

              {/* Section: Interview Details */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3 shadow-xs">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Interview Information</span>
                  {application.interview_type && (
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full lowercase first-letter:uppercase">
                      {application.interview_type}
                    </span>
                  )}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Date & Time:</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {application.interview_date
                        ? `${formatDate(application.interview_date)} ${
                            application.interview_time ? `at ${application.interview_time}` : ''
                          }`
                        : 'Not scheduled'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Interviewer / Contact:</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {application.contact_person || 'Not specified'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Meeting Link:</span>
                    {application.interview_link ? (
                      <a
                        href={application.interview_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 truncate"
                      >
                        <Video className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{application.interview_link}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Location:</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {application.interview_location || 'Remote'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section: Compensation */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3 shadow-xs">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Compensation
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Expected Salary:</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      {application.expected_salary || 'Not specified'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Offered Salary:</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      {application.offered_salary || 'None yet'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section: Notes */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-2 shadow-xs">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Notes & Observations</span>
                </h3>
                {application.notes ? (
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                    {application.notes}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No notes recorded.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-150">
              <ApplicationTimeline
                applicationId={application.id}
                activities={activities}
                onAddActivity={onAddActivity}
                onDeleteActivity={onDeleteActivity}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
