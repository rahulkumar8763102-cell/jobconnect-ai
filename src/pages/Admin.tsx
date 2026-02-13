// Admin.tsx — Full admin dashboard with user/recruiter/job/company/category management
import { useState, useEffect } from "react";
import { BarChart3, Users, Briefcase, Trash2, Settings, LogOut, TrendingUp, Search, Shield, Building2, Tags, FileText, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { DbProfile, DbJob, DbCompany, DbCategory } from "@/lib/types";

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard" },
  { icon: Users, label: "Users" },
  { icon: Briefcase, label: "Jobs" },
  { icon: Building2, label: "Companies" },
  { icon: Tags, label: "Categories" },
  { icon: FileText, label: "Applications" },
  { icon: Settings, label: "Settings" },
];

const Admin = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [users, setUsers] = useState<DbProfile[]>([]);
  const [jobs, setJobs] = useState<DbJob[]>([]);
  const [companies, setCompanies] = useState<DbCompany[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      if (!user) navigate("/login");
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    setLoadingData(true);
    Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("jobs").select("*, companies(name, logo), categories(name, icon)").order("created_at", { ascending: false }),
      supabase.from("companies").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
      supabase.from("applications").select("*, jobs(title), profiles:user_id(name, email)").order("created_at", { ascending: false }),
    ]).then(([u, j, co, ca, ap]) => {
      if (u.data) setUsers(u.data as unknown as DbProfile[]);
      if (j.data) setJobs(j.data as unknown as DbJob[]);
      if (co.data) setCompanies(co.data as DbCompany[]);
      if (ca.data) setCategories(ca.data as DbCategory[]);
      if (ap.data) setApplications(ap.data);
      setLoadingData(false);
    });
  }, [isAdmin]);

  const deleteUser = async (userId: string) => {
    if (!confirm("Delete this user?")) return;
    const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
    if (error) toast.error("Failed");
    else { toast.success("User deleted"); setUsers(users.filter(u => u.user_id !== userId)); }
  };

  const deleteJob = async (id: string) => {
    if (!confirm("Delete this job?")) return;
    await supabase.from("jobs").delete().eq("id", id);
    setJobs(jobs.filter(j => j.id !== id));
    toast.success("Job deleted");
  };

  const deleteCompany = async (id: string) => {
    if (!confirm("Delete this company?")) return;
    await supabase.from("companies").delete().eq("id", id);
    setCompanies(companies.filter(c => c.id !== id));
    toast.success("Company deleted");
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await supabase.from("categories").delete().eq("id", id);
    setCategories(categories.filter(c => c.id !== id));
    toast.success("Category deleted");
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Admin Access Required</h1>
        <Link to="/"><Button>Go Home</Button></Link>
      </div>
    </div>
  );

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border p-4 flex flex-col shrink-0 hidden lg:flex">
        <Link to="/" className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-display font-bold text-sidebar-foreground">Admin Panel</span>
        </Link>
        <nav className="space-y-1 flex-1">
          {sidebarItems.map((item) => (
            <button key={item.label} onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.label ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"}`}>
              <item.icon className="w-4 h-4" />{item.label}
            </button>
          ))}
        </nav>
        <button onClick={async () => { await signOut(); navigate("/login"); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground w-full">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <h1 className="font-display text-2xl font-bold">{activeTab}</h1>
              <p className="text-muted-foreground text-sm mt-1">Full admin control</p>
            </div>

            {/* Dashboard Stats */}
            {activeTab === "Dashboard" && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Total Users", value: users.length, icon: Users },
                    { label: "Total Jobs", value: jobs.length, icon: Briefcase },
                    { label: "Companies", value: companies.length, icon: Building2 },
                    { label: "Applications", value: applications.length, icon: FileText },
                  ].map(s => (
                    <div key={s.label} className="bg-card rounded-xl border border-border p-5 card-elevated">
                      <s.icon className="w-5 h-5 text-muted-foreground" />
                      <p className="font-display text-2xl font-bold mt-3">{s.value}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-card rounded-xl border border-border p-5">
                    <h3 className="font-display font-semibold mb-3">Categories</h3>
                    <div className="space-y-2">
                      {categories.map(c => (
                        <div key={c.id} className="flex items-center justify-between text-sm">
                          <span>{c.icon} {c.name}</span>
                          <Badge variant="outline">{jobs.filter(j => j.category_id === c.id).length} jobs</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-5">
                    <h3 className="font-display font-semibold mb-3">Recent Applications</h3>
                    <div className="space-y-2">
                      {applications.slice(0, 5).map(a => (
                        <div key={a.id} className="flex items-center justify-between text-sm">
                          <span>{(a as any).profiles?.name} → {a.jobs?.title}</span>
                          <Badge variant={a.status === "selected" ? "default" : a.status === "rejected" ? "destructive" : "secondary"}>{a.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Users Tab */}
            {activeTab === "Users" && (
              <>
                <div className="mb-4 relative max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-10" />
                </div>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">#</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Email</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Role</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Joined</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                    </tr></thead>
                    <tbody>
                      {filteredUsers.map((u, i) => (
                        <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-5 py-4 text-sm text-muted-foreground">{i + 1}</td>
                          <td className="px-5 py-4 font-medium text-sm">{u.name || "—"}</td>
                          <td className="px-5 py-4 text-sm text-muted-foreground">{u.email}</td>
                          <td className="px-5 py-4 text-sm hidden md:table-cell"><Badge variant="secondary">{u.role || "user"}</Badge></td>
                          <td className="px-5 py-4 text-sm text-muted-foreground hidden md:table-cell">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-4 text-right">
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteUser(u.user_id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {loadingData && <div className="text-center py-8 text-muted-foreground">Loading...</div>}
                  {!loadingData && filteredUsers.length === 0 && <div className="text-center py-12 text-muted-foreground">No users found</div>}
                </div>
              </>
            )}

            {/* Jobs Tab */}
            {activeTab === "Jobs" && (
              <div className="space-y-3">
                {jobs.map(job => (
                  <div key={job.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{job.title}</h3>
                      <p className="text-xs text-muted-foreground">{(job.companies as any)?.name} • {job.location} • {job.job_type}</p>
                      <div className="flex gap-1 mt-2">{job.skills?.slice(0, 3).map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteJob(job.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            )}

            {/* Companies Tab */}
            {activeTab === "Companies" && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map(c => (
                  <div key={c.id} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary font-display font-bold flex items-center justify-center text-xs">{c.logo}</div>
                        <div>
                          <h3 className="font-semibold text-sm">{c.name}</h3>
                          <p className="text-xs text-muted-foreground">{c.location}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteCompany(c.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === "Categories" && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.icon}</span>
                      <div>
                        <h3 className="font-semibold text-sm">{c.name}</h3>
                        <p className="text-xs text-muted-foreground">{c.slug}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteCategory(c.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === "Applications" && (
              <div className="space-y-3">
                {applications.map(a => (
                  <div key={a.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{(a as any).profiles?.name || "User"}</h3>
                      <p className="text-xs text-muted-foreground">{(a as any).profiles?.email} → {a.jobs?.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={a.status === "selected" ? "default" : a.status === "rejected" ? "destructive" : "secondary"}>{a.status}</Badge>
                  </div>
                ))}
                {applications.length === 0 && <p className="text-center text-muted-foreground py-8">No applications yet.</p>}
              </div>
            )}

            {activeTab === "Settings" && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-semibold mb-4">Admin Settings</h3>
                <p className="text-sm text-muted-foreground">Admin: admin@jobportal.com</p>
                <p className="text-sm text-muted-foreground mt-2">System is running on Lovable Cloud with AI-powered features enabled.</p>
                <div className="mt-6 space-y-2">
                  <h4 className="font-semibold text-sm">Future Enhancements</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Resume Builder</li>
                    <li>• AI Chat Assistant</li>
                    <li>• Video Interview Integration</li>
                    <li>• Payment for Premium Job Boost</li>
                    <li>• Cloud Deployment Ready</li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
