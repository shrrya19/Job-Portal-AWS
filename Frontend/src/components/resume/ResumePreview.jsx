import React, { forwardRef } from "react";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";

const ResumePreview = forwardRef(({ resumeData }, ref) => {
  if (!resumeData) {
    return (
      <div className="p-8 text-center text-gray-400 bg-white border border-gray-200 rounded-xl">
        No resume data available to preview.
      </div>
    );
  }

  const {
    personalInfo = {},
    summary = "",
    education = [],
    skills = { technical: [], soft: [], tools: [] },
    experience = [],
    projects = [],
    certifications = [],
    achievements = [],
    languages = [],
    extracurriculars = []
  } = resumeData;

  const technicalSkills = Array.isArray(skills.technical) ? skills.technical : [];
  const softSkills = Array.isArray(skills.soft) ? skills.soft : [];
  const tools = Array.isArray(skills.tools) ? skills.tools : [];

  return (
    <div
      ref={ref}
      id="resume-preview-document"
      className="bg-white text-gray-900 font-sans p-8 md:p-12 max-w-[800px] mx-auto shadow-md border border-gray-200 rounded-lg print:shadow-none print:border-none print:p-0 print:m-0"
      style={{ minHeight: "1050px", fontFamily: "'Inter', 'Arial', sans-serif" }}
    >
      {/* HEADER / CONTACT INFO (ATS Standard: Centered or Left, clean contact line) */}
      <header className="border-b border-gray-300 pb-4 mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 uppercase">
          {personalInfo.fullName || "Your Full Name"}
        </h1>

        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-2 text-xs md:text-sm text-gray-700">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail size={12} className="print:hidden text-gray-500" />
              <span>{personalInfo.email}</span>
            </span>
          )}
          {personalInfo.phoneNumber && (
            <span className="flex items-center gap-1">
              <span className="text-gray-300 print:text-gray-600">•</span>
              <Phone size={12} className="print:hidden text-gray-500" />
              <span>{personalInfo.phoneNumber}</span>
            </span>
          )}
          {personalInfo.address && (
            <span className="flex items-center gap-1">
              <span className="text-gray-300 print:text-gray-600">•</span>
              <MapPin size={12} className="print:hidden text-gray-500" />
              <span>{personalInfo.address}</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-600">
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              <FaLinkedin size={11} className="print:hidden text-blue-700" />
              <a
                href={personalInfo.linkedin.startsWith("http") ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-blue-700"
              >
                {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </span>
          )}
          {personalInfo.github && (
            <span className="flex items-center gap-1">
              <span className="text-gray-300 print:text-gray-600">•</span>
              <FaGithub size={11} className="print:hidden" />
              <a
                href={personalInfo.github.startsWith("http") ? personalInfo.github : `https://${personalInfo.github}`}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-black"
              >
                {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </span>
          )}
          {personalInfo.portfolio && (
            <span className="flex items-center gap-1">
              <span className="text-gray-300 print:text-gray-600">•</span>
              <Globe size={11} className="print:hidden" />
              <a
                href={personalInfo.portfolio.startsWith("http") ? personalInfo.portfolio : `https://${personalInfo.portfolio}`}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-black"
              >
                {personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </span>
          )}
        </div>
      </header>

      {/* PROFESSIONAL SUMMARY */}
      {summary && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-xs md:text-sm text-gray-700 leading-relaxed text-justify">
            {summary}
          </p>
        </section>
      )}

      {/* TECHNICAL & SOFT SKILLS */}
      {(technicalSkills.length > 0 || softSkills.length > 0 || tools.length > 0) && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-2">
            Technical Skills
          </h2>
          <div className="text-xs md:text-sm space-y-1">
            {technicalSkills.length > 0 && (
              <p>
                <strong className="font-semibold text-gray-900">Languages & Frameworks: </strong>
                <span className="text-gray-700">{technicalSkills.join(", ")}</span>
              </p>
            )}
            {tools.length > 0 && (
              <p>
                <strong className="font-semibold text-gray-900">Developer Tools & Platforms: </strong>
                <span className="text-gray-700">{tools.join(", ")}</span>
              </p>
            )}
            {softSkills.length > 0 && (
              <p>
                <strong className="font-semibold text-gray-900">Core Competencies: </strong>
                <span className="text-gray-700">{softSkills.join(", ")}</span>
              </p>
            )}
          </div>
        </section>
      )}

      {/* WORK EXPERIENCE / INTERNSHIPS */}
      {experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-2">
            Experience & Internships
          </h2>
          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={idx} className="text-xs md:text-sm">
                <div className="flex justify-between items-baseline font-semibold text-gray-900">
                  <span>
                    <strong className="text-gray-900 font-bold">{exp.role || "Role"}</strong>
                    {exp.company && <span className="text-gray-700 font-medium"> — {exp.company}</span>}
                  </span>
                  <span className="text-xs text-gray-600 font-normal">
                    {exp.startDate || ""} {exp.startDate && (exp.endDate || exp.current) ? "–" : ""} {exp.current ? "Present" : exp.endDate || ""}
                  </span>
                </div>

                {exp.location && (
                  <p className="text-xs text-gray-500 italic mb-1">{exp.location}</p>
                )}

                {exp.description && !exp.bullets?.length && (
                  <p className="text-gray-700 mt-1 leading-relaxed">{exp.description}</p>
                )}

                {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-gray-700">
                    {exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PROJECTS */}
      {projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-2">
            Key Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div key={idx} className="text-xs md:text-sm">
                <div className="flex justify-between items-baseline font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <strong className="text-gray-900 font-bold">{proj.title || "Project Title"}</strong>
                    {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                      <span className="text-xs text-gray-500 font-normal italic">
                        | {proj.technologies.join(", ")}
                      </span>
                    )}
                  </div>
                  {proj.link && (
                    <a
                      href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 underline font-normal"
                    >
                      Project Link
                    </a>
                  )}
                </div>

                {proj.description && !proj.bullets?.length && (
                  <p className="text-gray-700 mt-1 leading-relaxed">{proj.description}</p>
                )}

                {Array.isArray(proj.bullets) && proj.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-gray-700">
                    {proj.bullets.filter(Boolean).map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EDUCATION */}
      {education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-2">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className="text-xs md:text-sm">
                <div className="flex justify-between items-baseline">
                  <strong className="text-gray-900 font-bold">
                    {edu.institution || "College / University Name"}
                  </strong>
                  <span className="text-xs text-gray-600">
                    {edu.startDate || ""} {edu.startDate && (edu.endDate || edu.current) ? "–" : ""} {edu.current ? "Present" : edu.endDate || ""}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-gray-700">
                  <span>
                    {edu.degree || "Degree"} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                  </span>
                  {edu.grade && (
                    <span className="text-xs font-medium text-gray-600">
                      GPA / Grade: {edu.grade}
                    </span>
                  )}
                </div>
                {edu.description && (
                  <p className="text-xs text-gray-600 mt-1">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CERTIFICATIONS & ACHIEVEMENTS */}
      {(certifications.length > 0 || achievements.length > 0) && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-2">
            Certifications & Achievements
          </h2>
          <div className="text-xs md:text-sm space-y-1">
            {certifications.map((cert, idx) => (
              <p key={idx} className="text-gray-700">
                <strong className="font-semibold text-gray-900">{cert.name}</strong>
                {cert.issuer && ` — ${cert.issuer}`}
                {cert.issueDate && ` (${cert.issueDate})`}
              </p>
            ))}
            {achievements.filter(Boolean).map((ach, idx) => (
              <p key={idx} className="text-gray-700">
                • {ach}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* LANGUAGES & EXTRACURRICULARS */}
      {(languages.length > 0 || extracurriculars.length > 0) && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-2">
            Languages & Activities
          </h2>
          <div className="text-xs md:text-sm space-y-1 text-gray-700">
            {languages.length > 0 && (
              <p>
                <strong className="font-semibold text-gray-900">Languages: </strong>
                {languages.join(", ")}
              </p>
            )}
            {extracurriculars.length > 0 && (
              <p>
                <strong className="font-semibold text-gray-900">Extracurricular Activities: </strong>
                {extracurriculars.join(", ")}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
});

ResumePreview.displayName = "ResumePreview";

export default ResumePreview;
