import { ArrowUpRight, BriefcaseBusiness, Mail, MapPin, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Footer = () => {
  const shareUrl = encodeURIComponent(window.location.origin);

  return (
    <footer id="footer" className="scroll-mt-20 bg-[#111C3B] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.1fr_1fr_1.2fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
                <BriefcaseBusiness size={20} />
              </span>
              <span className="text-xl font-bold tracking-tight">
                Career<span className="text-violet-400">Nest</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              India's premier student job portal connecting ambitious talent with leading companies. Explore verified jobs, internships, ATS resume tools, and AI-powered interview practice.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Share CareerNest on LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-slate-300 transition hover:border-violet-400 hover:bg-violet-600 hover:text-white"
              >
                <FaLinkedinIn size={14} />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Share CareerNest on Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-slate-300 transition hover:border-violet-400 hover:bg-violet-600 hover:text-white"
              >
                <FaFacebookF size={14} />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent("Explore career opportunities with CareerNest")}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Share CareerNest on X"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-slate-300 transition hover:border-violet-400 hover:bg-violet-600 hover:text-white"
              >
                <FaXTwitter size={14} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="CareerNest on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-slate-300 transition hover:border-violet-400 hover:bg-violet-600 hover:text-white"
              >
                <FaInstagram size={14} />
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Quick Links</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li><Link className="transition hover:text-white hover:underline" to="/">Home</Link></li>
              <li><Link className="transition hover:text-white hover:underline" to="/jobs">Find Jobs</Link></li>
              <li><a className="transition hover:text-white hover:underline" href="#top-hiring-companies">Companies</a></li>
              <li><Link className="transition hover:text-white hover:underline" to="/internships">Internships</Link></li>
              <li><a className="transition hover:text-white hover:underline" href="#why-careernest">About Us</a></li>
              <li><a className="transition hover:text-white hover:underline" href="#footer">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Job Categories</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li><Link className="transition hover:text-white hover:underline" to="/browse?category=software">Software Development</Link></li>
              <li><Link className="transition hover:text-white hover:underline" to="/browse?category=web">Web Development</Link></li>
              <li><Link className="transition hover:text-white hover:underline" to="/browse?category=data">Data Science &amp; AI</Link></li>
              <li><Link className="transition hover:text-white hover:underline" to="/browse?category=cloud">Cloud &amp; DevOps</Link></li>
              <li><Link className="transition hover:text-white hover:underline" to="/browse?category=design">UI/UX Design</Link></li>
              <li><Link className="transition hover:text-white hover:underline" to="/browse?category=cybersecurity">Cybersecurity</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Student Resources</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li><Link className="transition hover:text-white hover:underline" to="/ats-resume">ATS Resume Builder</Link></li>
              <li><Link className="transition hover:text-white hover:underline" to="/demo-interview">AI Mock Interviews</Link></li>
              <li><Link className="transition hover:text-white hover:underline" to="/student/dashboard">Application Tracking</Link></li>
              <li><Link className="transition hover:text-white hover:underline" to="/internships">Fresher Internships</Link></li>
              <li><Link className="transition hover:text-white hover:underline" to="/events">Campus Career Events</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Contact Us</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-1 shrink-0 text-violet-400" />
                <span>Tech Park, Koramangala, Bengaluru, Karnataka 560034</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="shrink-0 text-violet-400" />
                <a href="mailto:support@careernest.com" className="transition hover:text-white">support@careernest.com</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="shrink-0 text-violet-400" />
                <span>+91 (80) 4567-8900</span>
              </li>
            </ul>
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
              <p className="font-semibold text-white">Student Support Hours</p>
              <p className="mt-1 text-slate-400">Mon - Sat: 9:00 AM - 7:00 PM IST</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} CareerNest. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="transition hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="transition hover:text-white">Terms of Service</Link>
            <Link to="/jobs" className="inline-flex items-center gap-1 text-violet-300 transition hover:text-white">
              Explore All Jobs <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
