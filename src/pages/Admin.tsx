// Admin.tsx — Admin dashboard with FULL CONTROL
// Fetches real user data from database, allows deletion
import { useState, useEffect } from "react";
import { BarChart3, Users, Briefcase, Trash2, Eye, Settings, LogOut, FileText, TrendingUp, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Sidebar navigation items
const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", active: true },
  { icon: Users, label: "All Users" },
  { icon: Briefcase, label: "Manage Jobs" },
  { icon: FileText, label: "Applications" },
  { icon: TrendingUp, label: "Analytics" },
  { icon: Settings, label: "Settings" },
];

// User type from database
interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
}

const Admin = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      if (!user) navigate("/login");
    }
  }, [user, loading, isAdmin, navigate]);

  // Fetch all users from database (admin only)
  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load users");
    } else {
      setUsers(data || []);
    }
    setLoadingUsers(false);
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  // Delete a user (removes from auth + cascades to profiles)
  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    // Delete profile (cascade will handle user_roles)
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to delete user");
    } else {
      toast.success("User deleted successfully");
      setUsers(users.filter((u) => u.user_id !== userId));
    }
  };

  // Filter users by search
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats based on real data
  const statsCards = [
    { label: "Total Users", value: users.length.toString(), icon: Users, color: "text-primary" },
    { label: "New Today", value: users.filter((u) => new Date(u.created_at).toDateString() === new Date().toDateString()).length.toString(), icon: TrendingUp, color: "text-primary" },
  ];

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
          <Link to="/"><Button>Go Home</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — professional admin look */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border p-4 flex flex-col shrink-0 hidden lg:flex">
        <Link to="/" className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-display font-bold text-sidebar-foreground">Admin Panel</span>
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
        <button
          onClick={async () => { await signOut(); navigate("/login"); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground w-full"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <h1 className="font-display text-2xl font-bold">{activeTab}</h1>
              <p className="text-muted-foreground text-sm mt-1">Welcome back, Admin</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {statsCards.map((stat) => (
                <div key={stat.label} className="bg-card rounded-xl border border-border p-5 card-elevated">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                  <p className="font-display text-2xl font-bold mt-3">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Users Table — shows ALL registered users */}
            <h2 className="font-display text-lg font-semibold mb-4">All Registered Users</h2>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
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
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Date Joined</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, i) => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4 text-sm text-muted-foreground">{i + 1}</td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-sm">{u.name || "—"}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{u.email}</td>
                        <td className="px-5 py-4 text-sm text-muted-foreground hidden md:table-cell">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUser(u.user_id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {loadingUsers && <div className="text-center py-8 text-muted-foreground">Loading users...</div>}
              {!loadingUsers && filteredUsers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No users found</div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
