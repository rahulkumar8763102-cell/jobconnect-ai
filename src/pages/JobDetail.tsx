import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Building2, DollarSign, Bookmark, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockJobs } from "@/data/jobs";
import { motion } from "framer-motion";

const JobDetail = () => {
  const { id } = useParams();
  const job = mockJobs.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="font-display text-2xl font-bold">Job not found</h1>
          <Link to="/jobs"><Button className="mt-4">Back to Jobs</Button></Link>
        </div>
      </div>
    );
  }

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
                {job.logo}
              </div>
              <div className="flex-1">
                <h1 className="font-display text-2xl md:text-3xl font-bold">{job.title}</h1>
                <p className="text-lg text-muted-foreground mt-1">{job.company}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{job.posted}</span>
                  <span className="flex items-center gap-1.5 font-semibold text-foreground"><DollarSign className="w-4 h-4" />{job.salary}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge>{job.type}</Badge>
                  <Badge variant="outline">{job.category}</Badge>
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <Button size="lg" className="glow font-semibold px-8">Apply Now</Button>
              <Button size="lg" variant="outline"><Bookmark className="w-4 h-4 mr-2" />Save</Button>
              <Button size="lg" variant="ghost"><Share2 className="w-4 h-4 mr-2" />Share</Button>
            </div>

            <hr className="my-8 border-border" />

            <div className="prose prose-sm max-w-none">
              <h3 className="font-display font-semibold text-lg mb-4">About this role</h3>
              <p className="text-muted-foreground leading-relaxed">{job.description}</p>

              <h3 className="font-display font-semibold text-lg mt-8 mb-4">Requirements</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 5+ years of professional experience in related field</li>
                <li>• Strong problem-solving and communication skills</li>
                <li>• Experience with modern tools and technologies</li>
                <li>• Ability to work in a fast-paced, collaborative environment</li>
                <li>• Bachelor's degree or equivalent experience</li>
              </ul>

              <h3 className="font-display font-semibold text-lg mt-8 mb-4">Benefits</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Competitive salary and equity packages</li>
                <li>• Health, dental, and vision insurance</li>
                <li>• Flexible working hours and remote options</li>
                <li>• Learning and development budget</li>
                <li>• 401(k) with company match</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default JobDetail;
