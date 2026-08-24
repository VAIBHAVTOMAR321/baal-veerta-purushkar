import React from "react";
import { FaEye } from "react-icons/fa";

const documents = [
  ["नामांकनकर्ता का पहचान पत्र", "अनिवार्य"],
  ["बच्चे का आधार कार्ड/पहचान पत्र", "अनिवार्य"],
  ["उत्तराखण्ड का स्थायी निवास प्रमाण पत्र", "अनिवार्य"],
  ["बच्चे का जन्म प्रमाण पत्र/आयु प्रमाण पत्र", "अनिवार्य"],
  ["वीरता की घटना के संबंध में नामांकनकर्ता द्वारा हस्ताक्षरित विस्तृत विवरण", "अनिवार्य"],
  ["बच्चे का पासपोर्ट आकार का फोटो", "अनिवार्य"],
  ["FIR/पुलिस रिपोर्ट", "जहां लागू हो"],
  ["समाचार पत्र की कटिंग/मीडिया रिपोर्ट", "यदि उपलब्ध हो"],
  ["प्रत्यक्षदर्शियों के बयान/प्रमाण", "यदि लागू हो"],
  ["घटना से संबंधित फोटो/वीडियो", "यदि उपलब्ध हो"],
  ["विद्यालय का प्रमाण पत्र", "यदि लागू हो"],
  ["अन्य सहायक अभिलेख", "यदि लागू हो"],
];

const StepD = ({ data, update, error }) => {
  const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

  const handleFileChange = (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    const mimeType = file.type.toLowerCase();

    const isExtensionAllowed = allowedExtensions.includes(extension);
    const isMimeTypeAllowed = allowedMimeTypes.includes(mimeType);

    if (!isExtensionAllowed || !isMimeTypeAllowed) {
      e.target.value = "";
      update({
        target: {
          name: `document${index}`,
          value: null,
        },
      });
      alert(
        `अवैध फ़ाइल प्रकार: "${extension?.toUpperCase() || "Unknown"}"\n\nकृपया केवल PDF, JPG, JPEG, PNG फ़ाइलें अपलोड करें।\nHEIC/HEIF और अन्य फॉर्मेट स्वीकार नहीं हैं।`
      );
      return;
    }

    update(e);
  };

  const handleViewFile = (file) => {
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);

    window.open(fileUrl, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      URL.revokeObjectURL(fileUrl);
    }, 10000);
  };

  return (
    <section className="nf-card">
      <div className="nf-card-heading">
        <span>Step 4</span>
        <h2>आवश्यक अभिलेख अपलोड (Document Upload)</h2>
      </div>

      <div className="nf-upload-list">
        {documents.map(([label, applicability], index) => {
          const isPhotoVideoLink = index === 9;
          const file = data[`document${index}`];

          return (
            <div className="nf-upload" key={label}>
              <div className="nf-upload-header">
                <div>
                  <strong>
                    {index + 1}. {label}
                  </strong>

                  <span
                    className={`nf-tag ${
                      applicability === "अनिवार्य" ? "required" : ""
                    }`}
                  >
                    {applicability}
                  </span>
                </div>

                {file && !isPhotoVideoLink && (
                  <button
                    type="button"
                    className="nf-view-file"
                    onClick={() => handleViewFile(file)}
                    title="View Document"
                  >
                    <FaEye />
                  </button>
                )}
              </div>

              {isPhotoVideoLink ? (
                <div className="nf-field">
                  <input
                    id={`nf-document-${index}`}
                    name={`document${index}`}
                    type="url"
                    placeholder="https://example.com/photo-or-video-link"
                    value={file || ""}
                    onChange={update}
                    aria-describedby={`nf-document-help-${index}`}
                  />
                  {error[`document${index}`] && (
                    <small className="nf-error">
                      {error[`document${index}`]}
                    </small>
                  )}
                  <small id={`nf-document-help-${index}`}>
                    कृपया फोटो/वीडियो का लिंक दर्ज करें
                  </small>
                </div>
              ) : (
                <>
                  <input
                    id={`nf-document-${index}`}
                    name={`document${index}`}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, index)}
                    aria-describedby={`nf-document-help-${index}`}
                  />

                  {file && (
                    <small className="nf-file-name">
                      {file.name}
                    </small>
                  )}

                  {error[`document${index}`] && (
                    <small className="nf-error">
                      {error[`document${index}`]}
                    </small>
                  )}

                  <small id={`nf-document-help-${index}`}>
                    File Format: PDF/JPG/JPEG/PNG only | Max Size: 5MB प्रति दस्तावेज
                  </small>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default StepD;