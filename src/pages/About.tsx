import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Sparkles, Shield, Zap, Globe } from "lucide-react";

const features = [
  { icon: Sparkles, title: "AI-Powered Matching", desc: "Our AI analyzes your skills, experience, and preferences to find the perfect job matches." },
  { icon: Shield, title: "Verified Companies", desc: "Every employer is verified to ensure safe and legitimate job postings." },
  { icon: Zap, title: "Instant Apply", desc: "Apply to jobs with one click using your saved profile and AI-generated cover letters." },
  { icon: Globe, title: "Global Reach", desc: "Access opportunities from companies worldwide, including remote positions." },
];

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-20 container mx-auto px-4 lg:px-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-4xl font-bold">About <span className="text-gradient">HireAI</span></h1>
        <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
          We're on a mission to revolutionize how people find jobs using artificial intelligence. Our platform connects talented professionals with their ideal careers faster than ever.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mt-16">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl border border-border p-6 card-elevated"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <f.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-lg">{f.title}</h3>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default About;
