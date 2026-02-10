import { useState } from "react";
import { BarChart3, Users, Briefcase, Plus, Trash2, Edit, Eye, Settings, LogOut, FileText, TrendingUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockJobs, Job } from "@/data/jobs";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", active: true },
  { icon: Briefcase, label: "Manage Jobs" },
  { icon: Users, label: "Candidates" },
  { icon: FileText, label: "Applications" },
  { icon: TrendingUp, label: "Analytics" },
  { icon: Settings, label: "Settings" },
];

const statsCards = [
  { label: "Total Jobs", value: "248", change: "+12%", icon: Briefcase },
  { label: "Applications", value: "1,847", change: "+24%", icon: FileText },
  { label: "Candidates", value: "3,291", change: "+8%", icon: Users },
  { label: "Views", value: "45.2K", change: "+18%", icon: Eye },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = jobs.filter(
    (j) => j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           j.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteJob = (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id));
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border p-4 flex flex-col shrink-0 hidden lg:flex">
        <Link to="/" className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-display font-bold text-sidebar-foreground">AI Job Portal</span>
        </Link>
        <nav className="space-y-1 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.label
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <Link to="/">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground w-full">
            <LogOut className="w-4 h-4" /> Back to Site
          </button>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-2xl font-bold">
                  {activeTab}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Welcome back, Admin</p>
              </div>
              <Button className="glow">
                <Plus className="w-4 h-4 mr-2" /> Post New Job
              </Button>
            </div>

            {/* Stats */}
            {activeTab === "Dashboard" && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {statsCards.map((stat, i) => (
                    <div key={stat.label} className="bg-card rounded-xl border border-border p-5 card-elevated">
                      <div className="flex items-center justify-between">
                        <stat.icon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs font-medium text-primary">{stat.change}</span>
                      </div>
                      <p className="font-display text-2xl font-bold mt-3">{stat.value}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <h2 className="font-display text-lg font-semibold mb-4">Recent Jobs</h2>
              </>
            )}

            {/* Jobs Table */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 max-w-sm"
                />
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Type</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Location</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Salary</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job) => (
                      <tr key={job.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary font-display font-bold flex items-center justify-center text-xs">
                              {job.logo}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{job.title}</p>
                              <p className="text-xs text-muted-foreground">{job.company}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <Badge variant="secondary" className="text-xs">{job.type}</Badge>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground hidden md:table-cell">{job.location}</td>
                        <td className="px-5 py-4 text-sm font-medium hidden lg:table-cell">{job.salary}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/jobs/${job.id}`}>
                              <Button variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" /></Button>
                            </Link>
                            <Button variant="ghost" size="sm"><Edit className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteJob(job.id)}>
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredJobs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No jobs found</div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
