const API_BASE = "http://127.0.0.1:8000/api";

export const sendOtpApi = async (mobile) => {
  const res = await fetch(`${API_BASE}/send-otp/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: mobile, role: "user" }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || "OTP भेजने में विफल।");
  }
  return res.json();
};

export const verifyOtpApi = async (mobile, otp) => {
  const res = await fetch(`${API_BASE}/verify-otp-user/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: mobile, otp, role: "user" }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || "OTP सत्यापन विफल।");
  }
  return res.json();
};
