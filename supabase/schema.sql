-- ==============================================================================
-- Job Application Tracker - Database Schema for Supabase
-- ==============================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    company_logo TEXT,
    position TEXT NOT NULL,
    website TEXT,
    linkedin_url TEXT,
    facebook_url TEXT,
    other_social_url TEXT,
    applied_email TEXT,
    application_source TEXT,
    job_posting_url TEXT,
    applied_date DATE,
    status TEXT NOT NULL DEFAULT 'Applied',
    interview_date DATE,
    interview_time TEXT,
    interview_type TEXT,
    interview_link TEXT,
    interview_location TEXT,
    contact_person TEXT,
    expected_salary TEXT,
    offered_salary TEXT,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create application_activities table
CREATE TABLE IF NOT EXISTS public.application_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    activity_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_applications_company_name ON public.applications (company_name);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON public.applications (applied_date);
CREATE INDEX IF NOT EXISTS idx_applications_follow_up_date ON public.applications (follow_up_date);
CREATE INDEX IF NOT EXISTS idx_activities_app_id ON public.application_activities (application_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.application_activities (activity_date DESC);

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.applications;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 6. Trigger to automatically record status changes as timeline activities
CREATE OR REPLACE FUNCTION public.handle_status_change_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.application_activities (
            application_id,
            activity_type,
            title,
            description,
            activity_date
        ) VALUES (
            NEW.id,
            'Status Change',
            'Application Created: ' || NEW.status,
            'Initial status set to ' || NEW.status,
            timezone('utc'::text, now())
        );
    ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.application_activities (
            application_id,
            activity_type,
            title,
            description,
            activity_date
        ) VALUES (
            NEW.id,
            'Status Change',
            'Status Changed to ' || NEW.status,
            'Status moved from ' || OLD.status || ' to ' || NEW.status,
            timezone('utc'::text, now())
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_status_change ON public.applications;
CREATE TRIGGER on_status_change
AFTER INSERT OR UPDATE OF status ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.handle_status_change_activity();

-- 7. Row Level Security (RLS)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_activities ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for personal single-user or anon key usage
-- (Can be adjusted to auth.uid() when user authentication is enabled)
CREATE POLICY "Allow all access to applications" ON public.applications
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to application_activities" ON public.application_activities
    FOR ALL
    USING (true)
    WITH CHECK (true);
