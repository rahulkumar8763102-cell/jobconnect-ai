import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-background/70">
    <div className="container mx-auto px-4 lg:px-8 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-background">HireAI</span>
          </div>
          <p className="text-sm leading-relaxed">
            AI-powered job matching that connects talent with opportunity. Find your dream career today.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-background mb-4 text-sm">For Job Seekers</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/jobs" className="hover:text-primary transition-colors">Browse Jobs</Link></li>
            <li><Link to="/companies" className="hover:text-primary transition-colors">Companies</Link></li>
            <li><Link to="/" className="hover:text-primary transition-colors">Career Advice</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-background mb-4 text-sm">For Employers</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-primary transition-colors">Post a Job</Link></li>
            <li><Link to="/" className="hover:text-primary transition-colors">Pricing</Link></li>
            <li><Link to="/" className="hover:text-primary transition-colors">AI Screening</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-background mb-4 text-sm">Company</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/" className="hover:text-primary transition-colors">Contact</Link></li>
            <li><Link to="/" className="hover:text-primary transition-colors">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-background/10 text-center text-sm">
        © 2026 HireAI. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
