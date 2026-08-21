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

export const submitNominatorPart1 = async (data, token) => {
  if (!token) {
    throw new Error("OTP token उपलब्ध नहीं है। कृपया OTP फिर से सत्यापित करें।");
  }
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(`${API_BASE}/bravery/nominator-part1/`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  const responseData = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = responseData.detail || responseData.message || JSON.stringify(responseData) || `HTTP ${res.status} ${res.statusText}`;
    console.error("[submitNominatorPart1] Bad Request:", responseData);
    throw new Error(msg);
  }
  if (responseData.success === false) {
    console.error("[submitNominatorPart1] API returned success=false:", responseData);
    throw new Error(responseData.detail || responseData.message || "नामांकनकर्ता पंजीकरण विफल।");
  }
  return responseData;
};
