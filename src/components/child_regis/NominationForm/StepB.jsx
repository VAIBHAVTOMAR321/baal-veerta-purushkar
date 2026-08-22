import React, { useEffect, useRef, useState } from "react";

const addressFields = ["ग्राम/मोहल्ला", "डाकघर", "विकासखण्ड/नगर निकाय", "जनपद", "पिन कोड"];

const StepB = ({ data, update, error }) => {
  const [nominator, setNominator] = useState(null);
  const fetchStarted = useRef(false);

  useEffect(() => {
    if (fetchStarted.current) return;
    fetchStarted.current = true;
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const fetchNominator = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/bravery/nominator-part1/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;

        const result = await response.json();
        const record = Array.isArray(result.data) ? result.data[0] : null;
        if (record) {
          setNominator(record);
          const category = String(record.nominator_category || "").toLowerCase();
          const fieldName = {
            self: "childName",
            "स्वयं बालक / बालिका": "childName",
            mother: "motherName",
            "माता": "motherName",
            father: "fatherName",
            "पिता": "fatherName",
            legal_guardian: "guardianName",
            "विधिक अभिभावक": "guardianName",
          }[category];
          if (fieldName && record.full_name) {
            update({ target: { name: fieldName, value: record.full_name, type: "text" } });
          }
        }
      } catch (fetchError) {
        console.error("Failed to fetch nominator details:", fetchError);
      }
    };

    fetchNominator();
  }, [update]);

  const nominatorCategory = data?.nominator_category || "";
  const registeredCategory = String(nominator?.nominator_category || nominatorCategory).toLowerCase();
  const nominatorName = nominator?.full_name || data?.full_name || "";

  const isSelf = ["self", "स्वयं", "स्वयं बालक / बालिका"].includes(registeredCategory);
  const isMother = ["mother", "माता"].includes(registeredCategory);
  const isFather = ["father", "पिता"].includes(registeredCategory);
  const isLegalGuardian = ["legal_guardian", "विधिक अभिभावक"].includes(registeredCategory);

  const input = (label, name, options = {}) => {
    const isSelect = options.options && options.options.length > 0;
    const disabled = options.disabled || false;
    let value = data[name] || "";

    if (name === "childName" && isSelf) value = nominatorName;
    if (name === "fatherName" && isFather) value = nominatorName;
    if (name === "motherName" && isMother) value = nominatorName;
    if (name === "guardianName" && isLegalGuardian) value = nominatorName;

    return (
      <div className="nf-field">
        <label htmlFor={`nf-${name}`}>{label}{options.required && <span> *</span>}</label>
        {isSelect ? (
          <select id={`nf-${name}`} name={name} value={value} onChange={update} disabled={disabled}>
            <option value="">{options.placeholder || "चयन करें"}</option>
            {options.options.map((option) => <option key={option}>{option}</option>)}
          </select>
        ) : (
          <input id={`nf-${name}`} name={name} type={options.type || "text"} value={value} placeholder={options.placeholder} onChange={update} disabled={disabled} />
        )}
        {error[name] && <small className="nf-error">{error[name]}</small>}
      </div>
    );
  };

  return (
    <section className="nf-card nf-step-b">
      <div className="nf-card-heading">
        <span>Step 1</span>
        <h2>नामांकित बच्चे का व्यक्तिगत विवरण (Nominee Details)</h2>
      </div>
      <div className="nf-grid">
        {input("1. बच्चे का पूरा नाम", "childName", { required: true, placeholder: "बच्चे का पूरा नाम", disabled: isSelf })}
        {input("2. पिता का नाम", "fatherName", { required: true, placeholder: "पिता का पूरा नाम", disabled: isFather })}
        {input("3. माता का नाम", "motherName", { required: true, placeholder: "माता का पूरा नाम", disabled: isMother })}
        {input("4. अभिभावक का नाम (यदि लागू हो)", "guardianName", { placeholder: "अभिभावक का पूरा नाम", disabled: isLegalGuardian })}
        {input("5. जन्म तिथि", "birthDate", { required: true, type: "date" })}
        <div className="nf-field">
          <label>6. घटना के समय आयु <span>*</span></label>
          <div className="nf-inline">
            {input("वर्ष", "ageYears", { required: true, type: "number", placeholder: "वर्ष" })}
            {input("माह", "ageMonths", { required: true, type: "number", placeholder: "माह" })}
          </div>
        </div>
        {input("7. लिंग", "gender", { required: true, options: ["बालक", "बालिका", "अन्य"], placeholder: "लिंग चुनें" })}
        {input("8. उत्तराखण्ड का स्थायी निवासी", "resident", { required: true, options: ["हाँ", "नहीं"], placeholder: "चुनें" })}
      </div>
      <fieldset className="nf-subsection">
        <legend>9. स्थायी निवास का पता <span>*</span></legend>
        <div className="nf-grid nf-address-grid">
          {addressFields.map((field) => input(field, `permanent${field}`, { required: true, placeholder: `${field} दर्ज करें` }))}
        </div>
      </fieldset>
      <div className="nf-grid">
        {input("10. वर्तमान पता (यदि स्थायी पते से भिन्न हो)", "currentAddress", { placeholder: "वर्तमान पता दर्ज करें" })}
        {input("11. विद्यालय का नाम", "schoolName", { placeholder: "विद्यालय का नाम" })}
        {input("12. विद्यालय का पता", "schoolAddress", { placeholder: "विद्यालय का पता" })}
        {input("13. वर्तमान कक्षा", "currentClass", { placeholder: "कक्षा दर्ज करें" })}
        {input("14. बच्चे/अभिभावक का मोबाइल नंबर", "childMobile", { type: "tel", placeholder: "10 अंकों का मोबाइल नंबर" })}
      </div>
    </section>
  );
};

export default StepB;
