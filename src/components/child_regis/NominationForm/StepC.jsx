import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../login/AuthContext";

const natureOptions = ["किसी व्यक्ति के जीवन की रक्षा", "स्वयं के जीवन की रक्षा हेतु साहसिक कार्य", "आपदा/प्राकृतिक आपदा में साहसिक कार्य", "दुर्घटना में बचाव कार्य", "डूबते हुए व्यक्ति को बचाना", "आग/अग्निकांड में बचाव कार्य", "अपराध/आपराधिक घटना के दौरान साहसिक कार्य", "अन्य असाधारण साहसिक कार्य"];

const incidentTypeMap = {
  "किसी व्यक्ति के जीवन की रक्षा": "life_protection",
  "स्वयं के जीवन की रक्षा हेतु साहसिक कार्य": "self_life_protection",
  "आपदा/प्राकृतिक आपदा में साहसिक कार्य": "disaster_rescue",
  "दुर्घटना में बचाव कार्य": "accident_rescue",
  "डूबते हुए व्यक्ति को बचाना": "drowning_rescue",
  "आग/अग्निकांड में बचाव कार्य": "fire_rescue",
  "अपराध/आपराधिक घटना के दौरान साहसिक कार्य": "crime_rescue",
  "अन्य असाधारण साहसिक कार्य": "other",
};

const isPart3Submitted = (record) => {
  const status = String(record?.status || record?.submission_status || "").toLowerCase();
  return ["completed", "submitted"].includes(status) || record?.submitted === true || record?.is_submitted === true;
};

const firstValue = (record, ...keys) => keys.map((key) => record?.[key]).find((value) => value !== undefined && value !== null);
const normalizePerson = (person) => Array.isArray(person)
  ? { name: person[0] || "", age: person[1] ?? "", relation: person[2] || "" }
  : { name: person?.name || "", age: person?.age ?? "", relation: person?.relation || "" };
const normalizeWitness = (witness) => Array.isArray(witness)
  ? { name: witness[0] || "", mobile: witness[1] || "", address: witness[2] || "", relation: witness[3] || "" }
  : { name: witness?.name || "", mobile: witness?.mobile || "", address: witness?.address || "", relation: witness?.relation || "" };

const StepC = ({ data, update, error, onSubmitSuccess, onCompleted, isStepCChecked, externalSubmitTrigger, onErrorsChange }) => {
  const { authFetch } = useAuth();
  const [customTitleActive, setCustomTitleActive] = useState(false);
  const [rescuedPeople, setRescuedPeople] = useState(data.rescuedDetails?.people?.length ? data.rescuedDetails.people : [{ name: "", age: "", relation: "" }]);
  const [witnesses, setWitnesses] = useState(data.witnesses?.length ? data.witnesses : [{ name: "", mobile: "", address: "", relation: "" }]);
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [isOverAge, setIsOverAge] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState(null);
  const customTitleRef = useRef(null);
  const fetchDistrictsRef = useRef(false);
  const dataFetchStarted = useRef(false);

  useEffect(() => {
    if (dataFetchStarted.current) return;
    dataFetchStarted.current = true;
    const fetchPart3Data = async () => {
      try {
        const response = await authFetch("https://mahadevaaya.com/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part3/");
        if (!response.ok) return;
        const result = await response.json();
        const record = result.success && (Array.isArray(result.data) ? result.data[0] : result.data);
        if (!record) return;

        const fieldMapping = {
          actTitle: firstValue(record, "incident_title", "act_title", "bravery_act_title", "title"),
          actDate: firstValue(record, "incident_date", "act_date"),
          incidentAge: firstValue(record, "age_at_incident", "incident_age"),
          actTime: firstValue(record, "incident_time", "act_time"),
          actPlace: firstValue(record, "incident_location", "act_place"),
          actDistrict: firstValue(record, "incident_district", "act_district"),
          shortDescription: firstValue(record, "incident_description", "short_description"),
          rescuedCount: firstValue(record, "rescued_persons_description", "rescued_count"),
          firRegistered: firstValue(record, "fir_status", "fir_registered"),
          policeStation: firstValue(record, "police_station", "policeStation"),
          firNumber: firstValue(record, "fir_number", "firNumber"),
          firDate: firstValue(record, "fir_date", "firDate"),
          mediaPublished: firstValue(record, "media_report_available", "media_published"),
        };
        Object.entries(fieldMapping).forEach(([name, value]) => {
          if (value !== undefined && value !== null) update({ target: { name, value, type: "text" } });
        });
        const fetchedTitle = fieldMapping.actTitle || "";
        setCustomTitleActive(fetchedTitle !== "" && !natureOptions.includes(fetchedTitle));
        const people = Array.isArray(record.rescued_persons) && record.rescued_persons.length
          ? record.rescued_persons.map(normalizePerson)
          : [{ name: "", age: "", relation: "" }];
        const witnessRows = Array.isArray(record.eyewitnesses) && record.eyewitnesses.length
          ? record.eyewitnesses.map(normalizeWitness)
          : [{ name: "", mobile: "", address: "", relation: "" }];
        setRescuedPeople(people);
        setWitnesses(witnessRows);
        update({ target: { name: "rescuedDetails", value: { ...(data.rescuedDetails || {}), people } } });
        update({ target: { name: "witnesses", value: witnessRows } });

        if (isPart3Submitted(record)) {
          setIsCompleted(true);
          if (!isStepCChecked && onCompleted) onCompleted(record);
        }
      } catch (fetchError) {
        console.error("Failed to fetch Step 2 data:", fetchError);
      } finally {
        setLoadingData(false);
      }
    };
    fetchPart3Data();
  }, [authFetch, data.rescuedDetails, isStepCChecked, onCompleted, update]);

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

  useEffect(() => {
    if (alertInfo) {
      const timer = setTimeout(() => setAlertInfo(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo]);

  useEffect(() => {
    if (externalSubmitTrigger) {
      handleSubmit(true);
    }
  }, [externalSubmitTrigger]);

  const input = (label, name, options = {}) => {
    const value = data[name] || "";
    const isFormLocked = isCompleted && !isEditing;
    const wordCount = options.textarea ? value.trim().split(/\s+/).filter(Boolean).length : 0;
    const wordValidation = options.words || null;
    const isWordValid = wordValidation ? wordCount >= wordValidation.min && wordCount <= wordValidation.max : true;
    const showWordCount = wordValidation && value.trim().length > 0;

    return (
      <div className={`nf-field ${options.wide ? "nf-wide" : ""} ${options.fieldClassName || ""}`}>
        <label htmlFor={`nf-${name}`}>{label}{options.required && <span> *</span>}</label>
        {options.options ? (
          <select id={`nf-${name}`} name={name} value={value} onChange={update} disabled={isFormLocked || (options.alwaysEnabled ? false : (isOverAge || options.disabled))}>
            <option value="">{options.placeholder || "चयन करें"}</option>
            {options.options.map((option) => <option key={option}>{option}</option>)}
          </select>
        ) : options.textarea ? (
          <textarea id={`nf-${name}`} name={name} value={value} onChange={update} rows={options.rows || 4} disabled={isFormLocked || isOverAge} />
        ) : (
          <input id={`nf-${name}`} name={name} type={options.type || "text"} value={value} onChange={update} disabled={isFormLocked || (options.alwaysEnabled ? false : (isOverAge || options.disabled))} />
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
  const isFormLocked = isCompleted && !isEditing;

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

  const normalizeTime = (time) => {
    if (!time) return "";
    if (/^\d{2}:\d{2}$/.test(time)) return `${time}:00`;
    return time;
  };

  const normalizeDate = (date) => {
    if (!date) return "";
    return date;
  };

  const buildPayload = () => {
    const applicantId = data.applicant_id || data.applicantId || localStorage.getItem("applicantId") || "";

    const actTitle = data.actTitle || "";
    const incidentType = customTitleActive
      ? "other"
      : (incidentTypeMap[actTitle] || "");

    const rescuedPersons = rescuedPeople
      .filter((person) => String(person.name || "").trim() !== "")
      .map((person) => [person.name, Number(person.age) || 0, person.relation || ""]);

    const eyewitnesses = witnesses
      .filter((witness) => String(witness.name || "").trim() !== "")
      .map((witness) => [witness.name, witness.mobile || "", witness.address || "", witness.relation || ""]);

    const payload = {
      applicant_id: applicantId,
      incident_title: actTitle,
      incident_type: incidentType,
      incident_date: data.actDate ? normalizeDate(data.actDate) : null,
      age_at_incident: data.incidentAge || "",
      incident_time: data.actTime ? normalizeTime(data.actTime) : null,
      incident_location: data.actPlace || "",
      incident_district: data.actDistrict || "",
      incident_description: data.shortDescription || "",
      rescued_persons_description: data.rescuedCount || "",
      rescued_persons: rescuedPersons.length ? rescuedPersons : null,
      eyewitnesses: eyewitnesses.length ? eyewitnesses : null,
      fir_status: data.firRegistered || "",
      police_station: data.policeStation || "",
      fir_number: data.firNumber || "",
      fir_date: data.firDate ? normalizeDate(data.firDate) : null,
      media_report_available: data.mediaPublished || "",
    };

    return payload;
  };

  const editableFields = ["actTitle", "actDate", "actTime", "actPlace", "actDistrict", "shortDescription", "rescuedCount", "firRegistered", "policeStation", "firNumber", "firDate", "mediaPublished"];

  const handleEdit = () => {
    setEditSnapshot({
      ...Object.fromEntries(editableFields.map((field) => [field, data[field] || ""])),
      rescuedPeople,
      witnesses,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (editSnapshot) {
      Object.entries(editSnapshot).forEach(([name, value]) => {
        if (name !== "rescuedPeople" && name !== "witnesses") update({ target: { name, value, type: "text" } });
      });
      setRescuedPeople(editSnapshot.rescuedPeople);
      setWitnesses(editSnapshot.witnesses);
    }
    setIsEditing(false);
    setEditSnapshot(null);
    setAlertInfo(null);
  };

  const validateBeforeSubmit = () => {
    const errors = {};
    if (!data.actTitle || data.actTitle.trim() === "") {
      errors.actTitle = "यह फ़ील्ड अनिवार्य है";
    }
    if (!data.actDate) {
      errors.actDate = "यह फ़ील्ड अनिवार्य है";
    }
    if (!data.actPlace || data.actPlace.trim() === "") {
      errors.actPlace = "यह फ़ील्ड अनिवार्य है";
    }
    if (!data.actDistrict) {
      errors.actDistrict = "यह फ़ील्ड अनिवार्य है";
    }
    if (!data.shortDescription || data.shortDescription.trim() === "") {
      errors.shortDescription = "यह फ़ील्ड अनिवार्य है";
    } else {
      const wc = data.shortDescription.trim().split(/\s+/).filter(Boolean).length;
      if (wc < 250 || wc > 500) {
        errors.shortDescription = "विवरण कम से कम 250 और अधिकतम 500 शब्दों में होना चाहिए।";
      }
    }
    if (!data.firRegistered) {
      errors.firRegistered = "यह फ़ील्ड अनिवार्य है";
    }
    if (data.firRegistered === "हाँ") {
      if (!data.policeStation || data.policeStation.trim() === "") errors.policeStation = "यह फ़ील्ड अनिवार्य है";
      if (!data.firNumber || data.firNumber.trim() === "") errors.firNumber = "यह फ़ील्ड अनिवार्य है";
      if (!data.firDate) errors.firDate = "यह फ़ील्ड अनिवार्य है";
    }
    if (!data.mediaPublished) {
      errors.mediaPublished = "यह फ़ील्ड अनिवार्य है";
    }

    const validateRows = (rows, group, fields) => {
      (rows || []).forEach((row, index) => {
        if (fields.some((field) => String(row?.[field] || "").trim())) {
          fields.forEach((field) => {
            if (!String(row?.[field] || "").trim()) {
              errors[`${group}.${index}.${field}`] = "यह फ़ील्ड अनिवार्य है";
            }
          });
        }
      });
    };
    validateRows(data.rescuedDetails?.people, "rescuedPeople", ["name", "age", "relation"]);
    validateRows(data.witnesses, "witnesses", ["name", "mobile", "address", "relation"]);

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const handleSubmit = async (moveToNext = true) => {
    if (isCompleted && !isEditing) {
      onSubmitSuccess?.();
      return;
    }
    if (isOverAge) {
      setAlertInfo({ type: "error", message: "आयु 18 वर्ष से अधिक होने के कारण इस फॉर्म को सबमिट नहीं किया जा सकता।" });
      return;
    }

    setAlertInfo(null);
    const validationErrors = validateBeforeSubmit();
    if (validationErrors) {
      if (onErrorsChange) onErrorsChange(validationErrors);
      requestAnimationFrame(() => {
        const firstKey = Object.keys(validationErrors)[0];
        let el = document.getElementById(`nf-${firstKey}`);
        if (!el) {
          const match = firstKey.match(/^(rescuedPeople|witnesses)\.(\d+)\.(.+)$/);
          if (match) {
            el = document.getElementById(`nf-${match[1]}-${match[2]}-${match[3]}`);
          }
        }
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    const payload = buildPayload();

    if (!payload.applicant_id) {
      setAlertInfo({ type: "error", message: "आवेदक ID नहीं मिली। कृपया पहले Step 1 पूरा करें।" });
      return;
    }

    setSubmitting(true);
    setAlertInfo(null);

    try {
      console.log("[StepC] Submitting payload:", JSON.stringify(payload, null, 2));
      const response = await authFetch(
        "https://mahadevaaya.com/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part3/",
        {
          method: isCompleted && isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const errorMsg =
          (typeof result === "object"
            ? result.detail || result.message || result.error || JSON.stringify(result)
            : result) ||
          `Server error: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
      }

      if (result.success !== true) {
        const errorMsg =
          (typeof result === "object"
            ? result.detail || result.message || result.error || JSON.stringify(result)
            : result) ||
          "सबमिशन में त्रुटि हुई।";
        throw new Error(errorMsg);
      }

      const wasUpdate = isCompleted && isEditing;
      setAlertInfo({ type: "success", message: wasUpdate ? "Step 2 सफलतापूर्वक अपडेट हो गया! ✅" : "Step 2 सफलतापूर्वक सबमिट हो गया! ✅" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (wasUpdate) {
        setIsCompleted(true);
        setIsEditing(false);
        setEditSnapshot(null);
      }
      if (moveToNext) onSubmitSuccess?.();
    } catch (err) {
      console.error("Submit error:", err);
      setAlertInfo({ type: "error", message: err.message || "सबमिशन में त्रुटि हुई। कृपया पुनः प्रयास करें।" });
    } finally {
      setSubmitting(false);
    }
  };

  const witnessRows = witnesses.map((row, index) => (
    <tr key={index}>
      <td>{index + 1}</td>
      {witnessFields.map((field, fieldIndex) => (
        <td key={field}>
          <input id={`nf-witnesses-${index}-${witnessRowFields[fieldIndex]}`} type="text" value={row[witnessRowFields[fieldIndex]] || ""} onChange={(e) => updateWitness(index, witnessRowFields[fieldIndex], e.target.value)} disabled={isFormLocked || isOverAge} />
          {rowError("witnesses", index, witnessRowFields[fieldIndex]) && <small className="nf-error">{rowError("witnesses", index, witnessRowFields[fieldIndex])}</small>}
        </td>
      ))}
      <td><button type="button" className="nf-remove" onClick={() => removeWitness(index)} disabled={isFormLocked || isOverAge}>हटाएं</button></td>
    </tr>
  ));

  const rescuedPeopleRows = rescuedPeople.map((person, index) => (
    <tr key={index}>
      <td>{index + 1}</td>
      {rescuedPeopleFields.map((field) => (
        <td key={field}>
          <input id={`nf-rescuedPeople-${index}-${field}`} type="text" value={person[field] || ""} onChange={(e) => updatePerson(index, field, e.target.value)} disabled={isFormLocked || isOverAge} />
          {rowError("rescuedPeople", index, field) && <small className="nf-error">{rowError("rescuedPeople", index, field)}</small>}
        </td>
      ))}
      <td><button type="button" className="nf-remove" onClick={() => removePerson(index)} disabled={isFormLocked || isOverAge}>हटाएं</button></td>
    </tr>
  ));

  return (
    <section className="nf-card">
      {/* Alert Box */}
      {alertInfo && (
        <div
          className="nf-alert"
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            borderRadius: "8px",
            border: alertInfo.type === "success"
              ? "1px solid #22c55e"
              : "1px solid #ef4444",
            backgroundColor: alertInfo.type === "success"
              ? "#f0fdf4"
              : "#fef2f2",
            color: alertInfo.type === "success" ? "#166534" : "#991b1b",
            fontSize: "1rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            animation: "nfFadeIn 0.3s ease",
          }}
        >
          <span>{alertInfo.message}</span>
          <button
            type="button"
            onClick={() => setAlertInfo(null)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: alertInfo.type === "success" ? "#166534" : "#991b1b",
              fontWeight: "bold",
              lineHeight: 1,
              padding: "0 0.25rem",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="nf-card-heading">
        <span>Step 2</span>
        <h2>वीरता की घटना का विवरण (Details of Bravery Act)</h2>
        {isCompleted && (
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
            {!isEditing ? (
              <button type="button" className="nf-secondary" onClick={handleEdit}>Edit / संपादित करें</button>
            ) : (
              <>
                <button type="button" className="nf-secondary" onClick={handleCancelEdit} disabled={submitting}>Cancel / रद्द करें</button>
                <button type="button" className="nf-primary" onClick={() => handleSubmit(false)} disabled={submitting}>
                  {submitting ? "अपडेट हो रहा है..." : "Update / अपडेट करें"}
                </button>
              </>
            )}
          </div>
        )}
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