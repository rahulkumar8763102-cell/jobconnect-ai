export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Remote" | "Internship";
  salary: string;
  posted: string;
  description: string;
  tags: string[];
  logo: string;
  featured?: boolean;
  category: string;
}

export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior React Developer",
    company: "TechNova Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$140K - $180K",
    posted: "2 hours ago",
    description: "We're looking for a Senior React Developer to join our growing team. You'll be building cutting-edge web applications using React, TypeScript, and modern tooling.",
    tags: ["React", "TypeScript", "Node.js"],
    logo: "TN",
    featured: true,
    category: "Engineering",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "DesignFlow",
    location: "Remote",
    type: "Remote",
    salary: "$120K - $150K",
    posted: "5 hours ago",
    description: "Join our design team to create beautiful, user-centered digital products. Experience with Figma and design systems required.",
    tags: ["Figma", "UI/UX", "Design Systems"],
    logo: "DF",
    featured: true,
    category: "Design",
  },
  {
    id: "3",
    title: "Data Scientist",
    company: "DataPulse AI",
    location: "New York, NY",
    type: "Full-time",
    salary: "$150K - $200K",
    posted: "1 day ago",
    description: "Apply machine learning techniques to solve complex business problems. PhD or equivalent experience preferred.",
    tags: ["Python", "ML", "TensorFlow"],
    logo: "DP",
    featured: true,
    category: "Data Science",
  },
  {
    id: "4",
    title: "DevOps Engineer",
    company: "CloudScale",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$130K - $170K",
    posted: "2 days ago",
    description: "Build and maintain cloud infrastructure. Experience with AWS, Docker, and Kubernetes required.",
    tags: ["AWS", "Docker", "Kubernetes"],
    logo: "CS",
    category: "Engineering",
  },
  {
    id: "5",
    title: "Marketing Manager",
    company: "GrowthLab",
    location: "Chicago, IL",
    type: "Full-time",
    salary: "$90K - $120K",
    posted: "3 days ago",
    description: "Lead our marketing initiatives and drive brand growth across digital channels.",
    tags: ["SEO", "Content", "Analytics"],
    logo: "GL",
    category: "Marketing",
  },
  {
    id: "6",
    title: "Mobile Developer (iOS)",
    company: "AppForge",
    location: "Seattle, WA",
    type: "Contract",
    salary: "$70/hr",
    posted: "4 days ago",
    description: "Develop native iOS applications using Swift and SwiftUI for our enterprise clients.",
    tags: ["Swift", "SwiftUI", "iOS"],
    logo: "AF",
    category: "Engineering",
  },
];

export const jobCategories = [
  { name: "Engineering", count: 1240, icon: "💻" },
  { name: "Design", count: 832, icon: "🎨" },
  { name: "Marketing", count: 645, icon: "📈" },
  { name: "Data Science", count: 520, icon: "🧠" },
  { name: "Product", count: 410, icon: "🚀" },
  { name: "Sales", count: 380, icon: "💼" },
];
