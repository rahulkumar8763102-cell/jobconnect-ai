import { Link } from "react-router-dom";
import { MapPin, Clock, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/data/jobs";

const JobCard = ({ job }: { job: Job }) => (
  <Link to={`/jobs/${job.id}`} className="block">
    <div className="bg-card rounded-xl p-5 card-elevated border border-border group cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary font-display font-bold flex items-center justify-center text-sm shrink-0">
          {job.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-card-foreground group-hover:text-primary transition-colors truncate">
                {job.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">{job.company}</p>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); }}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
            >
              <Bookmark className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {job.posted}
            </span>
            <span className="font-semibold text-foreground">{job.salary}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            <Badge variant="secondary" className="text-xs">{job.type}</Badge>
            {job.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  </Link>
);

export default JobCard;
