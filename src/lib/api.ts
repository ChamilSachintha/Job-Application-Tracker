import { supabase, isSupabaseConfigured } from './supabase';
import type {
  Application,
  ApplicationActivity,
  ApplicationFormData,
  ActivityFormData,
  ApplicationStatus,
} from '../types/database';
import { INITIAL_APPLICATIONS, INITIAL_ACTIVITIES } from './mockData';

const STORAGE_KEY_APPLICATIONS = 'job_tracker_applications_v1';
const STORAGE_KEY_ACTIVITIES = 'job_tracker_activities_v1';

// Local storage helpers
function getLocalApplications(): Application[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
      return INITIAL_APPLICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local applications:', e);
    return INITIAL_APPLICATIONS;
  }
}

function saveLocalApplications(apps: Application[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(apps));
  } catch (e) {
    console.error('Error saving local applications:', e);
  }
}

function getLocalActivities(): ApplicationActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
      return INITIAL_ACTIVITIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local activities:', e);
    return INITIAL_ACTIVITIES;
  }
}

function saveLocalActivities(acts: ApplicationActivity[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(acts));
  } catch (e) {
    console.error('Error saving local activities:', e);
  }
}

export const api = {
  isConfigured(): boolean {
    return isSupabaseConfigured;
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: 'Supabase credentials not set in .env. Running in local storage mode.',
      };
    }
    try {
      const { error } = await supabase.from('applications').select('id').limit(1);
      if (error) {
        return {
          success: false,
          message: `Supabase returned error: ${error.message}. Ensure supabase/schema.sql has been executed in the SQL Editor.`,
        };
      }
      return {
        success: true,
        message: 'Connected to Supabase database successfully!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error connecting to Supabase.',
      };
    }
  },

  // ================= APPLICATIONS =================
  async getApplications(): Promise<Application[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase fetch failed, falling back to local:', error.message);
          return getLocalApplications();
        }
        return data as Application[];
      } catch (err) {
        console.warn('Supabase request threw, falling back to local:', err);
        return getLocalApplications();
      }
    }
    return getLocalApplications();
  },

  async getApplicationById(id: string): Promise<Application | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          return getLocalApplications().find((a) => a.id === id) || null;
        }
        return data as Application;
      } catch {
        return getLocalApplications().find((a) => a.id === id) || null;
      }
    }
    return getLocalApplications().find((a) => a.id === id) || null;
  },

  async createApplication(formData: ApplicationFormData): Promise<Application> {
    const now = new Date().toISOString();
    const newId = crypto.randomUUID ? crypto.randomUUID() : 'app-' + Date.now();

    const newApp: Application = {
      id: newId,
      company_name: formData.company_name.trim(),
      company_logo: formData.company_logo?.trim() || null,
      position: formData.position.trim(),
      website: formData.website?.trim() || null,
      linkedin_url: formData.linkedin_url?.trim() || null,
      facebook_url: formData.facebook_url?.trim() || null,
      other_social_url: formData.other_social_url?.trim() || null,
      applied_email: formData.applied_email?.trim() || null,
      application_source: formData.application_source || null,
      job_posting_url: formData.job_posting_url?.trim() || null,
      applied_date: formData.applied_date || null,
      status: formData.status || 'Applied',
      interview_date: formData.interview_date || null,
      interview_time: formData.interview_time || null,
      interview_type: formData.interview_type || null,
      interview_link: formData.interview_link?.trim() || null,
      interview_location: formData.interview_location?.trim() || null,
      contact_person: formData.contact_person?.trim() || null,
      expected_salary: formData.expected_salary?.trim() || null,
      offered_salary: formData.offered_salary?.trim() || null,
      follow_up_date: formData.follow_up_date || null,
      notes: formData.notes?.trim() || null,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('applications')
          .insert([newApp])
          .select()
          .single();

        if (error) {
          console.warn('Supabase insert failed, saving locally:', error.message);
          const apps = getLocalApplications();
          apps.unshift(newApp);
          saveLocalApplications(apps);

          // create initial activity
          await this.createActivity(newApp.id, {
            activity_type: 'Status Change',
            title: `Application Created: ${newApp.status}`,
            description: `Initial application recorded with status "${newApp.status}"`,
            activity_date: now,
          });

          return newApp;
        }

        return data as Application;
      } catch (err) {
        console.warn('Supabase insert exception, saving locally:', err);
      }
    }

    // Local mode
    const apps = getLocalApplications();
    apps.unshift(newApp);
    saveLocalApplications(apps);

    // Initial activity
    await this.createActivity(newApp.id, {
      activity_type: 'Status Change',
      title: `Application Created: ${newApp.status}`,
      description: `Initial application recorded with status "${newApp.status}"`,
      activity_date: now,
    });

    return newApp;
  },

  async updateApplication(
    id: string,
    formData: Partial<ApplicationFormData>,
    previousStatus?: ApplicationStatus
  ): Promise<Application> {
    const now = new Date().toISOString();
    const updatePayload: Partial<Application> = {
      ...formData,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('applications')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return data as Application;
        }
      } catch (err) {
        console.warn('Supabase update failed, updating locally:', err);
      }
    }

    // Local update
    const apps = getLocalApplications();
    const index = apps.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Application with ID ${id} not found.`);
    }

    const updated: Application = {
      ...apps[index],
      ...updatePayload,
      updated_at: now,
    };
    apps[index] = updated;
    saveLocalApplications(apps);

    // If status changed, automatically log timeline entry
    if (formData.status && previousStatus && formData.status !== previousStatus) {
      await this.createActivity(id, {
        activity_type: 'Status Change',
        title: `Status Changed to ${formData.status}`,
        description: `Status changed from "${previousStatus}" to "${formData.status}"`,
        activity_date: now,
      });
    }

    return updated;
  },

  async deleteApplication(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('applications').delete().eq('id', id);
        if (error) {
          console.warn('Supabase delete error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase delete exception:', err);
      }
    }

    // Local delete
    const apps = getLocalApplications().filter((a) => a.id !== id);
    saveLocalApplications(apps);

    const acts = getLocalActivities().filter((a) => a.application_id !== id);
    saveLocalActivities(acts);
  },

  // ================= ACTIVITIES / TIMELINE =================
  async getActivities(applicationId: string): Promise<ApplicationActivity[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('application_activities')
          .select('*')
          .eq('application_id', applicationId)
          .order('activity_date', { ascending: false });

        if (!error && data) {
          return data as ApplicationActivity[];
        }
      } catch (err) {
        console.warn('Supabase activities fetch exception:', err);
      }
    }

    const all = getLocalActivities();
    return all
      .filter((a) => a.application_id === applicationId)
      .sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime());
  },

  async createActivity(
    applicationId: string,
    formData: ActivityFormData
  ): Promise<ApplicationActivity> {
    const now = new Date().toISOString();
    const newAct: ApplicationActivity = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'act-' + Date.now(),
      application_id: applicationId,
      activity_type: formData.activity_type,
      title: formData.title.trim(),
      description: formData.description?.trim() || null,
      activity_date: formData.activity_date || now,
      created_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('application_activities')
          .insert([newAct])
          .select()
          .single();

        if (!error && data) {
          return data as ApplicationActivity;
        }
      } catch (err) {
        console.warn('Supabase create activity exception:', err);
      }
    }

    // Local save
    const acts = getLocalActivities();
    acts.unshift(newAct);
    saveLocalActivities(acts);

    return newAct;
  },

  async deleteActivity(activityId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('application_activities').delete().eq('id', activityId);
      } catch (err) {
        console.warn('Supabase delete activity exception:', err);
      }
    }

    const acts = getLocalActivities().filter((a) => a.id !== activityId);
    saveLocalActivities(acts);
  },

  resetSampleData(): void {
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
  },
};
