
-- ============================================================
-- JobTatkal AI — Extended Database Schema
-- ============================================================

-- 1. Add 'recruiter' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'recruiter';

-- 2. Add phone and location columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS location text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- 3. Categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT '💼',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 4. Companies table
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Admins can manage companies" ON public.companies FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 5. Jobs table
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  requirements text NOT NULL DEFAULT '',
  salary_min integer NOT NULL DEFAULT 0,
  salary_max integer NOT NULL DEFAULT 0,
  location text NOT NULL DEFAULT '',
  job_type text NOT NULL DEFAULT 'Full Time',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  posted_by uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  skills text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active jobs" ON public.jobs FOR SELECT USING (is_active = true);
CREATE POLICY "Recruiters can manage own jobs" ON public.jobs FOR ALL USING (auth.uid() = posted_by);
CREATE POLICY "Admins can manage all jobs" ON public.jobs FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Applications table
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  cover_letter text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id, user_id)
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Recruiters can view applications for their jobs" ON public.applications FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.posted_by = auth.uid()));
CREATE POLICY "Recruiters can update application status" ON public.applications FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.posted_by = auth.uid()));
CREATE POLICY "Admins can view all applications" ON public.applications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Resumes table (stores metadata, file in storage)
CREATE TABLE public.resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  parsed_skills text[] NOT NULL DEFAULT '{}',
  parsed_education text NOT NULL DEFAULT '',
  parsed_experience text NOT NULL DEFAULT '',
  raw_text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own resumes" ON public.resumes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all resumes" ON public.resumes FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Recruiters can view applicant resumes" ON public.resumes FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    WHERE a.user_id = resumes.user_id AND j.posted_by = auth.uid()
  ));

-- 8. Storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

CREATE POLICY "Users can upload own resumes" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own resumes" ON storage.objects FOR SELECT 
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can view all resumes" ON storage.objects FOR SELECT 
  USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'));

-- 9. Seed categories
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Work From Home', 'work-from-home', '🏠'),
  ('Full Time', 'full-time', '💼'),
  ('Part Time', 'part-time', '⏰'),
  ('Jobs for Women', 'women-jobs', '👩'),
  ('Jobs for Freshers', 'fresher-jobs', '🎓'),
  ('Engineering', 'engineering', '💻'),
  ('Design', 'design', '🎨'),
  ('Marketing', 'marketing', '📈'),
  ('Data Science', 'data-science', '🧠'),
  ('Sales', 'sales', '📊');

-- 10. Seed companies
INSERT INTO public.companies (name, logo, website, description, location) VALUES
  ('Dream11', 'D11', 'https://dream11.com', 'India''s biggest fantasy sports platform', 'Mumbai, India'),
  ('Google', 'G', 'https://google.com', 'Technology giant powering search and cloud', 'Bangalore, India'),
  ('Deloitte', 'DL', 'https://deloitte.com', 'Global consulting and professional services', 'Hyderabad, India'),
  ('Infosys', 'IN', 'https://infosys.com', 'Leading IT services and consulting company', 'Bangalore, India'),
  ('TCS', 'TCS', 'https://tcs.com', 'Tata Consultancy Services - IT powerhouse', 'Mumbai, India');

-- 11. Seed sample jobs (we'll use a DO block to reference company/category IDs)
DO $$
DECLARE
  v_dream11 uuid;
  v_google uuid;
  v_deloitte uuid;
  v_infosys uuid;
  v_tcs uuid;
  v_wfh uuid;
  v_fulltime uuid;
  v_parttime uuid;
  v_women uuid;
  v_fresher uuid;
  v_eng uuid;
  -- Use a dummy posted_by (admin user)
  v_admin uuid;
BEGIN
  SELECT id INTO v_dream11 FROM public.companies WHERE name = 'Dream11';
  SELECT id INTO v_google FROM public.companies WHERE name = 'Google';
  SELECT id INTO v_deloitte FROM public.companies WHERE name = 'Deloitte';
  SELECT id INTO v_infosys FROM public.companies WHERE name = 'Infosys';
  SELECT id INTO v_tcs FROM public.companies WHERE name = 'TCS';

  SELECT id INTO v_wfh FROM public.categories WHERE slug = 'work-from-home';
  SELECT id INTO v_fulltime FROM public.categories WHERE slug = 'full-time';
  SELECT id INTO v_parttime FROM public.categories WHERE slug = 'part-time';
  SELECT id INTO v_women FROM public.categories WHERE slug = 'women-jobs';
  SELECT id INTO v_fresher FROM public.categories WHERE slug = 'fresher-jobs';
  SELECT id INTO v_eng FROM public.categories WHERE slug = 'engineering';

  -- Get admin user_id from user_roles
  SELECT user_id INTO v_admin FROM public.user_roles WHERE role = 'admin' LIMIT 1;
  IF v_admin IS NULL THEN
    v_admin := '00000000-0000-0000-0000-000000000000';
  END IF;

  -- Dream11 Jobs (5)
  INSERT INTO public.jobs (title, description, requirements, salary_min, salary_max, location, job_type, category_id, company_id, posted_by, skills) VALUES
    ('Frontend Developer', 'Build fantasy sports UI with React & TypeScript', '2+ years React experience', 800000, 1500000, 'Mumbai, India', 'Full Time', v_fulltime, v_dream11, v_admin, ARRAY['React','TypeScript','CSS']),
    ('Backend Developer', 'Design scalable APIs for millions of users', '3+ years Node.js/Python', 1000000, 1800000, 'Mumbai, India', 'Full Time', v_fulltime, v_dream11, v_admin, ARRAY['Node.js','Python','MongoDB']),
    ('Data Analyst', 'Analyze sports data and user engagement', 'SQL and Python proficiency', 600000, 1000000, 'Remote', 'Work From Home', v_wfh, v_dream11, v_admin, ARRAY['SQL','Python','Excel']),
    ('QA Engineer', 'Test mobile and web applications', 'Experience with Selenium', 500000, 900000, 'Mumbai, India', 'Full Time', v_fulltime, v_dream11, v_admin, ARRAY['Selenium','Testing','JIRA']),
    ('UI/UX Intern', 'Support the design team with wireframes', 'Figma knowledge preferred', 200000, 400000, 'Mumbai, India', 'Part Time', v_fresher, v_dream11, v_admin, ARRAY['Figma','UI/UX','Design']);

  -- Google Jobs (4)
  INSERT INTO public.jobs (title, description, requirements, salary_min, salary_max, location, job_type, category_id, company_id, posted_by, skills) VALUES
    ('Software Engineer', 'Work on Google Cloud products', '3+ years in distributed systems', 2000000, 3500000, 'Bangalore, India', 'Full Time', v_eng, v_google, v_admin, ARRAY['Java','Go','Cloud']),
    ('ML Engineer', 'Build ML models for search quality', 'PhD or MS in CS/ML', 2500000, 4000000, 'Bangalore, India', 'Full Time', v_eng, v_google, v_admin, ARRAY['Python','TensorFlow','ML']),
    ('Technical Writer', 'Write documentation for Google Cloud APIs', 'Strong writing skills', 1000000, 1800000, 'Remote', 'Work From Home', v_wfh, v_google, v_admin, ARRAY['Writing','APIs','Documentation']),
    ('Associate Engineer (Women in Tech)', 'Early career program for women engineers', 'BTech/BE graduate 2025/2026', 1200000, 1800000, 'Hyderabad, India', 'Full Time', v_women, v_google, v_admin, ARRAY['Python','Java','DSA']);

  -- Deloitte Jobs (4)
  INSERT INTO public.jobs (title, description, requirements, salary_min, salary_max, location, job_type, category_id, company_id, posted_by, skills) VALUES
    ('Business Analyst', 'Analyze client requirements and deliver solutions', '1+ years consulting experience', 700000, 1200000, 'Hyderabad, India', 'Full Time', v_fulltime, v_deloitte, v_admin, ARRAY['Excel','SQL','PowerPoint']),
    ('Cyber Security Analyst', 'Monitor and respond to security threats', 'CISSP or equivalent', 900000, 1600000, 'Bangalore, India', 'Full Time', v_fulltime, v_deloitte, v_admin, ARRAY['Security','SIEM','Network']),
    ('Part-Time Content Writer', 'Create thought leadership content', 'Marketing or journalism background', 300000, 500000, 'Remote', 'Part Time', v_parttime, v_deloitte, v_admin, ARRAY['Writing','SEO','Research']),
    ('Graduate Trainee (Fresher)', 'Rotational program across consulting divisions', '2025/2026 graduate', 500000, 800000, 'Multiple Locations', 'Full Time', v_fresher, v_deloitte, v_admin, ARRAY['Communication','Teamwork','Adaptability']);

  -- Infosys Jobs (3)
  INSERT INTO public.jobs (title, description, requirements, salary_min, salary_max, location, job_type, category_id, company_id, posted_by, skills) VALUES
    ('Java Developer', 'Enterprise application development', '2+ years Java experience', 600000, 1100000, 'Pune, India', 'Full Time', v_fulltime, v_infosys, v_admin, ARRAY['Java','Spring Boot','MySQL']),
    ('Power BI Analyst (WFH)', 'Create dashboards for client reporting', 'Power BI certification preferred', 500000, 900000, 'Remote', 'Work From Home', v_wfh, v_infosys, v_admin, ARRAY['Power BI','SQL','Analytics']),
    ('HR Executive (Women Preferred)', 'Manage recruitment and onboarding', '1+ years HR experience', 400000, 700000, 'Chennai, India', 'Full Time', v_women, v_infosys, v_admin, ARRAY['HR','Recruitment','Communication']);

  -- TCS Jobs (2)
  INSERT INTO public.jobs (title, description, requirements, salary_min, salary_max, location, job_type, category_id, company_id, posted_by, skills) VALUES
    ('Full Stack Developer', 'Build end-to-end web applications', 'React + Node.js proficiency', 700000, 1300000, 'Noida, India', 'Full Time', v_fulltime, v_tcs, v_admin, ARRAY['React','Node.js','PostgreSQL']),
    ('Fresher Python Developer', 'Entry-level Python development role', '2025/2026 BCA/BTech graduate', 350000, 550000, 'Hyderabad, India', 'Full Time', v_fresher, v_tcs, v_admin, ARRAY['Python','Django','Git']);
END $$;

-- 12. Update the handle_new_user trigger to include phone/location
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, phone, location, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'user'));
  RETURN NEW;
END;
$function$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
