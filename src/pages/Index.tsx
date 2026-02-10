import { motion } from "framer-motion";
import { Search, MapPin, Sparkles, TrendingUp, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { mockJobs, jobCategories } from "@/data/jobs";
import heroBg from "@/assets/hero-bg.jpg";

const stats = [
  { label: "Active Jobs", value: "12,400+", icon: TrendingUp },
  { label: "Companies", value: "3,200+", icon: Building2 },
  { label: "Candidates", value: "850K+", icon: Users },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/jobs?q=${searchQuery}&loc=${locationQuery}`);
  };

  const featuredJobs = mockJobs.filter((j) => j.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 hero-bg opacity-80" />
        <div className="relative container mx-auto px-4 lg:px-8 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Job Matching</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight max-w-4xl mx-auto">
              Find Your Dream Career with{" "}
              <span className="text-gradient">AI Intelligence</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/60 mt-6 max-w-2xl mx-auto leading-relaxed">
              Our AI matches your skills, experience, and preferences to the perfect opportunities. Join 850K+ professionals who found their ideal role.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-10 max-w-3xl mx-auto"
          >
            <div className="bg-card/10 backdrop-blur-xl rounded-2xl p-2 border border-primary-foreground/10">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    placeholder="Job title, keyword, or company"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-card border-0 text-card-foreground placeholder:text-muted-foreground rounded-xl"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    placeholder="City, state, or remote"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="pl-10 h-12 bg-card border-0 text-card-foreground placeholder:text-muted-foreground rounded-xl"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} size="lg" className="h-12 px-8 rounded-xl glow font-semibold">
                  Search Jobs
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-display font-bold text-primary-foreground">{s.value}</p>
                <p className="text-sm text-primary-foreground/50 mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl font-bold text-center">Browse by Category</h2>
          <p className="text-muted-foreground text-center mt-2">Explore opportunities across industries</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-10">
          {jobCategories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to={`/jobs?category=${cat.name}`}
                className="block bg-card rounded-xl p-5 text-center card-elevated border border-border hover:border-primary/30 transition-colors"
              >
                <span className="text-3xl">{cat.icon}</span>
                <h3 className="font-display font-semibold text-sm mt-3">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{cat.count} jobs</p>
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
              <h2 className="font-display text-3xl font-bold">Featured Jobs</h2>
              <p className="text-muted-foreground mt-2">Hand-picked opportunities for you</p>
            </div>
            <Link to="/jobs">
              <Button variant="outline">View All Jobs</Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredJobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="hero-bg rounded-3xl p-10 md:p-16 text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
            Ready to find your next opportunity?
          </h2>
          <p className="text-primary-foreground/60 mt-4 max-w-xl mx-auto">
            Create your profile and let our AI match you with the perfect roles. It's free to get started.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/register">
              <Button size="lg" className="glow font-semibold px-8">Create Free Account</Button>
            </Link>
            <Link to="/jobs">
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Browse Jobs
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
