// // src/components/ResumeCreator.jsx
// /**
//  * ResumeCreator - horizontal stepper style (Personal | Education | Experience | Skills | Links)
//  *
//  * - Stepper at top
//  * - Form area below stepper for selected section
//  * - Live preview on the right (handled by parent grid when used on ResumeAnalysis page)
//  * - "Create Resume" posts to /api/resumes/create (expected backend route)
//  * - "Download Resume" opens a print-friendly window for PDF save
//  *
//  * Note: The component expects user auth to be available via /context/AuthContext if server create is used.
//  *
//  * Author: Mandar K. (updated)
//  * Date: 2025-11-21
//  */

// import React, { useState, useRef } from "react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";

// const steps = ["Personal", "Education", "Experience", "Skills", "Links"];

// const emptyData = {
//   personal: {
//     name: "",
//     email: "",
//     phone: "",
//     location: "",
//     headline: "",
//     summary: "",
//   },
//   education: [
//     {
//       institution: "",
//       degree: "",
//       startYear: "",
//       endYear: "",
//       details: "",
//     },
//   ],
//   experience: [
//     {
//       company: "",
//       position: "",
//       startDate: "",
//       endDate: "",
//       description: "",
//     },
//   ],
//   skills: ["JavaScript", "React"],
//   links: {
//     linkedin: "",
//     github: "",
//     website: "",
//   },
//   title: "New Resume",
// };

// const ResumeCreator = ({ onCreateSuccess }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [data, setData] = useState(emptyData);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const previewRef = useRef(null);
//   const { user } = useAuth();

//   // Helpers to set nested state
//   const setPersonalField = (field, value) =>
//     setData((d) => ({ ...d, personal: { ...d.personal, [field]: value } }));

//   const setLinkField = (field, value) =>
//     setData((d) => ({ ...d, links: { ...d.links, [field]: value } }));

//   const updateEducation = (index, field, value) =>
//     setData((d) => {
//       const ed = [...d.education];
//       ed[index] = { ...ed[index], [field]: value };
//       return { ...d, education: ed };
//     });

//   const addEducation = () =>
//     setData((d) => ({ ...d, education: [...d.education, { institution: "", degree: "", startYear: "", endYear: "", details: "" }] }));

//   const removeEducation = (i) =>
//     setData((d) => ({ ...d, education: d.education.filter((_, idx) => idx !== i) }));

//   const updateExperience = (index, field, value) =>
//     setData((d) => {
//       const ex = [...d.experience];
//       ex[index] = { ...ex[index], [field]: value };
//       return { ...d, experience: ex };
//     });

//   const addExperience = () =>
//     setData((d) => ({ ...d, experience: [...d.experience, { company: "", position: "", startDate: "", endDate: "", description: "" }] }));

//   const removeExperience = (i) =>
//     setData((d) => ({ ...d, experience: d.experience.filter((_, idx) => idx !== i) }));

//   const addSkill = (s) =>
//     setData((d) => ({ ...d, skills: [...d.skills, s] }));

//   const removeSkill = (i) =>
//     setData((d) => ({ ...d, skills: d.skills.filter((_, idx) => idx !== i) }));

//   const handleCreate = async () => {
//     setLoading(true);
//     setMessage("");
//     try {
//       // Prepare payload to backend
//       const payload = {
//         title: data.title || `${data.personal.name || "Resume"} - ${new Date().getFullYear()}`,
//         studentId: user?._id,
//         structuredData: {
//           personal: data.personal,
//           education: data.education,
//           experience: data.experience,
//           skills: data.skills,
//           links: data.links,
//         },
//       };

//       const { data: res } = await axios.post("/api/resumes/create", payload);
//       setMessage("Resume created successfully.");
//       setLoading(false);
//       if (onCreateSuccess) onCreateSuccess(res.resume || res);
//     } catch (err) {
//       console.error("Create resume error:", err);
//       setMessage(err.response?.data?.message || "Failed to create resume.");
//       setLoading(false);
//     }
//   };

//   const handleDownload = () => {
//     // Open a new window with printable content of previewRef
//     const previewHtml = previewRef.current?.innerHTML;
//     if (!previewHtml) {
//       setMessage("Nothing to download yet.");
//       return;
//     }

//     const newWindow = window.open("", "_blank", "width=900,height=700");
//     newWindow.document.open();
//     newWindow.document.write(`
//       <html>
//         <head>
//           <title>Resume - ${data.personal.name || "Candidate"}</title>
//           <meta name="viewport" content="width=device-width, initial-scale=1" />
//           <style>
//             body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding: 20px; color: #111827; }
//             .rc-container { max-width: 800px; margin: 0 auto; }
//             .rc-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
//             .rc-name { font-size:28px; font-weight:700; }
//             .rc-headline { color:#4b5563; font-size:14px; margin-top:4px; }
//             .section { margin-top:12px; }
//             .section h4 { margin:0 0 6px 0; font-size:14px; color:#111827; }
//             .muted { color:#6b7280; font-size:13px; }
//             .chip { display:inline-block; padding:6px 8px; margin:3px; background:#eef2ff; color:#3730a3; border-radius:999px; font-size:12px; }
//             hr { border:none; border-top:1px solid #e5e7eb; margin:14px 0; }
//           </style>
//         </head>
//         <body>
//           <div class="rc-container">
//             ${previewHtml}
//             <hr />
//             <div style="text-align:center; font-size:12px; color:#6b7280;">Generated by Talentsync</div>
//           </div>
//         </body>
//       </html>
//     `);
//     newWindow.document.close();
//     // give browser a moment to render then call print
//     setTimeout(() => {
//       newWindow.focus();
//       newWindow.print();
//     }, 500);
//   };

//   // Step content components
//   const PersonalForm = () => (
//     <div className="space-y-3">
//       <div>
//         <label className="block text-xs text-gray-600">Full name</label>
//         <input className="w-full border px-3 py-2 rounded-md" value={data.personal.name} onChange={(e) => setPersonalField("name", e.target.value)} />
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//         <div>
//           <label className="block text-xs text-gray-600">Email</label>
//           <input className="w-full border px-3 py-2 rounded-md" value={data.personal.email} onChange={(e) => setPersonalField("email", e.target.value)} />
//         </div>
//         <div>
//           <label className="block text-xs text-gray-600">Phone</label>
//           <input className="w-full border px-3 py-2 rounded-md" value={data.personal.phone} onChange={(e) => setPersonalField("phone", e.target.value)} />
//         </div>
//         <div>
//           <label className="block text-xs text-gray-600">Location</label>
//           <input className="w-full border px-3 py-2 rounded-md" value={data.personal.location} onChange={(e) => setPersonalField("location", e.target.value)} />
//         </div>
//       </div>

//       <div>
//         <label className="block text-xs text-gray-600">Headline (e.g., Senior Frontend Engineer)</label>
//         <input className="w-full border px-3 py-2 rounded-md" value={data.personal.headline} onChange={(e) => setPersonalField("headline", e.target.value)} />
//       </div>

//       <div>
//         <label className="block text-xs text-gray-600">Summary</label>
//         <textarea rows="4" className="w-full border px-3 py-2 rounded-md" value={data.personal.summary} onChange={(e) => setPersonalField("summary", e.target.value)} />
//       </div>
//     </div>
//   );

//   const EducationForm = () => (
//     <div className="space-y-3">
//       {data.education.map((edu, idx) => (
//         <div key={idx} className="border rounded-md p-3">
//           <div className="flex justify-between items-start mb-2">
//             <div className="text-sm font-medium">Education #{idx + 1}</div>
//             <div className="flex gap-2">
//               {data.education.length > 1 && (
//                 <button onClick={() => removeEducation(idx)} type="button" className="text-xs text-red-600">Remove</button>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//             <input placeholder="Institution" className="border px-2 py-1 rounded" value={edu.institution} onChange={(e) => updateEducation(idx, "institution", e.target.value)} />
//             <input placeholder="Degree" className="border px-2 py-1 rounded" value={edu.degree} onChange={(e) => updateEducation(idx, "degree", e.target.value)} />
//             <input placeholder="Start year" className="border px-2 py-1 rounded" value={edu.startYear} onChange={(e) => updateEducation(idx, "startYear", e.target.value)} />
//             <input placeholder="End year" className="border px-2 py-1 rounded" value={edu.endYear} onChange={(e) => updateEducation(idx, "endYear", e.target.value)} />
//             <textarea placeholder="Details (optional)" className="border px-2 py-1 rounded col-span-1 sm:col-span-2" value={edu.details} onChange={(e) => updateEducation(idx, "details", e.target.value)} />
//           </div>
//         </div>
//       ))}

//       <div>
//         <button onClick={addEducation} type="button" className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm">+ Add Education</button>
//       </div>
//     </div>
//   );

//   const ExperienceForm = () => (
//     <div className="space-y-3">
//       {data.experience.map((exp, idx) => (
//         <div key={idx} className="border rounded-md p-3">
//           <div className="flex justify-between items-start mb-2">
//             <div className="text-sm font-medium">Experience #{idx + 1}</div>
//             <div className="flex gap-2">
//               {data.experience.length > 1 && <button onClick={() => removeExperience(idx)} type="button" className="text-xs text-red-600">Remove</button>}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//             <input placeholder="Company" className="border px-2 py-1 rounded" value={exp.company} onChange={(e) => updateExperience(idx, "company", e.target.value)} />
//             <input placeholder="Position" className="border px-2 py-1 rounded" value={exp.position} onChange={(e) => updateExperience(idx, "position", e.target.value)} />
//             <input placeholder="Start date" className="border px-2 py-1 rounded" value={exp.startDate} onChange={(e) => updateExperience(idx, "startDate", e.target.value)} />
//             <input placeholder="End date" className="border px-2 py-1 rounded" value={exp.endDate} onChange={(e) => updateExperience(idx, "endDate", e.target.value)} />
//             <textarea placeholder="Description" className="border px-2 py-1 rounded col-span-1 sm:col-span-2" value={exp.description} onChange={(e) => updateExperience(idx, "description", e.target.value)} />
//           </div>
//         </div>
//       ))}

//       <div>
//         <button onClick={addExperience} type="button" className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm">+ Add Experience</button>
//       </div>
//     </div>
//   );

//   const SkillsForm = () => {
//     const [skillInput, setSkillInput] = useState("");
//     return (
//       <div>
//         <div className="flex gap-2 mb-3">
//           <input placeholder="Add skill and press Enter" className="flex-1 border px-3 py-2 rounded-md" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => {
//             if (e.key === "Enter" && skillInput.trim()) {
//               e.preventDefault();
//               addSkill(skillInput.trim());
//               setSkillInput("");
//             }
//           }} />
//           <button onClick={() => { if (skillInput.trim()) { addSkill(skillInput.trim()); setSkillInput(""); }}} type="button" className="px-3 py-2 bg-indigo-600 text-white rounded-md">Add</button>
//         </div>

//         <div className="flex flex-wrap gap-2">
//           {data.skills.map((s, idx) => (
//             <div key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
//               <div className="text-sm">{s}</div>
//               <button onClick={() => removeSkill(idx)} type="button" className="text-xs text-red-600">x</button>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   const LinksForm = () => (
//     <div className="space-y-3">
//       <div>
//         <label className="block text-xs text-gray-600">LinkedIn</label>
//         <input className="w-full border px-3 py-2 rounded-md" value={data.links.linkedin} onChange={(e) => setLinkField("linkedin", e.target.value)} placeholder="https://linkedin.com/in/username" />
//       </div>
//       <div>
//         <label className="block text-xs text-gray-600">GitHub</label>
//         <input className="w-full border px-3 py-2 rounded-md" value={data.links.github} onChange={(e) => setLinkField("github", e.target.value)} placeholder="https://github.com/username" />
//       </div>
//       <div>
//         <label className="block text-xs text-gray-600">Website / Portfolio</label>
//         <input className="w-full border px-3 py-2 rounded-md" value={data.links.website} onChange={(e) => setLinkField("website", e.target.value)} placeholder="https://example.com" />
//       </div>
//     </div>
//   );

//   // Render preview HTML
//   const Preview = () => {
//     const p = data.personal;
//     return (
//       <div ref={previewRef} className="rc-preview p-4">
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//           <div>
//             <div style={{ fontSize: 22, fontWeight: 700 }}>{p.name || "Your Name"}</div>
//             <div style={{ color: "#6b7280", marginTop: 4 }}>{p.headline}</div>
//             <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>{p.location}{p.location && (p.email || p.phone) ? " • " : ""}{p.email}{p.email && p.phone ? " • " : ""}{p.phone}</div>
//           </div>

//           <div style={{ textAlign: "right" }}>
//             {data.links.linkedin && <div className="muted" style={{ fontSize: 13 }}><a href={data.links.linkedin} target="_blank" rel="noreferrer">{data.links.linkedin}</a></div>}
//             {data.links.github && <div className="muted" style={{ fontSize: 13, marginTop: 6 }}><a href={data.links.github} target="_blank" rel="noreferrer">{data.links.github}</a></div>}
//           </div>
//         </div>

//         {p.summary && (
//           <div style={{ marginTop: 14 }}>
//             <h4 style={{ margin: 0, fontSize: 14 }}>Summary</h4>
//             <div className="muted" style={{ marginTop: 6 }}>{p.summary}</div>
//           </div>
//         )}

//         {data.experience && data.experience.length > 0 && (
//           <div style={{ marginTop: 12 }}>
//             <h4 style={{ margin: 0, fontSize: 14 }}>Experience</h4>
//             <div className="muted" style={{ marginTop: 6 }}>
//               {data.experience.map((ex, i) => (
//                 <div key={i} style={{ marginBottom: 8 }}>
//                   <div style={{ fontWeight: 600 }}>{ex.position || "Position"} — <span style={{ fontWeight: 500, color: "#6b7280" }}>{ex.company}</span></div>
//                   <div style={{ color: "#6b7280", fontSize: 13 }}>{ex.startDate} — {ex.endDate}</div>
//                   <div style={{ marginTop: 6 }}>{ex.description}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {data.education && data.education.length > 0 && (
//           <div style={{ marginTop: 12 }}>
//             <h4 style={{ margin: 0, fontSize: 14 }}>Education</h4>
//             <div className="muted" style={{ marginTop: 6 }}>
//               {data.education.map((ed, i) => (
//                 <div key={i} style={{ marginBottom: 8 }}>
//                   <div style={{ fontWeight: 600 }}>{ed.degree || "Degree"}, <span style={{ fontWeight: 500 }}>{ed.institution}</span></div>
//                   <div style={{ color: "#6b7280", fontSize: 13 }}>{ed.startYear} — {ed.endYear}</div>
//                   <div style={{ marginTop: 6 }}>{ed.details}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {data.skills && data.skills.length > 0 && (
//           <div style={{ marginTop: 12 }}>
//             <h4 style={{ margin: 0, fontSize: 14 }}>Skills</h4>
//             <div style={{ marginTop: 8 }}>
//               {data.skills.map((s, i) => <span key={i} className="chip" style={{ display: "inline-block", marginRight: 6, marginBottom: 6, padding: "6px 8px", background: "#eef2ff", color: "#3730a3", borderRadius: 999 }}>{s}</span>)}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Decide which step form to render
//   const StepForm = () => {
//     switch (activeStep) {
//       case 0: return <PersonalForm />;
//       case 1: return <EducationForm />;
//       case 2: return <ExperienceForm />;
//       case 3: return <SkillsForm />;
//       case 4: return <LinksForm />;
//       default: return null;
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//       {/* LEFT: stepper + active form */}
//       <div>
//         <div className="flex items-center gap-4 mb-4">
//           {steps.map((label, i) => (
//             <div key={label} className="flex items-center gap-3">
//               <button
//                 type="button"
//                 onClick={() => setActiveStep(i)}
//                 className={`px-3 pb-1 text-sm ${activeStep === i ? "text-indigo-600 font-semibold" : "text-gray-600"}`}
//               >
//                 {label}
//               </button>
//               {i !== steps.length - 1 && <div className="w-6 h-[1px] bg-gray-200" />}
//             </div>
//           ))}
//         </div>

//         <div className="bg-white border rounded-md p-4 shadow-sm">
//           <div className="mb-4">
//             <label className="block text-xs text-gray-500 mb-1">Resume title</label>
//             <input className="w-full border px-3 py-2 rounded-md" value={data.title} onChange={(e) => setData(d => ({ ...d, title: e.target.value }))} />
//           </div>

//           <div className="mb-4">
//             <StepForm />
//           </div>

//           <div className="flex items-center gap-3">
//             <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))} type="button" className="px-3 py-2 bg-white border rounded-md text-sm">Back</button>

//             {activeStep < steps.length - 1 ? (
//               <button onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))} type="button" className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">Next</button>
//             ) : (
//               <button onClick={handleCreate} disabled={loading} type="button" className="px-3 py-2 bg-green-600 text-white rounded-md text-sm">
//                 {loading ? "Creating..." : "Create Resume"}
//               </button>
//             )}

//             <button onClick={handleDownload} type="button" className="ml-auto px-3 py-2 bg-gray-800 text-white rounded-md text-sm">Download</button>
//           </div>

//           {message && <div className="mt-3 text-sm text-gray-600">{message}</div>}
//         </div>
//       </div>

//       {/* RIGHT: live preview (printable) */}
//       <div>
//         <div className="bg-white border rounded-md p-4 shadow-sm">
//           <div className="flex items-center justify-between mb-3">
//             <div className="text-sm font-semibold">Live Preview</div>
//             <div className="text-xs text-gray-500">Printable / downloadable</div>
//           </div>

//           <div>
//             <Preview />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResumeCreator;







// src/components/ResumeCreator.jsx
/**
 * ResumeCreator - horizontal stepper style (Personal | Education | Experience | Skills | Links)
 * - Fixes input focus issue (no auto-blur after first character)
 * - Introduces "Save Step" so preview updates only on saved data
 * - Preview appears BELOW the form (layout B)
 *
 * Author: Mandar K. (updated)
 * Date: 2025-11-21 (updated)
 */

// import React, { useState, useRef, useCallback } from "react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";

// // Steps shown in horizontal stepper
// const STEPS = ["Personal", "Education", "Experience", "Skills", "Links"];

// // Empty draft structure
// const getEmptyDraft = () => ({
//   title: "New Resume",
//   personal: {
//     name: "",
//     email: "",
//     phone: "",
//     location: "",
//     headline: "",
//     summary: "",
//   },
//   education: [
//     { institution: "", degree: "", startYear: "", endYear: "", details: "" },
//   ],
//   experience: [
//     { company: "", position: "", startDate: "", endDate: "", description: "" },
//   ],
//   skills: [],
//   links: { linkedin: "", github: "", website: "" },
// });

// const sampleAvatar = "/mnt/data/47a4040f-5d21-4478-9504-71604a9036b5.png"; // uploaded file path (dev instruction)

// const ResumeCreator = ({ onCreateSuccess }) => {
//   const { user } = useAuth?.() || {}; // safe access; if useAuth not available, fall back
//   // draft = current editable values (fast typing)
//   const [draft, setDraft] = useState(getEmptyDraft);
//   // savedData = what is shown in preview (updated only when user clicks "Save Step" or "Create Resume")
//   const [savedData, setSavedData] = useState(getEmptyDraft);
//   const [activeStep, setActiveStep] = useState(0);
//   const [loadingCreate, setLoadingCreate] = useState(false);
//   const [message, setMessage] = useState("");
//   const previewRef = useRef(null);

//   // --------- Helpers: update draft without recreating fields ----------
//   const updateDraft = useCallback((path, value) => {
//     // path can be 'personal.name' or 'education[0].degree' etc.
//     // implement for our known forms with simple functions instead of a generic deep setter
//     setDraft((prev) => {
//       const clone = JSON.parse(JSON.stringify(prev)); // safe deep clone for this use case
//       const parts = path.split(".");
//       let cur = clone;
//       for (let i = 0; i < parts.length - 1; i++) {
//         const p = parts[i];
//         // handle array index like education[0]
//         const arrMatch = p.match(/^([a-zA-Z0-9_]+)\[(\d+)\]$/);
//         if (arrMatch) {
//           const key = arrMatch[1];
//           const idx = Number(arrMatch[2]);
//           cur = cur[key][idx];
//         } else {
//           cur = cur[p];
//         }
//       }
//       const last = parts[parts.length - 1];
//       const arrMatch = last.match(/^([a-zA-Z0-9_]+)\[(\d+)\]$/);
//       if (arrMatch) {
//         const key = arrMatch[1];
//         const idx = Number(arrMatch[2]);
//         cur[key][idx] = value;
//       } else {
//         cur[last] = value;
//       }
//       return clone;
//     });
//   }, []);

//   // Shorthand single-field updates:
//   const setPersonal = (field, val) => updateDraft(`personal.${field}`, val);
//   const setLink = (field, val) => updateDraft(`links.${field}`, val);

//   // education handlers
//   const addEducation = () =>
//     setDraft((d) => ({ ...d, education: [...d.education, { institution: "", degree: "", startYear: "", endYear: "", details: "" }] }));
//   const removeEducation = (index) =>
//     setDraft((d) => ({ ...d, education: d.education.filter((_, i) => i !== index) }));
//   const setEducationField = (index, field, val) =>
//     setDraft((d) => {
//       const ed = d.education.map((e, i) => (i === index ? { ...e, [field]: val } : e));
//       return { ...d, education: ed };
//     });

//   // experience handlers
//   const addExperience = () =>
//     setDraft((d) => ({ ...d, experience: [...d.experience, { company: "", position: "", startDate: "", endDate: "", description: "" }] }));
//   const removeExperience = (index) =>
//     setDraft((d) => ({ ...d, experience: d.experience.filter((_, i) => i !== index) }));
//   const setExperienceField = (index, field, val) =>
//     setDraft((d) => {
//       const ex = d.experience.map((e, i) => (i === index ? { ...e, [field]: val } : e));
//       return { ...d, experience: ex };
//     });

//   // skills handlers
//   const addSkill = (skill) =>
//     setDraft((d) => ({ ...d, skills: [...d.skills, skill] }));
//   const removeSkill = (index) =>
//     setDraft((d) => ({ ...d, skills: d.skills.filter((_, i) => i !== index) }));

//   // Save current step -> merges the relevant part of draft into savedData
//   const handleSaveStep = () => {
//     setSavedData((prev) => {
//       const clone = JSON.parse(JSON.stringify(prev));
//       // Merge only the current step's section
//       switch (activeStep) {
//         case 0: // Personal
//           clone.personal = JSON.parse(JSON.stringify(draft.personal));
//           clone.title = draft.title || clone.title;
//           break;
//         case 1: // Education
//           clone.education = JSON.parse(JSON.stringify(draft.education));
//           break;
//         case 2: // Experience
//           clone.experience = JSON.parse(JSON.stringify(draft.experience));
//           break;
//         case 3: // Skills
//           clone.skills = JSON.parse(JSON.stringify(draft.skills));
//           break;
//         case 4: // Links
//           clone.links = JSON.parse(JSON.stringify(draft.links));
//           break;
//         default:
//           break;
//       }
//       return clone;
//     });
//     setMessage("Saved current section to preview.");
//     // small clear of message after a short time
//     setTimeout(() => setMessage(""), 2200);
//   };

//   // Create resume (send to server) - this also saves all draft -> saved data and posts
//   const handleCreateResume = async () => {
//     setLoadingCreate(true);
//     setMessage("");
//     // ensure savedData contains full draft before creating
//     const payloadData = {
//       title: draft.title || draft.personal.name || "New Resume",
//       studentId: user?._id || null,
//       structuredData: {
//         personal: draft.personal,
//         education: draft.education,
//         experience: draft.experience,
//         skills: draft.skills,
//         links: draft.links,
//       },
//     };

//     try {
//       // Save preview locally first
//       setSavedData(JSON.parse(JSON.stringify(draft)));
//       // call backend (optional - if /api/resumes/create exists)
//       const res = await axios.post("/api/resumes/create", payloadData).catch((err) => {
//         // if endpoint not present, treat as soft success
//         console.warn("Create endpoint responded with error or not present:", err?.message || err);
//         return { data: { resume: payloadData } };
//       });

//       setMessage("Resume created successfully.");
//       if (onCreateSuccess) onCreateSuccess(res?.data?.resume || payloadData);
//     } catch (err) {
//       console.error("Error creating resume:", err);
//       setMessage(err?.response?.data?.message || "Failed to create resume.");
//     } finally {
//       setLoadingCreate(false);
//       setTimeout(() => setMessage(""), 2600);
//     }
//   };

//   // Download/Print preview
//   const handleDownload = () => {
//     const previewHtml = previewRef.current?.innerHTML;
//     if (!previewHtml) {
//       setMessage("Nothing saved to preview yet — save a step or create the resume first.");
//       return;
//     }
//     const win = window.open("", "_blank", "width=900,height=700");
//     win.document.open();
//     win.document.write(`
//       <html>
//         <head>
//           <meta name="viewport" content="width=device-width,initial-scale=1" />
//           <title>${savedData.personal?.name || "Resume"}</title>
//           <style>
//             body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial; color:#111827; padding:22px; }
//             .rc-wrap { max-width:900px; margin: 0 auto; }
//             .name { font-size:22px; font-weight:700; }
//             .muted { color:#6b7280; font-size:13px; }
//             h4 { margin:8px 0 6px; font-size:14px; }
//             .chip { display:inline-block; padding:4px 8px; margin:4px; background:#eef2ff; border-radius:999px; color:#3730a3; font-size:12px; }
//             hr { border: none; border-top: 1px solid #e5e7eb; margin:14px 0; }
//           </style>
//         </head>
//         <body>
//           <div class="rc-wrap">${previewHtml}<hr><div style="text-align:center;color:#6b7280;font-size:12px">Generated by Talentsync</div></div>
//         </body>
//       </html>
//     `);
//     win.document.close();
//     setTimeout(() => win.print(), 500);
//   };

//   // -------- UI pieces for each step (stable components - no keys changes) ----------
//   const PersonalForm = (
//     <div className="space-y-3">
//       <div>
//         <label className="block text-xs text-gray-600">Resume title</label>
//         <input
//           className="w-full border px-3 py-2 rounded-md"
//           value={draft.title}
//           onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
//           placeholder="e.g., Data Scientist Application"
//           aria-label="resume-title"
//         />
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//         <div>
//           <label className="block text-xs text-gray-600">Full name</label>
//           <input
//             className="w-full border px-3 py-2 rounded-md"
//             value={draft.personal.name}
//             onChange={(e) => setPersonal("name", e.target.value)}
//             placeholder="Your full name"
//             aria-label="full-name"
//           />
//         </div>
//         <div>
//           <label className="block text-xs text-gray-600">Email</label>
//           <input
//             className="w-full border px-3 py-2 rounded-md"
//             value={draft.personal.email}
//             onChange={(e) => setPersonal("email", e.target.value)}
//             placeholder="you@example.com"
//             aria-label="email"
//           />
//         </div>
//         <div>
//           <label className="block text-xs text-gray-600">Phone</label>
//           <input
//             className="w-full border px-3 py-2 rounded-md"
//             value={draft.personal.phone}
//             onChange={(e) => setPersonal("phone", e.target.value)}
//             placeholder="+91 98xxxx"
//             aria-label="phone"
//           />
//         </div>
//       </div>

//       <div>
//         <label className="block text-xs text-gray-600">Location</label>
//         <input
//           className="w-full border px-3 py-2 rounded-md"
//           value={draft.personal.location}
//           onChange={(e) => setPersonal("location", e.target.value)}
//           placeholder="City, Country"
//         />
//       </div>

//       <div>
//         <label className="block text-xs text-gray-600">Headline</label>
//         <input
//           className="w-full border px-3 py-2 rounded-md"
//           value={draft.personal.headline}
//           onChange={(e) => setPersonal("headline", e.target.value)}
//           placeholder="e.g., Senior Frontend Engineer"
//         />
//       </div>

//       <div>
//         <label className="block text-xs text-gray-600">Summary</label>
//         <textarea
//           rows={4}
//           className="w-full border px-3 py-2 rounded-md"
//           value={draft.personal.summary}
//           onChange={(e) => setPersonal("summary", e.target.value)}
//           placeholder="Short professional summary..."
//         />
//       </div>
//     </div>
//   );

//   const EducationForm = (
//     <div className="space-y-3">
//       {draft.education.map((edu, idx) => (
//         <div key={idx} className="border rounded-md p-3">
//           <div className="flex items-center justify-between mb-2">
//             <div className="text-sm font-medium">Education #{idx + 1}</div>
//             <div className="flex gap-2">
//               {draft.education.length > 1 && (
//                 <button
//                   type="button"
//                   onClick={() => removeEducation(idx)}
//                   className="text-xs text-red-600"
//                 >
//                   Remove
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//             <input placeholder="Institution" className="border px-2 py-1 rounded" value={edu.institution} onChange={(e) => setEducationField(idx, "institution", e.target.value)} />
//             <input placeholder="Degree" className="border px-2 py-1 rounded" value={edu.degree} onChange={(e) => setEducationField(idx, "degree", e.target.value)} />
//             <input placeholder="Start year" className="border px-2 py-1 rounded" value={edu.startYear} onChange={(e) => setEducationField(idx, "startYear", e.target.value)} />
//             <input placeholder="End year" className="border px-2 py-1 rounded" value={edu.endYear} onChange={(e) => setEducationField(idx, "endYear", e.target.value)} />
//             <textarea placeholder="Details (optional)" className="border px-2 py-1 rounded col-span-1 sm:col-span-2" value={edu.details} onChange={(e) => setEducationField(idx, "details", e.target.value)} />
//           </div>
//         </div>
//       ))}

//       <div>
//         <button type="button" onClick={addEducation} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm">+ Add Education</button>
//       </div>
//     </div>
//   );

//   const ExperienceForm = (
//     <div className="space-y-3">
//       {draft.experience.map((exp, idx) => (
//         <div key={idx} className="border rounded-md p-3">
//           <div className="flex items-center justify-between mb-2">
//             <div className="text-sm font-medium">Experience #{idx + 1}</div>
//             <div className="flex gap-2">
//               {draft.experience.length > 1 && (
//                 <button type="button" onClick={() => removeExperience(idx)} className="text-xs text-red-600">Remove</button>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//             <input placeholder="Company" className="border px-2 py-1 rounded" value={exp.company} onChange={(e) => setExperienceField(idx, "company", e.target.value)} />
//             <input placeholder="Position" className="border px-2 py-1 rounded" value={exp.position} onChange={(e) => setExperienceField(idx, "position", e.target.value)} />
//             <input placeholder="Start date" className="border px-2 py-1 rounded" value={exp.startDate} onChange={(e) => setExperienceField(idx, "startDate", e.target.value)} />
//             <input placeholder="End date" className="border px-2 py-1 rounded" value={exp.endDate} onChange={(e) => setExperienceField(idx, "endDate", e.target.value)} />
//             <textarea placeholder="Description" className="border px-2 py-1 rounded col-span-1 sm:col-span-2" value={exp.description} onChange={(e) => setExperienceField(idx, "description", e.target.value)} />
//           </div>
//         </div>
//       ))}

//       <div>
//         <button type="button" onClick={addExperience} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm">+ Add Experience</button>
//       </div>
//     </div>
//   );

//   const SkillsForm = (
//     <SkillsEditor draft={draft} addSkill={addSkill} removeSkill={removeSkill} updateDraft={setDraft} />
//   );

//   const LinksForm = (
//     <div className="space-y-3">
//       <div>
//         <label className="block text-xs text-gray-600">LinkedIn</label>
//         <input className="w-full border px-3 py-2 rounded-md" value={draft.links.linkedin} onChange={(e) => setLink("linkedin", e.target.value)} placeholder="https://linkedin.com/in/username" />
//       </div>
//       <div>
//         <label className="block text-xs text-gray-600">GitHub</label>
//         <input className="w-full border px-3 py-2 rounded-md" value={draft.links.github} onChange={(e) => setLink("github", e.target.value)} placeholder="https://github.com/username" />
//       </div>
//       <div>
//         <label className="block text-xs text-gray-600">Website / Portfolio</label>
//         <input className="w-full border px-3 py-2 rounded-md" value={draft.links.website} onChange={(e) => setLink("website", e.target.value)} placeholder="https://example.com" />
//       </div>
//     </div>
//   );

//   // Render the active form
//   const renderActiveForm = () => {
//     switch (activeStep) {
//       case 0:
//         return PersonalForm;
//       case 1:
//         return EducationForm;
//       case 2:
//         return ExperienceForm;
//       case 3:
//         return SkillsForm;
//       case 4:
//         return LinksForm;
//       default:
//         return null;
//     }
//   };

//   // Preview component uses savedData (not draft) so typing doesn't force preview updates unless user saved
//   const Preview = () => {
//     const p = savedData.personal || {};
//     return (
//       <div ref={previewRef} className="p-4">
//         <div className="flex items-start justify-between">
//           <div>
//             <div className="text-xl font-bold">{p.name || "Your Name"}</div>
//             <div className="text-sm text-gray-600 mt-1">{p.headline}</div>
//             <div className="text-xs text-gray-500 mt-2">{p.location}{p.location && (p.email || p.phone) ? " • " : ""}{p.email}{p.email && p.phone ? " • " : ""}{p.phone}</div>
//           </div>
//           <div className="text-right">
//             <img src={user?.avatarUrl || sampleAvatar} alt="avatar" className="w-16 h-16 object-cover rounded-md border" />
//             <div className="text-xs text-gray-500 mt-2">{savedData.links?.linkedin ? <a target="_blank" rel="noreferrer" href={savedData.links.linkedin}>{savedData.links.linkedin}</a> : null}</div>
//           </div>
//         </div>

//         {p.summary && (
//           <div className="mt-4">
//             <h4 className="font-medium">Summary</h4>
//             <div className="text-sm text-gray-700 mt-1">{p.summary}</div>
//           </div>
//         )}

//         {savedData.experience && savedData.experience.length > 0 && (
//           <div className="mt-4">
//             <h4 className="font-medium">Experience</h4>
//             <div className="text-sm text-gray-700 mt-1 space-y-3">
//               {savedData.experience.map((ex, i) => (
//                 <div key={i}>
//                   <div className="font-semibold">{ex.position || "Position"} • <span className="font-medium text-gray-600">{ex.company}</span></div>
//                   <div className="text-xs text-gray-500">{ex.startDate} — {ex.endDate}</div>
//                   {ex.description && <div className="mt-1">{ex.description}</div>}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {savedData.education && savedData.education.length > 0 && (
//           <div className="mt-4">
//             <h4 className="font-medium">Education</h4>
//             <div className="text-sm text-gray-700 mt-1 space-y-2">
//               {savedData.education.map((ed, i) => (
//                 <div key={i}>
//                   <div className="font-semibold">{ed.degree || "Degree"} • <span className="font-medium text-gray-600">{ed.institution}</span></div>
//                   <div className="text-xs text-gray-500">{ed.startYear} — {ed.endYear}</div>
//                   {ed.details && <div className="mt-1">{ed.details}</div>}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {savedData.skills && savedData.skills.length > 0 && (
//           <div className="mt-4">
//             <h4 className="font-medium">Skills</h4>
//             <div className="mt-2">
//               {savedData.skills.map((s, i) => (
//                 <span key={i} className="inline-block bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs mr-2 mb-2">{s}</span>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="max-w-3xl mx-auto space-y-6">
//       {/* Stepper */}
//       <div className="flex items-center justify-between gap-2 overflow-auto pb-2">
//         {STEPS.map((label, i) => (
//           <div key={label} className="flex items-center gap-3">
//             <button
//               type="button"
//               onClick={() => setActiveStep(i)}
//               className={`px-3 py-2 text-sm rounded-md focus:outline-none ${activeStep === i ? "bg-indigo-600 text-white" : "text-gray-700 bg-white border"}`}
//             >
//               {label}
//             </button>
//             {i < STEPS.length - 1 && <div className="w-6 h-[1px] bg-gray-200" />}
//           </div>
//         ))}
//       </div>

//       {/* Form container */}
//       <div className="bg-white border rounded-md p-4 shadow-sm">
//         <div className="mb-4 text-sm text-gray-600">Editing: <span className="font-medium">{STEPS[activeStep]}</span></div>

//         <div className="mb-4">
//           {renderActiveForm()}
//         </div>

//         <div className="flex items-center gap-3">
//           <button type="button" onClick={() => setActiveStep((s) => Math.max(0, s - 1))} className="px-3 py-2 bg-white border rounded-md text-sm">Back</button>

//           {activeStep < STEPS.length - 1 ? (
//             <button type="button" onClick={() => setActiveStep((s) => Math.min(STEPS.length - 1, s + 1))} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">Next</button>
//           ) : (
//             <button type="button" onClick={handleCreateResume} disabled={loadingCreate} className="px-3 py-2 bg-green-600 text-white rounded-md text-sm">
//               {loadingCreate ? "Creating..." : "Create Resume"}
//             </button>
//           )}

//           <button type="button" onClick={handleSaveStep} className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md text-sm border">Save Step</button>

//           <button type="button" onClick={handleDownload} className="ml-auto px-3 py-2 bg-gray-800 text-white rounded-md text-sm">Download Preview</button>
//         </div>

//         {message && <div className="mt-3 text-sm text-gray-600">{message}</div>}
//       </div>

//       {/* Preview below the form */}
//       <div className="bg-white border rounded-md p-4 shadow-sm">
//         <div className="flex items-center justify-between mb-3">
//           <div className="text-sm font-semibold">Live Preview (saved sections only)</div>
//           <div className="text-xs text-gray-500">Click "Save Step" to reflect changes here</div>
//         </div>
//         <Preview />
//       </div>
//     </div>
//   );
// };

// export default ResumeCreator;

// /* -----------------------------
//   SkillsEditor - separated small component (keeps ResumeCreator file tidy)
//    - uses internal state for skill input
//    - does not re-create inputs on parent changes
// ------------------------------ */
// function SkillsEditor({ draft, addSkill, removeSkill }) {
//   const [input, setInput] = useState("");
//   return (
//     <div>
//       <div className="flex gap-2 mb-3">
//         <input
//           placeholder="Add skill and press Enter"
//           className="flex-1 border px-3 py-2 rounded-md"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               e.preventDefault();
//               const val = input.trim();
//               if (val) {
//                 addSkill(val);
//                 setInput("");
//               }
//             }
//           }}
//         />
//         <button
//           onClick={() => {
//             const v = input.trim();
//             if (!v) return;
//             addSkill(v);
//             setInput("");
//           }}
//           type="button"
//           className="px-3 py-2 bg-indigo-600 text-white rounded-md"
//         >
//           Add
//         </button>
//       </div>

//       <div className="flex flex-wrap gap-2">
//         {(draft.skills || []).map((s, i) => (
//           <div key={i} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
//             <div className="text-sm">{s}</div>
//             <button type="button" onClick={() => removeSkill(i)} className="text-xs text-red-600">x</button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }









// import React, { useState, useRef, useCallback } from "react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";

// // 🚀 ATS-friendly steps
// const STEPS = [
//   "Personal",
//   "Education",
//   "Experience",
//   "Skills",
//   "Links",
//   "Projects",
//   "Achievements",
//   "Certifications",
// ];

// // Empty draft structure
// const getEmptyDraft = () => ({
//   title: "New Resume",
//   personal: {
//     name: "",
//     email: "",
//     phone: "",
//     location: "",
//     headline: "",
//     summary: "",
//   },
//   education: [
//     { institution: "", degree: "", startYear: "", endYear: "", details: "" },
//   ],
//   experience: [
//     { company: "", position: "", startDate: "", endDate: "", description: "" },
//   ],
//   skills: [],
//   links: { linkedin: "", github: "", website: "" },

//   // NEW ATS TABS
//   projects: [{ name: "", tech: "", description: "" }],
//   achievements: [{ title: "", description: "" }],
//   certifications: [{ name: "", issuer: "", year: "" }],
// });

// const sampleAvatar = "/mnt/data/47a4040f-5d21-4478-9504-71604a9036b5.png";

// const ResumeCreator = ({ onCreateSuccess }) => {
//   const { user } = useAuth?.() || {};

//   const [draft, setDraft] = useState(getEmptyDraft);
//   const [savedData, setSavedData] = useState(getEmptyDraft);
//   const [activeStep, setActiveStep] = useState(0);
//   const [loadingCreate, setLoadingCreate] = useState(false);
//   const [message, setMessage] = useState("");
//   const [errors, setErrors] = useState({});
//   const previewRef = useRef(null);

//   // --------------------------
//   // VALIDATION FUNCTION
//   // --------------------------
//   const validateStep = () => {
//     let err = {};

//     if (activeStep === 0) {
//       if (!draft.personal.name.trim()) err.name = "Name is required.";
//       if (!draft.personal.email.trim()) err.email = "Email is required.";
//       if (!draft.personal.phone.trim()) err.phone = "Phone number is required.";
//     }

//     if (activeStep === 1) {
//       draft.education.forEach((ed, i) => {
//         if (!ed.institution.trim())
//           err[`edu_inst_${i}`] = "Institution required.";
//         if (!ed.degree.trim())
//           err[`edu_deg_${i}`] = "Degree is required.";
//       });
//     }

//     if (activeStep === 2) {
//       draft.experience.forEach((ex, i) => {
//         if (!ex.company.trim())
//           err[`exp_comp_${i}`] = "Company required.";
//         if (!ex.position.trim())
//           err[`exp_pos_${i}`] = "Position required.";
//       });
//     }

//     if (activeStep === 5) {
//       draft.projects.forEach((p, i) => {
//         if (!p.name.trim()) err[`proj_name_${i}`] = "Project name required.";
//       });
//     }

//     if (activeStep === 6) {
//       draft.achievements.forEach((a, i) => {
//         if (!a.title.trim()) err[`ach_title_${i}`] = "Title required.";
//       });
//     }

//     if (activeStep === 7) {
//       draft.certifications.forEach((c, i) => {
//         if (!c.name.trim())
//           err[`cert_name_${i}`] = "Certification name required.";
//       });
//     }

//     setErrors(err);
//     return Object.keys(err).length === 0;
//   };

//   // NEXT BUTTON HANDLER (with validation)
//   const handleNext = () => {
//     if (!validateStep()) return;
//     setActiveStep((s) => Math.min(STEPS.length - 1, s + 1));
//   };

//   // -----------------------------
//   // Update draft helper
//   // -----------------------------
//   const updateDraft = useCallback((path, value) => {
//     setDraft((prev) => {
//       const clone = JSON.parse(JSON.stringify(prev));
//       const parts = path.split(".");
//       let cur = clone;

//       for (let i = 0; i < parts.length - 1; i++) {
//         const p = parts[i];
//         const match = p.match(/^(.+)\[(\d+)\]$/);
//         if (match) {
//           cur = cur[match[1]][Number(match[2])];
//         } else {
//           cur = cur[p];
//         }
//       }

//       const last = parts[parts.length - 1];
//       const match = last.match(/^(.+)\[(\d+)\]$/);
//       if (match) {
//         cur[match[1]][Number(match[2])] = value;
//       } else {
//         cur[last] = value;
//       }

//       return clone;
//     });
//   }, []);

//   const setPersonal = (field, val) =>
//     updateDraft(`personal.${field}`, val);
//   const setLink = (field, val) =>
//     updateDraft(`links.${field}`, val);

//   // --------------------------------
//   // Education Handlers
//   // --------------------------------
//   const addEducation = () =>
//     setDraft((d) => ({
//       ...d,
//       education: [
//         ...d.education,
//         { institution: "", degree: "", startYear: "", endYear: "", details: "" },
//       ],
//     }));

//   const removeEducation = (index) =>
//     setDraft((d) => ({
//       ...d,
//       education: d.education.filter((_, i) => i !== index),
//     }));

//   const setEducationField = (index, field, val) =>
//     setDraft((d) => {
//       const ed = d.education.map((e, i) =>
//         i === index ? { ...e, [field]: val } : e
//       );
//       return { ...d, education: ed };
//     });

//   // --------------------------------
//   // Experience Handlers
//   // --------------------------------
//   const addExperience = () =>
//     setDraft((d) => ({
//       ...d,
//       experience: [
//         ...d.experience,
//         { company: "", position: "", startDate: "", endDate: "", description: "" },
//       ],
//     }));

//   const removeExperience = (index) =>
//     setDraft((d) => ({
//       ...d,
//       experience: d.experience.filter((_, i) => i !== index),
//     }));

//   const setExperienceField = (index, field, val) =>
//     setDraft((d) => {
//       const ex = d.experience.map((e, i) =>
//         i === index ? { ...e, [field]: val } : e
//       );
//       return { ...d, experience: ex };
//     });

//   // -----------------------------
//   // Skills
//   // -----------------------------
//   const addSkill = (skill) =>
//     setDraft((d) => ({ ...d, skills: [...d.skills, skill] }));

//   const removeSkill = (i) =>
//     setDraft((d) => ({
//       ...d,
//       skills: d.skills.filter((_, idx) => idx !== i),
//     }));

//   // ------------------------------------
//   // PROJECTS
//   // ------------------------------------
//   const addProject = () =>
//     setDraft((d) => ({
//       ...d,
//       projects: [...d.projects, { name: "", tech: "", description: "" }],
//     }));

//   const setProjectField = (i, field, val) =>
//     setDraft((d) => {
//       const list = d.projects.map((p, idx) =>
//         idx === i ? { ...p, [field]: val } : p
//       );
//       return { ...d, projects: list };
//     });

//   const removeProject = (i) =>
//     setDraft((d) => ({
//       ...d,
//       projects: d.projects.filter((_, idx) => idx !== i),
//     }));

//   // ------------------------------------
//   // ACHIEVEMENTS
//   // ------------------------------------
//   const addAchievement = () =>
//     setDraft((d) => ({
//       ...d,
//       achievements: [...d.achievements, { title: "", description: "" }],
//     }));

//   const setAchievementField = (i, field, val) =>
//     setDraft((d) => {
//       const list = d.achievements.map((a, idx) =>
//         idx === i ? { ...a, [field]: val } : a
//       );
//       return { ...d, achievements: list };
//     });

//   const removeAchievement = (i) =>
//     setDraft((d) => ({
//       ...d,
//       achievements: d.achievements.filter((_, idx) => idx !== i),
//     }));

//   // ------------------------------------
//   // CERTIFICATIONS
//   // ------------------------------------
//   const addCert = () =>
//     setDraft((d) => ({
//       ...d,
//       certifications: [...d.certifications, { name: "", issuer: "", year: "" }],
//     }));

//   const setCertField = (i, field, val) =>
//     setDraft((d) => {
//       const list = d.certifications.map((c, idx) =>
//         idx === i ? { ...c, [field]: val } : c
//       );
//       return { ...d, certifications: list };
//     });

//   const removeCert = (i) =>
//     setDraft((d) => ({
//       ...d,
//       certifications: d.certifications.filter((_, idx) => idx !== i),
//     }));

//   // ------------------------------------
//   // Animated Stepper
//   // ------------------------------------
//   const Stepper = (
//     <div className="flex gap-6 border-b border-gray-200 pb-1 overflow-x-auto">
//       {STEPS.map((label, i) => (
//         <button
//           key={label}
//           onClick={() => setActiveStep(i)}
//           className={`relative pb-2 text-sm font-medium transition-all duration-300
//             ${
//               activeStep === i
//                 ? "text-indigo-600"
//                 : "text-gray-600 hover:text-gray-800"
//             }`}
//         >
//           {label}
//           <span
//             className={`absolute left-0 bottom-0 h-[3px] rounded-full transition-all duration-300
//               ${
//                 activeStep === i
//                   ? "bg-indigo-600 w-full"
//                   : "bg-transparent w-0"
//               }`}
//           />
//         </button>
//       ))}
//     </div>
//   );

//   // -------------------------------
//   //
//   // FORMS START HERE
//   //
//   // -------------------------------

//   const PersonalForm = (
//     <div className="space-y-3">
//       <div>
//         <label className="block text-xs text-gray-600">Resume title</label>
//         <input
//           className="w-full border px-3 py-2 rounded-md"
//           value={draft.title}
//           onChange={(e) =>
//             setDraft((d) => ({ ...d, title: e.target.value }))
//           }
//         />
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//         <div>
//           <label className="block text-xs text-gray-600">Full name</label>
//           <input
//             className="w-full border px-3 py-2 rounded-md"
//             value={draft.personal.name}
//             onChange={(e) => setPersonal("name", e.target.value)}
//           />
//           {errors.name && (
//             <p className="text-xs text-red-600 mt-1">{errors.name}</p>
//           )}
//         </div>

//         <div>
//           <label className="block text-xs text-gray-600">Email</label>
//           <input
//             className="w-full border px-3 py-2 rounded-md"
//             value={draft.personal.email}
//             onChange={(e) => setPersonal("email", e.target.value)}
//           />
//           {errors.email && (
//             <p className="text-xs text-red-600 mt-1">{errors.email}</p>
//           )}
//         </div>

//         <div>
//           <label className="block text-xs text-gray-600">Phone</label>
//           <input
//             className="w-full border px-3 py-2 rounded-md"
//             value={draft.personal.phone}
//             onChange={(e) => setPersonal("phone", e.target.value)}
//           />
//           {errors.phone && (
//             <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
//           )}
//         </div>
//       </div>

//       <div>
//         <label className="block text-xs text-gray-600">Location</label>
//         <input
//           className="w-full border px-3 py-2 rounded-md"
//           value={draft.personal.location}
//           onChange={(e) => setPersonal("location", e.target.value)}
//         />
//       </div>

//       <div>
//         <label className="block text-xs text-gray-600">Headline</label>
//         <input
//           className="w-full border px-3 py-2 rounded-md"
//           value={draft.personal.headline}
//           onChange={(e) => setPersonal("headline", e.target.value)}
//         />
//       </div>

//       <div>
//         <label className="block text-xs text-gray-600">Summary</label>
//         <textarea
//           rows={4}
//           className="w-full border px-3 py-2 rounded-md"
//           value={draft.personal.summary}
//           onChange={(e) => setPersonal("summary", e.target.value)}
//         />
//       </div>
//     </div>
//   );

//   const EducationForm = (
//     <div className="space-y-3">
//       {draft.education.map((edu, idx) => (
//         <div key={idx} className="border rounded-md p-3">
//           <div className="flex items-center justify-between mb-2">
//             <div className="text-sm font-medium">Education #{idx + 1}</div>

//             {draft.education.length > 1 && (
//               <button
//                 type="button"
//                 onClick={() => removeEducation(idx)}
//                 className="text-xs text-red-600"
//               >
//                 Remove
//               </button>
//             )}
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//             <input
//               placeholder="Institution"
//               className="border px-2 py-1 rounded"
//               value={edu.institution}
//               onChange={(e) =>
//                 setEducationField(idx, "institution", e.target.value)
//               }
//             />
//             {errors[`edu_inst_${idx}`] && (
//               <p className="text-xs text-red-600 mt-1 col-span-2">
//                 {errors[`edu_inst_${idx}`]}
//               </p>
//             )}

//             <input
//               placeholder="Degree"
//               className="border px-2 py-1 rounded"
//               value={edu.degree}
//               onChange={(e) =>
//                 setEducationField(idx, "degree", e.target.value)
//               }
//             />
//             {errors[`edu_deg_${idx}`] && (
//               <p className="text-xs text-red-600 mt-1 col-span-2">
//                 {errors[`edu_deg_${idx}`]}
//               </p>
//             )}

//             <input
//               placeholder="Start year"
//               className="border px-2 py-1 rounded"
//               value={edu.startYear}
//               onChange={(e) =>
//                 setEducationField(idx, "startYear", e.target.value)
//               }
//             />

//             <input
//               placeholder="End year"
//               className="border px-2 py-1 rounded"
//               value={edu.endYear}
//               onChange={(e) =>
//                 setEducationField(idx, "endYear", e.target.value)
//               }
//             />

//             <textarea
//               placeholder="Details (optional)"
//               className="border px-2 py-1 rounded col-span-2"
//               value={edu.details}
//               onChange={(e) =>
//                 setEducationField(idx, "details", e.target.value)
//               }
//             />
//           </div>
//         </div>
//       ))}

//       <button
//         type="button"
//         onClick={addEducation}
//         className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm"
//       >
//         + Add Education
//       </button>
//     </div>
//   );
//   // -------------------------------
//   // Experience Form
//   // -------------------------------
//   const ExperienceForm = (
//     <div className="space-y-3">
//       {draft.experience.map((exp, idx) => (
//         <div key={idx} className="border rounded-md p-3">
//           <div className="flex items-center justify-between mb-2">
//             <div className="text-sm font-medium">Experience #{idx + 1}</div>

//             {draft.experience.length > 1 && (
//               <button
//                 type="button"
//                 onClick={() => removeExperience(idx)}
//                 className="text-xs text-red-600"
//               >
//                 Remove
//               </button>
//             )}
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//             <input
//               placeholder="Company"
//               className="border px-2 py-1 rounded"
//               value={exp.company}
//               onChange={(e) => setExperienceField(idx, "company", e.target.value)}
//             />
//             {errors[`exp_comp_${idx}`] && (
//               <p className="text-xs text-red-600 mt-1 col-span-2">
//                 {errors[`exp_comp_${idx}`]}
//               </p>
//             )}

//             <input
//               placeholder="Position"
//               className="border px-2 py-1 rounded"
//               value={exp.position}
//               onChange={(e) => setExperienceField(idx, "position", e.target.value)}
//             />
//             {errors[`exp_pos_${idx}`] && (
//               <p className="text-xs text-red-600 mt-1 col-span-2">
//                 {errors[`exp_pos_${idx}`]}
//               </p>
//             )}

//             <input
//               placeholder="Start date"
//               className="border px-2 py-1 rounded"
//               value={exp.startDate}
//               onChange={(e) => setExperienceField(idx, "startDate", e.target.value)}
//             />

//             <input
//               placeholder="End date"
//               className="border px-2 py-1 rounded"
//               value={exp.endDate}
//               onChange={(e) => setExperienceField(idx, "endDate", e.target.value)}
//             />

//             <textarea
//               placeholder="Description"
//               className="border px-2 py-1 rounded col-span-2"
//               value={exp.description}
//               onChange={(e) => setExperienceField(idx, "description", e.target.value)}
//             />
//           </div>
//         </div>
//       ))}

//       <button
//         type="button"
//         onClick={addExperience}
//         className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm"
//       >
//         + Add Experience
//       </button>
//     </div>
//   );

//   // -------------------------------
//   // Skills Editor (small subcomponent)
//   // -------------------------------
//   function SkillsEditor({ skillsList, onAdd, onRemove }) {
//     const [input, setInput] = useState("");

//     const handleAdd = () => {
//       const v = input.trim();
//       if (!v) return;
//       onAdd(v);
//       setInput("");
//     };

//     return (
//       <div>
//         <div className="flex gap-2 mb-3">
//           <input
//             placeholder="Add skill and press Enter"
//             className="flex-1 border px-3 py-2 rounded-md"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") {
//                 e.preventDefault();
//                 handleAdd();
//               }
//             }}
//           />
//           <button
//             onClick={handleAdd}
//             type="button"
//             className="px-3 py-2 bg-indigo-600 text-white rounded-md"
//           >
//             Add
//           </button>
//         </div>

//         <div className="flex flex-wrap gap-2">
//           {(skillsList || []).map((s, i) => (
//             <div key={i} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
//               <div className="text-sm">{s}</div>
//               <button type="button" onClick={() => onRemove(i)} className="text-xs text-red-600">x</button>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   const SkillsForm = (
//     <div className="space-y-3">
//       <SkillsEditor skillsList={draft.skills} onAdd={addSkill} onRemove={removeSkill} />
//       <div className="text-xs text-gray-500 mt-2">Tip: Add keywords relevant to the job you want (e.g., React, Node.js, SQL).</div>
//     </div>
//   );

//   // -------------------------------
//   // Links Form
//   // -------------------------------
//   const LinksForm = (
//     <div className="space-y-3">
//       <div>
//         <label className="block text-xs text-gray-600">LinkedIn</label>
//         <input
//           className="w-full border px-3 py-2 rounded-md"
//           value={draft.links.linkedin}
//           onChange={(e) => setLink("linkedin", e.target.value)}
//           placeholder="https://linkedin.com/in/username"
//         />
//       </div>

//       <div>
//         <label className="block text-xs text-gray-600">GitHub</label>
//         <input
//           className="w-full border px-3 py-2 rounded-md"
//           value={draft.links.github}
//           onChange={(e) => setLink("github", e.target.value)}
//           placeholder="https://github.com/username"
//         />
//       </div>

//       <div>
//         <label className="block text-xs text-gray-600">Website / Portfolio</label>
//         <input
//           className="w-full border px-3 py-2 rounded-md"
//           value={draft.links.website}
//           onChange={(e) => setLink("website", e.target.value)}
//           placeholder="https://example.com"
//         />
//       </div>
//     </div>
//   );

//   // -------------------------------
//   // Projects Form
//   // -------------------------------
//   const ProjectsForm = (
//     <div className="space-y-3">
//       {draft.projects.map((p, idx) => (
//         <div key={idx} className="border rounded-md p-3">
//           <div className="flex items-center justify-between mb-2">
//             <div className="text-sm font-medium">Project #{idx + 1}</div>
//             {draft.projects.length > 1 && (
//               <button type="button" onClick={() => removeProject(idx)} className="text-xs text-red-600">Remove</button>
//             )}
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//             <input
//               placeholder="Project name"
//               className="border px-2 py-1 rounded"
//               value={p.name}
//               onChange={(e) => setProjectField(idx, "name", e.target.value)}
//             />
//             {errors[`proj_name_${idx}`] && (
//               <p className="text-xs text-red-600 mt-1 col-span-2">
//                 {errors[`proj_name_${idx}`]}
//               </p>
//             )}

//             <input
//               placeholder="Technologies (comma separated)"
//               className="border px-2 py-1 rounded"
//               value={p.tech}
//               onChange={(e) => setProjectField(idx, "tech", e.target.value)}
//             />

//             <textarea
//               placeholder="Short description"
//               className="border px-2 py-1 rounded col-span-1 sm:col-span-2"
//               value={p.description}
//               onChange={(e) => setProjectField(idx, "description", e.target.value)}
//             />
//           </div>
//         </div>
//       ))}

//       <button type="button" onClick={addProject} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm">+ Add Project</button>
//     </div>
//   );

//   // -------------------------------
//   // Achievements Form
//   // -------------------------------
//   const AchievementsForm = (
//     <div className="space-y-3">
//       {draft.achievements.map((a, idx) => (
//         <div key={idx} className="border rounded-md p-3">
//           <div className="flex items-center justify-between mb-2">
//             <div className="text-sm font-medium">Achievement #{idx + 1}</div>
//             {draft.achievements.length > 1 && (
//               <button type="button" onClick={() => removeAchievement(idx)} className="text-xs text-red-600">Remove</button>
//             )}
//           </div>

//           <div className="grid grid-cols-1 gap-2">
//             <input
//               placeholder="Title"
//               className="border px-2 py-1 rounded"
//               value={a.title}
//               onChange={(e) => setAchievementField(idx, "title", e.target.value)}
//             />
//             {errors[`ach_title_${idx}`] && (
//               <p className="text-xs text-red-600 mt-1">{errors[`ach_title_${idx}`]}</p>
//             )}

//             <textarea
//               placeholder="Description (optional)"
//               className="border px-2 py-1 rounded"
//               value={a.description}
//               onChange={(e) => setAchievementField(idx, "description", e.target.value)}
//             />
//           </div>
//         </div>
//       ))}

//       <button type="button" onClick={addAchievement} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm">+ Add Achievement</button>
//     </div>
//   );

//   // -------------------------------
//   // Certifications Form
//   // -------------------------------
//   const CertificationsForm = (
//     <div className="space-y-3">
//       {draft.certifications.map((c, idx) => (
//         <div key={idx} className="border rounded-md p-3">
//           <div className="flex items-center justify-between mb-2">
//             <div className="text-sm font-medium">Certification #{idx + 1}</div>
//             {draft.certifications.length > 1 && (
//               <button type="button" onClick={() => removeCert(idx)} className="text-xs text-red-600">Remove</button>
//             )}
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
//             <input
//               placeholder="Certification name"
//               className="border px-2 py-1 rounded"
//               value={c.name}
//               onChange={(e) => setCertField(idx, "name", e.target.value)}
//             />
//             {errors[`cert_name_${idx}`] && (
//               <p className="text-xs text-red-600 mt-1 col-span-3">{errors[`cert_name_${idx}`]}</p>
//             )}

//             <input
//               placeholder="Issuer"
//               className="border px-2 py-1 rounded"
//               value={c.issuer}
//               onChange={(e) => setCertField(idx, "issuer", e.target.value)}
//             />

//             <input
//               placeholder="Year"
//               className="border px-2 py-1 rounded"
//               value={c.year}
//               onChange={(e) => setCertField(idx, "year", e.target.value)}
//             />
//           </div>
//         </div>
//       ))}

//       <button type="button" onClick={addCert} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm">+ Add Certification</button>
//     </div>
//   );

//   // -------------------------------
//   // Render active form helper
//   // -------------------------------
//   const renderActiveForm = () => {
//     switch (activeStep) {
//       case 0:
//         return PersonalForm;
//       case 1:
//         return EducationForm;
//       case 2:
//         return ExperienceForm;
//       case 3:
//         return SkillsForm;
//       case 4:
//         return LinksForm;
//       case 5:
//         return ProjectsForm;
//       case 6:
//         return AchievementsForm;
//       case 7:
//         return CertificationsForm;
//       default:
//         return null;
//     }
//   };
//   // ------------------------------------------
//   // SAVE STEP (copy draft → savedData)
//   // ------------------------------------------
//   const handleSaveStep = () => {
//     setSavedData((prev) => {
//       const clone = JSON.parse(JSON.stringify(prev));

//       switch (activeStep) {
//         case 0:
//           clone.personal = { ...draft.personal };
//           clone.title = draft.title;
//           break;
//         case 1:
//           clone.education = [...draft.education];
//           break;
//         case 2:
//           clone.experience = [...draft.experience];
//           break;
//         case 3:
//           clone.skills = [...draft.skills];
//           break;
//         case 4:
//           clone.links = { ...draft.links };
//           break;
//         case 5:
//           clone.projects = [...draft.projects];
//           break;
//         case 6:
//           clone.achievements = [...draft.achievements];
//           break;
//         case 7:
//           clone.certifications = [...draft.certifications];
//           break;
//         default:
//           break;
//       }

//       return clone;
//     });

//     setMessage("Saved current section to preview.");
//     setTimeout(() => setMessage(""), 2000);
//   };

//   // ------------------------------------------
//   // CREATE RESUME (POST TO SERVER)
//   // ------------------------------------------
//   const handleCreateResume = async () => {
//     if (!validateStep()) return;

//     setLoadingCreate(true);

//     const payloadData = {
//       title: draft.title || draft.personal.name || "New Resume",
//       studentId: user?._id || null,
//       structuredData: {
//         personal: draft.personal,
//         education: draft.education,
//         experience: draft.experience,
//         skills: draft.skills,
//         links: draft.links,
//         projects: draft.projects,
//         achievements: draft.achievements,
//         certifications: draft.certifications,
//       },
//     };

//     try {
//       setSavedData(JSON.parse(JSON.stringify(draft)));

//       const res = await axios
//         .post("/api/resumes/create", payloadData)
//         .catch((err) => {
//           console.warn("Create endpoint not available:", err?.message);
//           return { data: { resume: payloadData } };
//         });

//       setMessage("Resume created successfully!");

//       if (onCreateSuccess) onCreateSuccess(res?.data?.resume || payloadData);
//     } catch (err) {
//       console.error("Error creating resume:", err);
//       setMessage("Failed to create resume.");
//     } finally {
//       setLoadingCreate(false);
//       setTimeout(() => setMessage(""), 2600);
//     }
//   };

//   // ------------------------------------------
//   // DOWNLOAD PREVIEW
//   // ------------------------------------------
//   const handleDownload = () => {
//     const previewHtml = previewRef.current?.innerHTML;
//     if (!previewHtml) {
//       setMessage(
//         "Nothing saved to preview yet. Click 'Save Step' before downloading."
//       );
//       return;
//     }

//     const win = window.open("", "_blank", "width=900,height=700");
//     win.document.open();
//     win.document.write(`
//       <html>
//         <head>
//           <title>${savedData.personal?.name || "Resume"}</title>
//           <style>
//             body { font-family: Arial; padding: 22px; }
//             h4 { margin: 10px 0 6px; }
//             .chip { padding:4px 8px; background:#eef2ff; border-radius:12px; }
//           </style>
//         </head>
//         <body>
//           ${previewHtml}
//           <hr />
//           <div style="text-align:center; font-size:11px; color:#777;">
//             Generated by Talentsync
//           </div>
//         </body>
//       </html>
//     `);
//     win.document.close();
//     setTimeout(() => win.print(), 300);
//   };

//   // ------------------------------------------
//   // PREVIEW COMPONENT
//   // ------------------------------------------
//   const Preview = () => {
//     const p = savedData.personal;
//     return (
//       <div ref={previewRef} className="p-4">
//         <div className="flex items-start justify-between">
//           <div>
//             <div className="text-xl font-bold">{p.name || "Your Name"}</div>
//             <div className="text-sm text-gray-600">{p.headline}</div>
//             <div className="text-xs text-gray-500 mt-1">
//               {p.location} {p.email && "•"} {p.email}{" "}
//               {p.phone && "•"} {p.phone}
//             </div>
//           </div>

//           <img
//             src={user?.avatarUrl || sampleAvatar}
//             alt="avatar"
//             className="w-16 h-16 rounded-md border object-cover"
//           />
//         </div>

//         {p.summary && (
//           <div className="mt-4">
//             <h4 className="font-medium">Summary</h4>
//             <p className="text-sm">{p.summary}</p>
//           </div>
//         )}

//         {savedData.experience?.length > 0 && (
//           <div className="mt-4">
//             <h4 className="font-medium">Experience</h4>
//             <div className="text-sm mt-2 space-y-2">
//               {savedData.experience.map((ex, i) => (
//                 <div key={i}>
//                   <div className="font-semibold">
//                     {ex.position} •{" "}
//                     <span className="text-gray-600">{ex.company}</span>
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     {ex.startDate} — {ex.endDate}
//                   </div>
//                   {ex.description && <p>{ex.description}</p>}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {savedData.education?.length > 0 && (
//           <div className="mt-4">
//             <h4 className="font-medium">Education</h4>
//             <div className="text-sm mt-2 space-y-2">
//               {savedData.education.map((ed, i) => (
//                 <div key={i}>
//                   <div className="font-semibold">
//                     {ed.degree} •{" "}
//                     <span className="text-gray-600">{ed.institution}</span>
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     {ed.startYear} — {ed.endYear}
//                   </div>
//                   {ed.details && <p>{ed.details}</p>}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {savedData.projects?.length > 0 && (
//           <div className="mt-4">
//             <h4 className="font-medium">Projects</h4>
//             <div className="text-sm mt-2 space-y-2">
//               {savedData.projects.map((p, i) => (
//                 <div key={i}>
//                   <div className="font-semibold">{p.name}</div>
//                   {p.tech && (
//                     <div className="text-xs text-gray-600">
//                       Tech: {p.tech}
//                     </div>
//                   )}
//                   {p.description && <p>{p.description}</p>}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {savedData.achievements?.length > 0 && (
//           <div className="mt-4">
//             <h4 className="font-medium">Achievements</h4>
//             <div className="text-sm mt-2 space-y-2">
//               {savedData.achievements.map((a, i) => (
//                 <div key={i}>
//                   <div className="font-semibold">{a.title}</div>
//                   {a.description && <p>{a.description}</p>}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {savedData.certifications?.length > 0 && (
//           <div className="mt-4">
//             <h4 className="font-medium">Certifications</h4>
//             <div className="text-sm mt-2 space-y-2">
//               {savedData.certifications.map((c, i) => (
//                 <div key={i}>
//                   <div className="font-semibold">{c.name}</div>
//                   <div className="text-xs text-gray-600">{c.issuer}</div>
//                   <div className="text-xs text-gray-500">{c.year}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {savedData.skills?.length > 0 && (
//           <div className="mt-4">
//             <h4 className="font-medium">Skills</h4>
//             <div className="mt-1 flex flex-wrap gap-2">
//               {savedData.skills.map((s, i) => (
//                 <span
//                   key={i}
//                   className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs"
//                 >
//                   {s}
//                 </span>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // ------------------------------------------
//   // FINAL RETURN JSX
//   // ------------------------------------------
//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       {/* Stepper */}
//       {Stepper}

//       {/* Form container */}
//       <div className="bg-white border rounded-md p-4 shadow-sm">
//         <div className="mb-4 text-sm text-gray-600">
//           Editing: <span className="font-medium">{STEPS[activeStep]}</span>
//         </div>

//         <div className="mb-4">{renderActiveForm()}</div>

//         <div className="flex items-center gap-3">
//           {/* Back */}
//           <button
//             type="button"
//             onClick={() =>
//               setActiveStep((s) => Math.max(0, s - 1))
//             }
//             className="px-3 py-2 bg-white border rounded-md text-sm"
//           >
//             Back
//           </button>

//           {/* Next or Create */}
//           {activeStep < STEPS.length - 1 ? (
//             <button
//               type="button"
//               onClick={handleNext}
//               className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm"
//             >
//               Next
//             </button>
//           ) : (
//             <button
//               type="button"
//               disabled={loadingCreate}
//               onClick={handleCreateResume}
//               className="px-3 py-2 bg-green-600 text-white rounded-md text-sm"
//             >
//               {loadingCreate ? "Creating..." : "Create Resume"}
//             </button>
//           )}

//           {/* Save Step */}
//           <button
//             type="button"
//             onClick={handleSaveStep}
//             className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md text-sm border"
//           >
//             Save Step
//           </button>

//           {/* Download Preview */}
//           <button
//             type="button"
//             onClick={handleDownload}
//             className="ml-auto px-3 py-2 bg-gray-800 text-white rounded-md text-sm"
//           >
//             Download Preview
//           </button>
//         </div>

//         {message && <div className="mt-3 text-sm text-gray-600">{message}</div>}
//       </div>

//       {/* Preview Area */}
//       <div className="bg-white border rounded-md p-4 shadow-sm">
//         <div className="flex items-center justify-between mb-3">
//           <div className="text-sm font-semibold">Live Preview</div>
//           <div className="text-xs text-gray-500">
//             Save step to update preview
//           </div>
//         </div>
//         <Preview />
//       </div>
//     </div>
//   );
// };

// export default ResumeCreator;





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
