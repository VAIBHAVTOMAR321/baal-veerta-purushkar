import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StepB from "./StepB.jsx";
import StepC from "./StepC.jsx";
import StepD from "./StepD.jsx";
import StepE from "./StepE.jsx";
import StepF from "./StepF.jsx";
import "./NominationForm.css";

const steps = ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"];
const requiredByStep = {
   0: ["childName", "fatherName", "motherName", "birthDate", "ageYears", "ageMonths", "gender", "resident", "permanentग्राम/मोहल्ला", "permanentडाकघर", "permanentविकासखण्ड/नगर निकाय", "permanentजनपद", "permanentपिन कोड"],
   1: ["actTitle", "actDate", "actPlace", "actDistrict", "actNature", "shortDescription", "detailedDescription", "firRegistered", "mediaPublished"],
 };

const NominationForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ ...(state?.nominator || {}), applicationNumber: "System Generated", submissionDate: "System Generated", district: state?.nominator?.address?.जनपद || "" });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");

  const update = (event) => {
    const { name, value, type, checked, files } = event.target;
    setData((current) => ({ ...current, [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validate = (targetStep) => {
    const nextErrors = {};
    (requiredByStep[targetStep] || []).forEach((field) => { if (!String(data[field] || "").trim()) nextErrors[field] = "यह फ़ील्ड आवश्यक है"; });
    if (targetStep === 1) {
      const validateRows = (rows, group, fields) => {
        (rows || []).forEach((row, index) => {
          if (fields.some((field) => String(row?.[field] || "").trim())) {
            fields.forEach((field) => {
              if (!String(row?.[field] || "").trim()) nextErrors[`${group}.${index}.${field}`] = "यह फ़ील्ड आवश्यक है";
            });
          }
        });
      };
      validateRows(data.rescuedDetails?.people, "rescuedPeople", ["name", "age", "relation"]);
      validateRows(data.witnesses, "witnesses", ["name", "mobile", "address", "relation"]);
    }
    if (targetStep === 3) ["document0", "document1", "document2", "document3"].forEach((field) => { if (!data[field]) nextErrors[field] = "यह दस्तावेज़ अनिवार्य है"; });
    setErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  };

  const next = () => { if (validate(step)) { setStep((current) => Math.min(current + 1, steps.length - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  const previous = () => { setStep((current) => Math.max(current - 1, 0)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const saveDraft = () => { localStorage.setItem("bal-veerata-nomination-draft", JSON.stringify({ ...data, savedAt: new Date().toISOString() })); setNotice("आवेदन ड्राफ्ट के रूप में सुरक्षित किया गया है।"); };
  const preview = () => setNotice("Preview Application तैयार है।");
  const finalSubmit = () => { if (data.declarationAccepted && data.otpVerified) setNotice("आवेदन सफलतापूर्वक प्रस्तुत किया गया है।"); };
  const canSubmit = Boolean(data.declarationAccepted && data.otpVerified && data["finalनाम"] && data["finalस्थान"] && data["finalदिनांक"] && data["finalमोबाइल नंबर"]);
  const component = [<StepB data={data} update={update} error={errors} />, <StepC data={data} update={update} error={errors} />, <StepE data={data} update={update} error={errors} />, <StepD data={data} update={update} error={errors} />, <StepF data={data} update={update} onSave={saveDraft} onPreview={preview} onSubmit={finalSubmit} canSubmit={canSubmit} />][step];

  return <main className="nf-page"><header className="nf-header"><div className="nf-brand-mark">उत्तराखण्ड<br /><small>सरकार</small></div><div><p>ऑनलाइन नामांकन प्रपत्र</p><h1>मुख्यमंत्री राज्य बाल वीरता पुरस्कार</h1></div><button type="button" className="nf-back" onClick={() => navigate("/StudentRegistration")}>भाग–A</button></header><div className="nf-shell"><nav className="nf-stepper" aria-label="Application steps">{steps.map((label, index) => <div className={`nf-step ${index === step ? "current" : ""} ${index < step ? "complete" : ""}`} key={label}><span>{index < step ? "✓" : index + 1}</span><strong>Step {index + 1}</strong><small>{label}</small></div>)}</nav>{notice && <div className="nf-notice" role="status">{notice}</div>}<form onSubmit={(event) => { event.preventDefault(); if (step < 4) next(); }} noValidate>{component}<div className="nf-navigation">{step > 0 && <button type="button" className="nf-secondary" onClick={previous}>← Previous / पिछला</button>}{step < 4 && <button type="submit" className="nf-primary">Next / आगे बढ़ें →</button>}</div></form></div></main>;
};
export default NominationForm;