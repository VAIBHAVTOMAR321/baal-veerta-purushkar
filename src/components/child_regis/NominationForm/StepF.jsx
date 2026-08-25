import React, { useState, useEffect } from "react";
import { useAuth } from "../../login/AuthContext";

const declaration = "मैं/हम यह प्रमाणित करते हैं कि इस ऑनलाइन नामांकन प्रपत्र में मेरे/हमारे द्वारा उपलब्ध कराई गई समस्त जानकारी एवं संलग्न अभिलेख मेरे/हमारे ज्ञान एवं विश्वास के अनुसार सत्य एवं सही हैं। उपरोक्त आवेदन में मेरे/हमारे द्वारा कोई महत्वपूर्ण तथ्य छिपाया नहीं गया है। तथा मुख्यमंत्री राज्य बाल पुरुष्कार हेतु नामांकन योग्य है।";
const parentDeclaration = "मैं/हम इस बात से सहमत हूँ कि महिला सशक्तिकरण एवं बाल विकास विभाग, उत्तराखण्ड द्वारा उपलब्ध कराई गई जानकारी एवं संलग्न अभिलेखों का संबंधित जिला प्रशासन, पुलिस विभाग एवं अन्य सक्षम प्राधिकारी के माध्यम से सत्यापन कराया जा सकता है। मैं/हम यह भी सहमत हूँ कि गलत अथवा भ्रामक जानकारी पाए जाने की स्थिति में नामांकन निरस्त किया जा सकता है तथा नियमानुसार आवश्यक कार्यवाही की जा सकती है। पुरस्कार हेतु चयन की स्थिति में बच्चे के नाम, फोटो एवं वीरता की घटना से संबंधित विवरण का उपयोग विभाग द्वारा पुरस्कार संबंधी प्रचार-प्रसार एवं आधिकारिक प्रयोजनों के लिए किया जा सकेगा।";
const endpoint = "https://mahadevaaya.com/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part5/declaration/";
const StepF = ({ data, update, onSave, onPreview, onSubmit, canSubmit, topAccepted, onApplicationCompleted }) => {
  const { user, authFetch } = useAuth();
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showParentDocumentUpload, setShowParentDocumentUpload] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const applicantId = data?.applicant_id || user?.applicant_id || localStorage.getItem("applicantId") || "";
  const district = data?.["permanentजनपद"] || data?.permanentजनपद || data?.district || "System Generated";
  const submissionDate = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  useEffect(() => {
    let active = true;
    const fetchPart6Data = async () => {
      try {
        const response = await authFetch(endpoint);
        if (!response.ok) return;
        const result = await response.json();
        const responseData = result?.data ?? result;
        const record = Array.isArray(responseData) ? responseData[0] : responseData;
        const recordApplicantId = record?.applicant_id;
        if (active && record && (!applicantId || String(recordApplicantId) === String(applicantId))) {
          if (record.declarationDocument) {
            update({ target: { name: "declarationDocument", value: record.declarationDocument, type: "text" } });
          }
          if (record.parentDeclarationDocument) {
            update({ target: { name: "parentDeclarationDocument", value: record.parentDeclarationDocument, type: "text" } });
          }
          if (record.declarationDocument) {
            update({ target: { name: "declarationAccepted", checked: true, type: "checkbox" } });
          }
          if (record.parentDeclarationDocument) {
            update({ target: { name: "parentDeclarationAccepted", checked: true, type: "checkbox" } });
          }
          const status = String(record.status || record.submission_status || "").trim().toLowerCase();
          if (status === "completed") {
            setIsCompleted(true);
            onApplicationCompleted?.(record);
          }
        }
      } catch (fetchError) {
        console.error("Failed to fetch Part 6 data:", fetchError);
      } finally {
        if (active) setLoadingData(false);
      }
    };
    fetchPart6Data();
    return () => { active = false; };
  }, [applicantId, authFetch, onApplicationCompleted]);

  useEffect(() => {
    if (data.declarationAccepted) {
      setShowDocumentUpload(true);
    }
  }, [data.declarationAccepted]);

  useEffect(() => {
    if (data.parentDeclarationAccepted) {
      setShowParentDocumentUpload(true);
    }
  }, [data.parentDeclarationAccepted]);

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    update(e);
    setShowDocumentUpload(checked);
  };

  const handleParentCheckboxChange = (e) => {
    const checked = e.target.checked;
    update(e);
    setShowParentDocumentUpload(checked);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    update({ target: { name: "declarationDocument", value: file } });
  };

  const handleParentFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    update({ target: { name: "parentDeclarationDocument", value: file } });
  };

  const handleFinalSubmit = async () => {
    if (!canSubmit || isCompleted || submitting) return;

    const formData = new FormData();
    formData.append("applicant_id", applicantId);
    formData.append("declarationDocument", data.declarationDocument);
    formData.append("parentDeclarationDocument", data.parentDeclarationDocument);

    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await authFetch(endpoint, { method: "PUT", body: formData });
      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok || (typeof result === "object" && result.success === false)) {
        const message = typeof result === "object"
          ? (result.detail || result.message || result.error)
          : result;
        throw new Error(message || "अंतिम सबमिशन में त्रुटि हुई।");
      }

      setIsCompleted(true);
      onApplicationCompleted?.(result);
      onSubmit?.();
    } catch (error) {
      console.error("Final declaration submit error:", error);
      setSubmitError(error.message || "अंतिम सबमिशन में त्रुटि हुई। कृपया पुनः प्रयास करें।");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <section className="nf-card">
        <div className="nf-card-heading">
          <span>Step 5</span>
          <h2>घोषणा एवं सहमति (Declaration)</h2>
        </div>
        <p>डेटा लोड हो रहा है...</p>
      </section>
    );
  }

  return (
    <section className="nf-card">
      {submitError && <div className="nf-error" role="alert">{submitError}</div>}
      <div className="nf-card-heading">
        <span>Step 5</span>
        <h2>घोषणा एवं सहमति (Declaration)</h2>
      </div>
      <div className="nf-declaration">
        <h3 className="nf-declaration-heading">नामांकनकर्ता की घोषणा</h3>
        <p>{declaration}</p>
        <div className="nf-declaration-center">
          <label className="nf-declaration-checkbox-label">
            <input
              type="checkbox"
              name="declarationAccepted"
              checked={Boolean(data.declarationAccepted)}
              onChange={handleCheckboxChange}
              disabled={isCompleted}
            /> <span>मैंने उपर्युक्त घोषणा को पढ़ लिया है तथा मैं इससे सहमत हूँ।</span>
          </label>
        </div>
        {showDocumentUpload && (
          <div className={`nf-document-upload${topAccepted ? " nf-disabled" : ""}`}>
            <label htmlFor="nf-declarationDocument" className="nf-document-upload-label">
              अभिलेख अपलोड करें
            </label>
            <label htmlFor="nf-declarationDocument" className="nf-document-dropzone">
              <input
                id="nf-declarationDocument"
                type="file"
                name="declarationDocument"
                onChange={handleFileChange}
                className="nf-document-input"
                disabled={topAccepted || isCompleted}
              />
              <span className="nf-document-dropzone-text">
                {data.declarationDocument ? (typeof data.declarationDocument === "string" ? data.declarationDocument : data.declarationDocument.name) : "No file chosen"}
              </span>
            </label>
            <span className="nf-document-upload-hint">PDF, DOC, JPG, PNG (अधिकतम 5MB)</span>
          </div>
        )}
        {/* <div className="nf-signature-text">
          <span>नामांकनकर्ता</span>
          <span>द्वारा</span>
          <span>हस्ताक्षर</span>
        </div> */}
      </div>
      <div className="nf-declaration">
        <h3 className="nf-declaration-heading">अभिभावक की सहमति </h3>
        <p>{parentDeclaration}</p>
        <div className="nf-declaration-center">
          <label className="nf-declaration-checkbox-label">
            <input
              type="checkbox"
              name="parentDeclarationAccepted"
              checked={Boolean(data.parentDeclarationAccepted)}
              onChange={handleParentCheckboxChange}
              disabled={isCompleted}
            />
            <span>मैंने उपर्युक्त सहमति को पढ़ लिया है तथा मैं इससे सहमत हूँ।</span>
          </label>
        </div>
        {showParentDocumentUpload && (
          <div className={`nf-document-upload${topAccepted ? " nf-disabled" : ""}`}>
            <label htmlFor="nf-parentDeclarationDocument" className="nf-document-upload-label">
              अभिलेख अपलोड करें
            </label>
            <label htmlFor="nf-parentDeclarationDocument" className="nf-document-dropzone">
              <input
                id="nf-parentDeclarationDocument"
                type="file"
                name="parentDeclarationDocument"
                onChange={handleParentFileChange}
                className="nf-document-input"
                disabled={topAccepted || isCompleted}
              />
              <span className="nf-document-dropzone-text">
                {data.parentDeclarationDocument ? (typeof data.parentDeclarationDocument === "string" ? data.parentDeclarationDocument : data.parentDeclarationDocument.name) : "No file chosen"}
              </span>
            </label>
            <span className="nf-document-upload-hint">PDF, DOC, JPG, PNG (अधिकतम 5MB)</span>
          </div>
        )}
        {/* <div className="nf-signature-text">
          <span>अभिभावक </span>
          <span>द्वारा</span>
          <span>हस्ताक्षर</span>
        </div> */}
      </div>
      <div className="nf-final">
        <h3>अंतिम प्रस्तुतीकरण (Final Submission)</h3>
        <div className="nf-final-actions">
          <button type="button" className="nf-secondary" onClick={onPreview}>
            Preview Application
          </button>
          {!isCompleted && (
            <button
              type="button"
              className="nf-primary"
              disabled={!canSubmit}
              onClick={handleFinalSubmit}
            >
              {submitting ? "Submitting..." : "Final Submit"}
            </button>
          )}
        </div>
        <p className="nf-note">
          नोट: Final Submit के पश्चात आवेदन में कोई संशोधन नहीं किया जा सकेगा।
        </p>
      </div>
      <div className="nf-system">
        <p>
          <strong>Application Number:</strong> {applicantId || "System Generated"}
        </p>
        <p>
          <strong>Application Submission Date:</strong> {submissionDate}
        </p>
        <p>
          <strong>District:</strong> {district}
        </p>
      </div>
    </section>
  );
};

export default StepF;
