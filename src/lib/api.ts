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

  // ================= DATA MANAGEMENT & MIGRATION =================
  getLocalData(): { applications: Application[]; activities: ApplicationActivity[] } {
    return {
      applications: getLocalApplications(),
      activities: getLocalActivities(),
    };
  },

  getLocalCounts(): { applicationsCount: number; activitiesCount: number } {
    const apps = getLocalApplications();
    const acts = getLocalActivities();
    return {
      applicationsCount: apps.length,
      activitiesCount: acts.length,
    };
  },

  downloadBackupJson(): void {
    const data = this.getLocalData();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `job-tracker-backup-${timestamp}.json`;
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  downloadSqlDump(): void {
    const { applications, activities } = this.getLocalData();
    const escapeSql = (val: any) => {
      if (val === null || val === undefined || val === '') return 'NULL';
      return `'${String(val).replace(/'/g, "''")}'`;
    };

    let sql = `-- Job Application Tracker SQL Dump\n-- Generated on ${new Date().toISOString()}\n\n`;

    if (applications.length > 0) {
      sql += `-- 1. Applications (${applications.length} rows)\n`;
      for (const app of applications) {
        sql += `INSERT INTO public.applications (id, company_name, company_logo, position, website, linkedin_url, facebook_url, other_social_url, applied_email, application_source, job_posting_url, applied_date, status, interview_date, interview_time, interview_type, interview_link, interview_location, contact_person, expected_salary, offered_salary, follow_up_date, notes, created_at, updated_at)\n`;
        sql += `VALUES (${escapeSql(app.id)}, ${escapeSql(app.company_name)}, ${escapeSql(app.company_logo)}, ${escapeSql(app.position)}, ${escapeSql(app.website)}, ${escapeSql(app.linkedin_url)}, ${escapeSql(app.facebook_url)}, ${escapeSql(app.other_social_url)}, ${escapeSql(app.applied_email)}, ${escapeSql(app.application_source)}, ${escapeSql(app.job_posting_url)}, ${app.applied_date ? escapeSql(app.applied_date) : 'NULL'}, ${escapeSql(app.status)}, ${app.interview_date ? escapeSql(app.interview_date) : 'NULL'}, ${escapeSql(app.interview_time)}, ${escapeSql(app.interview_type)}, ${escapeSql(app.interview_link)}, ${escapeSql(app.interview_location)}, ${escapeSql(app.contact_person)}, ${escapeSql(app.expected_salary)}, ${escapeSql(app.offered_salary)}, ${app.follow_up_date ? escapeSql(app.follow_up_date) : 'NULL'}, ${escapeSql(app.notes)}, ${escapeSql(app.created_at)}, ${escapeSql(app.updated_at)})\n`;
        sql += `ON CONFLICT (id) DO UPDATE SET\n`;
        sql += `  company_name = EXCLUDED.company_name,\n`;
        sql += `  position = EXCLUDED.position,\n`;
        sql += `  status = EXCLUDED.status,\n`;
        sql += `  updated_at = EXCLUDED.updated_at;\n\n`;
      }
    }

    if (activities.length > 0) {
      sql += `-- 2. Application Activities (${activities.length} rows)\n`;
      for (const act of activities) {
        sql += `INSERT INTO public.application_activities (id, application_id, activity_type, title, description, activity_date, created_at)\n`;
        sql += `VALUES (${escapeSql(act.id)}, ${escapeSql(act.application_id)}, ${escapeSql(act.activity_type)}, ${escapeSql(act.title)}, ${escapeSql(act.description)}, ${escapeSql(act.activity_date)}, ${escapeSql(act.created_at)})\n`;
        sql += `ON CONFLICT (id) DO NOTHING;\n\n`;
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `job-tracker-insert-${timestamp}.sql`;
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importData(data: { applications?: Application[]; activities?: ApplicationActivity[] }): {
    appCount: number;
    actCount: number;
  } {
    if (!data || !Array.isArray(data.applications)) {
      throw new Error('Invalid backup file format: missing applications array.');
    }

    const currentApps = getLocalApplications();
    const currentActs = getLocalActivities();

    const appMap = new Map(currentApps.map((a) => [a.id, a]));
    for (const app of data.applications) {
      appMap.set(app.id, app);
    }
    const mergedApps = Array.from(appMap.values());
    saveLocalApplications(mergedApps);

    let mergedActs = currentActs;
    if (Array.isArray(data.activities)) {
      const actMap = new Map(currentActs.map((act) => [act.id, act]));
      for (const act of data.activities) {
        actMap.set(act.id, act);
      }
      mergedActs = Array.from(actMap.values());
      saveLocalActivities(mergedActs);
    }

    return {
      appCount: mergedApps.length,
      actCount: mergedActs.length,
    };
  },

  async migrateLocalToSupabase(): Promise<{
    success: boolean;
    appCount: number;
    actCount: number;
    error?: string;
  }> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        appCount: 0,
        actCount: 0,
        error: 'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env first.',
      };
    }

    try {
      const { applications, activities } = this.getLocalData();

      if (applications.length === 0) {
        return { success: true, appCount: 0, actCount: 0 };
      }

      // Check / format valid UUIDs if any mock or old format
      const isUUID = (str: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

      const idMap = new Map<string, string>();

      const cleanedApps = applications.map((app) => {
        let validId = app.id;
        if (!isUUID(validId)) {
          validId = crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0');
          idMap.set(app.id, validId);
        }
        return {
          ...app,
          id: validId,
          applied_date: app.applied_date || null,
          interview_date: app.interview_date || null,
          follow_up_date: app.follow_up_date || null,
        };
      });

      // Batch upsert applications in chunks of 50
      const CHUNK_SIZE = 50;
      for (let i = 0; i < cleanedApps.length; i += CHUNK_SIZE) {
        const chunk = cleanedApps.slice(i, i + CHUNK_SIZE);
        const { error: appError } = await supabase.from('applications').upsert(chunk, {
          onConflict: 'id',
        });
        if (appError) {
          throw new Error(`Failed migrating applications batch: ${appError.message}`);
        }
      }

      // Cleaned activities
      const cleanedActs = activities.map((act) => {
        let validId = act.id;
        if (!isUUID(validId)) {
          validId = crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0');
        }
        const mappedAppId = idMap.get(act.application_id) || act.application_id;
        return {
          ...act,
          id: validId,
          application_id: mappedAppId,
        };
      });

      // Filter activities to only ones whose application_id actually exists in cleanedApps
      const validAppIds = new Set(cleanedApps.map((a) => a.id));
      const validActs = cleanedActs.filter((a) => validAppIds.has(a.application_id));

      for (let i = 0; i < validActs.length; i += CHUNK_SIZE) {
        const chunk = validActs.slice(i, i + CHUNK_SIZE);
        const { error: actError } = await supabase.from('application_activities').upsert(chunk, {
          onConflict: 'id',
        });
        if (actError) {
          console.warn('Activities batch warning:', actError.message);
        }
      }

      return {
        success: true,
        appCount: cleanedApps.length,
        actCount: validActs.length,
      };
    } catch (err: any) {
      console.error('Migration error:', err);
      return {
        success: false,
        appCount: 0,
        actCount: 0,
        error: err?.message || 'Unknown migration error',
      };
    }
  },
};
