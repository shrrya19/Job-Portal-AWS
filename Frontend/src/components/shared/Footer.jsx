import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import { FaFacebookF, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Footer = () => {
  const shareUrl = encodeURIComponent(window.location.origin);

  return (
    <footer id="footer" className="scroll-mt-20 bg-[#111C3B] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white"><BriefcaseBusiness size={20} /></span>
              <span className="text-xl font-semibold tracking-tight">Career <span className="text-violet-300">Nest</span></span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              Helping students discover opportunities, prepare for interviews, and take their next career step.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noreferrer" aria-label="Share Career Nest on LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-slate-300 transition hover:border-violet-400 hover:bg-white/10 hover:text-white"><FaLinkedinIn size={15} /></a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" aria-label="Share Career Nest on Facebook" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-slate-300 transition hover:border-violet-400 hover:bg-white/10 hover:text-white"><FaFacebookF size={15} /></a>
              <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent("Explore career opportunities with Career Nest")}`} target="_blank" rel="noreferrer" aria-label="Share Career Nest on X" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-slate-300 transition hover:border-violet-400 hover:bg-white/10 hover:text-white"><FaXTwitter size={15} /></a>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">Quick links</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><Link className="transition hover:text-white" to="/">Home</Link></li>
              <li><Link className="transition hover:text-white" to="/jobs">Find jobs</Link></li>
              <li><Link className="transition hover:text-white" to="/internships">Internships</Link></li>
              <li><Link className="transition hover:text-white" to="/events">Career events</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">Job categories</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><Link className="transition hover:text-white" to="/browse">Software &amp; Web</Link></li>
              <li><Link className="transition hover:text-white" to="/browse">Data &amp; Analytics</Link></li>
              <li><Link className="transition hover:text-white" to="/browse">Design &amp; Product</Link></li>
              <li><Link className="transition hover:text-white" to="/browse">Cloud &amp; Security</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">Student resources</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><Link className="transition hover:text-white" to="/ats-resume">ATS resume tools</Link></li>
              <li><Link className="transition hover:text-white" to="/demo-interview">Interview practice</Link></li>
              <li><Link className="transition hover:text-white" to="/profile">Application tracking</Link></li>
              <li><Link className="transition hover:text-white" to="/events">Career events</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Career Nest. All rights reserved.</span>
          <Link to="/jobs" className="inline-flex items-center gap-1 transition hover:text-white">Explore career opportunities <ArrowUpRight size={13} /></Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
