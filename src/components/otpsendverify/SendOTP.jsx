import React, { useState, useEffect } from "react";
import { sendOtpApi } from "./api";
import "./otp.css";

export const SendOTP = ({ show, onClose, onSuccess, defaultMobile }) => {
  const [mobile, setMobile] = useState(defaultMobile || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMobile(defaultMobile || "");
  }, [defaultMobile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^[0-9]{10}$/.test(mobile)) {
      setError("कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।");
      return;
    }
    setLoading(true);
    try {
      await sendOtpApi(mobile);
      onSuccess && onSuccess(mobile);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="otp-modal-overlay" onClick={onClose}>
      <div className="otp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="otp-modal-header">
          <h3>OTP भेजें</h3>
          <button className="otp-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="otp-modal-body">
            <p className="otp-hint">अपने मोबाइल नंबर पर OTP प्राप्त करने के लिए नीचे दर्ज करें।</p>
            <div className="otp-field">
              <label htmlFor="otp-mobile">मोबाइल नंबर</label>
              <input
                id="otp-mobile"
                type="tel"
                maxLength={10}
                placeholder="10 अंकों का मोबाइल नंबर"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            {error && <div className="otp-error" role="alert">{error}</div>}
          </div>
          <div className="otp-modal-footer">
            <button type="button" className="otp-btn-secondary" onClick={onClose}>रद्द करें</button>
            <button type="submit" className="otp-btn-primary" disabled={loading}>
              {loading ? "भेज रहे हैं..." : "OTP भेजें"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
