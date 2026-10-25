import React, { useState, useEffect } from 'react';
import type {
  Application,
  ApplicationFormData,
  ApplicationStatus,
  ApplicationSource,
  InterviewType,
} from '../types/database';
import { X, Building2, FileText, CalendarClock, DollarSign, Save } from 'lucide-react';

interface ApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  initialData?: Application | null;
  mode: 'add' | 'edit';
}

const STATUS_OPTIONS: ApplicationStatus[] = [
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

const SOURCE_OPTIONS: ApplicationSource[] = [
  'LinkedIn',
  'Company Website',
  'Email',
  'WhatsApp',
  'Referral',
  'Recruiter',
  'Other',
];

const INTERVIEW_TYPES: InterviewType[] = ['Phone', 'Online', 'On-site'];

const EXPECTED_SALARY_OPTIONS = [
  'Rs. 250,000',
  'Rs. 200,000',
  'Rs. 180,000',
  'Rs. 150,000',
];

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [formData, setFormData] = useState<ApplicationFormData>({
    company_name: '',
    company_logo: '',
    position: 'UI/UX Engineer & Product Designer',
    website: '',
    linkedin_url: '',
    facebook_url: '',
    other_social_url: '',
    applied_email: '',
    application_source: 'Email',
    job_posting_url: '',
    applied_date: new Date().toISOString().substring(0, 10),
    status: 'Applied',
    interview_date: '',
    interview_time: '',
    interview_type: 'Online',
    interview_link: '',
    interview_location: '',
    contact_person: '',
    expected_salary: 'Rs. 180,000',
    offered_salary: '',
    follow_up_date: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        company_name: initialData.company_name || '',
        company_logo: initialData.company_logo || '',
        position: initialData.position || '',
        website: initialData.website || '',
        linkedin_url: initialData.linkedin_url || '',
        facebook_url: initialData.facebook_url || '',
        other_social_url: initialData.other_social_url || '',
        applied_email: initialData.applied_email || '',
        application_source: initialData.application_source || 'LinkedIn',
        job_posting_url: initialData.job_posting_url || '',
        applied_date: initialData.applied_date || '',
        status: initialData.status || 'Applied',
        interview_date: initialData.interview_date || '',
        interview_time: initialData.interview_time || '',
        interview_type: initialData.interview_type || 'Online',
        interview_link: initialData.interview_link || '',
        interview_location: initialData.interview_location || '',
        contact_person: initialData.contact_person || '',
        expected_salary: initialData.expected_salary || 'Rs. 180,000',
        offered_salary: initialData.offered_salary || '',
        follow_up_date: initialData.follow_up_date || '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        company_name: '',
        company_logo: '',
        position: 'UI/UX Engineer & Product Designer',
        website: '',
        linkedin_url: '',
        facebook_url: '',
        other_social_url: '',
        applied_email: '',
        application_source: 'Email',
        job_posting_url: '',
        applied_date: new Date().toISOString().substring(0, 10),
        status: 'Applied',
        interview_date: '',
        interview_time: '',
        interview_type: 'Online',
        interview_link: '',
        interview_location: '',
        contact_person: '',
        expected_salary: 'Rs. 180,000',
        offered_salary: '',
        follow_up_date: '',
        notes: '',
      });
    }
    setErrors({});
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.company_name.trim()) {
      errs.company_name = 'Company Name is required';
    }
    if (!formData.position.trim()) {
      errs.position = 'Position / Job Title is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'add' ? 'Add New Application' : `Edit Application: ${initialData?.company_name}`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in the company, timeline, interview, and compensation details.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Company Information */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Company Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  className={`w-full text-sm py-2 px-3 bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.company_name
                      ? 'border-rose-300 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
                {errors.company_name && (
                  <p className="text-xs text-rose-600 mt-1">{errors.company_name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Position / Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className={`w-full text-sm py-2 px-3 bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.position
                      ? 'border-rose-300 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
                {errors.position && (
                  <p className="text-xs text-rose-600 mt-1">{errors.position}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Website
                </label>
                <input
                  type="url"
                  placeholder="https://company.com"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Logo URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.company_logo}
                  onChange={(e) =>
                    setFormData({ ...formData, company_logo: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/company/..."
                  value={formData.linkedin_url}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedin_url: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facebook URL
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={formData.facebook_url}
                  onChange={(e) =>
                    setFormData({ ...formData, facebook_url: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Other Social / Twitter / GitHub URL
                </label>
                <input
                  type="url"
                  placeholder="https://x.com/... or https://github.com/..."
                  value={formData.other_social_url}
                  onChange={(e) =>
                    setFormData({ ...formData, other_social_url: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Application Information */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Application Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Applied Email Address
                </label>
                <input
                  type="email"
                  placeholder="careers@company.com"
                  value={formData.applied_email}
                  onChange={(e) =>
                    setFormData({ ...formData, applied_email: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Application Source
                </label>
                <select
                  value={formData.application_source}
                  onChange={(e) =>
                    setFormData({ ...formData, application_source: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {SOURCE_OPTIONS.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Applied Date
                </label>
                <input
                  type="date"
                  value={formData.applied_date}
                  onChange={(e) =>
                    setFormData({ ...formData, applied_date: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as ApplicationStatus,
                    })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Posting URL
                </label>
                <input
                  type="url"
                  placeholder="https://company.com/jobs/..."
                  value={formData.job_posting_url}
                  onChange={(e) =>
                    setFormData({ ...formData, job_posting_url: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Interview Information */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <CalendarClock className="w-4 h-4 text-indigo-600" />
              <span>Interview Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Interview Date
                </label>
                <input
                  type="date"
                  value={formData.interview_date}
                  onChange={(e) =>
                    setFormData({ ...formData, interview_date: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Interview Time
                </label>
                <input
                  type="time"
                  value={formData.interview_time}
                  onChange={(e) =>
                    setFormData({ ...formData, interview_time: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Interview Type
                </label>
                <select
                  value={formData.interview_type}
                  onChange={(e) =>
                    setFormData({ ...formData, interview_type: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">None</option>
                  {INTERVIEW_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Interviewer / Contact Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe (Tech Recruiter)"
                  value={formData.contact_person}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_person: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meeting Link
                </label>
                <input
                  type="url"
                  placeholder="https://zoom.us/... or meet.google.com/..."
                  value={formData.interview_link}
                  onChange={(e) =>
                    setFormData({ ...formData, interview_link: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Remote or London Office"
                  value={formData.interview_location}
                  onChange={(e) =>
                    setFormData({ ...formData, interview_location: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Additional Information */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              <span>Compensation & Follow-up</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Salary
                </label>
                <select
                  value={formData.expected_salary}
                  onChange={(e) =>
                    setFormData({ ...formData, expected_salary: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium cursor-pointer"
                >
                  {formData.expected_salary &&
                    !EXPECTED_SALARY_OPTIONS.includes(formData.expected_salary) && (
                      <option value={formData.expected_salary}>
                        {formData.expected_salary}
                      </option>
                    )}
                  {EXPECTED_SALARY_OPTIONS.map((sal) => (
                    <option key={sal} value={sal}>
                      {sal}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Offered Salary
                </label>
                <input
                  type="text"
                  placeholder="e.g. $155,000 + Equity"
                  value={formData.offered_salary}
                  onChange={(e) =>
                    setFormData({ ...formData, offered_salary: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) =>
                    setFormData({ ...formData, follow_up_date: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Personal observations, questions to ask, interview impressions, prep materials..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full text-sm py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting
                ? 'Saving...'
                : mode === 'add'
                ? 'Create Application'
                : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
