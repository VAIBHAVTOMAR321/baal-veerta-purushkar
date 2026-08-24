import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import UserTopNav from "./UserTopNav";
import UserLeftNav from "./UserLeftNav";
import "../../../child_regis/NominationForm/NominationForm.css";
import StepB from "../../../child_regis/NominationForm/StepB";
import StepF from "../../../child_regis/NominationForm/StepF";
import StepE from "../../../child_regis/NominationForm/StepE";
import StepD from "../../../child_regis/NominationForm/StepD";
import StepC from "../../../child_regis/NominationForm/StepC";

const steps = ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"];
const requiredByStep = {
  0: [
    "childName", "fatherName", "motherName", "birthDate",
    "gender", "resident",
    "permanentग्राम/मोहल्ला", "permanentडाकघर",
    "permanentविकासखण्ड/नगर निकाय", "permanentजनपद", "permanentपिन कोड",
  ],
  1: [
    "actTitle", "actDate", "actPlace", "actDistrict",
    "actNature", "shortDescription", "detailedDescription", "firRegistered", "mediaPublished",
  ],
};

const getTableErrors = (formData) => {
  const nextErrors = {};
  const validateRows = (rows, group, fields) => {
    (rows || []).forEach((row, index) => {
      if (fields.some((field) => String(row?.[field] || "").trim())) {
        fields.forEach((field) => {
          if (!String(row?.[field] || "").trim()) nextErrors[`${group}.${index}.${field}`] = "यह फ़ील्ड आवश्यक है";
        });
      }
    });
  };
  validateRows(formData.rescuedDetails?.people, "rescuedPeople", ["name", "age", "relation"]);
  validateRows(formData.witnesses, "witnesses", ["name", "mobile", "address", "relation"]);
  return nextErrors;
};

const UserDashBoard = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    ...(state?.nominator || {}),
    applicationNumber: "System Generated",
    submissionDate: "System Generated",
    district: state?.nominator?.address?.जनपद || "",
  });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      if (width < 768) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const update = useCallback((event) => {
    const { name, value, type, checked, files } = event.target;
    setData((current) => {
      const nextData = {
        ...current,
        [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
      };
      setErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        Object.keys(nextErrors).filter((key) => key.startsWith("rescuedPeople.") || key.startsWith("witnesses.")).forEach((key) => delete nextErrors[key]);
        delete nextErrors[name];
        return { ...nextErrors, ...getTableErrors(nextData) };
      });
      return nextData;
    });
  }, []);

  const validate = (targetStep) => {
    const nextErrors = {};
    (requiredByStep[targetStep] || []).forEach((field) => {
      if (!String(data[field] || "").trim())
        nextErrors[field] = "यह फ़ील्ड आवश्यक है";
    });
    if (targetStep === 1) {
      const validateRows = (rows, group, fields) => {
        (rows || []).forEach((row, index) => {
          if (fields.some((field) => String(row?.[field] || "").trim())) {
            fields.forEach((field) => {
              if (!String(row?.[field] || "").trim())
                nextErrors[`${group}.${index}.${field}`] = "यह फ़ील्ड आवश्यक है";
            });
          }
        });
      };
      validateRows(data.rescuedDetails?.people, "rescuedPeople", ["name", "age", "relation"]);
      validateRows(data.witnesses, "witnesses", ["name", "mobile", "address", "relation"]);
    }
    if (targetStep === 3)
      ["document0", "document1", "document2", "document3"].forEach((field) => {
        if (!data[field]) nextErrors[field] = "यह दस्तावेज़ अनिवार्य है";
      });
    setErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  };

  const next = () => {
    if (validate(step)) {
      setStep((current) => Math.min(current + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const previous = () => {
    setStep((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveDraft = () => {
    localStorage.setItem(
      "bal-veerata-nomination-draft",
      JSON.stringify({ ...data, savedAt: new Date().toISOString() })
    );
    setNotice("आवेदन ड्राफ्ट के रूप में सुरक्षित किया गया है।");
  };

  const preview = () => setNotice("Preview Application तैयार है।");

  const finalSubmit = () => {
    if (data.declarationAccepted && data.otpVerified)
      setNotice("आवेदन सफलतापूर्वक प्रस्तुत किया गया है।");
  };

  const canSubmit = Boolean(
    data.declarationAccepted &&
      data.otpVerified &&
      data["finalनाम"] &&
      data["finalस्थान"] &&
      data["finalदिनांक"] &&
      data["finalमोबाइल नंबर"]
  );

  // ✅ Handle Step B completion (after POST success)
  const handleStepBNext = (result) => {
    console.log("Step B completed:", result);
    setNotice("Step 1 सफलतापूर्वक सबमिट हो गया!");
    setStep(1); // Move to Step C
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Handle Step B already completed (auto-skip to Step C)
  const handleStepBAlreadyCompleted = (record) => {
    console.log("Step B already completed, auto-skipping to Step C:", record);
    setNotice("Step 1 पहले ही पूरा हो चुका है, Step 2 पर जा रहे हैं...");
    setStep(1); // Move to Step C
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const component = [
    <StepB
      key="step-b"
      data={data}
      update={update}
      error={errors}
      onNext={handleStepBNext}
      onCompleted={handleStepBAlreadyCompleted}
    />,
    <StepC key="step-c" data={data} update={update} error={errors} />,
    <StepE key="step-e" data={data} update={update} error={errors} />,
    <StepD key="step-d" data={data} update={update} error={errors} />,
    <StepF
      key="step-f"
      data={data}
      update={update}
      onSave={saveDraft}
      onPreview={preview}
      onSubmit={finalSubmit}
      canSubmit={canSubmit}
    />,
  ][step];

  return (
    <div className="dashboard-container">
      <UserLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <div className="main-content-dash">
        <UserTopNav toggleSidebar={toggleSidebar} />

        <div className="nf-wrapper">
          {/* ── Form Header ── */}
          <header className="nf-header">
            <div className="nf-brand-mark">
              उत्तराखण्ड<br />
              <small>सरकार</small>
            </div>
            <div className="nf-header-text">
              <p className="nf-kicker">ऑनलाइन नामांकन प्रपत्र</p>
              <h1>मुख्यमंत्री राज्य बाल वीरता पुरस्कार</h1>
              <p className="nf-subtitle">प्रथम स्क्रीन : नामांकनकर्ता का विवरण</p>
            </div>
          </header>

          {/* ── Stepper ── */}
          <nav className="nf-stepper" aria-label="Application steps">
            {steps.map((label, index) => (
              <div
                className={`nf-step ${
                  index === step ? "current" : ""
                } ${index < step ? "complete" : ""}`}
                key={label}
              >
                <span className="nf-step-number">
                  {index < step ? "✓" : index + 1}
                </span>
                <strong>Step {index + 1}</strong>
                <small>{label}</small>
              </div>
            ))}
          </nav>

          {/* ── Notice ── */}
          {notice && (
            <div className="nf-notice" role="status">
              {notice}
              <button
                type="button"
                onClick={() => setNotice("")}
                style={{
                  marginLeft: "12px",
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px"
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* ── Form Body ── */}
          <form
            className="nf-form-body"
            onSubmit={(event) => {
              event.preventDefault();
              // Only use default next for steps other than Step B (0)
              // Step B handles its own submission
              if (step !== 0) {
                next();
              }
            }}
            noValidate
          >
            {component}

            {/* ✅ Hide default navigation for Step B (it has its own button) */}
            {step !== 0 && (
              <div className="nf-navigation">
                {step > 0 && (
                  <button
                    type="button"
                    className="nf-secondary"
                    onClick={previous}
                  >
                    ← Previous / पिछला
                  </button>
                )}
                {step < 4 && (
                  <button type="submit" className="nf-primary">
                    Next / आगे बढ़ें →
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserDashBoard;