// JobDetail.tsx — Job detail page with real data and apply functionality
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, DollarSign, Bookmark, Share2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { DbJob } from "@/lib/types";

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<DbJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("jobs").select("*, companies(name, logo, website, description, location), categories(name, icon, slug)")
      .eq("id", id).single()
      .then(({ data }) => { setJob(data as unknown as DbJob); setLoading(false); });

    // Check if already applied
    if (user) {
      supabase.from("applications").select("id").eq("job_id", id).eq("user_id", user.id).maybeSingle()
        .then(({ data }) => { if (data) setApplied(true); });
    }
  }, [id, user]);

  const handleApply = async () => {
    if (!user) { navigate("/login"); return; }
    if (!job) return;
    setApplying(true);
    const { error } = await supabase.from("applications").insert({ job_id: job.id, user_id: user.id });
    setApplying(false);
    if (error) {
      if (error.code === "23505") toast.error("Already applied to this job");
      else toast.error("Failed to apply");
    } else {
      setApplied(true);
      toast.success("Application submitted successfully!");
    }
  };

  const formatSalary = (min: number, max: number) => {
    const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
    return `${fmt(min)} - ${fmt(max)}`;
  };

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="pt-32 text-center"><p className="text-muted-foreground">Loading...</p></div></div>;

  if (!job) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 text-center">
        <h1 className="font-display text-2xl font-bold">Job not found</h1>
        <Link to="/jobs"><Button className="mt-4">Back to Jobs</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 container mx-auto px-4 lg:px-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Link>

          <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary font-display font-bold flex items-center justify-center text-lg shrink-0">
                {(job.companies as any)?.logo || "JT"}
              </div>
              <div className="flex-1">
                <h1 className="font-display text-2xl md:text-3xl font-bold">{job.title}</h1>
                <p className="text-lg text-muted-foreground mt-1">{(job.companies as any)?.name}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{new Date(job.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5 font-semibold text-foreground"><DollarSign className="w-4 h-4" />{formatSalary(job.salary_min, job.salary_max)}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge>{job.job_type}</Badge>
                  {(job.categories as any)?.name && <Badge variant="outline">{(job.categories as any).name}</Badge>}
                  {job.skills?.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              {applied ? (
                <Button size="lg" disabled className="font-semibold px-8">✓ Applied</Button>
              ) : (
                <Button size="lg" className="glow font-semibold px-8" onClick={handleApply} disabled={applying}>
                  {applying ? "Applying..." : "Apply Now"}
                </Button>
              )}
              <Button size="lg" variant="outline"><Bookmark className="w-4 h-4 mr-2" />Save</Button>
              <Button size="lg" variant="ghost"><Share2 className="w-4 h-4 mr-2" />Share</Button>
            </div>

            <hr className="my-8 border-border" />

            <div className="prose prose-sm max-w-none">
              <h3 className="font-display font-semibold text-lg mb-4">About this role</h3>
              <p className="text-muted-foreground leading-relaxed">{job.description}</p>

              {job.requirements && (
                <>
                  <h3 className="font-display font-semibold text-lg mt-8 mb-4">Requirements</h3>
                  <p className="text-muted-foreground leading-relaxed">{job.requirements}</p>
                </>
              )}

              {(job.companies as any)?.description && (
                <>
                  <h3 className="font-display font-semibold text-lg mt-8 mb-4">About {(job.companies as any).name}</h3>
                  <p className="text-muted-foreground leading-relaxed">{(job.companies as any).description}</p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default JobDetail;
