// Jobs.tsx — Browse and search jobs from the database
import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import type { DbJob, DbCategory } from "@/lib/types";

const jobTypes = ["All", "Full Time", "Part Time", "Work From Home", "Contract", "Internship"];

const Jobs = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState("recent");
  const [jobs, setJobs] = useState<DbJob[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    supabase.from("categories").select("*").then(({ data }) => { if (data) setCategories(data as DbCategory[]); });
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      let query = supabase.from("jobs").select("*, companies(name, logo), categories(name, icon, slug)").eq("is_active", true);

      if (selectedType !== "All") query = query.eq("job_type", selectedType);
      if (selectedCategory) query = query.eq("categories.slug", selectedCategory);

      if (sortBy === "recent") query = query.order("created_at", { ascending: false });
      else if (sortBy === "salary") query = query.order("salary_max", { ascending: false });

      const { data } = await query;
      let results = (data || []) as unknown as DbJob[];

      // Client-side search filter
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(j =>
          j.title.toLowerCase().includes(q) ||
          (j.companies as any)?.name?.toLowerCase().includes(q) ||
          j.skills?.some(s => s.toLowerCase().includes(q)) ||
          j.location.toLowerCase().includes(q)
        );
      }

      // Filter by category (if joined data was nullified by PostgREST inner join issue)
      if (selectedCategory) {
        results = results.filter(j => (j.categories as any)?.slug === selectedCategory);
      }

      setJobs(results);
      setLoadingJobs(false);
    };
    fetchJobs();
  }, [selectedType, selectedCategory, sortBy, search]);

  const formatSalary = (min: number, max: number) => {
    const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
    return `${fmt(min)} - ${fmt(max)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 container mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold">Find Jobs</h1>
          <p className="text-muted-foreground mt-1">Discover opportunities from top companies</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search jobs, companies, skills..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11" />
          </div>
          <Select value={selectedCategory || "all"} onValueChange={v => setSelectedCategory(v === "all" ? "" : v)}>
            <SelectTrigger className="w-full md:w-48 h-11"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.icon} {c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-44 h-11"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="salary">Highest Salary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {jobTypes.map((type) => (
            <Badge key={type} variant={selectedType === type ? "default" : "outline"} className="cursor-pointer px-4 py-1.5 text-sm" onClick={() => setSelectedType(type)}>
              {type}
            </Badge>
          ))}
        </div>

        {/* Results */}
        <p className="text-sm text-muted-foreground mb-4">{jobs.length} jobs found</p>
        {loadingJobs ? (
          <div className="text-center py-16"><p className="text-muted-foreground">Loading jobs...</p></div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
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
                          {(job.categories as any)?.name && <Badge variant="outline" className="text-xs">{(job.categories as any).name}</Badge>}
                          {job.skills?.slice(0, 3).map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            {jobs.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No jobs found matching your criteria.</p>
                <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setSelectedType("All"); setSelectedCategory(""); }}>Clear Filters</Button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Jobs;
