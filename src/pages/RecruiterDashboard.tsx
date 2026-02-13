// RecruiterDashboard.tsx — Recruiter module for posting jobs and managing applicants
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Plus, Users, Trash2, Edit2, CheckCircle, XCircle, Clock, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { DbJob, DbCategory, DbCompany } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";

const RecruiterDashboard = () => {
  const { user, loading, isRecruiter, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<DbJob[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [companies, setCompanies] = useState<DbCompany[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<DbJob | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: "", description: "", requirements: "", salary_min: "", salary_max: "",
    location: "", job_type: "Full Time", category_id: "", company_id: "", skills: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate("/login");
    if (!loading && user && !isRecruiter && !isAdmin) navigate("/dashboard");
  }, [user, loading, isRecruiter, isAdmin, navigate]);

  useEffect(() => {
    if (!user) return;
    // Fetch recruiter's jobs
    supabase.from("jobs").select("*, companies(name, logo), categories(name, icon, slug)")
      .eq("posted_by", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setJobs(data as unknown as DbJob[]); });
    // Fetch categories & companies
    supabase.from("categories").select("*").then(({ data }) => { if (data) setCategories(data as DbCategory[]); });
    supabase.from("companies").select("*").then(({ data }) => { if (data) setCompanies(data as DbCompany[]); });
    // Fetch applications for recruiter's jobs
    supabase.from("applications").select("*, jobs!inner(title, posted_by), profiles:user_id(name, email)")
      .then(({ data }) => { if (data) setApplications(data); });
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !form.title) { toast.error("Title is required"); return; }
    const jobData = {
      title: form.title, description: form.description, requirements: form.requirements,
      salary_min: parseInt(form.salary_min) || 0, salary_max: parseInt(form.salary_max) || 0,
      location: form.location, job_type: form.job_type,
      category_id: form.category_id || null, company_id: form.company_id || null,
      posted_by: user.id, skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
    };

    if (editingJob) {
      const { error } = await supabase.from("jobs").update(jobData).eq("id", editingJob.id);
      if (error) toast.error("Failed to update job");
      else { toast.success("Job updated!"); setEditingJob(null); }
    } else {
      const { error } = await supabase.from("jobs").insert(jobData);
      if (error) toast.error("Failed to post job");
      else toast.success("Job posted!");
    }
    setShowForm(false);
    resetForm();
    // Refresh
    const { data } = await supabase.from("jobs").select("*, companies(name, logo), categories(name, icon, slug)")
      .eq("posted_by", user.id).order("created_at", { ascending: false });
    if (data) setJobs(data as unknown as DbJob[]);
  };

  const resetForm = () => setForm({ title: "", description: "", requirements: "", salary_min: "", salary_max: "", location: "", job_type: "Full Time", category_id: "", company_id: "", skills: "" });

  const deleteJob = async (id: string) => {
    if (!confirm("Delete this job?")) return;
    await supabase.from("jobs").delete().eq("id", id);
    setJobs(jobs.filter(j => j.id !== id));
    toast.success("Job deleted");
  };

  const updateAppStatus = async (appId: string, status: string) => {
    await supabase.from("applications").update({ status }).eq("id", appId);
    setApplications(applications.map(a => a.id === appId ? { ...a, status } : a));
    toast.success(`Application ${status}`);
  };

  const startEdit = (job: DbJob) => {
    setEditingJob(job);
    setForm({
      title: job.title, description: job.description, requirements: job.requirements,
      salary_min: job.salary_min.toString(), salary_max: job.salary_max.toString(),
      location: job.location, job_type: job.job_type,
      category_id: job.category_id || "", company_id: job.company_id || "",
      skills: job.skills?.join(", ") || "",
    });
    setShowForm(true);
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 container mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold">Recruiter Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage jobs and applicants</p>
            </div>
            <Button onClick={() => { resetForm(); setEditingJob(null); setShowForm(!showForm); }}>
              <Plus className="w-4 h-4 mr-2" /> Post New Job
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-5">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
              <p className="font-display text-2xl font-bold mt-2">{jobs.length}</p>
              <p className="text-sm text-muted-foreground">Posted Jobs</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <Users className="w-5 h-5 text-muted-foreground" />
              <p className="font-display text-2xl font-bold mt-2">{applications.length}</p>
              <p className="text-sm text-muted-foreground">Applications</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              <p className="font-display text-2xl font-bold mt-2">{applications.filter(a => a.status === "selected").length}</p>
              <p className="text-sm text-muted-foreground">Selected</p>
            </div>
          </div>

          {/* Job Post Form */}
          {showForm && (
            <div className="bg-card rounded-xl border border-border p-6 mb-8">
              <h2 className="font-display text-lg font-semibold mb-4">{editingJob ? "Edit Job" : "Post New Job"}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Frontend Developer" />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Mumbai, India" />
                </div>
                <div className="space-y-2">
                  <Label>Job Type</Label>
                  <Select value={form.job_type} onValueChange={v => setForm({ ...form, job_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Full Time", "Part Time", "Work From Home", "Contract", "Internship"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category_id} onValueChange={v => setForm({ ...form, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Select value={form.company_id} onValueChange={v => setForm({ ...form, company_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                    <SelectContent>
                      {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Skills (comma-separated)</Label>
                  <Input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, Python, SQL" />
                </div>
                <div className="space-y-2">
                  <Label>Min Salary (₹)</Label>
                  <Input type="number" value={form.salary_min} onChange={e => setForm({ ...form, salary_min: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Max Salary (₹)</Label>
                  <Input type="number" value={form.salary_max} onChange={e => setForm({ ...form, salary_max: e.target.value })} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Requirements</Label>
                  <Textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} rows={3} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={handleSubmit}>{editingJob ? "Update Job" : "Post Job"}</Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setEditingJob(null); }}>Cancel</Button>
              </div>
            </div>
          )}

          <Tabs defaultValue="jobs">
            <TabsList>
              <TabsTrigger value="jobs">My Jobs</TabsTrigger>
              <TabsTrigger value="applicants">Applicants</TabsTrigger>
            </TabsList>

            <TabsContent value="jobs">
              <div className="space-y-3 mt-4">
                {jobs.map(job => (
                  <div key={job.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{(job.companies as any)?.name} • {job.location} • {job.job_type}</p>
                      <div className="flex gap-1 mt-2">
                        {job.skills?.slice(0, 4).map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(job)}><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteJob(job.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && <p className="text-center text-muted-foreground py-8">No jobs posted yet.</p>}
              </div>
            </TabsContent>

            <TabsContent value="applicants">
              <div className="space-y-3 mt-4">
                {applications.map(app => (
                  <div key={app.id} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{(app as any).profiles?.name || "Applicant"}</h3>
                        <p className="text-xs text-muted-foreground">{(app as any).profiles?.email} • Applied for: {app.jobs?.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={app.status === "selected" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}>
                          {app.status}
                        </Badge>
                        <Select value={app.status} onValueChange={v => updateAppStatus(app.id, v)}>
                          <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="selected">Selected</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
                {applications.length === 0 && <p className="text-center text-muted-foreground py-8">No applications yet.</p>}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default RecruiterDashboard;
