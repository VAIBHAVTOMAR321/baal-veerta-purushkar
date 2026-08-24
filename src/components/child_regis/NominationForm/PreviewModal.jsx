import React from "react";
import "./PreviewModal.css";

const yesNo = (val) => (val === "हाँ" || val === "yes" || val === true ? "हाँ" : val === "नहीं" || val === "no" || val === false ? "नहीं" : val || "-");

const Section = ({ title, children }) => (
  <div className="nf-preview-section">
    <h3 className="nf-preview-section-title">{title}</h3>
    <div className="nf-preview-section-body">{children}</div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="nf-preview-row">
    <span className="nf-preview-label">{label}</span>
    <span className="nf-preview-value">{value || "-"}</span>
  </div>
);

const PreviewModal = ({ data, onClose, topAccepted, onTopAcceptedChange }) => {
  const applicationNumber = data?.applicant_id || "System Generated";
  const district = data?.["permanentजनपद"] || data?.district || "System Generated";
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

  const documents = [
    "नामांकनकर्ता का पहचान पत्र",
    "बच्चे का आधार कार्ड/पहचान पत्र",
    "उत्तराखण्ड का स्थायी निवास प्रमाण पत्र",
    "बच्चे का जन्म प्रमाण पत्र/आयु प्रमाण पत्र",
    "वीरता की घटना के संबंध में नामांकनकर्ता द्वारा हस्ताक्षरित विस्तृत विवरण",
    "बच्चे का पासपोर्ट आकार का फोटो",
    "FIR/पुलिस रिपोर्ट",
    "समाचार पत्र की कटिंग/मीडिया रिपोर्ट",
    "प्रत्यक्षदर्शियों के बयान/प्रमाण",
    "घटना से संबंधित फोटो/वीडियो",
    "विद्यालय का प्रमाण पत्र",
    "अन्य सहायक अभिलेख",
  ];

  return (
    <div className="nf-preview-overlay" onClick={onClose}>
      <div className="nf-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nf-preview-header">
          <div>
            <h2>आवेदन पूर्वावलोकन / Application Preview</h2>
            <p className="nf-preview-subtitle">मुख्यमंत्री राज्य बाल वीरता पुरस्कार</p>
          </div>
          <button type="button" className="nf-preview-close" onClick={onClose}>×</button>
        </div>

        <div className="nf-preview-meta">
          <div className="nf-preview-meta-item">
            <span className="nf-preview-meta-label">Application Number</span>
            <span className="nf-preview-meta-value">{applicationNumber}</span>
          </div>
          <div className="nf-preview-meta-item">
            <span className="nf-preview-meta-label">Submission Date</span>
            <span className="nf-preview-meta-value">{submissionDate}</span>
          </div>
          <div className="nf-preview-meta-item">
            <span className="nf-preview-meta-label">District</span>
            <span className="nf-preview-meta-value">{district}</span>
          </div>
        </div>

        <div className="nf-preview-body">
          <Section title="Step 1: नामांकित बच्चे का व्यक्तिगत विवरण">
            <Row label="बच्चे का पूरा नाम" value={data?.childName} />
            <Row label="पिता का नाम" value={data?.fatherName} />
            <Row label="माता का नाम" value={data?.motherName} />
            <Row label="अभिभावक का नाम" value={data?.guardianName} />
            <Row label="मोबाइल नंबर" value={data?.childMobile} />
            <Row label="जन्म तिथि" value={data?.birthDate} />
            <Row label="लिंग" value={data?.gender} />
            <Row label="उत्तराखण्ड का स्थायी निवासी" value={yesNo(data?.resident)} />
            <Row label="ग्राम/मोहल्ला" value={data?.["permanentग्राम/मोहल्ला"]} />
            <Row label="डाकघर" value={data?.["permanentडाकघर"]} />
            <Row label="जनपद" value={data?.["permanentजनपद"]} />
            <Row label="विकासखण्ड/नगर निकाय" value={data?.["permanentविकासखण्ड/नगर निकाय"]} />
            <Row label="पिन कोड" value={data?.["permanentपिन कोड"]} />
            <Row label="वर्तमान ग्राम/मोहल्ला" value={data?.["currentग्राम/मोहल्ला"]} />
            <Row label="वर्तमान डाकघर" value={data?.["currentडाकघर"]} />
            <Row label="वर्तमान जनपद" value={data?.["currentजनपद"]} />
            <Row label="वर्तमान विकासखण्ड/नगर निकाय" value={data?.["currentविकासखण्ड/नगर निकाय"]} />
            <Row label="वर्तमान पिन कोड" value={data?.["currentपिन कोड"]} />
            <Row label="विद्यालय का नाम" value={data?.schoolName} />
            <Row label="विद्यालय का पता" value={data?.schoolAddress} />
            <Row label="वर्तमान कक्षा" value={data?.currentClass} />
          </Section>

          <Section title="Step 2: वीरता की घटना का विवरण">
            <Row label="घटना का शीर्षक" value={data?.actTitle} />
            <Row label="घटना की दिनांक" value={data?.actDate} />
            <Row label="घटना का समय" value={data?.actTime} />
            <Row label="घटना का स्थान" value={data?.actPlace} />
            <Row label="घटना का जनपद" value={data?.actDistrict} />
            <Row label="संक्षिप्त विवरण" value={data?.shortDescription} />
            <Row label="बच्चे द्वारा बचाए गये व्यक्तियों का विवरण" value={data?.rescuedCount} />
            <Row label="पुलिस रिपोर्ट/FIR दर्ज है?" value={yesNo(data?.firRegistered)} />
            {data?.firRegistered === "हाँ" && (
              <>
                <Row label="थाना" value={data?.policeStation} />
                <Row label="FIR संख्या" value={data?.firNumber} />
                <Row label="FIR दिनांक" value={data?.firDate} />
              </>
            )}
            <Row label="समाचार/मीडिया रिपोर्ट प्रकाशित हुई?" value={data?.mediaPublished} />
          </Section>

          <Section title="Step 3: अतिरिक्त जानकारी">
            <Row label="क्या कोई अन्य पुरस्कार/सम्मान प्राप्त हुआ है?" value={yesNo(data?.otherAward)} />
            {data?.otherAward === "हाँ" && (
              <Row label="अन्य पुरस्कार का विवरण" value={data?.otherAwardDetails} />
            )}
            <Row label="अतिरिक्त टिप्पणी/अन्य महत्वपूर्ण जानकारी" value={data?.additionalInformation} />
          </Section>

          <Section title="Step 4: आवश्यक अभिलेख अपलोड">
            {documents.map((label, index) => {
              const file = data?.[`document${index}`];
              return (
                <div key={label} className="nf-preview-doc-row">
                  <span className="nf-preview-label">{index + 1}. {label}</span>
                  <span className={`nf-preview-doc-status ${file ? "uploaded" : "missing"}`}>
                    {file ? file.name : "अपलोड नहीं किया गया"}
                  </span>
                </div>
              );
            })}
          </Section>

          <Section title="Step 5: घोषणा एवं सहमति">
            <Row label="नामांकनकर्ता की घोषणा स्वीकार की गई?" value={data?.declarationAccepted ? "हाँ" : "नहीं"} />
            {data?.declarationDocument && (
              <Row label="नामांकनकर्ता अभिलेख" value={typeof data.declarationDocument === "string" ? data.declarationDocument : data.declarationDocument.name} />
            )}
            <Row label="अभिभावक की घोषणा स्वीकार की गई?" value={data?.parentDeclarationAccepted ? "हाँ" : "नहीं"} />
            {data?.parentDeclarationDocument && (
              <Row label="अभिभावक अभिलेख" value={typeof data.parentDeclarationDocument === "string" ? data.parentDeclarationDocument : data.parentDeclarationDocument.name} />
            )}
          </Section>
        </div>

        <div className="nf-preview-footer">
          <label className="nf-declaration-checkbox-label nf-preview-accept">
            <input
              type="checkbox"
              checked={topAccepted}
              onChange={onTopAcceptedChange}
            />
            <span>मैंने समस्त शर्तें पढ़ ली हैं और मैं उनसे सहमत हूँ।</span>
          </label>
          {topAccepted && (
            <small className="nf-preview-hint">
              बदलाव करने के लिए कृपया ऊपर दिए गए चेकबॉक्स को अनचेक करें।
            </small>
          )}
          <button type="button" className="nf-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
