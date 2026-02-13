// Index.tsx — JobTatkal AI Homepage with category sections and CV wizard
import { motion } from "framer-motion";
import { Search, MapPin, Sparkles, TrendingUp, Users, Building2, Upload, FileText, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";
import type { DbJob, DbCategory, DbCompany } from "@/lib/types";

const stats = [
  { label: "Active Jobs", value: "18+", icon: TrendingUp },
  { label: "Companies", value: "5+", icon: Building2 },
  { label: "AI Powered", value: "100%", icon: Sparkles },
];

// CV Wizard Steps
const wizardSteps = [
  { step: 1, title: "Upload CV", desc: "Upload your resume in PDF/DOC format", icon: Upload },
  { step: 2, title: "AI Matches Jobs", desc: "Our AI finds the best jobs for your skills", icon: Sparkles },
  { step: 3, title: "Apply Easily", desc: "One-click apply to matched positions", icon: Zap },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [categories, setCategories] = useState<(DbCategory & { job_count?: number })[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<DbJob[]>([]);
  const [companies, setCompanies] = useState<DbCompany[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories
    supabase.from("categories").select("*").then(({ data }) => {
      if (data) setCategories(data as DbCategory[]);
    });
    // Fetch featured jobs (latest 6)
    supabase.from("jobs").select("*, companies(name, logo), categories(name, icon, slug)")
      .eq("is_active", true).order("created_at", { ascending: false }).limit(6)
      .then(({ data }) => { if (data) setFeaturedJobs(data as unknown as DbJob[]); });
    // Fetch companies
    supabase.from("companies").select("*").then(({ data }) => { if (data) setCompanies(data as DbCompany[]); });
  }, []);

  const handleSearch = () => navigate(`/jobs?q=${searchQuery}&loc=${locationQuery}`);

  const formatSalary = (min: number, max: number) => {
    const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
    return `${fmt(min)} - ${fmt(max)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 hero-bg opacity-80" />
        <div className="relative container mx-auto px-4 lg:px-8 text-center pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Job Matching</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight max-w-4xl mx-auto">
              Find Your Dream Career with{" "}
              <span className="text-gradient">JobTatkal AI</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/60 mt-6 max-w-2xl mx-auto leading-relaxed">
              AI-powered resume parsing, skill matching, and one-click job applications. Upload your CV and let AI find the perfect role for you.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mt-10 max-w-3xl mx-auto">
            <div className="bg-card/10 backdrop-blur-xl rounded-2xl p-2 border border-primary-foreground/10">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input placeholder="Job title, keyword, or company" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-card border-0 text-card-foreground placeholder:text-muted-foreground rounded-xl"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input placeholder="City or Remote" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)}
                    className="pl-10 h-12 bg-card border-0 text-card-foreground placeholder:text-muted-foreground rounded-xl"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                </div>
                <Button onClick={handleSearch} size="lg" className="h-12 px-8 rounded-xl glow font-semibold">Search Jobs</Button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.4 }} className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-display font-bold text-primary-foreground">{s.value}</p>
                <p className="text-sm text-primary-foreground/50 mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-20 container mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl font-bold text-center">Browse by Category</h2>
          <p className="text-muted-foreground text-center mt-2">Explore jobs across different categories</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-10">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link to={`/jobs?category=${cat.slug}`} className="block bg-card rounded-xl p-5 text-center card-elevated border border-border hover:border-primary/30 transition-colors">
                <span className="text-3xl">{cat.icon}</span>
                <h3 className="font-display font-semibold text-sm mt-3">{cat.name}</h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold">Latest Jobs</h2>
              <p className="text-muted-foreground mt-2">Fresh opportunities from top companies</p>
            </div>
            <Link to="/jobs"><Button variant="outline">View All Jobs</Button></Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredJobs.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={`/jobs/${job.id}`} className="block">
                  <div className="bg-card rounded-xl p-5 card-elevated border border-border group cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary font-display font-bold flex items-center justify-center text-sm shrink-0">
                        {(job.companies as any)?.logo || "JT"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-card-foreground group-hover:text-primary transition-colors truncate">{job.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{(job.companies as any)?.name || "Company"}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                          <span className="font-semibold text-foreground">{formatSalary(job.salary_min, job.salary_max)}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          <Badge variant="secondary" className="text-xs">{job.job_type}</Badge>
                          {job.skills?.slice(0, 2).map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies */}
      <section className="py-20 container mx-auto px-4 lg:px-8">
        <h2 className="font-display text-3xl font-bold text-center mb-10">Top Companies Hiring</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {companies.map(c => (
            <div key={c.id} className="bg-card rounded-xl border border-border p-6 text-center card-elevated">
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary font-display font-bold flex items-center justify-center text-lg mx-auto">{c.logo}</div>
              <h3 className="font-display font-semibold mt-3">{c.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{c.location}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CV Wizard Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center">AI CV Enhancer</h2>
          <p className="text-muted-foreground text-center mt-2 mb-12">3 simple steps to your dream job</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {wizardSteps.map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="bg-card rounded-xl border border-border p-8 text-center card-elevated relative">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-primary mb-2">STEP {s.step}</div>
                <h3 className="font-display font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
                {i < 2 && <ArrowRight className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />}
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/register"><Button size="lg" className="glow font-semibold px-8">Get Started Free</Button></Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 container mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="hero-bg rounded-3xl p-10 md:p-16 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
            Ready to find your next opportunity?
          </h2>
          <p className="text-primary-foreground/60 mt-4 max-w-xl mx-auto">
            Create your profile and let our AI match you with the perfect roles. It's free to get started.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/register"><Button size="lg" className="glow font-semibold px-8">Create Free Account</Button></Link>
            <Link to="/jobs">
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">Browse Jobs</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
