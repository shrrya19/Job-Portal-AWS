const companyRows = [
  ["TCS", "IT and Software Development", "Mumbai"],
  ["Infosys", "IT and Software Development", "Bengaluru"],
  ["Wipro", "IT and Software Development", "Bengaluru"],
  ["Accenture India", "Consulting", "Mumbai"],
  ["Cognizant", "IT and Software Development", "Chennai"],
  ["Capgemini India", "IT and Software Development", "Mumbai"],
  ["HCLTech", "IT and Software Development", "Noida"],
  ["Tech Mahindra", "Telecommunications", "Pune"],
  ["IBM India", "IT and Software Development", "Bengaluru"],
  ["Microsoft India", "IT and Software Development", "Hyderabad"],
  ["Amazon India", "E-commerce", "Bengaluru"],
  ["Google India", "IT and Software Development", "Bengaluru"],
  ["Deloitte India", "Consulting", "Mumbai"],
  ["EY India", "Consulting", "Noida"],
  ["KPMG India", "Consulting", "Noida"],
  ["PwC India", "Consulting", "Kolkata"],
  ["Flipkart", "E-commerce", "Bengaluru"],
  ["PhonePe", "Banking and Finance", "Bengaluru"],
  ["Razorpay", "Banking and Finance", "Bengaluru"],
  ["Paytm", "Banking and Finance", "Noida"],
  ["Zoho", "IT and Software Development", "Chennai"],
  ["Freshworks", "IT and Software Development", "Chennai"],
  ["Swiggy", "E-commerce", "Bengaluru"],
  ["Zomato", "E-commerce", "Noida"],
  ["Meesho", "E-commerce", "Bengaluru"],
  ["Myntra", "E-commerce", "Bengaluru"],
  ["Reliance Industries", "Manufacturing", "Mumbai"],
  ["ICICI Bank", "Banking and Finance", "Mumbai"],
  ["HDFC Bank", "Banking and Finance", "Mumbai"],
  ["Axis Bank", "Banking and Finance", "Mumbai"],
  ["Kotak Mahindra Bank", "Banking and Finance", "Mumbai"],
  ["Genpact", "Business Services", "Noida"],
  ["LTIMindtree", "IT and Software Development", "Mumbai"],
  ["Mphasis", "IT and Software Development", "Bengaluru"],
  ["Persistent Systems", "IT and Software Development", "Pune"],
  ["Hexaware Technologies", "IT and Software Development", "Navi Mumbai"],
  ["UST", "IT and Software Development", "Thiruvananthapuram"],
  ["SAP Labs India", "IT and Software Development", "Bengaluru"],
  ["Oracle India", "IT and Software Development", "Bengaluru"],
  ["Cisco India", "Telecommunications", "Bengaluru"],
  ["Adobe India", "IT and Software Development", "Noida"],
  ["Qualcomm India", "Telecommunications", "Hyderabad"],
  ["Bosch India", "Manufacturing", "Bengaluru"],
  ["Tata Motors", "Automobile", "Pune"],
  ["Mahindra and Mahindra", "Automobile", "Mumbai"],
  ["TVS Motor Company", "Automobile", "Chennai"],
  ["Airtel", "Telecommunications", "Delhi"],
  ["Jio Platforms", "Telecommunications", "Mumbai"],
  ["Apollo Hospitals", "Healthcare", "Chennai"],
  ["Northstar Learning", "Education", "Pune"],
  ["Blue Banyan Digital", "Digital Marketing", "Jaipur"],
  ["MintTrail Finance", "Banking and Finance", "Ahmedabad"],
  ["CareBridge HealthTech", "Healthcare", "Hyderabad"],
  ["OrbitCart", "Startups", "Thiruvananthapuram"],
  ["BrightRoute Mobility", "Automobile", "Coimbatore"],
  ["CloudKite Labs", "Startups", "Indore"],
  ["PeopleSpring Services", "Business Services", "Kolkata"],
  ["SkillHarbor Academy", "Education", "Chandigarh"],
  ["SignalNest Networks", "Telecommunications", "Noida"],
  ["GrowthMint Studio", "Digital Marketing", "Surat"],
];

const templates = {
  "IT and Software Development": [
    ["Software Developer", ["JavaScript", "REST APIs", "Git"], 1, 15, "Full-Time", "Hybrid", "B.E./B.Tech or equivalent"],
    ["Java Developer", ["Java", "Spring Boot", "SQL"], 2, 20, "Full-Time", "On-site", "B.E./B.Tech or MCA"],
    ["Frontend Developer", ["React", "HTML", "CSS"], 0, 16, "Full-Time", "Remote", "B.E./B.Tech or equivalent"],
    ["Cloud Engineer", ["AWS", "Linux", "Docker"], 2, 22, "Contract", "Hybrid", "B.E./B.Tech or equivalent"],
    ["Python Developer", ["Python", "Django", "PostgreSQL"], 1, 18, "Full-Time", "Hybrid", "B.E./B.Tech or equivalent"],
    ["Backend Developer", ["Node.js", "REST APIs", "MongoDB"], 1, 19, "Full-Time", "Remote", "B.E./B.Tech or equivalent"],
    ["Data Scientist", ["Python", "Machine learning", "Statistics"], 2, 22, "Full-Time", "Hybrid", "Master's in Data Science or related field"],
    ["Full Stack Developer", ["React", "Node.js", "SQL"], 1, 20, "Full-Time", "On-site", "B.E./B.Tech or equivalent"],
  ],
  "Banking and Finance": [
    ["Financial Analyst", ["Financial modelling", "Excel", "Accounting"], 1, 14, "Full-Time", "Hybrid", "B.Com, BBA or MBA Finance"],
    ["Business Analyst", ["SQL", "Excel", "Requirements analysis"], 1, 16, "Full-Time", "On-site", "Bachelor's degree in Business or Technology"],
    ["Data Analyst", ["SQL", "Python", "Power BI"], 0, 15, "Full-Time", "Hybrid", "Bachelor's degree in Statistics or Technology"],
    ["Graduate Trainee", ["Communication", "Excel", "Problem solving"], 0, 8, "Internship", "On-site", "Bachelor's degree in Finance or Business"],
    ["Accountant", ["Accounting", "GST", "Excel"], 1, 11, "Full-Time", "On-site", "B.Com or equivalent"],
  ],
  "E-commerce": [
    ["Backend Developer", ["Node.js", "MongoDB", "REST APIs"], 1, 18, "Full-Time", "Hybrid", "B.E./B.Tech or equivalent"],
    ["Data Analyst", ["SQL", "Python", "Looker"], 0, 15, "Full-Time", "Remote", "Bachelor's degree in Statistics or Technology"],
    ["Digital Marketing Executive", ["SEO", "Google Analytics", "Campaigns"], 0, 10, "Full-Time", "Hybrid", "Bachelor's degree in Marketing or Business"],
    ["Customer Support Executive", ["Communication", "CRM", "Customer service"], 0, 8, "Full-Time", "On-site", "Bachelor's degree or equivalent"],
    ["Sales Executive", ["Sales", "Negotiation", "CRM"], 0, 11, "Full-Time", "Hybrid", "Bachelor's degree in Business or equivalent"],
    ["Python Developer", ["Python", "Data pipelines", "SQL"], 1, 17, "Full-Time", "Remote", "B.E./B.Tech or equivalent"],
  ],
  "Healthcare": [
    ["Healthcare Data Analyst", ["SQL", "Power BI", "Healthcare data"], 1, 14, "Full-Time", "Hybrid", "Bachelor's degree in Health, Statistics or Technology"],
    ["Operations Executive", ["Operations", "Excel", "Coordination"], 0, 9, "Full-Time", "On-site", "Bachelor's degree in Business or Healthcare"],
    ["Python Developer", ["Python", "Django", "SQL"], 1, 16, "Full-Time", "Remote", "B.E./B.Tech or equivalent"],
    ["Graduate Trainee", ["Communication", "Research", "Documentation"], 0, 7, "Internship", "On-site", "Bachelor's degree in a relevant discipline"],
  ],
  "Education": [
    ["Web Developer", ["HTML", "React", "Accessibility"], 0, 14, "Full-Time", "Hybrid", "B.E./B.Tech or equivalent"],
    ["Learning Program Associate", ["Program coordination", "Communication", "Research"], 0, 9, "Full-Time", "On-site", "Bachelor's degree in Education or Business"],
    ["Digital Marketing Executive", ["SEO", "Content", "Analytics"], 0, 10, "Full-Time", "Remote", "Bachelor's degree in Marketing or Communications"],
    ["Graduate Trainee", ["Research", "Writing", "Presentation"], 0, 6, "Internship", "Hybrid", "Bachelor's degree in a relevant discipline"],
  ],
  "Digital Marketing": [
    ["Digital Marketing Executive", ["SEO", "Google Ads", "Analytics"], 0, 11, "Full-Time", "Hybrid", "Bachelor's degree in Marketing or Communications"],
    ["Content Marketing Executive", ["Copywriting", "SEO", "Social media"], 0, 9, "Full-Time", "Remote", "Bachelor's degree in Communications or English"],
    ["Business Analyst", ["Excel", "Research", "Data analysis"], 1, 14, "Full-Time", "On-site", "Bachelor's degree in Business or Technology"],
    ["Marketing Intern", ["Social media", "Writing", "Research"], 0, 4, "Internship", "Remote", "Bachelor's degree in progress"],
  ],
  "Telecommunications": [
    ["Network Engineer", ["Networking", "TCP/IP", "Linux"], 1, 18, "Full-Time", "On-site", "B.E./B.Tech in Computer Science or Electronics"],
    ["Cloud Engineer", ["AWS", "Kubernetes", "Automation"], 2, 22, "Full-Time", "Hybrid", "B.E./B.Tech or equivalent"],
    ["Customer Support Executive", ["Communication", "Troubleshooting", "CRM"], 0, 9, "Full-Time", "On-site", "Bachelor's degree or equivalent"],
    ["Graduate Trainee", ["Networking fundamentals", "Teamwork", "Communication"], 0, 7, "Internship", "Hybrid", "B.E./B.Tech in progress"],
    ["Cybersecurity Analyst", ["Security monitoring", "SIEM", "Networking"], 1, 17, "Full-Time", "Hybrid", "B.E./B.Tech or equivalent security experience"],
  ],
  "Consulting": [
    ["Business Analyst", ["Business analysis", "Excel", "Stakeholder management"], 1, 17, "Full-Time", "Hybrid", "Bachelor's degree; MBA preferred"],
    ["Data Analyst", ["SQL", "Python", "Data visualization"], 1, 17, "Full-Time", "Remote", "Bachelor's degree in Statistics or Technology"],
    ["Full Stack Developer", ["React", "Node.js", "SQL"], 1, 19, "Full-Time", "Hybrid", "B.E./B.Tech or equivalent"],
    ["Graduate Trainee", ["Research", "Presentation", "Problem solving"], 0, 8, "Internship", "On-site", "Bachelor's or MBA in progress"],
  ],
  "Manufacturing": [
    ["Manufacturing Data Analyst", ["Excel", "SQL", "Process analysis"], 1, 13, "Full-Time", "On-site", "Bachelor's degree in Engineering or Statistics"],
    ["Software Developer", ["Java", "APIs", "SQL"], 1, 16, "Full-Time", "Hybrid", "B.E./B.Tech or equivalent"],
    ["Financial Analyst", ["Accounting", "Excel", "Financial reporting"], 1, 12, "Full-Time", "On-site", "B.Com, BBA or MBA Finance"],
    ["Graduate Trainee", ["Communication", "Documentation", "Problem solving"], 0, 7, "Internship", "On-site", "B.E./B.Tech in progress"],
  ],
  "Automobile": [
    ["Embedded Software Engineer", ["C++", "Embedded systems", "Testing"], 1, 18, "Full-Time", "Hybrid", "B.E./B.Tech in Electronics or Computer Science"],
    ["Mechanical Design Engineer", ["CAD", "Design", "Engineering analysis"], 1, 15, "Full-Time", "On-site", "B.E./B.Tech in Mechanical Engineering"],
    ["Data Analyst", ["Python", "SQL", "Power BI"], 0, 14, "Full-Time", "Hybrid", "Bachelor's degree in Statistics or Engineering"],
    ["Graduate Trainee", ["Engineering fundamentals", "Teamwork", "Communication"], 0, 8, "Internship", "On-site", "B.E./B.Tech in progress"],
  ],
  "Startups": [
    ["Full Stack Developer", ["React", "Node.js", "MongoDB"], 1, 20, "Full-Time", "Remote", "B.E./B.Tech or equivalent"],
    ["Product Analyst", ["SQL", "Product analytics", "Experimentation"], 1, 17, "Full-Time", "Hybrid", "Bachelor's degree in Business or Technology"],
    ["Business Development Executive", ["Sales", "Communication", "CRM"], 0, 12, "Full-Time", "On-site", "Bachelor's degree in Business or equivalent"],
    ["UI/UX Designer", ["Figma", "Prototyping", "User research"], 1, 16, "Contract", "Remote", "Design degree or equivalent portfolio"],
  ],
  "Business Services": [
    ["Customer Support Executive", ["Communication", "CRM", "Problem solving"], 0, 9, "Full-Time", "On-site", "Bachelor's degree or equivalent"],
    ["Accountant", ["Accounting", "GST", "Excel"], 1, 12, "Full-Time", "Hybrid", "B.Com or equivalent"],
    ["HR Executive", ["Recruitment", "HR operations", "Communication"], 0, 11, "Full-Time", "On-site", "Bachelor's degree in HR or Business"],
    ["Business Development Executive", ["Sales", "Negotiation", "CRM"], 0, 12, "Full-Time", "Hybrid", "Bachelor's degree in Business or equivalent"],
    ["Sales Executive", ["Sales", "Communication", "Lead generation"], 0, 10, "Full-Time", "On-site", "Bachelor's degree in Business or equivalent"],
  ],
};

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const makeLogo = (name, index) => {
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const hue = (index * 47 + 265) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="20" fill="hsl(${hue} 62% 92%)"/><text x="48" y="58" text-anchor="middle" font-family="Arial,sans-serif" font-size="32" font-weight="700" fill="hsl(${hue} 58% 34%)">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
};

const salaryFor = (template, index) => {
  const midPoint = template[2] + (template[3] - template[2]) * (0.32 + (index % 3) * 0.06);
  const salaryMin = Number(Math.max(2, midPoint * 0.85).toFixed(1));
  const salaryMax = Number((midPoint * 1.15).toFixed(1));
  return { salary: Number(((salaryMin + salaryMax) / 2).toFixed(1)), salaryMin, salaryMax };
};

export const buildDemoDataset = () => {
  const companies = companyRows.map(([name, industry, location], index) => {
    const slug = slugify(name);
    return {
      name,
      industry,
      location,
      country: "India",
      status: "Active",
      website: `https://${slug}.example`,
      description: `${name} brings together teams across India's ${industry.toLowerCase()} sector to deliver products and services to customers. This CareerNest demo profile includes sample hiring opportunities.`,
      contactEmail: `careers+${slug}@careernest.demo`,
      contactPhone: `+91 ${String(9000000000 + index).replace(/(\d{5})(\d{5})/, "$1 $2")}`,
      logo: makeLogo(name, index),
      slug,
      index,
    };
  });

  const jobs = companies.flatMap((company) => {
    const industryTemplates = templates[company.industry] || templates["IT and Software Development"];
    const roles = industryTemplates.length > JOBS_PER_DEMO_COMPANY
      ? Array.from({ length: JOBS_PER_DEMO_COMPANY }, (_, roleIndex) =>
          industryTemplates[(company.index + roleIndex) % industryTemplates.length]
        )
      : industryTemplates;
    return roles.map((template, roleIndex) => {
      const [title, requirements, experienceLevel, salaryCeiling, jobType, workMode, qualification] = template;
      const { salary, salaryMin, salaryMax } = salaryFor([0, 0, 2, salaryCeiling], company.index + roleIndex);
      const postedAt = new Date(Date.now() - ((company.index * 4 + roleIndex) % 28) * 86_400_000);
      const applicationDeadline = new Date(Date.now() + 45 * 86_400_000);
      const jobId = `CN-${company.slug.slice(0, 28)}-${roleIndex + 1}`.slice(0, 50);
      return {
        jobId,
        title,
        description: `Join ${company.name} as a ${title} in ${company.location}. Contribute to meaningful ${company.industry.toLowerCase()} initiatives with a collaborative team.`,
        responsibilities: [
          `Deliver day-to-day ${title.toLowerCase()} responsibilities and project milestones.`,
          "Collaborate with cross-functional teams and communicate progress clearly.",
          "Follow quality, privacy, and documentation standards."
        ],
        requirements,
        qualification,
        experienceLevel,
        salary,
        salaryMin,
        salaryMax,
        salaryUnit: "LPA",
        location: company.location,
        locations: [company.location],
        country: "India",
        jobType,
        workMode,
        position: 1 + ((company.index + roleIndex) % 5),
        status: roleIndex === 3 ? "Inactive" : "Active",
        applicationDeadline,
        createdAt: postedAt,
        companySlug: company.slug,
      };
    });
  });

  return { companies, jobs };
};

export const DEMO_COMPANY_COUNT = companyRows.length;
export const JOBS_PER_DEMO_COMPANY = 4;
