const API_BASE = "http://127.0.0.1:8000/api";

export const sendOtpApi = async (mobile) => {
  const res = await fetch(`${API_BASE}/send-otp/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: mobile, role: "user" }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.message || "OTP भेजने में विफल।");
  }
  if (data.success === false) {
    throw new Error(data.detail || data.message || "OTP भेजने में विफल।");
  }
  return data;
};

export const verifyOtpApi = async (mobile, otp) => {
  const res = await fetch(`${API_BASE}/verify-otp-user/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: mobile, otp, role: "user" }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.message || "OTP सत्यापन विफल।");
  }
  if (data.success === false) {
    throw new Error(data.detail || data.message || "OTP सत्यापन विफल।");
  }
  return data;
};
