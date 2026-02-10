import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Building2, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";

const companies = [
  { name: "TechNova Inc.", industry: "Technology", location: "San Francisco, CA", employees: "500-1000", jobs: 24, logo: "TN" },
  { name: "DesignFlow", industry: "Design", location: "Remote", employees: "50-200", jobs: 12, logo: "DF" },
  { name: "DataPulse AI", industry: "AI / ML", location: "New York, NY", employees: "200-500", jobs: 18, logo: "DP" },
  { name: "CloudScale", industry: "Cloud Computing", location: "Austin, TX", employees: "1000+", jobs: 31, logo: "CS" },
  { name: "GrowthLab", industry: "Marketing", location: "Chicago, IL", employees: "50-200", jobs: 8, logo: "GL" },
  { name: "AppForge", industry: "Mobile", location: "Seattle, WA", employees: "200-500", jobs: 15, logo: "AF" },
];

const Companies = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-20 container mx-auto px-4 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">Top Companies Hiring</h1>
        <p className="text-muted-foreground mt-1">Explore companies and their open positions</p>
      </motion.div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {companies.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="bg-card rounded-xl border border-border p-6 card-elevated">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-display font-bold flex items-center justify-center">
                  {c.logo}
                </div>
                <div>
                  <h3 className="font-display font-semibold">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.industry}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{c.location}</div>
                <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" />{c.employees} employees</div>
                <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5" />{c.jobs} open positions</div>
              </div>
              <Link to="/jobs" className="mt-4 block">
                <button className="text-sm font-medium text-primary hover:underline">View Jobs →</button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default Companies;
