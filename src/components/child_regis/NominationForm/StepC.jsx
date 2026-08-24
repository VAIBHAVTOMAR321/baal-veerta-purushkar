import React, { useState, useRef, useEffect } from "react";

const natureOptions = ["किसी व्यक्ति के जीवन की रक्षा", "स्वयं के जीवन की रक्षा हेतु साहसिक कार्य", "आपदा/प्राकृतिक आपदा में साहसिक कार्य", "दुर्घटना में बचाव कार्य", "डूबते हुए व्यक्ति को बचाना", "आग/अग्निकांड में बचाव कार्य", "अपराध/आपराधिक घटना के दौरान साहसिक कार्य", "अन्य असाधारण साहसिक कार्य"];

const StepC = ({ data, update, error }) => {
  const [customTitleActive, setCustomTitleActive] = useState(false);
  const [rescuedPeople, setRescuedPeople] = useState(data.rescuedDetails?.people?.length ? data.rescuedDetails.people : [{ name: "", age: "", relation: "" }]);
  const [witnesses, setWitnesses] = useState(data.witnesses?.length ? data.witnesses : [{ name: "", mobile: "", address: "", relation: "" }]);
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [isOverAge, setIsOverAge] = useState(false);
  const customTitleRef = useRef(null);
  const fetchDistrictsRef = useRef(false);

  useEffect(() => {
    if (fetchDistrictsRef.current) return;
    fetchDistrictsRef.current = true;
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const response = await fetch("https://mahadevaaya.com/balvirtaawardproject/balvirtaawardproject_backend/api/cdpo-dropdown/");
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
    if (data.actDate && data.birthDate) {
      const incident = new Date(data.actDate);
      const dob = new Date(data.birthDate);
      let years = incident.getFullYear() - dob.getFullYear();
      let months = incident.getMonth() - dob.getMonth();
      let days = incident.getDate() - dob.getDate();
      if (days < 0) {
        months--;
        const prevMonth = new Date(incident.getFullYear(), incident.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }
      const formatted = `${years} वर्ष ${months} महीने ${days} दिन`;
      update({ target: { name: "incidentAge", value: formatted } });
      setIsOverAge(years > 18);
    } else {
      setIsOverAge(false);
    }
  }, [data.actDate, data.birthDate]);
  const input = (label, name, options = {}) => {
    const value = data[name] || "";
    const wordCount = options.textarea ? value.trim().split(/\s+/).filter(Boolean).length : 0;
    const wordValidation = options.words || null;
    const isWordValid = wordValidation ? wordCount >= wordValidation.min && wordCount <= wordValidation.max : true;
    const showWordCount = wordValidation && value.trim().length > 0;

    return (
      <div className={`nf-field ${options.wide ? "nf-wide" : ""} ${options.fieldClassName || ""}`}>
        <label htmlFor={`nf-${name}`}>{label}{options.required && <span> *</span>}</label>
        {options.options ? (
          <select id={`nf-${name}`} name={name} value={value} onChange={update} disabled={options.alwaysEnabled ? false : (isOverAge || options.disabled)}>
            <option value="">{options.placeholder || "चयन करें"}</option>
            {options.options.map((option) => <option key={option}>{option}</option>)}
          </select>
        ) : options.textarea ? (
          <textarea id={`nf-${name}`} name={name} value={value} onChange={update} rows={options.rows || 4} disabled={isOverAge} />
        ) : (
          <input id={`nf-${name}`} name={name} type={options.type || "text"} value={value} onChange={update} disabled={options.alwaysEnabled ? false : (isOverAge || options.disabled)} />
        )}
        {showWordCount && (
          <small className={`nf-word-count ${!isWordValid ? "nf-invalid" : ""}`}>
            {wordCount} शब्द {!isWordValid && `(कम से कम ${wordValidation.min} और अधिकतम ${wordValidation.max} शब्द आवश्यक)`}
          </small>
        )}
        {error[name] && <small className="nf-error">{error[name]}</small>}
      </div>
    );
  };

  const witnessFields = ["नाम", "मोबाइल नंबर", "पता", "बच्चे से संबंध"];
  const rescuedPeopleFields = ["name", "age", "relation"];
  const witnessRowFields = ["name", "mobile", "address", "relation"];
  const rowError = (group, index, field) => error[`${group}.${index}.${field}`];

  const showCustomTitle = customTitleActive;

  const handleResetActTitle = () => {
    setCustomTitleActive(false);
    const syntheticEvent = { target: { name: "actTitle", value: "" } };
    update(syntheticEvent);
  };

  const syncPeople = (people) => {
    update({ target: { name: "rescuedDetails", value: { ...(data.rescuedDetails || {}), people } } });
  };

  const addPerson = () => {
    const next = [...rescuedPeople, { name: "", age: "", relation: "" }];
    setRescuedPeople(next);
    syncPeople(next);
  };

  const removePerson = (index) => {
    const next = rescuedPeople.filter((_, i) => i !== index);
    setRescuedPeople(next);
    syncPeople(next);
  };

  const updatePerson = (index, field, value) => {
    const next = rescuedPeople.map((person, i) => (i === index ? { ...person, [field]: value } : person));
    setRescuedPeople(next);
    syncPeople(next);
  };

  const syncWitnesses = (rows) => {
    const payload = {};
    rows.forEach((row, idx) => {
      witnessFields.forEach((field) => {
        payload[`witness${idx + 1}${field}`] = row[field];
      });
    });
    update({ target: { name: "witnesses", value: rows } });
    Object.entries(payload).forEach(([name, value]) => {
      update({ target: { name, value } });
    });
  };

  const addWitness = () => {
    const next = [...witnesses, { name: "", mobile: "", address: "", relation: "" }];
    setWitnesses(next);
    syncWitnesses(next);
  };

  const removeWitness = (index) => {
    const next = witnesses.filter((_, i) => i !== index);
    setWitnesses(next);
    syncWitnesses(next);
  };

  const updateWitness = (index, field, value) => {
    const next = witnesses.map((row, i) => (i === index ? { ...row, [field]: value } : row));
    setWitnesses(next);
    syncWitnesses(next);
  };

  const witnessRows = witnesses.map((row, index) => (
    <tr key={index}>
      <td>{index + 1}</td>
      {witnessFields.map((field, fieldIndex) => (
        <td key={field}>
          <input type="text" value={row[witnessRowFields[fieldIndex]] || ""} onChange={(e) => updateWitness(index, witnessRowFields[fieldIndex], e.target.value)} disabled={isOverAge} />
          {rowError("witnesses", index, witnessRowFields[fieldIndex]) && <small className="nf-error">{rowError("witnesses", index, witnessRowFields[fieldIndex])}</small>}
        </td>
      ))}
      <td><button type="button" className="nf-remove" onClick={() => removeWitness(index)} disabled={isOverAge}>हटाएं</button></td>
    </tr>
  ));

  const rescuedPeopleRows = rescuedPeople.map((person, index) => (
    <tr key={index}>
      <td>{index + 1}</td>
      {rescuedPeopleFields.map((field) => (
        <td key={field}>
          <input type="text" value={person[field] || ""} onChange={(e) => updatePerson(index, field, e.target.value)} disabled={isOverAge} />
          {rowError("rescuedPeople", index, field) && <small className="nf-error">{rowError("rescuedPeople", index, field)}</small>}
        </td>
      ))}
      <td><button type="button" className="nf-remove" onClick={() => removePerson(index)} disabled={isOverAge}>हटाएं</button></td>
    </tr>
  ));

  return (
    <section className="nf-card">
      <div className="nf-card-heading">
        <span>Step 2</span>
        <h2>वीरता की घटना का विवरण (Details of Bravery Act)</h2>
      </div>

      <div className="nf-block">
        <div className="nf-grid nf-grid-3">
          <div className="nf-field">
            <label htmlFor="nf-actTitle">1. वीरता की घटना का शीर्षक <span> *</span></label>
            {showCustomTitle ? (
              <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
              <input ref={customTitleRef} id="nf-actTitle" name="actTitle" type="text" value={data.actTitle || ""} onChange={update} disabled={isOverAge} />
              <button type="button" className="nf-reset" onClick={handleResetActTitle} disabled={isOverAge}>रीसेट</button>
              </div>
            ) : (
              <select
                id="nf-actTitle"
                name="actTitle"
                value={data.actTitle || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomTitleActive(value === "अन्य असाधारण साहसिक कार्य");
                  if (value === "अन्य असाधारण साहसिक कार्य") {
                    update({ target: { name: "actTitle", value: "" } });
                    setTimeout(() => customTitleRef.current?.focus(), 0);
                  } else {
                    update(e);
                  }
                }}
                disabled={isOverAge}
              >
                <option value="">चयन करें</option>
                {natureOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            )}
            {error.actTitle && <small className="nf-error">{error.actTitle}</small>}
          </div>
          {input("2. घटना की दिनांक", "actDate", { required: true, type: "date", alwaysEnabled: true })}
          {input("3. घटना के समय आयु", "incidentAge", { type: "text", disabled: true })}
        </div>

        <div className="nf-grid nf-grid-3">
          {input("4. घटना का समय", "actTime", { type: "time" })}
          {input("5. घटना का स्थान", "actPlace", { required: true })}
          {input("6. घटना का जनपद", "actDistrict", { required: true, options: districts, placeholder: loadingDistricts ? "लोड हो रहा है..." : "जनपद चुनें", disabled: loadingDistricts })}
        </div>

        {input("7. घटना का संक्षिप्त विवरण", "shortDescription", { required: true, textarea: true, wide: true, words: { min: 250, max: 500 } })}
        <p className="nf-hint">(अधिकतम 500 शब्द)</p>
        <div className="nf-grid">
          {input("8. घटना के दौरान बच्चे द्वारा बचाये गये व्यक्ति/व्यक्तियों/संस्थानों का संक्षिप्त विवरण", "rescuedCount", { textarea: true, wide: true })}
        </div>
      </div>

      <div className="nf-block">
        <div className="nf-field nf-wide">
          <label>9. बचाये गये व्यक्ति/व्यक्तियों का विवरण (यदि लागू हो)</label>
          <div className="nf-actions">
            <button type="button" className="nf-add" onClick={addPerson} disabled={isOverAge}>+ व्यक्ति जोड़ें</button>
          </div>
          <div className="nf-table-wrap">
            <table className="nf-table">
              <colgroup>
                <col style={{ width: "6%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr>{["क्र.सं.", "नाम", "आयु", "बच्चे से संबंध", "क्रिया"].map((field) => <th key={field}>{field}</th>)}</tr>
              </thead>
              <tbody>{rescuedPeopleRows}</tbody>
            </table>
          </div>
        </div>
        <div className="nf-field nf-wide">
          <label>10. घटना के प्रत्यक्षदर्शियों का विवरण (यदि लागू हो)</label>
          <div className="nf-actions">
            <button type="button" className="nf-add" onClick={addWitness} disabled={isOverAge}>+ प्रत्यक्षदर्शी जोड़ें</button>
          </div>
          <div className="nf-table-wrap">
            <table className="nf-table">
              <colgroup>
                <col style={{ width: "6%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "8%" }} />
              </colgroup>
              <thead>
                <tr>{["क्र.सं.", ...witnessFields, "क्रिया"].map((field) => <th key={field}>{field}</th>)}</tr>
              </thead>
              <tbody>{witnessRows}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="nf-block">
        <div className="nf-grid">
          {input("11. घटना के संबंध में पुलिस रिपोर्ट/FIR दर्ज है?", "firRegistered", { required: true, options: ["हाँ", "नहीं", "लागू नहीं"] })}
          {input("12. क्या घटना के संबंध में कोई समाचार/मीडिया रिपोर्ट प्रकाशित हुई है?", "mediaPublished", { required: true, options: ["हाँ, प्रकाशित हुई है।", "नहीं, प्रकाशित नहीं हुई है।", "प्रकाशित हुई है किंतु आवेदन हेतु उपलब्ध नहीं है।"], fieldClassName: "nf-media-field" })}
        </div>
        {data.firRegistered === "हाँ" && <div className="nf-grid nf-conditional">{input("थाना", "policeStation", { required: true })}{input("FIR संख्या", "firNumber", { required: true })}{input("FIR दिनांक", "firDate", { required: true, type: "date" })}</div>}
      </div>
    </section>
  );
};

export default StepC;