import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// Steps
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

const getEmptyDraft = () => ({
  title: "New Resume",
  personal: { name: "", email: "", phone: "", location: "", headline: "", summary: "" },
  education: [{ institution: "", degree: "", startYear: "", endYear: "", details: "" }],
  experience: [{ company: "", position: "", startDate: "", endDate: "", description: "" }],
  skills: [],
  links: { linkedin: "", github: "", website: "" },
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

  // Validation
  const validateStep = () => {
    let err = {};
    if (activeStep === 0) {
      if (!draft.personal.name.trim()) err.name = "Name is required.";
      if (!draft.personal.email.trim()) err.email = "Email is required.";
      if (!draft.personal.phone.trim()) err.phone = "Phone number is required.";
    }
    if (activeStep === 1) {
      draft.education.forEach((ed, i) => {
        if (!ed.institution.trim()) err[`edu_inst_${i}`] = "Institution required.";
        if (!ed.degree.trim()) err[`edu_deg_${i}`] = "Degree is required.";
      });
    }
    if (activeStep === 2) {
      draft.experience.forEach((ex, i) => {
        if (!ex.company.trim()) err[`exp_comp_${i}`] = "Company required.";
        if (!ex.position.trim()) err[`exp_pos_${i}`] = "Position required.";
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
        if (!c.name.trim()) err[`cert_name_${i}`] = "Certification name required.";
      });
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setActiveStep(s => Math.min(STEPS.length - 1, s + 1));
  };

  // Deep update helper
  const updateDraft = useCallback((path, value) => {
    setDraft(prev => {
      const clone = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let cur = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        const match = p.match(/^(.+)\[(\d+)\]$/);
        if (match) cur = cur[match[1]][Number(match[2])];
        else cur = cur[p];
      }
      const last = parts[parts.length - 1];
      const match = last.match(/^(.+)\[(\d+)\]$/);
      if (match) cur[match[1]][Number(match[2])] = value;
      else cur[last] = value;
      return clone;
    });
  }, []);

  const setPersonal = (field, val) => updateDraft(`personal.${field}`, val);
  const setLink = (field, val) => updateDraft(`links.${field}`, val);

  // Education handlers
  const addEducation = () => setDraft(d => ({ ...d, education: [...d.education, { institution: "", degree: "", startYear: "", endYear: "", details: "" }] }));
  const removeEducation = (i) => setDraft(d => ({ ...d, education: d.education.filter((_, idx) => idx !== i) }));
  const setEducationField = (i, field, val) => setDraft(d => ({ ...d, education: d.education.map((e, idx) => idx === i ? { ...e, [field]: val } : e) }));

  // Experience handlers
  const addExperience = () => setDraft(d => ({ ...d, experience: [...d.experience, { company: "", position: "", startDate: "", endDate: "", description: "" }] }));
  const removeExperience = (i) => setDraft(d => ({ ...d, experience: d.experience.filter((_, idx) => idx !== i) }));
  const setExperienceField = (i, field, val) => setDraft(d => ({ ...d, experience: d.experience.map((e, idx) => idx === i ? { ...e, [field]: val } : e) }));

  // Skills
  const addSkill = skill => setDraft(d => ({ ...d, skills: [...d.skills, skill] }));
  const removeSkill = idx => setDraft(d => ({ ...d, skills: d.skills.filter((_, i) => i !== idx) }));

  // Projects
  const addProject = () => setDraft(d => ({ ...d, projects: [...d.projects, { name: "", tech: "", description: "" }] }));
  const setProjectField = (i, field, val) => setDraft(d => ({ ...d, projects: d.projects.map((p, idx) => idx === i ? { ...p, [field]: val } : p) }));
  const removeProject = i => setDraft(d => ({ ...d, projects: d.projects.filter((_, idx) => idx !== i) }));

  // Achievements
  const addAchievement = () => setDraft(d => ({ ...d, achievements: [...d.achievements, { title: "", description: "" }] }));
  const setAchievementField = (i, field, val) => setDraft(d => ({ ...d, achievements: d.achievements.map((a, idx) => idx === i ? { ...a, [field]: val } : a) }));
  const removeAchievement = i => setDraft(d => ({ ...d, achievements: d.achievements.filter((_, idx) => idx !== i) }));

  // Certifications
  const addCert = () => setDraft(d => ({ ...d, certifications: [...d.certifications, { name: "", issuer: "", year: "" }] }));
  const setCertField = (i, field, val) => setDraft(d => ({ ...d, certifications: d.certifications.map((c, idx) => idx === i ? { ...c, [field]: val } : c) }));
  const removeCert = i => setDraft(d => ({ ...d, certifications: d.certifications.filter((_, idx) => idx !== i) }));

  // Small UI primitives
  const FieldLabel = ({ children }) => <label className="block text-xs text-gray-600 mb-1">{children}</label>;
  const Input = ({ value, onChange, placeholder, className = "", ...rest }) => (
    <input
      className={`w-full border border-gray-200 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...rest}
    />
  );
  const Textarea = ({ value, onChange, rows = 3, placeholder, className = "" }) => (
    <textarea rows={rows} className={`w-full border border-gray-200 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 ${className}`} value={value} onChange={onChange} placeholder={placeholder} />
  );

  // Forms (same structure as before but kept compact)
  const PersonalForm = (
    <div className="space-y-4">
      <div>
        <FieldLabel>Resume title</FieldLabel>
        <Input value={draft.title} onChange={(e) => setDraft(d => ({ ...d, title: e.target.value }))} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <FieldLabel>Full name</FieldLabel>
          <Input value={draft.personal.name} onChange={(e) => setPersonal("name", e.target.value)} />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <Input value={draft.personal.email} onChange={(e) => setPersonal("email", e.target.value)} />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>
        <div>
          <FieldLabel>Phone</FieldLabel>
          <Input value={draft.personal.phone} onChange={(e) => setPersonal("phone", e.target.value)} />
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel>Location</FieldLabel>
          <Input value={draft.personal.location} onChange={(e) => setPersonal("location", e.target.value)} />
        </div>
        <div>
          <FieldLabel>Headline</FieldLabel>
          <Input value={draft.personal.headline} onChange={(e) => setPersonal("headline", e.target.value)} />
        </div>
      </div>

      <div>
        <FieldLabel>Summary</FieldLabel>
        <Textarea rows={4} value={draft.personal.summary} onChange={(e) => setPersonal("summary", e.target.value)} />
      </div>
    </div>
  );

  const EducationForm = (
    <div className="space-y-4">
      {draft.education.map((edu, idx) => (
        <div key={idx} className="border border-gray-100 rounded-md p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-medium">Education #{idx + 1}</div>
            </div>
            {draft.education.length > 1 && <button onClick={() => removeEducation(idx)} className="text-xs text-red-600">Remove</button>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Institution</FieldLabel>
              <Input placeholder="Institution" value={edu.institution} onChange={(e) => setEducationField(idx, "institution", e.target.value)} />
              {errors[`edu_inst_${idx}`] && <p className="text-xs text-red-600 mt-1">{errors[`edu_inst_${idx}`]}</p>}
            </div>
            <div>
              <FieldLabel>Degree</FieldLabel>
              <Input placeholder="Degree" value={edu.degree} onChange={(e) => setEducationField(idx, "degree", e.target.value)} />
              {errors[`edu_deg_${idx}`] && <p className="text-xs text-red-600 mt-1">{errors[`edu_deg_${idx}`]}</p>}
            </div>

            <Input placeholder="Start year" value={edu.startYear} onChange={(e) => setEducationField(idx, "startYear", e.target.value)} />
            <Input placeholder="End year" value={edu.endYear} onChange={(e) => setEducationField(idx, "endYear", e.target.value)} />
            <Textarea placeholder="Details" className="sm:col-span-2" value={edu.details} onChange={(e) => setEducationField(idx, "details", e.target.value)} />
          </div>
        </div>
      ))}

      <div>
        <button onClick={addEducation} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Add Education</button>
      </div>
    </div>
  );

  const ExperienceForm = (
    <div className="space-y-4">
      {draft.experience.map((exp, idx) => (
        <div key={idx} className="border border-gray-100 rounded-md p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-medium">Experience #{idx + 1}</div>
            </div>
            {draft.experience.length > 1 && <button onClick={() => removeExperience(idx)} className="text-xs text-red-600">Remove</button>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Company" value={exp.company} onChange={(e) => setExperienceField(idx, "company", e.target.value)} />
            <Input placeholder="Position" value={exp.position} onChange={(e) => setExperienceField(idx, "position", e.target.value)} />
            <Input placeholder="Start date" value={exp.startDate} onChange={(e) => setExperienceField(idx, "startDate", e.target.value)} />
            <Input placeholder="End date" value={exp.endDate} onChange={(e) => setExperienceField(idx, "endDate", e.target.value)} />
            <Textarea placeholder="Description" className="sm:col-span-2" value={exp.description} onChange={(e) => setExperienceField(idx, "description", e.target.value)} />
          </div>
        </div>
      ))}

      <div>
        <button onClick={addExperience} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Add Experience</button>
      </div>
    </div>
  );

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
          <input placeholder="Add skill" className="flex-1 border border-gray-200 px-3 py-2 rounded-md text-sm" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }} />
          <button onClick={handleAdd} className="px-3 py-2 bg-indigo-600 text-white rounded-md">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skillsList.map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100">
              <span className="text-sm">{s}</span>
              <button onClick={() => onRemove(i)} className="text-xs text-red-600">x</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const SkillsForm = (
    <div className="space-y-3">
      <SkillsEditor skillsList={draft.skills} onAdd={addSkill} onRemove={removeSkill} />
    </div>
  );

  const LinksForm = (
    <div className="space-y-3">
      <div>
        <FieldLabel>LinkedIn</FieldLabel>
        <Input placeholder="https://linkedin.com/in/..." value={draft.links.linkedin} onChange={(e) => setLink("linkedin", e.target.value)} />
      </div>
      <div>
        <FieldLabel>GitHub</FieldLabel>
        <Input placeholder="https://github.com/..." value={draft.links.github} onChange={(e) => setLink("github", e.target.value)} />
      </div>
      <div>
        <FieldLabel>Portfolio / Website</FieldLabel>
        <Input placeholder="https://..." value={draft.links.website} onChange={(e) => setLink("website", e.target.value)} />
      </div>
    </div>
  );

  const ProjectsForm = (
    <div className="space-y-4">
      {draft.projects.map((p, idx) => (
        <div key={idx} className="border border-gray-100 rounded-md p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Project #{idx + 1}</div>
            {draft.projects.length > 1 && <button onClick={() => removeProject(idx)} className="text-xs text-red-600">Remove</button>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Project name" value={p.name} onChange={(e) => setProjectField(idx, "name", e.target.value)} />
            <Input placeholder="Technologies" value={p.tech} onChange={(e) => setProjectField(idx, "tech", e.target.value)} />
            <Textarea placeholder="Short description" className="sm:col-span-2" value={p.description} onChange={(e) => setProjectField(idx, "description", e.target.value)} />
          </div>
        </div>
      ))}
      <div><button onClick={addProject} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Add Project</button></div>
    </div>
  );

  const AchievementsForm = (
    <div className="space-y-4">
      {draft.achievements.map((a, idx) => (
        <div key={idx} className="border border-gray-100 rounded-md p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Achievement #{idx + 1}</div>
            {draft.achievements.length > 1 && <button onClick={() => removeAchievement(idx)} className="text-xs text-red-600">Remove</button>}
          </div>
          <Input placeholder="Title" value={a.title} onChange={(e) => setAchievementField(idx, "title", e.target.value)} />
          <Textarea placeholder="Description" className="mt-2" value={a.description} onChange={(e) => setAchievementField(idx, "description", e.target.value)} />
        </div>
      ))}
      <div><button onClick={addAchievement} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Add Achievement</button></div>
    </div>
  );

  const CertificationsForm = (
    <div className="space-y-4">
      {draft.certifications.map((c, idx) => (
        <div key={idx} className="border border-gray-100 rounded-md p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Certification #{idx + 1}</div>
            {draft.certifications.length > 1 && <button onClick={() => removeCert(idx)} className="text-xs text-red-600">Remove</button>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Certification name" value={c.name} onChange={(e) => setCertField(idx, "name", e.target.value)} />
            <Input placeholder="Issuer" value={c.issuer} onChange={(e) => setCertField(idx, "issuer", e.target.value)} />
            <Input placeholder="Year" value={c.year} onChange={(e) => setCertField(idx, "year", e.target.value)} />
          </div>
        </div>
      ))}
      <div><button onClick={addCert} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">+ Add Certification</button></div>
    </div>
  );

  const renderActiveForm = () => {
    switch (activeStep) {
      case 0: return PersonalForm;
      case 1: return EducationForm;
      case 2: return ExperienceForm;
      case 3: return SkillsForm;
      case 4: return LinksForm;
      case 5: return ProjectsForm;
      case 6: return AchievementsForm;
      case 7: return CertificationsForm;
      default: return null;
    }
  };

  const handleSaveStep = () => {
    setSavedData(JSON.parse(JSON.stringify(draft)));
    setMessage("Saved.");
    setTimeout(() => setMessage(""), 1500);
  };

  const handleCreateResume = async () => {
    if (!validateStep()) return;
    setLoadingCreate(true);
    const payload = { title: draft.title || draft.personal.name || "New Resume", studentId: user?._id || null, structuredData: draft };
    try {
      await axios.post("/api/resumes/create", payload).catch(() => ({ data: { resume: payload } }));
      if (onCreateSuccess) onCreateSuccess(payload);
      setMessage("Resume created!");
    } catch (err) {
      console.error(err);
      setMessage("Error creating resume.");
    }
    setTimeout(() => setMessage(""), 2000);
    setLoadingCreate(false);
  };

  const handleDownload = () => {
    const html = previewRef.current?.innerHTML;
    if (!html) { setMessage("Save step first."); return; }
    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(`
      <html><head><title>${savedData.personal.name || "Resume"}</title>
      <style>body{font-family:Arial;padding:22px;}h4{margin:10px 0 6px;}</style></head>
      <body>${html}<hr/><div style="text-align:center;font-size:10px;color:#888;">Generated by Talentsync</div></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  // Preview
  const Preview = () => {
    const p = savedData.personal;
    return (
      <div ref={previewRef} className="p-4">
        <div className="border-b pb-3 mb-3">
          <div className="text-lg font-bold">{p.name || "Your Name"}</div>
          <div className="text-sm text-gray-600">{p.headline}</div>
          <div className="text-xs text-gray-500 mt-1">{p.location} {p.email && "•"} {p.email} {p.phone && "•"} {p.phone}</div>
        </div>

        {p.summary && (<div className="mb-3"><h4 className="font-medium">Summary</h4><p className="text-sm">{p.summary}</p></div>)}

        {savedData.experience.length > 0 && (
          <div className="mb-3"><h4 className="font-medium">Experience</h4>
            <div className="text-sm mt-2 space-y-2">
              {savedData.experience.map((ex, i) => (
                <div key={i}>
                  <div className="font-semibold">{ex.position} • <span className="text-gray-600">{ex.company}</span></div>
                  <div className="text-xs text-gray-500">{ex.startDate} — {ex.endDate}</div>
                  {ex.description && <p className="mt-1">{ex.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {savedData.education.length > 0 && (
          <div className="mb-3"><h4 className="font-medium">Education</h4>
            <div className="text-sm mt-2 space-y-2">
              {savedData.education.map((ed, i) => (
                <div key={i}>
                  <div className="font-semibold">{ed.degree} • <span className="text-gray-600">{ed.institution}</span></div>
                  <div className="text-xs text-gray-500">{ed.startYear} — {ed.endYear}</div>
                  {ed.details && <p className="mt-1">{ed.details}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {savedData.projects.length > 0 && (<div className="mb-3"><h4 className="font-medium">Projects</h4>
          <div className="text-sm mt-2 space-y-2">{savedData.projects.map((p, i) => (<div key={i}><div className="font-semibold">{p.name}</div>{p.tech && <div className="text-xs text-gray-600">Tech: {p.tech}</div>}{p.description && <p className="mt-1">{p.description}</p>}</div>))}</div>
        </div>)}

        {savedData.achievements.length > 0 && (<div className="mb-3"><h4 className="font-medium">Achievements</h4><div className="text-sm mt-2 space-y-2">{savedData.achievements.map((a, i) => (<div key={i}><div className="font-semibold">{a.title}</div>{a.description && <p className="mt-1">{a.description}</p>}</div>))}</div></div>)}

        {savedData.certifications.length > 0 && (<div className="mb-3"><h4 className="font-medium">Certifications</h4><div className="text-sm mt-2 space-y-2">{savedData.certifications.map((c, i) => (<div key={i}><div className="font-semibold">{c.name}</div><div className="text-xs text-gray-600">{c.issuer}</div><div className="text-xs text-gray-500">{c.year}</div></div>))}</div></div>)}

        {savedData.skills.length > 0 && (<div className="mb-3"><h4 className="font-medium">Skills</h4><div className="mt-2 flex flex-wrap gap-2">{savedData.skills.map((skill, i) => (<span key={i} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs">{skill}</span>))}</div></div>)}
      </div>
    );
  };

  // Top stepper (horizontal, sticky on top small)
  const TopStepper = (
    <div className="bg-white shadow-sm rounded-md px-3 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto">
        {STEPS.map((label, i) => (
          <button
            key={label}
            onClick={() => setActiveStep(i)}
            className={`flex-none px-3 py-2 rounded-md inline-flex items-center gap-3 focus:outline-none transition-all
              ${activeStep === i ? "bg-indigo-600 text-white shadow" : "text-gray-700 hover:bg-gray-50"}`}
            aria-current={activeStep === i ? "step" : undefined}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${activeStep === i ? "bg-white text-indigo-600" : "bg-gray-100 text-gray-700"}`}>
              {i + 1}
            </div>
            <div className="text-sm">{label}</div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Top stepper */}
      {TopStepper}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main content full-width form area (spans most cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-md shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Editing: <span className="font-medium">{STEPS[activeStep]}</span></div>
              <div className="text-xs text-gray-400">{activeStep + 1}/{STEPS.length}</div>
            </div>

            {/* Active form */}
            <div className="space-y-4">{renderActiveForm()}</div>

            {/* Navigation actions */}
            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => setActiveStep(s => Math.max(0, s - 1))} className="px-3 py-2 bg-white border rounded-md text-sm">Back</button>

              {activeStep < STEPS.length - 1 ? (
                <button onClick={handleNext} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">Next</button>
              ) : (
                <button onClick={handleCreateResume} disabled={loadingCreate} className="px-3 py-2 bg-green-600 text-white rounded-md text-sm">{loadingCreate ? "Creating..." : "Create Resume"}</button>
              )}

              <button onClick={handleSaveStep} className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md border text-sm">Save Step</button>

              <button onClick={handleDownload} className="ml-auto px-3 py-2 bg-gray-800 text-white rounded-md text-sm">Download PDF</button>
            </div>

            {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
          </div>
        </div>

        {/* Right side preview (sticky on large screens) */}
        <div className="lg:col-span-4">
          <div className="hidden lg:block sticky top-6 space-y-4">
            <div className="bg-white rounded-md shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">Live Preview</div>
                <div className="text-xs text-gray-400">Save to update</div>
              </div>
              <div className="max-h-[70vh] overflow-auto">
                <Preview />
              </div>
            </div>

            <div className="bg-white rounded-md shadow-sm p-4">
              <div className="text-sm font-medium mb-2">Quick actions</div>
              <div className="flex flex-col gap-2">
                <button onClick={handleSaveStep} className="w-full px-3 py-2 rounded-md bg-indigo-600 text-white text-sm">Save</button>
                <button onClick={handleDownload} className="w-full px-3 py-2 rounded-md bg-gray-800 text-white text-sm">Download</button>
                <button onClick={() => { setDraft(getEmptyDraft()); setSavedData(getEmptyDraft()); setMessage("Reset done."); setTimeout(() => setMessage(""), 1200); }} className="w-full px-3 py-2 rounded-md bg-red-50 text-red-700 text-sm">Reset</button>
              </div>
            </div>
          </div>

          {/* Mobile preview (below form) */}
          <div className="lg:hidden">
            <div className="bg-white rounded-md shadow-sm p-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">Live Preview</div>
                <div className="text-xs text-gray-400">Save to update</div>
              </div>
              <Preview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeCreator;
