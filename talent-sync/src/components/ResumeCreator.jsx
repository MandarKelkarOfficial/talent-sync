import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// 🚀 ATS-friendly steps
const STEPS = [
  "Personal",
  "Education",
  "Experience",
  "Skills",
  "Links",
  "Projects",
  "Achievements",
  "Certifications",
];

// Empty draft structure
const getEmptyDraft = () => ({
  title: "New Resume",
  personal: {
    name: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    summary: "",
  },
  education: [
    { institution: "", degree: "", startYear: "", endYear: "", details: "" },
  ],
  experience: [
    { company: "", position: "", startDate: "", endDate: "", description: "" },
  ],
  skills: [],
  links: { linkedin: "", github: "", website: "" },

  // ATS Extra Sections
  projects: [{ name: "", tech: "", description: "" }],
  achievements: [{ title: "", description: "" }],
  certifications: [{ name: "", issuer: "", year: "" }],
});

const ResumeCreator = ({ onCreateSuccess }) => {
  const { user } = useAuth?.() || {};

  const [draft, setDraft] = useState(getEmptyDraft);
  const [savedData, setSavedData] = useState(getEmptyDraft);
  const [activeStep, setActiveStep] = useState(0);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const previewRef = useRef(null);

  // --------------------------
  // VALIDATION FUNCTION
  // --------------------------
  const validateStep = () => {
    let err = {};

    if (activeStep === 0) {
      if (!draft.personal.name.trim()) err.name = "Name is required.";
      if (!draft.personal.email.trim()) err.email = "Email is required.";
      if (!draft.personal.phone.trim()) err.phone = "Phone number is required.";
    }

    if (activeStep === 1) {
      draft.education.forEach((ed, i) => {
        if (!ed.institution.trim())
          err[`edu_inst_${i}`] = "Institution required.";
        if (!ed.degree.trim())
          err[`edu_deg_${i}`] = "Degree is required.";
      });
    }

    if (activeStep === 2) {
      draft.experience.forEach((ex, i) => {
        if (!ex.company.trim())
          err[`exp_comp_${i}`] = "Company required.";
        if (!ex.position.trim())
          err[`exp_pos_${i}`] = "Position required.";
      });
    }

    if (activeStep === 5) {
      draft.projects.forEach((p, i) => {
        if (!p.name.trim()) err[`proj_name_${i}`] = "Project name required.";
      });
    }

    if (activeStep === 6) {
      draft.achievements.forEach((a, i) => {
        if (!a.title.trim()) err[`ach_title_${i}`] = "Title required.";
      });
    }

    if (activeStep === 7) {
      draft.certifications.forEach((c, i) => {
        if (!c.name.trim())
          err[`cert_name_${i}`] = "Certification name required.";
      });
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // NEXT BUTTON HANDLER
  const handleNext = () => {
    if (!validateStep()) return;
    setActiveStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  // -----------------------------
  // Update draft helper
  // -----------------------------
  const updateDraft = useCallback((path, value) => {
    setDraft((prev) => {
      const clone = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let cur = clone;

      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        const match = p.match(/^(.+)\[(\d+)\]$/);
        if (match) {
          cur = cur[match[1]][Number(match[2])];
        } else {
          cur = cur[p];
        }
      }

      const last = parts[parts.length - 1];
      const match = last.match(/^(.+)\[(\d+)\]$/);
      if (match) {
        cur[match[1]][Number(match[2])] = value;
      } else {
        cur[last] = value;
      }

      return clone;
    });
  }, []);

  const setPersonal = (field, val) => updateDraft(`personal.${field}`, val);
  const setLink = (field, val) => updateDraft(`links.${field}`, val);

  // --------------------------------
  // Education Handlers
  // --------------------------------
  const addEducation = () =>
    setDraft((d) => ({
      ...d,
      education: [
        ...d.education,
        { institution: "", degree: "", startYear: "", endYear: "", details: "" },
      ],
    }));

  const removeEducation = (index) =>
    setDraft((d) => ({
      ...d,
      education: d.education.filter((_, i) => i !== index),
    }));

  const setEducationField = (index, field, val) =>
    setDraft((d) => {
      const ed = d.education.map((e, i) =>
        i === index ? { ...e, [field]: val } : e
      );
      return { ...d, education: ed };
    });

  // --------------------------------
  // Experience Handlers
  // --------------------------------
  const addExperience = () =>
    setDraft((d) => ({
      ...d,
      experience: [
        ...d.experience,
        {
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));

  const removeExperience = (index) =>
    setDraft((d) => ({
      ...d,
      experience: d.experience.filter((_, i) => i !== index),
    }));

  const setExperienceField = (index, field, val) =>
    setDraft((d) => {
      const ex = d.experience.map((e, i) =>
        i === index ? { ...e, [field]: val } : e
      );
      return { ...d, experience: ex };
    });

  // -----------------------------
  // Skills
  // -----------------------------
  const addSkill = (skill) =>
    setDraft((d) => ({ ...d, skills: [...d.skills, skill] }));

  const removeSkill = (i) =>
    setDraft((d) => ({
      ...d,
      skills: d.skills.filter((_, idx) => idx !== i),
    }));

  // ------------------------------------
  // PROJECTS
  // ------------------------------------
  const addProject = () =>
    setDraft((d) => ({
      ...d,
      projects: [...d.projects, { name: "", tech: "", description: "" }],
    }));

  const setProjectField = (i, field, val) =>
    setDraft((d) => {
      const list = d.projects.map((p, idx) =>
        idx === i ? { ...p, [field]: val } : p
      );
      return { ...d, projects: list };
    });

  const removeProject = (i) =>
    setDraft((d) => ({
      ...d,
      projects: d.projects.filter((_, idx) => idx !== i),
    }));

  // ------------------------------------
  // ACHIEVEMENTS
  // ------------------------------------
  const addAchievement = () =>
    setDraft((d) => ({
      ...d,
      achievements: [...d.achievements, { title: "", description: "" }],
    }));

  const setAchievementField = (i, field, val) =>
    setDraft((d) => {
      const list = d.achievements.map((a, idx) =>
        idx === i ? { ...a, [field]: val } : a
      );
      return { ...d, achievements: list };
    });

  const removeAchievement = (i) =>
    setDraft((d) => ({
      ...d,
      achievements: d.achievements.filter((_, idx) => idx !== i),
    }));

  // ------------------------------------
  // CERTIFICATIONS
  // ------------------------------------
  const addCert = () =>
    setDraft((d) => ({
      ...d,
      certifications: [...d.certifications, { name: "", issuer: "", year: "" }],
    }));

  const setCertField = (i, field, val) =>
    setDraft((d) => {
      const list = d.certifications.map((c, idx) =>
        idx === i ? { ...c, [field]: val } : c
      );
      return { ...d, certifications: list };
    });

  const removeCert = (i) =>
    setDraft((d) => ({
      ...d,
      certifications: d.certifications.filter((_, idx) => idx !== i),
    }));

  // -------------------------------
  // Animated Stepper
  // -------------------------------
  const Stepper = (
    <div className="flex gap-6 border-b border-gray-200 pb-1 overflow-x-auto">
      {STEPS.map((label, i) => (
        <button
          key={label}
          onClick={() => setActiveStep(i)}
          className={`relative pb-2 text-sm font-medium transition-all duration-300
            ${
              activeStep === i
                ? "text-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
        >
          {label}
          <span
            className={`absolute left-0 bottom-0 h-[3px] rounded-full transition-all duration-300
              ${
                activeStep === i
                  ? "bg-indigo-600 w-full"
                  : "bg-transparent w-0"
              }`}
          />
        </button>
      ))}
    </div>
  );

  // -------------------------------  
  // FORMS START  
  // -------------------------------


  // ---------- PERSONAL FORM ----------
  const PersonalForm = (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-600">Resume title</label>
        <input
          className="w-full border px-3 py-2 rounded-md"
          value={draft.title}
          onChange={(e) =>
            setDraft((d) => ({ ...d, title: e.target.value }))
          }
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-600">Full name</label>
          <input
            className="w-full border px-3 py-2 rounded-md"
            value={draft.personal.name}
            onChange={(e) => setPersonal("name", e.target.value)}
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-600">Email</label>
          <input
            className="w-full border px-3 py-2 rounded-md"
            value={draft.personal.email}
            onChange={(e) => setPersonal("email", e.target.value)}
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-600">Phone</label>
          <input
            className="w-full border px-3 py-2 rounded-md"
            value={draft.personal.phone}
            onChange={(e) => setPersonal("phone", e.target.value)}
          />
          {errors.phone && (
            <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-600">Location</label>
        <input
          className="w-full border px-3 py-2 rounded-md"
          value={draft.personal.location}
          onChange={(e) => setPersonal("location", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-600">Headline</label>
        <input
          className="w-full border px-3 py-2 rounded-md"
          value={draft.personal.headline}
          onChange={(e) => setPersonal("headline", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-600">Summary</label>
        <textarea
          rows={4}
          className="w-full border px-3 py-2 rounded-md"
          value={draft.personal.summary}
          onChange={(e) => setPersonal("summary", e.target.value)}
        />
      </div>
    </div>
  );

  // ---------- EDUCATION ----------
  const EducationForm = (
    <div className="space-y-3">
      {draft.education.map((edu, idx) => (
        <div key={idx} className="border rounded-md p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Education #{idx + 1}</div>
            {draft.education.length > 1 && (
              <button
                type="button"
                onClick={() => removeEducation(idx)}
                className="text-xs text-red-600"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              placeholder="Institution"
              className="border px-2 py-1 rounded"
              value={edu.institution}
              onChange={(e) =>
                setEducationField(idx, "institution", e.target.value)
              }
            />
            {errors[`edu_inst_${idx}`] && (
              <p className="text-xs text-red-600 col-span-2">
                {errors[`edu_inst_${idx}`]}
              </p>
            )}

            <input
              placeholder="Degree"
              className="border px-2 py-1 rounded"
              value={edu.degree}
              onChange={(e) =>
                setEducationField(idx, "degree", e.target.value)
              }
            />
            {errors[`edu_deg_${idx}`] && (
              <p className="text-xs text-red-600 col-span-2">
                {errors[`edu_deg_${idx}`]}
              </p>
            )}

            <input
              placeholder="Start year"
              className="border px-2 py-1 rounded"
              value={edu.startYear}
              onChange={(e) =>
                setEducationField(idx, "startYear", e.target.value)
              }
            />

            <input
              placeholder="End year"
              className="border px-2 py-1 rounded"
              value={edu.endYear}
              onChange={(e) =>
                setEducationField(idx, "endYear", e.target.value)
              }
            />

            <textarea
              placeholder="Details"
              className="border px-2 py-1 rounded col-span-2"
              value={edu.details}
              onChange={(e) =>
                setEducationField(idx, "details", e.target.value)
              }
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addEducation}
        className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm"
      >
        + Add Education
      </button>
    </div>
  );

  // ---------- EXPERIENCE ----------
  const ExperienceForm = (
    <div className="space-y-3">
      {draft.experience.map((exp, idx) => (
        <div key={idx} className="border rounded-md p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Experience #{idx + 1}</div>
            {draft.experience.length > 1 && (
              <button
                type="button"
                onClick={() => removeExperience(idx)}
                className="text-xs text-red-600"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              placeholder="Company"
              className="border px-2 py-1 rounded"
              value={exp.company}
              onChange={(e) =>
                setExperienceField(idx, "company", e.target.value)
              }
            />

            <input
              placeholder="Position"
              className="border px-2 py-1 rounded"
              value={exp.position}
              onChange={(e) =>
                setExperienceField(idx, "position", e.target.value)
              }
            />

            <input
              placeholder="Start date"
              className="border px-2 py-1 rounded"
              value={exp.startDate}
              onChange={(e) =>
                setExperienceField(idx, "startDate", e.target.value)
              }
            />

            <input
              placeholder="End date"
              className="border px-2 py-1 rounded"
              value={exp.endDate}
              onChange={(e) =>
                setExperienceField(idx, "endDate", e.target.value)
              }
            />

            <textarea
              placeholder="Description"
              className="border px-2 py-1 rounded col-span-2"
              value={exp.description}
              onChange={(e) =>
                setExperienceField(idx, "description", e.target.value)
              }
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addExperience}
        className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm"
      >
        + Add Experience
      </button>
    </div>
  );

  // ---------- SKILLS ----------
  function SkillsEditor({ skillsList, onAdd, onRemove }) {
    const [input, setInput] = useState("");

    const handleAdd = () => {
      const v = input.trim();
      if (!v) return;
      onAdd(v);
      setInput("");
    };

    return (
      <div>
        <div className="flex gap-2 mb-3">
          <input
            placeholder="Add skill"
            className="flex-1 border px-3 py-2 rounded-md"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />

          <button
            onClick={handleAdd}
            type="button"
            className="px-3 py-2 bg-indigo-600 text-white rounded-md"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {skillsList.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
            >
              <span>{s}</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-xs text-red-600"
              >
                x
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const SkillsForm = (
    <div className="space-y-3">
      <SkillsEditor
        skillsList={draft.skills}
        onAdd={addSkill}
        onRemove={removeSkill}
      />
    </div>
  );

  // ---------- LINKS ----------
  const LinksForm = (
    <div className="space-y-3">
      <input
        placeholder="LinkedIn"
        className="w-full border px-3 py-2 rounded-md"
        value={draft.links.linkedin}
        onChange={(e) => setLink("linkedin", e.target.value)}
      />

      <input
        placeholder="GitHub"
        className="w-full border px-3 py-2 rounded-md"
        value={draft.links.github}
        onChange={(e) => setLink("github", e.target.value)}
      />

      <input
        placeholder="Portfolio / Website"
        className="w-full border px-3 py-2 rounded-md"
        value={draft.links.website}
        onChange={(e) => setLink("website", e.target.value)}
      />
    </div>
  );

  // ---------- PROJECTS ----------
  const ProjectsForm = (
    <div className="space-y-3">
      {draft.projects.map((p, idx) => (
        <div key={idx} className="border p-3 rounded-md">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Project #{idx + 1}</span>
            {draft.projects.length > 1 && (
              <button
                className="text-xs text-red-600"
                onClick={() => removeProject(idx)}
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <input
              placeholder="Project name"
              className="border px-2 py-1 rounded"
              value={p.name}
              onChange={(e) =>
                setProjectField(idx, "name", e.target.value)
              }
            />

            <input
              placeholder="Technologies, comma separated"
              className="border px-2 py-1 rounded"
              value={p.tech}
              onChange={(e) =>
                setProjectField(idx, "tech", e.target.value)
              }
            />

            <textarea
              placeholder="Short description"
              className="border px-2 py-1 rounded col-span-2"
              value={p.description}
              onChange={(e) =>
                setProjectField(idx, "description", e.target.value)
              }
            />
          </div>
        </div>
      ))}

      <button
        className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm"
        onClick={addProject}
      >
        + Add Project
      </button>
    </div>
  );

  // ---------- ACHIEVEMENTS ----------
  const AchievementsForm = (
    <div className="space-y-3">
      {draft.achievements.map((a, idx) => (
        <div key={idx} className="border p-3 rounded-md">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Achievement #{idx + 1}</span>
            {draft.achievements.length > 1 && (
              <button
                className="text-xs text-red-600"
                onClick={() => removeAchievement(idx)}
              >
                Remove
              </button>
            )}
          </div>

          <input
            placeholder="Title"
            className="border px-2 py-1 rounded mt-2"
            value={a.title}
            onChange={(e) =>
              setAchievementField(idx, "title", e.target.value)
            }
          />

          <textarea
            placeholder="Description"
            className="border px-2 py-1 rounded w-full mt-2"
            value={a.description}
            onChange={(e) =>
              setAchievementField(idx, "description", e.target.value)
            }
          />
        </div>
      ))}

      <button
        className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm"
        onClick={addAchievement}
      >
        + Add Achievement
      </button>
    </div>
  );

  // ---------- CERTIFICATIONS ----------
  const CertificationsForm = (
    <div className="space-y-3">
      {draft.certifications.map((c, idx) => (
        <div key={idx} className="border p-3 rounded-md">
          <div className="flex justify-between">
            <span className="text-sm font-medium">
              Certification #{idx + 1}
            </span>
            {draft.certifications.length > 1 && (
              <button
                className="text-xs text-red-600"
                onClick={() => removeCert(idx)}
              >
                Remove
              </button>
            )}
          </div>

          <input
            placeholder="Certification name"
            className="border px-2 py-1 rounded mt-2"
            value={c.name}
            onChange={(e) => setCertField(idx, "name", e.target.value)}
          />

          <input
            placeholder="Issuer"
            className="border px-2 py-1 rounded mt-2"
            value={c.issuer}
            onChange={(e) => setCertField(idx, "issuer", e.target.value)}
          />

          <input
            placeholder="Year"
            className="border px-2 py-1 rounded mt-2"
            value={c.year}
            onChange={(e) => setCertField(idx, "year", e.target.value)}
          />
        </div>
      ))}

      <button
        className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm"
        onClick={addCert}
      >
        + Add Certification
      </button>
    </div>
  );

  // ---------- RENDER ACTIVE FORM ----------
  const renderActiveForm = () => {
    switch (activeStep) {
      case 0:
        return PersonalForm;
      case 1:
        return EducationForm;
      case 2:
        return ExperienceForm;
      case 3:
        return SkillsForm;
      case 4:
        return LinksForm;
      case 5:
        return ProjectsForm;
      case 6:
        return AchievementsForm;
      case 7:
        return CertificationsForm;
      default:
        return null;
    }
  };

  // ---------- SAVE STEP ----------
  const handleSaveStep = () => {
    setSavedData(JSON.parse(JSON.stringify(draft)));
    setMessage("Saved.");
    setTimeout(() => setMessage(""), 1500);
  };

  // ---------- CREATE RESUME ----------
  const handleCreateResume = async () => {
    if (!validateStep()) return;

    setLoadingCreate(true);

    const payload = {
      title: draft.title || draft.personal.name || "New Resume",
      studentId: user?._id || null,
      structuredData: draft,
    };

    try {
      await axios
        .post("/api/resumes/create", payload)
        .catch(() => ({ data: { resume: payload } }));

      if (onCreateSuccess) onCreateSuccess(payload);

      setMessage("Resume created!");
    } catch (err) {
      console.error(err);
      setMessage("Error creating resume.");
    }

    setTimeout(() => setMessage(""), 2000);
    setLoadingCreate(false);
  };

  // ---------- DOWNLOAD PREVIEW ----------
  const handleDownload = () => {
    const html = previewRef.current?.innerHTML;
    if (!html) {
      setMessage("Save step first.");
      return;
    }

    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(`
      <html>
        <head>
          <title>${savedData.personal.name || "Resume"}</title>
          <style>
            body { font-family: Arial; padding: 22px; }
            h4 { margin: 10px 0 6px; }
          </style>
        </head>
        <body>
          ${html}
          <hr/>
          <div style="text-align:center; font-size:10px; color:#888;">
            Generated by Talentsync
          </div>
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  // ---------- PREVIEW (NO AVATAR) ----------
  const Preview = () => {
    const p = savedData.personal;

    return (
      <div ref={previewRef} className="p-4">

        {/* HEADER */}
        <div>
          <div className="text-xl font-bold">{p.name || "Your Name"}</div>
          <div className="text-sm text-gray-600">{p.headline}</div>
          <div className="text-xs text-gray-500 mt-1">
            {p.location} {p.email && "•"} {p.email}{" "}
            {p.phone && "•"} {p.phone}
          </div>
        </div>

        {/* SUMMARY */}
        {p.summary && (
          <div className="mt-4">
            <h4 className="font-medium">Summary</h4>
            <p className="text-sm">{p.summary}</p>
          </div>
        )}

        {/* EXPERIENCE */}
        {savedData.experience.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium">Experience</h4>
            <div className="text-sm mt-2 space-y-2">
              {savedData.experience.map((ex, i) => (
                <div key={i}>
                  <div className="font-semibold">
                    {ex.position} • <span className="text-gray-600">{ex.company}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {ex.startDate} — {ex.endDate}
                  </div>
                  {ex.description && <p>{ex.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDUCATION */}
        {savedData.education.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium">Education</h4>
            <div className="text-sm mt-2 space-y-2">
              {savedData.education.map((ed, i) => (
                <div key={i}>
                  <div className="font-semibold">
                    {ed.degree} • <span className="text-gray-600">{ed.institution}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {ed.startYear} — {ed.endYear}
                  </div>
                  {ed.details && <p>{ed.details}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS */}
        {savedData.projects.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium">Projects</h4>
            <div className="text-sm mt-2 space-y-2">
              {savedData.projects.map((p, i) => (
                <div key={i}>
                  <div className="font-semibold">{p.name}</div>
                  {p.tech && (
                    <div className="text-xs text-gray-600">Tech: {p.tech}</div>
                  )}
                  {p.description && <p>{p.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS */}
        {savedData.achievements.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium">Achievements</h4>
            <div className="text-sm mt-2 space-y-2">
              {savedData.achievements.map((a, i) => (
                <div key={i}>
                  <div className="font-semibold">{a.title}</div>
                  {a.description && <p>{a.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CERTIFICATIONS */}
        {savedData.certifications.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium">Certifications</h4>
            <div className="text-sm mt-2 space-y-2">
              {savedData.certifications.map((c, i) => (
                <div key={i}>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-gray-600">{c.issuer}</div>
                  <div className="text-xs text-gray-500">{c.year}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SKILLS */}
        {savedData.skills.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium">Skills</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {savedData.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ---------- FINAL RETURN ----------
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {Stepper}

      <div className="bg-white border rounded-md p-4 shadow-sm">
        <div className="mb-4 text-sm text-gray-600">
          Editing: <span className="font-medium">{STEPS[activeStep]}</span>
        </div>

        {renderActiveForm()}

        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
            className="px-3 py-2 bg-white border rounded-md text-sm"
          >
            Back
          </button>

          {activeStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              disabled={loadingCreate}
              onClick={handleCreateResume}
              className="px-3 py-2 bg-green-600 text-white rounded-md text-sm"
            >
              {loadingCreate ? "Creating..." : "Create Resume"}
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveStep}
            className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md border text-sm"
          >
            Save Step
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="ml-auto px-3 py-2 bg-gray-800 text-white rounded-md text-sm"
          >
            Download PDF
          </button>
        </div>

        {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
      </div>

      <div className="bg-white border rounded-md p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">Live Preview</span>
          <span className="text-xs text-gray-500">
            Save step to update preview
          </span>
        </div>

        <Preview />
      </div>
    </div>
  );
};

export default ResumeCreator;
