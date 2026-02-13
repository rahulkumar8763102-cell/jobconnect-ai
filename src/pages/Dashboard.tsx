// Dashboard.tsx — Job Seeker dashboard with resume upload, AI features, and applied jobs
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User, Mail, Calendar, Upload, FileText, Sparkles, Briefcase, MapPin, Phone, Edit2, CheckCircle, Clock, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { DbProfile, DbResume, DbApplication, DbJob } from "@/lib/types";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [resume, setResume] = useState<DbResume | null>(null);
  const [applications, setApplications] = useState<(DbApplication & { jobs: { title: string; location: string; companies: { name: string } | null } | null })[]>([]);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState("");
  const [aiResult, setAiResult] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [matchedJobs, setMatchedJobs] = useState<DbJob[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // Fetch profile, resume, applications
  useEffect(() => {
    if (!user) return;
    // Profile
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setProfile(data as unknown as DbProfile);
          setEditName(data.name);
          setEditPhone((data as any).phone || "");
          setEditLocation((data as any).location || "");
        }
      });
    // Latest resume
    supabase.from("resumes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1)
      .then(({ data }) => { if (data?.[0]) setResume(data[0] as unknown as DbResume); });
    // Applications
    supabase.from("applications").select("*, jobs(title, location, companies(name))").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setApplications(data as any); });
  }, [user]);

  // Upload resume
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext || "")) {
      toast.error("Only PDF, DOC, DOCX files allowed");
      return;
    }
    setUploading(true);
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("resumes").upload(path, file);
    if (uploadError) { toast.error("Upload failed"); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(path);
    const { data: resumeData, error: insertError } = await supabase.from("resumes").insert({
      user_id: user.id, file_name: file.name, file_url: urlData.publicUrl,
    }).select().single();

    if (insertError) { toast.error("Failed to save resume"); }
    else { setResume(resumeData as unknown as DbResume); toast.success("Resume uploaded!"); }
    setUploading(false);
  };

  // AI Actions
  const callAI = async (action: string) => {
    if (!resume?.file_name && !resume) {
      toast.error("Please upload a resume first");
      return;
    }
    setAiLoading(action);
    setAiResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-resume", {
        body: { action, resume_text: resume?.raw_text || `Resume: ${resume?.file_name}. Skills: ${resume?.parsed_skills?.join(", ") || "Not parsed yet"}` },
      });
      if (error) throw error;
      setAiResult({ action, ...data });

      // If parsing, update the resume record with extracted data
      if (action === "parse_resume" && data.skills) {
        await supabase.from("resumes").update({
          parsed_skills: data.skills,
          parsed_education: data.education || "",
          parsed_experience: data.experience || "",
        }).eq("id", resume!.id);
        setResume(prev => prev ? { ...prev, parsed_skills: data.skills, parsed_education: data.education || "", parsed_experience: data.experience || "" } : null);
      }

      // If job matching, fetch matching jobs
      if (action === "match_jobs" && data.recommended_categories) {
        const { data: jobs } = await supabase.from("jobs").select("*, companies(name, logo), categories(name, icon, slug)").eq("is_active", true).limit(6);
        if (jobs) setMatchedJobs(jobs as unknown as DbJob[]);
      }
    } catch (err: any) {
      toast.error(err.message || "AI request failed");
    }
    setAiLoading("");
  };

  // Update profile
  const handleProfileUpdate = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      name: editName, phone: editPhone, location: editLocation,
    }).eq("user_id", user.id);
    if (error) toast.error("Update failed");
    else {
      toast.success("Profile updated!");
      setProfile(prev => prev ? { ...prev, name: editName, phone: editPhone, location: editLocation } : null);
      setEditingProfile(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  const statusIcon = (s: string) => {
    if (s === "selected") return <CheckCircle className="w-4 h-4 text-primary" />;
    if (s === "rejected") return <XCircle className="w-4 h-4 text-destructive" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 container mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold">Welcome, {profile?.name || "User"}!</h1>
              <p className="text-muted-foreground mt-1">Your JobTatkal AI Dashboard</p>
            </div>
            <Button variant="outline" onClick={async () => { await signOut(); navigate("/login"); }}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 max-w-lg">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="resume">Resume & AI</TabsTrigger>
              <TabsTrigger value="jobs">Matched Jobs</TabsTrigger>
              <TabsTrigger value="applied">Applied</TabsTrigger>
            </TabsList>

            {/* PROFILE TAB */}
            <TabsContent value="profile">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold">Your Profile</h2>
                  <Button variant="ghost" size="sm" onClick={() => setEditingProfile(!editingProfile)}>
                    <Edit2 className="w-4 h-4 mr-1" /> {editingProfile ? "Cancel" : "Edit"}
                  </Button>
                </div>
                {editingProfile ? (
                  <div className="space-y-3 max-w-md">
                    <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Name" />
                    <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Phone" />
                    <Input value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="Location" />
                    <Button onClick={handleProfileUpdate}>Save Changes</Button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3"><User className="w-4 h-4 text-muted-foreground" /><span className="text-sm"><strong>Name:</strong> {profile?.name || "—"}</span></div>
                    <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-muted-foreground" /><span className="text-sm"><strong>Email:</strong> {profile?.email || user?.email}</span></div>
                    <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-sm"><strong>Phone:</strong> {profile?.phone || "—"}</span></div>
                    <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-muted-foreground" /><span className="text-sm"><strong>Location:</strong> {profile?.location || "—"}</span></div>
                    <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-muted-foreground" /><span className="text-sm"><strong>Joined:</strong> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</span></div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* RESUME & AI TAB */}
            <TabsContent value="resume">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Upload Section */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-display text-lg font-semibold mb-4">
                    <Upload className="w-5 h-5 inline mr-2" />Upload Resume
                  </h2>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">Upload PDF, DOC, or DOCX</p>
                    <label className="cursor-pointer">
                      <Button variant="outline" disabled={uploading} asChild><span>{uploading ? "Uploading..." : "Choose File"}</span></Button>
                      <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
                    </label>
                  </div>
                  {resume && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">{resume.file_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Uploaded {new Date(resume.created_at).toLocaleDateString()}</p>
                      {resume.parsed_skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {resume.parsed_skills.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* AI Tools */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-display text-lg font-semibold mb-4">
                    <Sparkles className="w-5 h-5 inline mr-2" />AI CV Enhancer
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { action: "parse_resume", label: "Parse Resume", icon: "📄" },
                      { action: "match_jobs", label: "Match Jobs", icon: "🎯" },
                      { action: "spell_check", label: "Spell Check", icon: "✏️" },
                      { action: "grammar_check", label: "Grammar Check", icon: "📝" },
                      { action: "suggest_objective", label: "Suggest Objective", icon: "🎯" },
                      { action: "suggest_skills", label: "Suggest Skills", icon: "💡" },
                    ].map(tool => (
                      <Button
                        key={tool.action}
                        variant="outline"
                        className="h-auto py-3 flex flex-col items-center gap-1"
                        disabled={!!aiLoading || !resume}
                        onClick={() => callAI(tool.action)}
                      >
                        <span className="text-lg">{tool.icon}</span>
                        <span className="text-xs">{aiLoading === tool.action ? "Processing..." : tool.label}</span>
                      </Button>
                    ))}
                  </div>
                  {!resume && <p className="text-xs text-muted-foreground mt-3">Upload a resume first to use AI tools</p>}
                </div>
              </div>

              {/* AI Results */}
              {aiResult && (
                <div className="bg-card rounded-xl border border-border p-6 mt-6">
                  <h3 className="font-display font-semibold mb-3">
                    AI Result: {aiResult.action?.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </h3>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-64 whitespace-pre-wrap">
                    {JSON.stringify(aiResult, null, 2)}
                  </pre>
                </div>
              )}
            </TabsContent>

            {/* MATCHED JOBS TAB */}
            <TabsContent value="jobs">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold">AI Recommended Jobs</h2>
                  <Button variant="outline" size="sm" onClick={() => callAI("match_jobs")} disabled={!!aiLoading || !resume}>
                    <Sparkles className="w-4 h-4 mr-1" /> {aiLoading === "match_jobs" ? "Matching..." : "Find Matches"}
                  </Button>
                </div>
                {matchedJobs.length > 0 ? (
                  <div className="space-y-3">
                    {matchedJobs.map(job => (
                      <Link key={job.id} to={`/jobs/${job.id}`} className="block">
                        <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-sm">{job.title}</h3>
                              <p className="text-xs text-muted-foreground">{(job.companies as any)?.name} • {job.location}</p>
                            </div>
                            <Badge variant="secondary">{job.job_type}</Badge>
                          </div>
                          <div className="flex gap-1 mt-2">
                            {job.skills?.slice(0, 3).map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Upload your resume and click "Find Matches" to get AI-powered job recommendations.
                  </p>
                )}
                <div className="mt-4 text-center">
                  <Link to="/jobs"><Button variant="outline">Browse All Jobs</Button></Link>
                </div>
              </div>
            </TabsContent>

            {/* APPLIED JOBS TAB */}
            <TabsContent value="applied">
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Applied Jobs</h2>
                {applications.length > 0 ? (
                  <div className="space-y-3">
                    {applications.map(app => (
                      <div key={app.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h3 className="font-semibold text-sm">{app.jobs?.title || "Job"}</h3>
                          <p className="text-xs text-muted-foreground">{(app.jobs as any)?.companies?.name} • {app.jobs?.location}</p>
                          <p className="text-xs text-muted-foreground mt-1">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {statusIcon(app.status)}
                          <Badge variant={app.status === "selected" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}>
                            {app.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">You haven't applied to any jobs yet.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
