import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentRegistration.css";
import { SendOTP } from "../../otpsendverify/SendOTP";
import { VerifyOTP } from "../../otpsendverify/VerifyOTP";
import { submitNominatorPart1 } from "../../otpsendverify/api";

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
    password: "",
    confirmPassword: "",
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
  const [showEligibility, setShowEligibility] = useState(false);
  const [childDob, setChildDob] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eligibilityMessage, setEligibilityMessage] = useState("");
  const [eligibilityStatus, setEligibilityStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const today = new Date().toISOString().split("T")[0];

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
    let { name, value } = event.target;
    let hadNumbers = false;

    if ((name === "name" || name === "relation") && /[0-9]/.test(value)) {
      hadNumbers = true;
      value = value.replace(/[0-9]/g, "");
    }

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
      if (hadNumbers) {
        next[name] = "केवल अक्षर दर्ज करें, नंबर नहीं।";
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
      if (name === "confirmPassword" && value && form.password && value !== form.password) {
        next.confirmPassword = "पासवर्ड और कन्फर्म पासवर्ड समान होने चाहिए";
      }
      return next;
    });
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    ["category", "name", "mobile", "password", "confirmPassword", "idType", "idNumber"].forEach((fieldName) => {
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
    if (form.password && form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "पासवर्ड और कन्फर्म पासवर्ड समान होने चाहिए";
    }
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) {
      setShowSendOtp(true);
    }
  };

  const handleOtpSuccess = async (res) => {
    setLoading(true);
    try {
      if (!res?.access) {
        throw new Error("OTP सत्यापन से access token प्राप्त नहीं हुआ।");
      }
      const idTypeMap = {
        "आधार कार्ड": "aadhaar",
        "मतदाता पहचान पत्र": "voter_id",
      };

      const payload = {
        nominator_category: form.category,
        full_name: form.name,
        relat_with_child: form.relation,
        email: form.email,
        password: form.password,
        id_proof_type: idTypeCustom ? null : (idTypeMap[form.idType] || form.idType),
        id_proof_no: form.idNumber,
        village: form.address["ग्राम/मोहल्ला"],
        post_office: form.address["डाकघर"],
        project: form.address["विकासखण्ड/नगर निकाय"],
        district: form.address["जनपद"],
        pincode: form.address["पिन कोड"],
        id_proof_type_other: idTypeCustom ? form.idType : null,
      };

      console.log("[StudentRegistration] Submitting payload:", payload);
      console.log("[StudentRegistration] Using token:", res?.access);

      await submitNominatorPart1(payload, res?.access);
      navigate("/", { state: { registrationSuccess: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = () => {
    if (!childDob) {
      setEligibilityMessage("कृपया बच्चे की जन्म तिथि दर्ज करें।");
      setEligibilityStatus("error");
      return;
    }
    if (!eventDate) {
      setEligibilityMessage("कृपया वीरता की घटना की तारीख दर्ज करें।");
      setEligibilityStatus("error");
      return;
    }

    const dob = new Date(childDob);
    const event = new Date(eventDate);
    const eighteenthBirthday = new Date(dob);
    eighteenthBirthday.setFullYear(dob.getFullYear() + 18);

    if (event < eighteenthBirthday) {
      setEligibilityMessage("बच्चा पात्र है। घटना के समय उम्र 18 वर्ष से कम थी।");
      setEligibilityStatus("success");
    } else {
      setEligibilityMessage("बच्चा पात्र नहीं है। घटना के समय उम्र 18 वर्ष या उससे अधिक थी।");
      setEligibilityStatus("error");
    }
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
            <button type="button" className="sr-eligibility-btn" onClick={() => setShowEligibility(!showEligibility)}>
              पात्रता जांचें
            </button>
          </div>

          {showEligibility && (
            <div className="sr-eligibility-box">
              <h4>बच्चे की पात्रता जांच</h4>
              <div className="sr-field">
                <label htmlFor="child-dob">बच्चे की जन्म तिथि</label>
                <input
                  id="child-dob"
                  type="date"
                  value={childDob}
                  onChange={(e) => setChildDob(e.target.value)}
                  max={today}
                />
              </div>
              <div className="sr-field">
                <label htmlFor="event-date">वीरता की घटना की तारीख</label>
                <input
                  id="event-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  max={today}
                />
              </div>
              <button type="button" className="sr-eligibility-check-btn" onClick={checkEligibility}>
                जांचें
              </button>
              {eligibilityMessage && (
                <div className={`sr-eligibility-message ${eligibilityStatus}`}>
                  {eligibilityMessage}
                </div>
              )}
            </div>
          )}

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

          <div className="sr-grid">
            <div className="sr-field">
              <label htmlFor="sr-password">9. पासवर्ड <span aria-hidden="true"> *</span></label>
              <div className="sr-input-wrap">
                <input
                  id="sr-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="पासवर्ड दर्ज करें"
                  value={form.password}
                  onChange={update}
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  className="sr-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "पासवर्ड छिपाएं" : "पासवर्ड दिखाएं"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="sr-error" role="alert">{errors.password}</span>}
            </div>
            <div className="sr-field">
              <label htmlFor="sr-confirmPassword">10. पासवर्ड की पुष्टि करें <span aria-hidden="true"> *</span></label>
              <div className="sr-input-wrap">
                <input
                  id="sr-confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="पासवर्ड दोबारा दर्ज करें"
                  value={form.confirmPassword}
                  onChange={update}
                  aria-invalid={Boolean(errors.confirmPassword)}
                />
                <button
                  type="button"
                  className="sr-password-toggle"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "पासवर्ड छिपाएं" : "पासवर्ड दिखाएं"}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <span className="sr-error" role="alert">{errors.confirmPassword}</span>}
            </div>
          </div>
        </section>

        {error && (
          <div className="sr-error" role="alert" style={{ textAlign: "center", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <div className="sr-actions">
          <button className="sr-primary" type="submit" disabled={loading}>
            {loading ? "पंजीकरण हो रहा है..." : "रजिस्टर करें"}
          </button>
        </div>

      </form>

      <SendOTP
        show={showSendOtp}
        onClose={() => setShowSendOtp(false)}
        defaultMobile={form.mobile}
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
    </main>
  );
};

export default StudentRegistration;