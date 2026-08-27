import React, { useMemo, useState } from "react";
import "./PreviewModal.css";

const yesNo = (val) =>
  val === "हाँ" || val === "yes" || val === true
    ? "हाँ"
    : val === "नहीं" || val === "no" || val === false
    ? "नहीं"
    : val || "-";

const calcAge = (dob) => {
  if (!dob) return "-";
  try {
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return "-";
    const ref = new Date("2025-07-01");
    let years = ref.getFullYear() - birth.getFullYear();
    let months = ref.getMonth() - birth.getMonth();
    let days = ref.getDate() - birth.getDate();
    if (days < 0) { months--; days += new Date(ref.getFullYear(), ref.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    return `${years} वर्ष ${months} माह ${days} दिन (as on 1-July-2025)`;
  } catch { return "-"; }
};

const getFileType = (file) => {
  if (!file) return null;
  if (typeof file === "string") {
    if (/\.pdf$/i.test(file)) return "pdf";
    if (/\.(doc|docx)$/i.test(file)) return "doc";
    if (/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file)) return "image";
    return "other";
  }
  if (file instanceof File) {
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf") return "pdf";
    if (file.type.includes("word") || file.type.includes("document")) return "doc";
    return "other";
  }
  return null;
};

const getFileSrc = (file) => {
  if (!file) return null;
  const mediaBaseUrl = "https://mahadevaaya.com/balvirtaawardproject/balvirtaawardproject_backend";
  if (typeof file === "string") {
    const trimmed = String(file).trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `${mediaBaseUrl}/${trimmed.replace(/^\/+/, "")}`;
  }
  if (file instanceof File) return URL.createObjectURL(file);
  return null;
};

/* ── Doc preview box ── */
const DocPreview = ({ file }) => {
  const src = useMemo(() => getFileSrc(file), [file]);
  const type = useMemo(() => getFileType(file), [file]);

  if (!src) {
    return (
      <div className="nf-pv-dprev nf-pv-dprev-na">
        <span>Not Applicable</span>
      </div>
    );
  }
  const openFile = () => { if (src) window.open(src, "_blank"); };

  if (type === "image") {
    return (
      <div className="nf-pv-dprev" onClick={openFile} title="क्लिक करें">
        <img src={src} alt="preview" className="nf-pv-dprev-img" />
      </div>
    );
  }
  if (type === "pdf") {
    return (
      <div className="nf-pv-dprev nf-pv-dprev-pdf" onClick={openFile} title="क्लिक करें">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <span>PDF</span>
      </div>
    );
  }
  return (
    <div className="nf-pv-dprev nf-pv-dprev-doc" onClick={openFile} title="क्लिक करें">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#217193" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
      <span>DOC</span>
    </div>
  );
};

/* ── 4-col helpers ── */
const Row4 = ({ l1, v1, l2, v2 }) => (
  <tr>
    <td className="nf-pv-l4">{l1}</td>
    <td className="nf-pv-v4">{v1 || "-"}</td>
    <td className="nf-pv-l4">{l2}</td>
    <td className="nf-pv-v4">{v2 || "-"}</td>
  </tr>
);

const Row4Full = ({ label, value }) => (
  <tr>
    <td className="nf-pv-l4">{label}</td>
    <td className="nf-pv-v4" colSpan="3">{value || "-"}</td>
  </tr>
);

/* ── Expand / Collapse ── */
const ExpandText = ({ text, maxWords = 20 }) => {
  const [open, setOpen] = useState(false);
  if (!text) return <span>-</span>;
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return <span>{text}</span>;
  return (
    <span>
      {open ? text : words.slice(0, maxWords).join(" ") + "..."}
      <button type="button" className="nf-pv-more-btn" onClick={() => setOpen((p) => !p)}>
        {open ? " कम दिखाएं ▲" : " और पढ़ें ▼"}
      </button>
    </span>
  );
};

/* ── Single doc cell (name + filename) ── */
const DocNameCell = ({ label, file }) => {
  const fname = file && typeof file === "object" ? file.name : null;
  return (
    <td className="nf-pv-l4 nf-pv-docname">
      <span>{label}</span>
      {fname && <small>{fname}</small>}
    </td>
  );
};

/* ════════════════════════════════════════════════ */
const PreviewModal = ({ data, onClose, topAccepted, onTopAcceptedChange }) => {
  const applicationNumber = data?.applicant_id || "System Generated";
  const district = data?.["permanentजनपद"] || data?.district || "-";

  const submissionDate = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: true,
  }).replace(",", "");

  const photoSrc = useMemo(() => getFileSrc(data?.document5), [data?.document5]);

  const curAddr = [data?.["currentग्राम/मोहल्ला"], data?.["currentडाकघर"], data?.["currentजनपद"], data?.["currentपिन कोड"]].filter(Boolean).join(" / ");
  const perAddr = [data?.["permanentग्राम/मोहल्ला"], data?.["permanentडाकघर"], data?.["permanentजनपद"], data?.["permanentपिन कोड"]].filter(Boolean).join(" / ");

  const allDocs = [
    { label: "नामांकनकर्ता का पहचान पत्र", key: "document0" },
    { label: "बच्चे का आधार कार्ड/पहचान पत्र", key: "document1" },
    { label: "उत्तराखण्ड का स्थायी निवास प्रमाण पत्र", key: "document2" },
    { label: "बच्चे का जन्म प्रमाण पत्र/आयु प्रमाण पत्र", key: "document3" },
    { label: "वीरता घटना का विस्तृत विवरण", key: "document4" },
    { label: "बच्चे का पासपोर्ट आकार फोटो", key: "document5" },
    { label: "FIR/पुलिस रिपोर्ट", key: "document6" },
    { label: "समाचार पत्र की कटिंग/मीडिया रिपोर्ट", key: "document7" },
    { label: "प्रत्यक्षदर्शियों के बयान/प्रमाण", key: "document8" },
    { label: "घटना से संबंधित फोटो/वीडियो", key: "document9" },
    { label: "विद्यालय का प्रमाण पत्र", key: "document10" },
    { label: "अन्य सहायक अभिलेख", key: "document11" },
    { label: "नामांकनकर्ता घोषणा अभिलेख", key: "declarationDocument" },
    { label: "अभिभावक घोषणा अभिलेख", key: "parentDeclarationDocument" },
  ];

  /* pair documents: 2 per row */
  const docPairs = [];
  for (let i = 0; i < allDocs.length; i += 2) {
    docPairs.push({ left: allDocs[i], right: allDocs[i + 1] || null });
  }

  return (
    <div className="nf-pv-overlay" onClick={onClose}>
      <div className="nf-pv-sheet" onClick={(e) => e.stopPropagation()}>

        <button type="button" className="nf-pv-x" onClick={onClose} aria-label="Close">×</button>

        {/* ── Header ── */}
        <div className="nf-pv-dept-header">
          <h1>महिला सशक्तिकरण एवं बाल विकास विभाग</h1>
          <p>उत्तराखण्ड सरकार</p>
        </div>

        {/* ── Body ── */}
        <div className="nf-pv-body">

          {/* ═══ 1. आवेदक + पता (4-COL + PHOTO) ═══ */}
          <div className="nf-pv-block">
            <div className="nf-pv-block-label">आवेदक का विवरण:</div>
            <div className="nf-pv-form-id">
              Form ID: {applicationNumber} (Final Submitted on {submissionDate})
            </div>
            <div className="nf-pv-photo-row">
              <table className="nf-pv-t4">
                <tbody>
                  <Row4 l1="बच्चे का पूरा नाम" v1={data?.childName} l2="पिता का नाम" v2={data?.fatherName} />
                  <Row4 l1="माता का नाम" v1={data?.motherName} l2="अभिभावक का नाम" v2={data?.guardianName} />
                  <Row4 l1="मोबाइल नंबर" v1={data?.childMobile} l2="लिंग" v2={data?.gender} />
                  <Row4 l1="जन्म तिथि" v1={data?.birthDate} l2="आयु" v2={calcAge(data?.birthDate)} />
                  <Row4 l1="उत्तराखण्ड का स्थायी निवासी" v1={yesNo(data?.resident)} l2="वर्तमान कक्षा" v2={data?.currentClass} />
                  <Row4Full label="विद्यालय का नाम" value={data?.schoolName} />
                  <Row4Full label="विद्यालय का पता" value={data?.schoolAddress} />
                  <tr><td colSpan="4" className="nf-pv-sep4" /></tr>
                  <Row4 l1="वर्तमान पता" v1={curAddr} l2="स्थायी पता" v2={perAddr} />
                  <Row4 l1="वर्तमान विकासखण्ड / नगर निकाय" v1={data?.["currentविकासखण्ड/नगर निकाय"]} l2="स्थायी विकासखण्ड / नगर निकाय" v2={data?.["permanentविकासखण्ड/नगर निकाय"]} />
                  <Row4 l1="वर्तमान जनपद" v1={data?.["currentजनपद"]} l2="स्थायी जनपद" v2={district} />
                  <Row4 l1="वर्तमान पिन कोड" v1={data?.["currentपिन कोड"]} l2="स्थायी पिन कोड" v2={data?.["permanentपिन कोड"]} />
                </tbody>
              </table>
              <div className="nf-pv-photo-wrap">
                <div className="nf-pv-photo-box">
                  {photoSrc ? <img src={photoSrc} alt="फोटो" className="nf-pv-photo-img" /> : <span className="nf-pv-photo-ph">फोटो</span>}
                </div>
                <span className="nf-pv-photo-label">पासपोर्ट फोटो</span>
              </div>
            </div>
          </div>

          {/* ═══ 2. वीरता (4-COL + EXPAND) ═══ */}
          <div className="nf-pv-block">
            <div className="nf-pv-block-label">वीरता की घटना का विवरण:</div>
            <table className="nf-pv-t4">
              <tbody>
                <Row4Full label="घटना का शीर्षक" value={data?.actTitle} />
                <Row4 l1="घटना की दिनांक" v1={data?.actDate} l2="घटना का समय" v2={data?.actTime} />
                <Row4 l1="घटना का स्थान" v1={data?.actPlace} l2="घटना का जनपद" v2={data?.actDistrict} />
                <tr>
                  <td className="nf-pv-l4">संक्षिप्त विवरण</td>
                  <td className="nf-pv-v4" colSpan="3">
                    <ExpandText text={data?.shortDescription} maxWords={20} />
                  </td>
                </tr>
                <Row4Full label="बचाए गये व्यक्तियों का विवरण" value={data?.rescuedCount} />
              </tbody>
            </table>
          </div>

          {/* ═══ 3. अतिरिक्त जानकारी + दस्तावेज़ (ONE SECTION, 4-COL) ═══ */}
          <div className="nf-pv-block">
            <div className="nf-pv-block-label">अतिरिक्त जानकारी एवं अपलोड दस्तावेजों का विवरण:</div>
            <table className="nf-pv-t4">
              <tbody>
                {/* ── Yes/No: question colSpan 3, answer col 4 ── */}
                <tr>
                  <td className="nf-pv-l4" colSpan="3">1. क्या पुलिस रिपोर्ट / FIR दर्ज है ?</td>
                  <td className="nf-pv-v4 nf-pv-ynv4">{yesNo(data?.firRegistered)}</td>
                </tr>
                {data?.firRegistered === "हाँ" && (
                  <>
                    <tr>
                      <td className="nf-pv-sub4" colSpan="3">थाना</td>
                      <td className="nf-pv-v4">{data?.policeStation || "-"}</td>
                    </tr>
                    <tr>
                      <td className="nf-pv-sub4" colSpan="3">FIR संख्या</td>
                      <td className="nf-pv-v4">{data?.firNumber || "-"}</td>
                    </tr>
                    <tr>
                      <td className="nf-pv-sub4" colSpan="3">FIR दिनांक</td>
                      <td className="nf-pv-v4">{data?.firDate || "-"}</td>
                    </tr>
                  </>
                )}
                <tr>
                  <td className="nf-pv-l4" colSpan="3">2. क्या समाचार पत्र / मीडिया रिपोर्ट प्रकाशित हुई ?</td>
                  <td className="nf-pv-v4 nf-pv-ynv4">{data?.mediaPublished || "-"}</td>
                </tr>
                <tr>
                  <td className="nf-pv-l4" colSpan="3">3. क्या कोई अन्य पुरस्कार / सम्मान प्राप्त हुआ है ?</td>
                  <td className="nf-pv-v4 nf-pv-ynv4">{yesNo(data?.otherAward)}</td>
                </tr>
                {data?.otherAward === "हाँ" && (
                  <tr>
                    <td className="nf-pv-sub4" colSpan="3">अन्य पुरस्कार का विवरण</td>
                    <td className="nf-pv-v4">{data?.otherAwardDetails || "-"}</td>
                  </tr>
                )}
                <tr>
                  <td className="nf-pv-l4" colSpan="3">4. अतिरिक्त टिप्पणी / अन्य महत्वपूर्ण जानकारी</td>
                  <td className="nf-pv-v4">{data?.additionalInformation || "-"}</td>
                </tr>

                {/* ── separator ── */}
                <tr><td colSpan="4" className="nf-pv-sep4" /></tr>

                {/* ── Documents: 2 per row (name | preview | name | preview) ── */}
                {docPairs.map((pair, idx) => (
                  <tr key={idx}>
                    <DocNameCell label={pair.left.label} file={data?.[pair.left.key]} />
                    <td className="nf-pv-v4 nf-pv-prev-td">
                      <DocPreview file={data?.[pair.left.key]} />
                    </td>
                    {pair.right ? (
                      <>
                        <DocNameCell label={pair.right.label} file={data?.[pair.right.key]} />
                        <td className="nf-pv-v4 nf-pv-prev-td">
                          <DocPreview file={data?.[pair.right.key]} />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="nf-pv-l4 nf-pv-empty" />
                        <td className="nf-pv-v4 nf-pv-empty" />
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

                   {/* ═══ 4. घोषणा ═══ */}
          <div className="nf-pv-block">
            <div className="nf-pv-block-label">घोषणा</div>
            <div className="nf-pv-decl-box">
              {/* ── नामांकनकर्ता की घोषणा ── */}
              <p className="nf-pv-decl-title">नामांकनकर्ता की घोषणा:</p>
              <p>
                मेरे द्वारा उपरोक्त भरी गई समस्त जानकारी पूर्णतयः सत्य एवं
                सही है। यदि कोई जानकारी उपरोक्त में अंकित है और गलत पाई
                जाती है तो विभाग द्वारा नियमानुसार कार्यवाही की जा
                सकती है जिसकी सम्पूर्ण जिम्मेदारी आवेदक की होगी।
              </p>
              {data?.declarationDocument && (
                <div className="nf-pv-decl-view">
                  <a href={getFileSrc(data?.declarationDocument)} target="_blank" rel="noopener noreferrer" className="nf-pv-dstatus has">view</a>
                </div>
              )}
              <div className="nf-pv-decl-sign">
                <span className="nf-pv-sign-name">{data?.childName || "-"}</span>
              </div>
              <div className="nf-pv-sign-line">
                <span>नामांकनकर्ता</span>
                <span>द्वारा</span>
                <span>हस्ताक्षर</span>
              </div>

              {/* ── अभिभावक की घोषणा / सहमति ── */}
              <p className="nf-pv-decl-title" style={{ marginTop: "14px" }}>
                अभिभावक की घोषणा / सहमति:
              </p>
              <p>
                मैं/हम इस बात से सहमत हूँ कि महिला सशक्तिकरण एवं बाल
                विकास विभाग, उत्तराखण्ड द्वारा उपलब्ध कराई गई जानकारी
                एवं संलग्न अभिलेखों का संबंधित जिला प्रशासन, पुलिस
                विभाग एवं अन्य सक्षम प्राधिकारी के माध्यम से सत्यापन
                कराया जा सकता है। मैं/हम यह भी सहमत हूँ कि गलत अथवा
                भ्रामक जानकारी पाए जाने की स्थिति में नामांकन निरस्त
                किया जा सकता है तथा नियमानुसार आवश्यक कार्यवाही की
                जा सकती है। पुरस्कार हेतु चयन की स्थिति में बच्चे के नाम,
                फोटो एवं वीरता की घटना से संबंधित विवरण का उपयोग
                विभाग द्वारा पुरस्कार संबंधी प्रचार-प्रसार एवं
                आधिकारिक प्रयोजनों के लिए किया जा सकेगा।
              </p>
              {data?.parentDeclarationDocument && (
                <div className="nf-pv-decl-view">
                  <a href={getFileSrc(data?.parentDeclarationDocument)} target="_blank" rel="noopener noreferrer" className="nf-pv-dstatus has">view</a>
                </div>
              )}
              <div className="nf-pv-decl-sign">
                <span className="nf-pv-sign-name">
                  {data?.guardianName || data?.fatherName || "-"}
                </span>
              </div>
              <div className="nf-pv-sign-line">
                <span>अभिभावक</span>
                <span>द्वारा</span>
                <span>हस्ताक्षर</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* ── Footer ── */}
        <div className="nf-pv-footer">
          <label className="nf-pv-accept">
            <input type="checkbox" checked={topAccepted} onChange={(e) => onTopAcceptedChange(e.target.checked)} />
            <span>मैंने समस्त शर्तें पढ़ ली हैं और मैं उनसे सहमत हूँ।</span>
          </label>
          {topAccepted && <small className="nf-pv-warn">बदलाव करने के लिए कृपया ऊपर दिए गए चेकबॉक्स को अनचेक करें।</small>}
          <button type="button" className="nf-pv-closebtn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;