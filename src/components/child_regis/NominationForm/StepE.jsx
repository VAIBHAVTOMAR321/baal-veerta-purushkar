import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../login/AuthContext";

const endpoint = "https://mahadevaaya.com/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/nominator-part4/";

const isPart4Submitted = (record) => {
    const status = String(record?.status || record?.submission_status || "").toLowerCase();
    return ["completed", "submitted"].includes(status) || record?.submitted === true || record?.is_submitted === true;
};

const StepE = ({ data, update, onSubmitSuccess, onCompleted, isStepEChecked, externalSubmitTrigger }) => {
    const { authFetch } = useAuth();
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [alertInfo, setAlertInfo] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editSnapshot, setEditSnapshot] = useState(null);
    const dataFetchStarted = useRef(false);

    useEffect(() => {
        if (dataFetchStarted.current) return;
        dataFetchStarted.current = true;
        const fetchPart4Data = async () => {
            try {
                const response = await authFetch(endpoint);
                if (!response.ok) return;
                const result = await response.json();
                const record = result.success && (Array.isArray(result.data) ? result.data[0] : result.data);
                if (!record) return;

                const values = {
                    applicant_id: record.applicant_id,
                    otherAward: record.other_award,
                    otherAwardDetails: record.other_award_details,
                    additionalInformation: record.additional_information,
                };
                Object.entries(values).forEach(([name, value]) => {
                    if (value !== undefined && value !== null) update({ target: { name, value, type: "text" } });
                });
                if (isPart4Submitted(record)) {
                    setIsCompleted(true);
                    if (!isStepEChecked) onCompleted?.(record);
                }
            } catch (fetchError) {
                console.error("Failed to fetch Part 4 data:", fetchError);
            } finally {
                setLoadingData(false);
            }
        };
        fetchPart4Data();
    }, [authFetch, isStepEChecked, onCompleted, update]);

    useEffect(() => {
        if (externalSubmitTrigger) handleSubmit(true);
    }, [externalSubmitTrigger]);

    const isFormLocked = isCompleted && !isEditing;

    const handleEdit = () => {
        setEditSnapshot({
            otherAward: data.otherAward || "",
            otherAwardDetails: data.otherAwardDetails || "",
            additionalInformation: data.additionalInformation || "",
        });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        Object.entries(editSnapshot || {}).forEach(([name, value]) => update({ target: { name, value, type: "text" } }));
        setIsEditing(false);
        setEditSnapshot(null);
        setAlertInfo(null);
    };

    const handleSubmit = async (moveToNext = true) => {
        if (isCompleted && !isEditing) {
            onSubmitSuccess?.();
            return;
        }
        const applicantId = data.applicant_id || data.applicantId || localStorage.getItem("applicantId") || "";
        if (!applicantId) {
            setAlertInfo({ type: "error", message: "आवेदक ID नहीं मिली। कृपया पहले Step 1 पूरा करें।" });
            return;
        }
        setSubmitting(true);
        try {
            const response = await authFetch(endpoint, {
                method: isCompleted && isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    applicant_id: applicantId,
                    other_award: data.otherAward || "",
                    other_award_details: data.otherAwardDetails || "",
                    additional_information: data.additionalInformation || "",
                }),
            });
            const result = await response.json();
            if (!response.ok || result.success !== true) throw new Error(result.message || "सबमिशन में त्रुटि हुई।");

            const wasUpdate = isCompleted && isEditing;
            setAlertInfo({ type: "success", message: wasUpdate ? "Step 3 सफलतापूर्वक अपडेट हो गया!" : "Step 3 सफलतापूर्वक सबमिट हो गया!" });
            if (wasUpdate) {
                setIsEditing(false);
                setEditSnapshot(null);
            }
            if (moveToNext) onSubmitSuccess?.();
        } catch (submitError) {
            console.error("Part 4 submit error:", submitError);
            setAlertInfo({ type: "error", message: submitError.message || "सबमिशन में त्रुटि हुई।" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) return <section className="nf-card"><div className="nf-card-heading"><span>Step 3</span><h2>अतिरिक्त जानकारी</h2></div><p>डेटा लोड हो रहा है...</p></section>;

    return <section className="nf-card">
        {alertInfo && <div className={`nf-alert ${alertInfo.type === "success" ? "nf-alert-success" : "nf-alert-error"}`} role="alert">{alertInfo.message}</div>}
        <div className="nf-card-heading">
            <span>Step 3</span><h2>अतिरिक्त जानकारी</h2>
            {isCompleted && <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                {!isEditing ? <button type="button" className="nf-secondary" onClick={handleEdit}>Edit / संपादित करें</button> : <><button type="button" className="nf-secondary" onClick={handleCancelEdit} disabled={submitting}>Cancel / रद्द करें</button><button type="button" className="nf-primary" onClick={() => handleSubmit(false)} disabled={submitting}>{submitting ? "अपडेट हो रहा है..." : "Update / अपडेट करें"}</button></>}
            </div>}
        </div>
        <div className="nf-grid">
            <div className="nf-field"><label>1. क्या इस घटना के संबंध में कोई अन्य पुरस्कार/सम्मान प्राप्त हुआ है?</label><div className="nf-radio-group">{["हाँ", "नहीं"].map((option) => <label key={option}><input type="radio" name="otherAward" value={option} checked={data.otherAward === option} onChange={update} disabled={isFormLocked} /> {option}</label>)}</div></div>
            {data.otherAward === "हाँ" && <div className="nf-field"><label htmlFor="nf-otherAwardDetails">विवरण:</label><textarea id="nf-otherAwardDetails" name="otherAwardDetails" value={data.otherAwardDetails || ""} onChange={update} rows={3} disabled={isFormLocked} /></div>}
        </div>
        <div className="nf-field nf-wide"><label htmlFor="nf-additionalInformation">2. अतिरिक्त टिप्पणी/अन्य महत्वपूर्ण जानकारी</label><textarea id="nf-additionalInformation" name="additionalInformation" value={data.additionalInformation || ""} onChange={update} rows={6} disabled={isFormLocked} /></div>
    </section>;
};

export default StepE;