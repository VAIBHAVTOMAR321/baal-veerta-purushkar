import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { sendOtpApi, verifyOtpApi } from "./api";
import "./otp.css";

const OTP_EXPIRY_SECONDS = 1 * 60;

const formatSecondsToExpiry = (seconds) => {
  if (seconds <= 0) return "0:00 remaining";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")} remaining`;
};

export const VerifyOTP = ({ show, onClose, mobile, onSuccess, otpSentAt }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [expiry, setExpiry] = useState(0);

  const calculateRemaining = () => {
    if (otpSentAt) {
      const elapsed = Math.floor((Date.now() - otpSentAt) / 1000);
      const remaining = OTP_EXPIRY_SECONDS - elapsed;
      return remaining > 0 ? remaining : 0;
    }
    return OTP_EXPIRY_SECONDS;
  };

  useEffect(() => {
    if (show) {
      setOtp("");
      setError("");
      setLoading(false);
      setExpiry(calculateRemaining());
      setCountdown(0);
    }
  }, [show, otpSentAt]);

  useEffect(() => {
    if (!show || expiry <= 0) return;
    const timer = setTimeout(() => setExpiry((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [show, expiry]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    const isExpired = expiry <= 0;
    console.info("[VerifyOTP] submit", {
      mobile: mobile ? `${mobile.slice(0, 2)}******${mobile.slice(-2)}` : "<missing>",
      isExpired,
    });
    if (isExpired) {
      console.error("[VerifyOTP] OTP expired", { mobile: mobile ? `${mobile.slice(0, 2)}******${mobile.slice(-2)}` : "<missing>" });
      setError("OTP समाप्त हो गया है। कृपया फिर से OTP भेजें।");
      return;
    }
    if (!/^[0-9]{6}$/.test(otp)) {
      console.error("[VerifyOTP] invalid OTP format", { length: otp.length });
      setError("कृपया 6 अंकों का OTP दर्ज करें।");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtpApi(mobile, otp);
      console.info("[VerifyOTP] success; opening query form", {
        responseKeys: Object.keys(res || {}),
        hasAccessToken: Boolean(res?.access),
      });
      onSuccess && onSuccess(res);
      onClose();
    } catch (err) {
      console.error("[VerifyOTP] failed", err);
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
      console.info("[VerifyOTP] resend success", { mobile: mobile ? `${mobile.slice(0, 2)}******${mobile.slice(-2)}` : "<missing>" });
      setCountdown(30);
      setExpiry(OTP_EXPIRY_SECONDS);
    } catch (err) {
      console.error("[VerifyOTP] resend failed", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const isExpired = expiry <= 0;

  return createPortal(
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
            <div className="otp-expiry-timer" aria-live="polite">
              {formatSecondsToExpiry(expiry)}
            </div>
            <div className="otp-field">
              <label htmlFor="otp-code">OTP</label>
              <input
                id="otp-code"
                type="text"
                maxLength={6}
                placeholder={isExpired ? "OTP समाप्त हो गया" : "OTP दर्ज करें"}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                disabled={isExpired}
              />
            </div>
            {error && <div className="otp-error" role="alert">{error}</div>}
            {isExpired && (
              <div className="otp-error" role="alert">
                OTP समाप्त हो गया है। कृपया नीचे से फिर से OTP भेजें।
              </div>
            )}
          </div>
          <div className="otp-modal-footer">
            <button type="button" className="otp-btn-secondary" onClick={onClose}>रद्द करें</button>
            <button type="submit" className="otp-btn-primary" disabled={loading || isExpired}>
              {loading ? "सत्यापित कर रहे हैं..." : "सत्यापित करें"}
            </button>
          </div>
          <div className="otp-resend">
            {countdown > 0 ? (
              <span>पुनः भेजने में {countdown} सेकंड remaining</span>
            ) : (
              <button type="button" className="otp-resend-btn" onClick={handleResend} disabled={loading || !isExpired}>
                OTP पुनः भेजें
              </button>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};