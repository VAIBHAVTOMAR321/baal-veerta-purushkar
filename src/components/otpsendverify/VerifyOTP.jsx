import React, { useState, useEffect } from "react";
import { sendOtpApi, verifyOtpApi } from "./api";
import "./otp.css";

export const VerifyOTP = ({ show, onClose, mobile, onSuccess }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^[0-9]{6}$/.test(otp)) {
      setError("कृपया 6 अंकों का OTP दर्ज करें।");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtpApi(mobile, otp);
      onSuccess && onSuccess(res);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setOtp("");
    setLoading(true);
    try {
      await sendOtpApi(mobile);
      setCountdown(30);
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
          <h3>OTP सत्यापन</h3>
          <button className="otp-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="otp-modal-body">
            <p className="otp-hint">
              <strong>{mobile}</strong> पर भेजा गया OTP दर्ज करें।
            </p>
            <div className="otp-field">
              <label htmlFor="otp-code">OTP</label>
              <input
                id="otp-code"
                type="text"
                maxLength={6}
                placeholder="OTP दर्ज करें"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            {error && <div className="otp-error" role="alert">{error}</div>}
          </div>
          <div className="otp-modal-footer">
            <button type="button" className="otp-btn-secondary" onClick={onClose}>रद्द करें</button>
            <button type="submit" className="otp-btn-primary" disabled={loading}>
              {loading ? "सत्यापित कर रहे हैं..." : "सत्यापित करें"}
            </button>
          </div>
          <div className="otp-resend">
            {countdown > 0 ? (
              <span>पुनः भेजने में {countdown} सेकंड remaining</span>
            ) : (
              <button type="button" className="otp-resend-btn" onClick={handleResend} disabled={loading}>
                OTP पुनः भेजें
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
