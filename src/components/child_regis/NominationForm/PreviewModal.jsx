import React, { useMemo } from "react";
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
    if (days < 0) {
      months--;
      days += new Date(ref.getFullYear(), ref.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years} वर्ष ${months} माह ${days} दिन (as on 1-July-2025)`;
  } catch {
    return "-";
  }
};

const PreviewModal = ({ data, onClose, topAccepted, onTopAcceptedChange }) => {
  const applicationNumber = data?.applicant_id || "System Generated";
  const district = data?.["permanentजनपद"] || data?.district || "-";

  const submissionDate = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).replace(",", "");

  /* ── photo source ── */
  const photoSrc = useMemo(() => {
    const f = data?.document5;
    if (!f) return null;
    if (typeof f === "string") return f;
    if (f instanceof File) return URL.createObjectURL(f);
    return null;
  }, [data?.document5]);

  const currentAddress = [
    data?.["currentग्राम/मोहल्ला"],
    data?.["currentडाकघर"],
    data?.["currentजनपद"],
    data?.["currentपिन कोड"],
  ]
    .filter(Boolean)
    .join(" / ");

  const permanentAddress = [
    data?.["permanentग्राम/मोहल्ला"],
    data?.["permanentडाकघर"],
    data?.["permanentजनपद"],
    data?.["permanentपिन कोड"],
  ]
    .filter(Boolean)
    .join(" / ");

  const documents = [
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
  ];

  const docPairs = [];
  for (let i = 0; i < documents.length; i += 2) {
    docPairs.push([documents[i], documents[i + 1] || null]);
  }

  return (
    <div className="nf-pv-overlay" onClick={onClose}>
      <div className="nf-pv-modal" onClick={(e) => e.stopPropagation()}>
        {/* ── Department Header ── */}
        <div className="nf-pv-dept-header">
          <h1>महिला सशक्तिकरण एवं बाल विकास विभाग</h1>
          <p>उत्तराखण्ड सरकार</p>
          <button
            type="button"
            className="nf-pv-x"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="nf-pv-body">
          {/* ═══ 1. आवेदक का विवरण  (table + photo) ═══ */}
          <div className="nf-pv-block">
            <div className="nf-pv-block-label">आवेदक का विवरण:</div>
            <div className="nf-pv-form-id">
              Form ID: {applicationNumber} (Final Submitted on{" "}
              {submissionDate})
            </div>

            <div className="nf-pv-photo-row">
              {/* left: 4-col table */}
              <table className="nf-pv-t4">
                <tbody>
                  <tr>
                    <td className="nf-pv-l">बच्चे का पूरा नाम</td>
                    <td className="nf-pv-v">
                      {data?.childName || "-"}
                    </td>
                    <td className="nf-pv-l">पिता का नाम</td>
                    <td className="nf-pv-v">
                      {data?.fatherName || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="nf-pv-l">माता का नाम</td>
                    <td className="nf-pv-v">
                      {data?.motherName || "-"}
                    </td>
                    <td className="nf-pv-l">अभिभावक का नाम</td>
                    <td className="nf-pv-v">
                      {data?.guardianName || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="nf-pv-l">मोबाइल नंबर</td>
                    <td className="nf-pv-v">
                      {data?.childMobile || "-"}
                    </td>
                    <td className="nf-pv-l">लिंग</td>
                    <td className="nf-pv-v">{data?.gender || "-"}</td>
                  </tr>
                  <tr>
                    <td className="nf-pv-l">जन्म तिथि</td>
                    <td className="nf-pv-v">
                      {data?.birthDate || "-"}
                    </td>
                    <td className="nf-pv-l">आयु</td>
                    <td className="nf-pv-v">
                      {calcAge(data?.birthDate)}
                    </td>
                  </tr>
                  <tr>
                    <td className="nf-pv-l">
                      उत्तराखण्ड का स्थायी निवासी
                    </td>
                    <td className="nf-pv-v">
                      {yesNo(data?.resident)}
                    </td>
                    <td className="nf-pv-l">वर्तमान कक्षा</td>
                    <td className="nf-pv-v">
                      {data?.currentClass || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="nf-pv-l">विद्यालय का नाम</td>
                    <td className="nf-pv-v" colSpan="3">
                      {data?.schoolName || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="nf-pv-l">विद्यालय का पता</td>
                    <td className="nf-pv-v" colSpan="3">
                      {data?.schoolAddress || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* right: photo box */}
              <div className="nf-pv-photo-wrap">
                <div className="nf-pv-photo-box">
                  {photoSrc ? (
                    <img
                      src={photoSrc}
                      alt="फोटो"
                      className="nf-pv-photo-img"
                    />
                  ) : (
                    <span className="nf-pv-photo-ph">फोटो</span>
                  )}
                </div>
                <span className="nf-pv-photo-label">पासपोर्ट फोटो</span>
              </div>
            </div>
          </div>

          {/* ═══ 2. पता ═══ */}
          <div className="nf-pv-block">
            <table className="nf-pv-t4">
              <tbody>
                <tr>
                  <td className="nf-pv-l">वर्तमान पता</td>
                  <td className="nf-pv-v">
                    {currentAddress || "-"}
                  </td>
                  <td className="nf-pv-l">स्थायी पता</td>
                  <td className="nf-pv-v">
                    {permanentAddress || "-"}
                  </td>
                </tr>
                <tr>
                  <td className="nf-pv-l">
                    विकासखण्ड / नगर निकाय
                  </td>
                  <td className="nf-pv-v">
                    {data?.[
                      "currentविकासखण्ड/नगर निकाय"
                    ] || "-"}
                  </td>
                  <td className="nf-pv-l">
                    विकासखण्ड / नगर निकाय
                  </td>
                  <td className="nf-pv-v">
                    {data?.[
                      "permanentविकासखण्ड/नगर निकाय"
                    ] || "-"}
                  </td>
                </tr>
                <tr>
                  <td className="nf-pv-l">जनपद</td>
                  <td className="nf-pv-v">
                    {data?.["currentजनपद"] || "-"}
                  </td>
                  <td className="nf-pv-l">जनपद</td>
                  <td className="nf-pv-v">{district}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ═══ 3. वीरता की घटना ═══ */}
          <div className="nf-pv-block">
            <div className="nf-pv-block-label">
              वीरता की घटना का विवरण:
            </div>
            <table className="nf-pv-t4">
              <tbody>
                <tr>
                  <td className="nf-pv-l">घटना का शीर्षक</td>
                  <td className="nf-pv-v" colSpan="3">
                    {data?.actTitle || "-"}
                  </td>
                </tr>
                <tr>
                  <td className="nf-pv-l">घटना की दिनांक</td>
                  <td className="nf-pv-v">
                    {data?.actDate || "-"}
                  </td>
                  <td className="nf-pv-l">घटना का समय</td>
                  <td className="nf-pv-v">
                    {data?.actTime || "-"}
                  </td>
                </tr>
                <tr>
                  <td className="nf-pv-l">घटना का स्थान</td>
                  <td className="nf-pv-v">
                    {data?.actPlace || "-"}
                  </td>
                  <td className="nf-pv-l">घटना का जनपद</td>
                  <td className="nf-pv-v">
                    {data?.actDistrict || "-"}
                  </td>
                </tr>
                <tr>
                  <td className="nf-pv-l">संक्षिप्त विवरण</td>
                  <td
                    className="nf-pv-v"
                    colSpan="3"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {data?.shortDescription || "-"}
                  </td>
                </tr>
                <tr>
                  <td className="nf-pv-l">
                    बच्चे द्वारा बचाए गये व्यक्तियों का विवरण
                  </td>
                  <td className="nf-pv-v" colSpan="3">
                    {data?.rescuedCount || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ═══ 4. Yes / No Questions ═══ */}
          <div className="nf-pv-block">
            <table className="nf-pv-tyn">
              <tbody>
                <tr>
                  <td>
                    1. क्या पुलिस रिपोर्ट / FIR दर्ज है ?
                  </td>
                  <td className="nf-pv-ynv">
                    {yesNo(data?.firRegistered)}
                  </td>
                </tr>
                {data?.firRegistered === "हाँ" && (
                  <>
                    <tr>
                      <td className="nf-pv-sub">थाना</td>
                      <td className="nf-pv-ynv">
                        {data?.policeStation || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="nf-pv-sub">FIR संख्या</td>
                      <td className="nf-pv-ynv">
                        {data?.firNumber || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="nf-pv-sub">FIR दिनांक</td>
                      <td className="nf-pv-ynv">
                        {data?.firDate || "-"}
                      </td>
                    </tr>
                  </>
                )}
                <tr>
                  <td>
                    2. क्या समाचार पत्र / मीडिया रिपोर्ट प्रकाशित
                    हुई ?
                  </td>
                  <td className="nf-pv-ynv">
                    {data?.mediaPublished || "-"}
                  </td>
                </tr>
                <tr>
                  <td>
                    3. क्या कोई अन्य पुरस्कार / सम्मान प्राप्त
                    हुआ है ?
                  </td>
                  <td className="nf-pv-ynv">
                    {yesNo(data?.otherAward)}
                  </td>
                </tr>
                {data?.otherAward === "हाँ" && (
                  <tr>
                    <td className="nf-pv-sub">
                      अन्य पुरस्कार का विवरण
                    </td>
                    <td className="nf-pv-ynv">
                      {data?.otherAwardDetails || "-"}
                    </td>
                  </tr>
                )}
                <tr>
                  <td>
                    4. अतिरिक्त टिप्पणी / अन्य महत्वपूर्ण
                    जानकारी
                  </td>
                  <td className="nf-pv-ynv">
                    {data?.additionalInformation || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ═══ 5. अपलोड दस्तावेजों का विवरण ═══ */}
          <div className="nf-pv-block">
            <div className="nf-pv-block-label">
              अपलोड दस्तावेजों का विवरण
            </div>
            <table className="nf-pv-tdoc">
              <tbody>
                {docPairs.map((pair, idx) => (
                  <tr key={idx}>
                    {pair.map(
                      (doc) =>
                        doc && (
                          <td key={doc.key} className="nf-pv-dcell">
                            <span className="nf-pv-dname">
                              {doc.label}
                            </span>
                            <span
                              className={`nf-pv-dstatus ${
                                data?.[doc.key]
                                  ? "has"
                                  : "na"
                              }`}
                            >
                              {data?.[doc.key]
                                ? "view"
                                : "Not Applicable"}
                            </span>
                          </td>
                        )
                    )}
                    {pair.length === 1 && <td />}
                  </tr>
                ))}

                {/* declaration docs row */}
                <tr>
                  <td className="nf-pv-dcell">
                    <span className="nf-pv-dname">
                      नामांकनकर्ता घोषणा अभिलेख
                    </span>
                    <span
                      className={`nf-pv-dstatus ${
                        data?.declarationDocument
                          ? "has"
                          : "na"
                      }`}
                    >
                      {data?.declarationDocument
                        ? "view"
                        : "Not Applicable"}
                    </span>
                  </td>
                  <td className="nf-pv-dcell">
                    <span className="nf-pv-dname">
                      अभिभावक घोषणा अभिलेख
                    </span>
                    <span
                      className={`nf-pv-dstatus ${
                        data?.parentDeclarationDocument
                          ? "has"
                          : "na"
                      }`}
                    >
                      {data?.parentDeclarationDocument
                        ? "view"
                        : "Not Applicable"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ═══ 6. घोषणा ═══ */}
          <div className="nf-pv-block">
            <div className="nf-pv-block-label">घोषणा</div>
            <div className="nf-pv-decl-box">
              <p>
                मेरे द्वारा उपरोक्त भरी गई समस्त जानकारी
                पूर्णतयः सत्य एवं सही है। यदि कोई जानकारी
                उपरोक्त में अंकित है और गलत पाई जाती है तो
                विभाग द्वारा नियमानुसार कार्यवाही की जा सकती
                है जिसकी सम्पूर्ण जिम्मेदारी आवेदक की होगी।
              </p>
              <div className="nf-pv-decl-foot">
                {data?.declarationDocument && (
                  <span className="nf-pv-dstatus has">
                    view
                  </span>
                )}
                <span className="nf-pv-sign-name">
                  {data?.childName || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="nf-pv-footer">
          <label className="nf-pv-accept">
            <input
              type="checkbox"
              checked={topAccepted}
              onChange={onTopAcceptedChange}
            />
            <span>
              मैंने समस्त शर्तें पढ़ ली हैं और मैं उनसे
              सहमत हूँ।
            </span>
          </label>
          {topAccepted && (
            <small className="nf-pv-warn">
              बदलाव करने के लिए कृपया ऊपर दिए गए चेकबॉक्स
              को अनचेक करें।
            </small>
          )}
          <button
            type="button"
            className="nf-pv-closebtn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;