import React, { useEffect, useRef, useState } from "react";

const addressFields = ["ग्राम/मोहल्ला", "डाकघर", "जनपद", "विकासखण्ड/नगर निकाय", "पिन कोड"];

const StepB = ({ data, update, error }) => {
  const [resident, setResident] = useState(data?.resident || "");
  const [sameAsPermanent, setSameAsPermanent] = useState(false);
  const [childMobileError, setChildMobileError] = useState("");
  const [nominator, setNominator] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentProjects, setCurrentProjects] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(data?.permanentजनपद || "");
  const [currentSelectedDistrict, setCurrentSelectedDistrict] = useState(data?.currentजनपद || "");
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

  useEffect(() => {
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const response = await fetch("http://127.0.0.1:8000/api/cdpo-dropdown/");
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setDistricts([...new Set(result.data.map((item) => item.district).filter(Boolean))]);
        }
      } catch (error) {
        console.error("Failed to fetch districts:", error);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    const fetchProjectsForDistrict = async () => {
      if (!selectedDistrict) {
        setProjects([]);
        return;
      }
      setLoadingProjects(true);
      setProjects([]);
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/cdpo-dropdown/?district=${encodeURIComponent(selectedDistrict)}`
        );
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setProjects([...new Set(result.data.map((item) => item.project_name).filter(Boolean))]);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjectsForDistrict();
  }, [selectedDistrict]);

  useEffect(() => {
    const fetchCurrentProjects = async () => {
      if (!currentSelectedDistrict) {
        setCurrentProjects([]);
        return;
      }
      setLoadingProjects(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/cdpo-dropdown/?district=${encodeURIComponent(currentSelectedDistrict)}`
        );
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setCurrentProjects([...new Set(result.data.map((item) => item.project_name).filter(Boolean))]);
        } else {
          setCurrentProjects([]);
        }
      } catch (error) {
        console.error("Failed to fetch current projects:", error);
        setCurrentProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchCurrentProjects();
  }, [currentSelectedDistrict]);

  const nominatorCategory = data?.nominator_category || "";
  const registeredCategory = String(nominator?.nominator_category || nominatorCategory).toLowerCase();
  const nominatorName = nominator?.full_name || data?.full_name || "";

  const isSelf = ["self", "स्वयं", "स्वयं बालक / बालिका"].includes(registeredCategory);
  const isMother = ["mother", "माता"].includes(registeredCategory);
  const isFather = ["father", "पिता"].includes(registeredCategory);
  const isLegalGuardian = ["legal_guardian", "विधिक अभिभावक"].includes(registeredCategory);

  const today = new Date().toISOString().split("T")[0];

  const nameFields = ["childName", "fatherName", "motherName", "guardianName"];
  const numericPattern = /[0-9]/g;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "resident") {
      setResident(value);
    }
    if (name === "childMobile") {
      const numericOnly = value.replace(/[^0-9]/g, "").slice(0, 10);
      update({ target: { name, value: numericOnly, type: "text" } });
      if (numericOnly.length > 0 && numericOnly.length < 10) {
        setChildMobileError("मोबाइल नंबर 10 अंकों का होना चाहिए");
      } else {
        setChildMobileError("");
      }
      return;
    }
    if (name === "permanentजनपद") {
      setSelectedDistrict(value);
      update({ target: { name: "permanentविकासखण्ड/नगर निकाय", value: "", type: "text" } });
    }
    if (name === "currentजनपद") {
      setCurrentSelectedDistrict(value);
      update({ target: { name: "currentविकासखण्ड/नगर निकाय", value: "", type: "text" } });
    }
    if (nameFields.includes(name)) {
      const sanitized = value.replace(numericPattern, "");
      update({ target: { name, value: sanitized, type: "text" } });
    } else if (name && addressFields.some((field) => name === `current${field}`)) {
      setSameAsPermanent(false);
      update(e);
    } else {
      update(e);
    }
  };

  const handleSameAsPermanent = (e) => {
    const checked = e.target.checked;
    setSameAsPermanent(checked);
    if (checked) {
      const currentAddressParts = [];
      addressFields.forEach((field) => {
        const permanentValue = data[`permanent${field}`] || "";
        currentAddressParts.push(permanentValue);
        update({ target: { name: `current${field}`, value: permanentValue, type: "text" } });
        if (field === "जनपद") {
          setCurrentSelectedDistrict(permanentValue);
        }
      });
      update({ target: { name: "currentAddress", value: currentAddressParts.join(", "), type: "text" } });
    } else {
      addressFields.forEach((field) => {
        update({ target: { name: `current${field}`, value: "", type: "text" } });
        if (field === "जनपद") {
          setCurrentSelectedDistrict("");
        }
      });
      update({ target: { name: "currentAddress", value: "", type: "text" } });
    }
  };

  const isNotUttarakhand = resident === "नहीं";

  const input = (label, name, options = {}) => {
    const isSelect = Array.isArray(options.options);
    const disabled = isNotUttarakhand && name !== "resident" ? true : (options.disabled || false);
    let value = data[name] || "";

    if (name === "childName" && isSelf) value = nominatorName;
    if (name === "fatherName" && isFather) value = nominatorName;
    if (name === "motherName" && isMother) value = nominatorName;
    if (name === "guardianName" && isLegalGuardian) value = nominatorName;

    const extraProps = {};
    if (name === "birthDate") {
      extraProps.max = today;
    }

    return (
      <div className="nf-field">
        <label htmlFor={`nf-${name}`}>{label}{options.required && <span> *</span>}</label>
        {isSelect ? (
          <select id={`nf-${name}`} name={name} value={value} onChange={handleChange} disabled={disabled}>
            <option value="">{options.placeholder || "चयन करें"}</option>
            {options.options.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        ) : (
          <input id={`nf-${name}`} name={name} type={options.type || "text"} value={value} placeholder={options.placeholder} onChange={handleChange} disabled={disabled} {...extraProps} />
        )}
        {error[name] && <small className="nf-error">{error[name]}</small>}
        {name === "childMobile" && childMobileError && <small className="nf-error">{childMobileError}</small>}
      </div>
    );
  };

  return (
    <section className="nf-card nf-step-b">
      <div className="nf-card-heading">
        <span>Step 1</span>
        <h2>नामांकित बच्चे का व्यक्तिगत विवरण (Nominee Details)</h2>
      </div>
      {isNotUttarakhand && (
        <div className="nf-ineligible-message">आप इस लिए eligible नहीं हो</div>
      )}
      <div className="nf-grid">
        {input("1. बच्चे का पूरा नाम", "childName", { required: true, placeholder: "बच्चे का पूरा नाम", disabled: isSelf })}
        {input("2. पिता का नाम", "fatherName", { required: true, placeholder: "पिता का पूरा नाम", disabled: isFather })}
        {input("3. माता का नाम", "motherName", { required: true, placeholder: "माता का पूरा नाम", disabled: isMother })}
        {input("4. अभिभावक का नाम (यदि लागू हो)", "guardianName", { placeholder: "अभिभावक का पूरा नाम", disabled: isLegalGuardian })}
        {input("5. बच्चे/अभिभावक का मोबाइल नंबर", "childMobile", { type: "tel", placeholder: "10 अंकों का मोबाइल नंबर" })}
        {input("6. जन्म तिथि", "birthDate", { required: true, type: "date" })}
        {input("7. लिंग", "gender", { required: true, options: ["बालक", "बालिका", "अन्य"], placeholder: "लिंग चुनें" })}
        {input("8. उत्तराखण्ड का स्थायी निवासी", "resident", { required: true, options: ["हाँ", "नहीं"], placeholder: "चुनें" })}
      </div>
      <fieldset className="nf-subsection nf-subsection-left">
        <legend>9. स्थायी निवास का पता <span>*</span></legend>
        <div className="nf-grid nf-address-grid">
          {addressFields.map((field) => {
            if (field === "जनपद") {
              return input("जनपद", `permanent${field}`, { required: true, options: districts, placeholder: loadingDistricts ? "लोड हो रहा है..." : "जनपद चुनें", disabled: loadingDistricts });
            }
            if (field === "विकासखण्ड/नगर निकाय") {
              return input("विकासखण्ड/नगर निकाय", `permanent${field}`, { required: true, options: projects, placeholder: !selectedDistrict ? "पहले जनपद चुनें" : loadingProjects ? "लोड हो रहा है..." : projects.length === 0 ? "कोई विकासखण्ड उपलब्ध नहीं" : "विकासखण्ड/नगर निकाय चुनें", disabled: loadingProjects || !selectedDistrict || projects.length === 0 });
            }
            return input(field, `permanent${field}`, { required: true, placeholder: `${field} दर्ज करें` });
          })}
        </div>
      </fieldset>
      <div className="nf-field nf-checkbox-field">
        <label>
          <input type="checkbox" checked={sameAsPermanent} onChange={handleSameAsPermanent} disabled={isNotUttarakhand} />
          स्थायी पते के समान
        </label>
      </div>
      <fieldset className="nf-subsection nf-subsection-left">
        <legend>10. वर्तमान पता (यदि स्थायी पते से भिन्न हो)</legend>
        <div className="nf-grid nf-address-grid">
          {addressFields.map((field) => {
            if (field === "जनपद") {
              return input("जनपद", `current${field}`, { required: true, options: districts, placeholder: loadingDistricts ? "लोड हो रहा है..." : "जनपद चुनें", disabled: loadingDistricts });
            }
            if (field === "विकासखण्ड/नगर निकाय") {
              return input("विकासखण्ड/नगर निकाय", `current${field}`, { required: true, options: currentProjects, placeholder: !currentSelectedDistrict ? "पहले जनपद चुनें" : loadingProjects ? "लोड हो रहा है..." : currentProjects.length === 0 ? "कोई विकासखण्ड उपलब्ध नहीं" : "विकासखण्ड/नगर निकाय चुनें", disabled: loadingProjects || !currentSelectedDistrict || currentProjects.length === 0 });
            }
            return input(field, `current${field}`, { placeholder: `${field} दर्ज करें` });
          })}
        </div>
      </fieldset>
      <div className="nf-grid">
        {input("11. विद्यालय का नाम", "schoolName", { placeholder: "विद्यालय का नाम" })}
        {input("12. विद्यालय का पता", "schoolAddress", { placeholder: "विद्यालय का पता" })}
        {input("13. वर्तमान कक्षा", "currentClass", { placeholder: "कक्षा दर्ज करें" })}
      </div>
    </section>
  );
};

export default StepB;
