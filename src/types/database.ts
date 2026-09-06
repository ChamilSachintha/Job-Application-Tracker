export type ApplicationStatus =
  | 'Interested'
  | 'Applied'
  | 'Application Viewed'
  | 'Replied'
  | 'HR Call'
  | 'Interview Scheduled'
  | 'Interview Completed'
  | 'Assignment Received'
  | 'Assignment Submitted'
  | 'Final Interview'
  | 'Offer Received'
  | 'Rejected'
  | 'Withdrawn'
  | 'No Response';

export type ApplicationSource =
  | 'LinkedIn'
  | 'Company Website'
  | 'Email'
  | 'WhatsApp'
  | 'Referral'
  | 'Recruiter'
  | 'Other';

export type InterviewType = 'Phone' | 'Online' | 'On-site';

export type ActivityType =
  | 'Status Change'
  | 'Received email'
  | 'Phone call'
  | 'Followed up'
  | 'Interview'
  | 'Assignment'
  | 'Personal note'
  | 'Other';

export interface Application {
  id: string;
  company_name: string;
  company_logo?: string | null;
  position: string;
  website?: string | null;
  linkedin_url?: string | null;
  facebook_url?: string | null;
  other_social_url?: string | null;
  applied_email?: string | null;
  application_source?: ApplicationSource | string | null;
  job_posting_url?: string | null;
  applied_date?: string | null; // ISO YYYY-MM-DD
  status: ApplicationStatus;
  interview_date?: string | null; // ISO YYYY-MM-DD
  interview_time?: string | null;
  interview_type?: InterviewType | string | null;
  interview_link?: string | null;
  interview_location?: string | null;
  contact_person?: string | null;
  expected_salary?: string | null;
  offered_salary?: string | null;
  follow_up_date?: string | null; // ISO YYYY-MM-DD
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationActivity {
  id: string;
  application_id: string;
  activity_type: ActivityType | string;
  title: string;
  description?: string | null;
  activity_date: string; // ISO string
  created_at: string;
}

export interface ApplicationFormData {
  company_name: string;
  company_logo?: string;
  position: string;
  website?: string;
  linkedin_url?: string;
  facebook_url?: string;
  other_social_url?: string;
  applied_email?: string;
  application_source?: string;
  job_posting_url?: string;
  applied_date?: string;
  status: ApplicationStatus;
  interview_date?: string;
  interview_time?: string;
  interview_type?: string;
  interview_link?: string;
  interview_location?: string;
  contact_person?: string;
  expected_salary?: string;
  offered_salary?: string;
  follow_up_date?: string;
  notes?: string;
}

export interface ActivityFormData {
  activity_type: ActivityType;
  title: string;
  description?: string;
  activity_date?: string;
}

export interface FilterState {
  search: string;
  status: string;
  source: string;
  appliedDate: string;
  interviewDate: string;
  sortBy: 'company_name' | 'applied_date' | 'status' | 'updated_at';
  sortOrder: 'asc' | 'desc';
}
