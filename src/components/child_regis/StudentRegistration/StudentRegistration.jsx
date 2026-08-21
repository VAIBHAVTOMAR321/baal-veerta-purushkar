import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentRegistration.css";
import { SendOTP } from "../../otpsendverify/SendOTP";
import { VerifyOTP } from "../../otpsendverify/VerifyOTP";

const nominatorCategories = ["स्वयं बालक / बालिका", "माता", "पिता", "विधिक अभिभावक", "विद्यालय के प्रधानाचार्य/प्रधानाध्यापक", "जिलाधिकारी"];
const idTypes = ["आधार कार्ड", "मतदाता पहचान पत्र", "अन्य सरकारी पहचान पत्र"];

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category: "",
    name: "",
    relation: "",
    mobile: "",
    email: "",
    idType: "",
    idNumber: "",
    address: {
      "ग्राम/मोहल्ला": "",
      "डाकघर": "",
      "विकासखण्ड/नगर निकाय": "",
      "जनपद": "",
      "पिन कोड": "",
    },
  });
  const [errors, setErrors] = useState({});
  const [idTypeCustom, setIdTypeCustom] = useState(false);
  const [showSendOtp, setShowSendOtp] = useState(false);
  const [showVerifyOtp, setShowVerifyOtp] = useState(false);
  const [otpMobile, setOtpMobile] = useState("");
  const [districts, setDistricts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  /* ---------- जनपद (District) list from API ---------- */
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

  /* ---------- विकासखण्ड (Project) list — जनपद के अनुसार ---------- */
  const fetchProjects = async (district) => {
    if (!district) {
      setProjects([]);
      return;
    }
    setLoadingProjects(true);
    setProjects([]); // old list clear
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/cdpo-dropdown/?district=${encodeURIComponent(district)}`
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

  const update = (event) => {
    const { name, value } = event.target;

    if (name.startsWith("address.")) {
      const fieldName = name.slice(8);
      setForm((current) => {
        const nextAddress = { ...current.address, [fieldName]: value };
        // जनपद बदलने पर विकासखण्ड रीसेट करें
        if (fieldName === "जनपद") {
          nextAddress["विकासखण्ड/नगर निकाय"] = "";
        }
        return { ...current, address: nextAddress };
      });
      if (fieldName === "जनपद") {
        fetchProjects(value);
      }
    } else {
      setForm((current) => {
        const next = { ...current, [name]: value };
        if (name === "category") {
          if (value === "स्वयं बालक / बालिका") {
            next.relation = "स्वयं";
          } else if (value === "माता" || value === "पिता") {
            next.relation = value;
          } else {
            next.relation = "";
          }
        }
        if (name === "idType") {
          setIdTypeCustom(value === "अन्य सरकारी पहचान पत्र");
          if (value === "अन्य सरकारी पहचान पत्र") {
            next.idType = "";
          }
        }
        return next;
      });
    }

    setErrors((current) => {
      const next = { ...current, [name]: "" };
      if (name === "category") {
        next.relation = "";
      }
      if (name === "mobile" || name === "address.mobile") {
        if (!/^[0-9]{10}$/.test(value)) {
          next.mobile = value.length > 0 ? "मोबाइल नंबर 10 अंकों का होना चाहिए" : "";
        }
      }
      if (name === "email" || name === "address.email") {
        if (value && !/^\S+@\S+\.\S+$/.test(value)) {
          next.email = "कृपया मान्य ई-मेल आईडी दर्ज करें";
        }
      }
      return next;
    });
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    ["category", "name", "mobile", "idType", "idNumber"].forEach((fieldName) => {
      if (!form[fieldName].trim()) nextErrors[fieldName] = "यह फ़ील्ड आवश्यक है";
    });
    if (form.category !== "माता" && form.category !== "पिता" && !form.relation.trim()) {
      nextErrors.relation = "यह फ़ील्ड आवश्यक है";
    }
    Object.keys(form.address).forEach((fieldName) => {
      if (!form.address[fieldName].trim()) nextErrors[`address.${fieldName}`] = "यह फ़ील्ड आवश्यक है";
    });
    if (!/^[0-9]{10}$/.test(form.mobile)) nextErrors.mobile = "मोबाइल नंबर 10 अंकों का होना चाहिए";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "कृपया मान्य ई-मेल आईडी दर्ज करें";
    if (form.address["पिन कोड"] && !/^[0-9]{6}$/.test(form.address["पिन कोड"])) {
      nextErrors["address.पिन कोड"] = "पिन कोड 6 अंकों का होना चाहिए";
    }
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) {
      setShowSendOtp(true);
    }
  };

  const handleOtpSuccess = () => {
    navigate("/NominationForm", { state: { nominator: form } });
  };

  const field = (label, name, options = {}) => {
    const value = name.startsWith("address.") ? form.address[name.slice(8)] : form[name];

    /* Array हो तो हमेशा SELECT render होगा (खाली होने पर भी) */
    if (Array.isArray(options.options)) {
      return (
        <div className="sr-field">
          <label htmlFor={`sr-${name}`}>
            {label}
            {options.required && <span aria-hidden="true"> *</span>}
          </label>
          <select
            id={`sr-${name}`}
            name={name}
            value={value}
            onChange={update}
            aria-invalid={Boolean(errors[name])}
            disabled={options.disabled}
          >
            <option value="">{options.placeholder || "चयन करें"}</option>
            {options.options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors[name] && <span className="sr-error" role="alert">{errors[name]}</span>}
        </div>
      );
    }

    return (
      <div className="sr-field">
        <label htmlFor={`sr-${name}`}>
          {label}
          {options.required && <span aria-hidden="true"> *</span>}
        </label>
        <input
          id={`sr-${name}`}
          name={name}
          type={options.type || "text"}
          value={value}
          onChange={update}
          maxLength={options.maxLength}
          placeholder={options.placeholder}
          disabled={options.disabled}
          aria-invalid={Boolean(errors[name])}
        />
        {errors[name] && <span className="sr-error" role="alert">{errors[name]}</span>}
      </div>
    );
  };

  const selectedDistrict = form.address["जनपद"];

  return (
    <main className="sr-page">
      <header className="sr-header">
        <div className="sr-emblem" aria-hidden="true">उत्तराखण्ड<br /><small>सरकार</small></div>
        <div>
          <p className="sr-kicker">ऑनलाइन नामांकन प्रपत्र</p>
          <h1>मुख्यमंत्री राज्य बाल वीरता पुरस्कार</h1>
          <p>प्रथम स्क्रीन : नामांकनकर्ता का विवरण</p>
        </div>
      </header>

      <form className="sr-shell" onSubmit={submit} noValidate>
        <section className="sr-card">
          <div className="sr-section-title">
            <span className="sr-badge-year">आवेदन वर्ष 2026-27</span>
            <div className="sr-section-center">
              <span className="sr-section-badge">भाग–A</span>
              <div>
                <h2>नामांकनकर्ता (Nominator) का विवरण</h2>
                <p>कृपया सभी आवश्यक जानकारी दर्ज करें</p>
              </div>
            </div>
          </div>

          <div className="sr-grid">
            {field("1. नामांकनकर्ता की श्रेणी", "category", { required: true, options: nominatorCategories })}
            {field("2. नामांकनकर्ता का पूरा नाम", "name", { required: true, placeholder: "पूरा नाम दर्ज करें" })}
            {(() => {
              const isSelf = form.category === "स्वयं बालक / बालिका";
              const isParent = form.category === "माता" || form.category === "पिता";
              const relationOpts = {
                disabled: isSelf || isParent,
                placeholder: isSelf ? "स्वयं" : isParent ? "" : "संबंध दर्ज करें",
              };
              if (isSelf || !isParent) relationOpts.required = true;
              return field("3. बच्चे से संबंध", "relation", relationOpts);
            })()}
            {field("4. मोबाइल नंबर", "mobile", { required: true, type: "tel", maxLength: 10, placeholder: "10 अंकों का मोबाइल नंबर" })}
            {field("5. ई-मेल आईडी", "email", { type: "email", placeholder: "ई-मेल आईडी दर्ज करें" })}

            <div className="sr-field">
              <label htmlFor="sr-idType">6. पहचान पत्र का प्रकार <span aria-hidden="true"> *</span></label>
              {idTypeCustom ? (
                <div className="sr-input-wrap">
                  <input id="sr-idType" name="idType" type="text" value={form.idType} onChange={update} aria-invalid={Boolean(errors.idType)} />
                  <button
                    type="button"
                    className="sr-reset"
                    onClick={() => {
                      setForm((c) => ({ ...c, idType: "" }));
                      setIdTypeCustom(false);
                    }}
                    aria-label="Reset"
                  >
                    ↺
                  </button>
                </div>
              ) : (
                <select id="sr-idType" name="idType" value={form.idType} onChange={update} aria-invalid={Boolean(errors.idType)}>
                  <option value="">चयन करें</option>
                  {idTypes.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}
              {errors.idType && <span className="sr-error" role="alert">{errors.idType}</span>}
            </div>

            {field("7. पहचान पत्र संख्या", "idNumber", { required: true, placeholder: "पहचान पत्र संख्या दर्ज करें" })}
          </div>

          <fieldset className="sr-address">
            <legend>8. नामांकनकर्ता का पता <span aria-hidden="true">*</span></legend>
            <div className="sr-grid">
              {field("ग्राम/मोहल्ला", "address.ग्राम/मोहल्ला", { required: true, placeholder: "ग्राम/मोहल्ला का नाम" })}
              {field("डाकघर", "address.डाकघर", { required: true, placeholder: "डाकघर का नाम" })}

              {field("जनपद", "address.जनपद", {
                required: true,
                options: districts,
                placeholder: loadingDistricts ? "लोड हो रहा है..." : "जनपद चुनें",
                disabled: loadingDistricts,
              })}

              {field("विकासखण्ड/नगर निकाय", "address.विकासखण्ड/नगर निकाय", {
                required: true,
                options: projects,
                placeholder: !selectedDistrict
                  ? "पहले जनपद चुनें"
                  : loadingProjects
                  ? "लोड हो रहा है..."
                  : projects.length === 0
                  ? "कोई विकासखण्ड उपलब्ध नहीं"
                  : "विकासखण्ड/नगर निकाय चुनें",
                disabled: loadingProjects || !selectedDistrict || projects.length === 0,
              })}

              {field("पिन कोड", "address.पिन कोड", { required: true, type: "tel", maxLength: 6, placeholder: "6 अंकों का पिन कोड" })}
            </div>
          </fieldset>
        </section>

        <div className="sr-actions">
          <button className="sr-primary" type="submit">रजिस्टर करें</button>
        </div>

        <SendOTP
          show={showSendOtp}
          onClose={() => setShowSendOtp(false)}
          onSuccess={(mobile) => {
            setOtpMobile(mobile);
            setShowSendOtp(false);
            setShowVerifyOtp(true);
          }}
        />
        <VerifyOTP
          show={showVerifyOtp}
          onClose={() => setShowVerifyOtp(false)}
          mobile={otpMobile}
          onSuccess={handleOtpSuccess}
        />
      </form>
    </main>
  );
};

export default StudentRegistration;