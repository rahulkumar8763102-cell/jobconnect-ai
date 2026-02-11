// Dashboard.tsx — User dashboard after login
// Shows profile info and available jobs
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { mockJobs } from "@/data/jobs";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ name: string; email: string; created_at: string } | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Fetch user profile from database
  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("name, email, created_at")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 container mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Card */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold">Welcome, {profile?.name || "User"}!</h1>
              <p className="text-muted-foreground mt-1">Your personal dashboard</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h2 className="font-display text-lg font-semibold mb-4">Your Profile</h2>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm"><strong>Name:</strong> {profile?.name || "—"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm"><strong>Email:</strong> {profile?.email || user?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm"><strong>Joined:</strong> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</span>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <h2 className="font-display text-2xl font-bold mb-4">Available Jobs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
