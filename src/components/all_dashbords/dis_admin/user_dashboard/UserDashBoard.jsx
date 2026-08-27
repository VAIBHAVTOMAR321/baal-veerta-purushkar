import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import UserTopNav from "./UserTopNav";
import UserLeftNav from "./UserLeftNav";
import "../../../child_regis/NominationForm/NominationForm.css";
import StepB from "../../../child_regis/NominationForm/StepB";
import StepF from "../../../child_regis/NominationForm/StepF";
import StepE from "../../../child_regis/NominationForm/StepE";
import StepD from "../../../child_regis/NominationForm/StepD";
import StepC from "../../../child_regis/NominationForm/StepC";
import PreviewModal from "../../../child_regis/NominationForm/PreviewModal";

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
  const [showPreview, setShowPreview] = useState(false);
  const [topAccepted, setTopAccepted] = useState(false);
  const [isApplicationCompleted, setIsApplicationCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [maxStep, setMaxStep] = useState(0);
  const stepBCheckedRef = useRef(false);
  const stepCCheckedRef = useRef(false);
  const [stepCSubmitTrigger, setStepCSubmitTrigger] = useState(0);
  const stepECheckedRef = useRef(false);
  const [stepESubmitTrigger, setStepESubmitTrigger] = useState(0);
  const stepDCheckedRef = useRef(false);
  const [stepDSubmitTrigger, setStepDSubmitTrigger] = useState(0);

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

  //  Mark a step as completed
  const markStepCompleted = useCallback((stepIndex) => {
    setCompletedSteps((prev) => prev.includes(stepIndex) ? prev : [...prev, stepIndex]);
  }, []);

  useEffect(() => {
    setMaxStep((prev) => Math.max(prev, step));
  }, [step]);

  //  Check if a step is completed
  const isStepCompleted = useCallback((stepIndex) => {
    return completedSteps.includes(stepIndex);
  }, [completedSteps]);

  //  Navigate to a completed or previously visited step
  const goToStep = useCallback((stepIndex) => {
    if (isApplicationCompleted) return;
    if (isStepCompleted(stepIndex) || stepIndex <= maxStep) {
      setStep(stepIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isStepCompleted, maxStep, isApplicationCompleted]);

  const update = useCallback((event) => {
    const { name, value, type, checked, files } = event.target;
    setData((current) => {
      const nextData = {
        ...current,
        [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
      };
      setErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        Object.keys(nextErrors)
          .filter((key) => key.startsWith("rescuedPeople.") || key.startsWith("witnesses."))
          .forEach((key) => delete nextErrors[key]);
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
    if (isApplicationCompleted) return;
    if (step === 3) {
      setStepDSubmitTrigger((current) => current + 1);
      return;
    }
    if (validate(step)) {
      setStep((current) => Math.min(current + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const previous = () => {
    if (isApplicationCompleted) return;
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

  const preview = () => setShowPreview(true);
  const closePreview = () => setShowPreview(false);

  const finalSubmit = () => {
    if (
      data.declarationAccepted &&
      data.parentDeclarationAccepted &&
      data.declarationDocument &&
      data.parentDeclarationDocument &&
      topAccepted
    )
      setNotice("आवेदन सफलतापूर्वक प्रस्तुत किया गया है।");
  };

  const canSubmit = Boolean(
    data.declarationAccepted &&
      data.parentDeclarationAccepted &&
      data.declarationDocument &&
      data.parentDeclarationDocument &&
      topAccepted
  );

  //  Handle Step B completion (after POST success)
  const handleStepBNext = (result) => {
    stepBCheckedRef.current = true;
    markStepCompleted(0);
    setNotice("Step 1 सफलतापूर्वक सबमिट हो गया!");
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  //  Handle Step B already completed (auto-skip to Step C)
  const handleStepBAlreadyCompleted = (record) => {
    console.log("Step B already completed, auto-skipping to Step C:", record);
    stepBCheckedRef.current = true;
    markStepCompleted(0);
    setNotice("Step 1 पहले ही पूरा हो चुका है, Step 2 पर जा रहे हैं...");
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepCSubmitSuccess = () => {
    stepCCheckedRef.current = true;
    markStepCompleted(1);
    setNotice("Step 2 सफलतापूर्वक सबमिट हो गया!");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepCAlreadyCompleted = () => {
    stepCCheckedRef.current = true;
    markStepCompleted(1);
    setNotice("Step 2 पहले ही सबमिट हो चुका है, Step 3 पर जा रहे हैं...");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepESubmitSuccess = () => {
    stepECheckedRef.current = true;
    markStepCompleted(2);
    setNotice("Step 3 सफलतापूर्वक सबमिट हो गया!");
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepEAlreadyCompleted = () => {
    stepECheckedRef.current = true;
    markStepCompleted(2);
    setNotice("Step 3 पहले ही सबमिट हो चुका है, Step 4 पर जा रहे हैं...");
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepDSubmitSuccess = () => {
    stepDCheckedRef.current = true;
    markStepCompleted(3);
    setNotice("Step 4 सफलतापूर्वक सबमिट हो गया!");
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepDAlreadyCompleted = (record) => {
    console.log("Step D already completed, auto-skipping to Step 5:", record);
    stepDCheckedRef.current = true;
    markStepCompleted(3);
    setNotice("Step 4 पहले ही पूरा हो चुका है, Step 5 पर जा रहे हैं...");
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplicationCompleted = () => {
    setIsApplicationCompleted(true);
    markStepCompleted(4);
  };

  const component = [
    <StepB
      key="step-b"
      data={data}
      update={update}
      error={errors}
      onNext={handleStepBNext}
      onCompleted={handleStepBAlreadyCompleted}
      isStepBChecked={stepBCheckedRef.current}
    />,
    <StepC
      key="step-c"
      data={data}
      update={update}
      error={errors}
      onSubmitSuccess={handleStepCSubmitSuccess}
      onCompleted={handleStepCAlreadyCompleted}
      isStepCChecked={stepCCheckedRef.current}
      externalSubmitTrigger={stepCSubmitTrigger}
    />,
    <StepE
      key="step-e"
      data={data}
      update={update}
      onSubmitSuccess={handleStepESubmitSuccess}
      onCompleted={handleStepEAlreadyCompleted}
      isStepEChecked={stepECheckedRef.current}
      externalSubmitTrigger={stepESubmitTrigger}
    />,
    <StepD
      key="step-d"
      data={data}
      update={update}
      error={errors}
      onSubmitSuccess={handleStepDSubmitSuccess}
      onCompleted={handleStepDAlreadyCompleted}
      isStepDChecked={stepDCheckedRef.current}
      externalSubmitTrigger={stepDSubmitTrigger}
    />,
    <StepF
      key="step-f"
      data={data}
      update={update}
      onSave={saveDraft}
      onPreview={preview}
      onSubmit={finalSubmit}
      canSubmit={canSubmit}
      topAccepted={topAccepted}
      onApplicationCompleted={handleApplicationCompleted}
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

          {/* ── Stepper (with clickable completed steps) ── */}
          <nav className="nf-stepper" aria-label="Application steps">
             {steps.map((label, index) => {
              const completed = isStepCompleted(index);
              const isCurrent = index === step;
              const clickable = !isApplicationCompleted && (completed || index <= maxStep);

              return (
                <div
                  className={`nf-step ${isCurrent ? "current" : ""} ${completed ? "complete" : ""} ${
                    clickable ? "clickable" : ""
                  }`}
                  key={label}
                  role={clickable ? "button" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  aria-label={
                    clickable
                      ? `Step ${index + 1}${completed ? " - पूर्ण" : index <= maxStep ? " - देखें" : ""}, क्लिक करें`
                      : `Step ${index + 1}${completed ? " - पूर्ण" : ""}${isCurrent ? " - वर्तमान" : ""}`
                  }
                  onClick={() => goToStep(index)}
                  onKeyDown={(e) => {
                    if (clickable && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      goToStep(index);
                    }
                  }}
                  style={clickable ? { cursor: "pointer" } : undefined}
                >
                  <span className="nf-step-number">
                    {completed && !isCurrent ? "✓" : index + 1}
                  </span>
                  <strong>Step {index + 1}</strong>
                  <small>{label}</small>
                </div>
              );
            })}
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
                  fontSize: "16px",
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
              if (step !== 0) {
                if (step === 1) setStepCSubmitTrigger((current) => current + 1);
                else if (step === 2) setStepESubmitTrigger((current) => current + 1);
                else next();
              }
            }}
            noValidate
          >
            <fieldset
              disabled={isApplicationCompleted && step !== 4}
              style={{ border: 0, padding: 0, margin: 0 }}
            >
              {component}
            </fieldset>

            {step !== 0 && (
              <div className="nf-navigation">
                {step > 0 && !isApplicationCompleted && (
                  <button
                    type="button"
                    className="nf-secondary"
                    onClick={previous}
                    disabled={isApplicationCompleted}
                  >
                    ← Previous / पिछला
                  </button>
                )}
                {step < 4 && !isApplicationCompleted && (
                  <button type="submit" className="nf-primary">
                    Next / आगे बढ़ें →
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
      {showPreview && (
        <PreviewModal
          data={data}
          onClose={closePreview}
          topAccepted={topAccepted}
          onTopAcceptedChange={setTopAccepted}
        />
      )}
    </div>
  );
};

export default UserDashBoard;