// ============================================================
// JobTatkal AI — Shared TypeScript Types
// ============================================================

export interface DbJob {
  id: string;
  title: string;
  description: string;
  requirements: string;
  salary_min: number;
  salary_max: number;
  location: string;
  job_type: string;
  category_id: string | null;
  company_id: string | null;
  posted_by: string;
  is_active: boolean;
  skills: string[];
  created_at: string;
  updated_at: string;
  // Joined fields
  companies?: { name: string; logo: string } | null;
  categories?: { name: string; icon: string; slug: string } | null;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  created_at: string;
}

export interface DbCompany {
  id: string;
  name: string;
  logo: string;
  website: string;
  description: string;
  location: string;
  created_at: string;
}

export interface DbApplication {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  cover_letter: string;
  created_at: string;
  updated_at: string;
  // Joined
  jobs?: DbJob | null;
}

export interface DbResume {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  parsed_skills: string[];
  parsed_education: string;
  parsed_experience: string;
  raw_text: string;
  created_at: string;
}

export interface DbProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  created_at: string;
  updated_at: string;
}
