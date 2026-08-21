import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentRegistration.css";

const nominatorCategories = ["स्वयं बालक / बालिका", "माता", "पिता", "विधिक अभिभावक", "विद्यालय के प्रधानाचार्य/प्रधानाध्यापक", "जिलाधिकारी"];
const idTypes = ["आधार कार्ड", "मतदाता पहचान पत्र", "अन्य सरकारी पहचान पत्र"];
const addressFields = ["ग्राम/मोहल्ला", "डाकघर", "विकासखण्ड/नगर निकाय", "जनपद", "पिन कोड"];

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    applicationYear: new Date().getFullYear().toString(),
    applicationNumber: "System Generated",
    applicationDate: "System Generated",
    category: "",
    name: "",
    relation: "",
    mobile: "",
    email: "",
    idType: "",
    idNumber: "",
    address: Object.fromEntries(addressFields.map((field) => [field, ""])),
  });
  const [errors, setErrors] = useState({});

  const update = (event) => {
    const { name, value } = event.target;
    if (name.startsWith("address.")) {
      setForm((current) => ({ ...current, address: { ...current.address, [name.slice(8)]: value } }));
    } else {
      setForm((current) => ({ ...current, [name]: value }));
    }
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    ["category", "name", "relation", "mobile", "idType", "idNumber"].forEach((field) => {
      if (!form[field].trim()) nextErrors[field] = "यह फ़ील्ड आवश्यक है";
    });
    addressFields.forEach((field) => {
      if (!form.address[field].trim()) nextErrors[`address.${field}`] = "यह फ़ील्ड आवश्यक है";
    });
    if (!/^[0-9]{10}$/.test(form.mobile)) nextErrors.mobile = "मोबाइल नंबर 10 अंकों का होना चाहिए";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "कृपया मान्य ई-मेल आईडी दर्ज करें";
    if (form["address.Пин код"] && !/^[0-9]{6}$/.test(form["address.Пин код"])) nextErrors["address.Пिन код"] = "पिन कोड 6 अंकों का होना चाहिए";
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) navigate("/NominationForm", { state: { nominator: form } });
  };

  const field = (label, name, options = {}) => {
    const value = name.startsWith("address.") ? form.address[name.slice(8)] : form[name];
    return (
    <div className="sr-field">
      <label htmlFor={`sr-${name}`}>{label}{options.required && <span aria-hidden="true"> *</span>}</label>
      {options.options ? (
        <select id={`sr-${name}`} name={name} value={value} onChange={update} aria-invalid={Boolean(errors[name])}>
          <option value="">चयन करें</option>
          {options.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input id={`sr-${name}`} name={name} type={options.type || "text"} value={value} onChange={update} maxLength={options.maxLength} readOnly={name === "applicationNumber" || name === "applicationDate"} aria-invalid={Boolean(errors[name])} />
      )}
      {errors[name] && <span className="sr-error" role="alert">{errors[name]}</span>}
    </div>
    );
  };

  return (
    <main className="sr-page">
      <header className="sr-header">
        <div className="sr-emblem" aria-hidden="true">उत्तराखण्ड<br /><small>सरकार</small></div>
        <div><p className="sr-kicker">ऑनलाइन नामांकन प्रपत्र</p><h1>मुख्यमंत्री राज्य बाल वीरता पुरस्कार</h1><p>प्रथम स्क्रीन : नामांकनकर्ता का विवरण</p></div>
      </header>
      <form className="sr-shell" onSubmit={submit} noValidate>
        <section className="sr-meta" aria-label="आवेदन विवरण">
          {field("आवेदन वर्ष", "applicationYear", { required: true, type: "number" })}
          {field("Application Number (System Generated)", "applicationNumber")}
          {field("आवेदन की दिनांक (System Generated)", "applicationDate")}
        </section>
        <section className="sr-card">
          <div className="sr-section-title"><span>भाग–A</span><div><h2>नामांकनकर्ता (Nominator) का विवरण</h2><p>कृपया सभी आवश्यक जानकारी दर्ज करें</p></div></div>
          <div className="sr-grid">
            {field("1. नामांकनकर्ता की श्रेणी", "category", { required: true, options: nominatorCategories })}
            {field("2. नामांकनकर्ता का पूरा नाम", "name", { required: true })}
            {field("3. बच्चे से संबंध", "relation", { required: true })}
            {field("4. मोबाइल नंबर", "mobile", { required: true, type: "tel", maxLength: 10 })}
            {field("5. ई-मेल आईडी", "email", { type: "email" })}
            {field("6. पहचान पत्र का प्रकार", "idType", { required: true, options: idTypes })}
            {field("7. पहचान पत्र संख्या", "idNumber", { required: true })}
          </div>
          <fieldset className="sr-address"><legend>8. नामांकनकर्ता का पता <span aria-hidden="true">*</span></legend><div className="sr-grid">{addressFields.map((addressField) => field(addressField, `address.${addressField}`, { required: true, type: addressField === "पिन कोड" ? "tel" : "text", maxLength: addressField === "पिन कोड" ? 6 : undefined }))}</div></fieldset>
        </section>
        <div className="sr-actions"><p><span aria-hidden="true">*</span> आवश्यक फ़ील्ड</p><button className="sr-primary" type="submit">Continue / आगे बढ़ें <span aria-hidden="true">→</span></button></div>
      </form>
    </main>
  );
};

export default StudentRegistration;