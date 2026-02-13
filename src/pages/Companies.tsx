// Companies.tsx — Companies page with real data from database
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Building2, MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DbCompany } from "@/lib/types";

const Companies = () => {
  const [companies, setCompanies] = useState<DbCompany[]>([]);

  useEffect(() => {
    supabase.from("companies").select("*").order("name").then(({ data }) => {
      if (data) setCompanies(data as DbCompany[]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 container mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold">Top Companies Hiring</h1>
          <p className="text-muted-foreground mt-1">Explore companies and their open positions</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {companies.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="bg-card rounded-xl border border-border p-6 card-elevated">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-display font-bold flex items-center justify-center">{c.logo}</div>
                  <div>
                    <h3 className="font-display font-semibold">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{c.description?.slice(0, 50)}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{c.location}</div>
                  {c.website && <div className="flex items-center gap-2"><ExternalLink className="w-3.5 h-3.5" /><a href={c.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{c.website}</a></div>}
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
};

export default Companies;
