import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Container, Row, Col, Form, Button, Card
} from "react-bootstrap";
import {
  FaUserShield, FaKey, FaClipboardList, FaAddressCard,
  FaPhone, FaMapMarkerAlt, FaEnvelope, FaFileAlt,
  FaCheckCircle, FaEdit, FaUpload, FaInfoCircle,
  FaFileSignature, FaChevronDown, FaChevronUp,
  FaEye, FaEyeSlash, FaTrophy, FaCalendarAlt,
  FaUsers, FaBullseye, FaMedal, FaFileContract,
  FaRupeeSign, FaStar,
  FaShieldAlt,
  FaBookOpen
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../login/AuthContext";
import "./Home.css";

function Home() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState(null);
  const [forgotSuccess, setForgotSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Collapsible section state - first section open by default
  const [openSection, setOpenSection] = useState("schemeInfo");

  // Scroll state
  const contentRef = useRef(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // Refs for scroll-based auto-expand
  const schemeInfoHeaderRef = useRef(null);
  const objectivesHeaderRef = useRef(null);
  const eligibilityHeaderRef = useRef(null);
  const nominatorsHeaderRef = useRef(null);
  const userInteractedRef = useRef(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.registrationSuccess) {
      setSuccess("Registration successful! Please login.");
      navigate("/", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const check = () => {
      setShowScrollHint(el.scrollHeight > el.clientHeight + 5);
    };
    const timer = setTimeout(check, 150);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(check).catch(() => {});
    }
    window.addEventListener("resize", check);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", check);
    };
  }, []);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (userInteractedRef.current) return;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target === schemeInfoHeaderRef.current) {
            setOpenSection("schemeInfo");
          } else if (entry.target === objectivesHeaderRef.current) {
            setOpenSection("objectives");
          } else if (entry.target === eligibilityHeaderRef.current) {
            setOpenSection("eligibility");
          } else if (entry.target === nominatorsHeaderRef.current) {
            setOpenSection("nominators");
          }
        });
      },
      {
        root: container,
        rootMargin: "0px 0px -75% 0px",
        threshold: 0,
      }
    );

    const headers = [
      schemeInfoHeaderRef,
      objectivesHeaderRef,
      eligibilityHeaderRef,
      nominatorsHeaderRef,
    ];

    headers.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const handleContentScroll = () => {
    const el = contentRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    setShowScrollHint(!atBottom);
  };

  const toggleSection = useCallback(
    (section) => {
      userInteractedRef.current = true;
      setOpenSection((prev) => (prev === section ? null : section));
      setTimeout(() => {
        userInteractedRef.current = false;
      }, 1200);
    },
    []
  );

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);
      if (!phone.trim()) { setError("कृपया फ़ोन नंबर दर्ज करें।"); return; }
      if (!password.trim()) { setError("कृपया पासवर्ड दर्ज करें।"); return; }
      try {
        const response = await fetch(
          "https://mahadevaaya.com/balvirtaawardproject/balvirtaawardproject_backend/api/login/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, password, role: "user" }),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || data.message || "लॉगिन विफल। कृपया क्रेडेंशियल जांचें।");
        }
        login(data);
        navigate("/UserDashBoard");
      } catch (err) {
        setError(err.message);
      }
    },
    [phone, password, navigate, login]
  );

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);
    if (!forgotPhone.trim() || forgotPhone.length !== 10) {
      setForgotError("कृपया मान्य 10 अंकों का फ़ोन नंबर दर्ज करें।");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        "https://mahadevaaya.com/balvirtaawardproject/balvirtaawardproject_backend/api/send-otp-password-change/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: forgotPhone, role: "user" }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "OTP भेजने में विफल।");
      setForgotSuccess("OTP सफलतापूर्वक भेजा गया है।");
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);
    if (!forgotOtp.trim()) { setForgotError("कृपया OTP दर्ज करें।"); return; }
    setLoading(true);
    try {
      const response = await fetch(
        "https://mahadevaaya.com/balvirtaawardproject/balvirtaawardproject_backend/api/verify-otp-password-change/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: forgotPhone, otp: forgotOtp, role: "user" }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "OTP सत्यापन विफल।");
      setForgotSuccess("OTP सत्यापित हो गया है।");
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);
    if (!newPassword.trim() || newPassword.length < 6) {
      setForgotError("पासवर्ड कम से कम 6 अंकों का होना चाहिए।");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError("पासवर्ड मेल नहीं खा रहे।");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        "https://mahadevaaya.com/balvirtaawardproject/balvirtaawardproject_backend/api/change-password/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: forgotPhone, role: "user", new_password: newPassword }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "पासवर्ड बदलने में विफल।");
      setForgotSuccess("पासवर्ड सफलतापूर्वक बदल दिया गया है।");
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotPhone("");
        setForgotOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setForgotError(null);
        setForgotSuccess(null);
      }, 1500);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openForgotModal = () => {
    setShowForgotModal(true);
    setForgotStep(1);
    setForgotPhone("");
    setForgotOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotError(null);
    setForgotSuccess(null);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotPhone("");
    setForgotOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotError(null);
    setForgotSuccess(null);
  };

  /* ========== DATA FROM GOVERNMENT ORDER ========== */

  const awardDetails = [
    {
      icon: FaRupeeSign,
      value: "₹51,000/-",
      label: "पुरस्कार राशि (DBT)",
      color: "#198754",
    },
    {
      icon: FaMedal,
      value: "मेडल / पदक",
      label: "सम्मान प्रतीक",
      color: "#0d6efd",
    },
    {
      icon: FaFileContract,
      value: "प्रशस्ति पत्र",
      label: "आधिकारिक सम्मान पत्र",
      color: "#fd7e14",
    },
  ];

  const importantDates = [
    { date: "10 – 30 सितंबर", text: "ऑनलाइन आवेदन / नामांकन", color: "#0d6efd" },
    { date: "15 अक्टूबर", text: "जिला स्तरीय जांच एवं सत्यापन", color: "#198754" },
    { date: "25 अक्टूबर", text: "राज्य स्तरीय चयन समिति का परीक्षण", color: "#fd7e14" },
    { date: "31 अक्टूबर", text: "मुख्य सचिव का अंतिम अनुमोदन", color: "#dc3545" },
    { date: "05 नवंबर", text: "चयनित बच्चों की आधिकारिक घोषणा", color: "#6f42c1" },
    {
      date: "09 नवंबर",
      text: "राज्य स्थापना दिवस पर पुरस्कार वितरण",
      color: "#20c997",
    },
  ];

  const objectives = [
    "बच्चों में साहस, आत्मविश्वास, परोपकार एवं मानवीय मूल्यों की भावना को प्रोत्साहित करना।",
    "असाधारण साहस एवं वीरता का प्रदर्शन करने वाले बच्चों को राज्य स्तर पर सम्मानित एवं प्रोत्साहित करना।",
    "बच्चों द्वारा किये गये अनुकरणीय एवं वीरतापूर्ण कार्यों को समाज के समक्ष प्रेरणादायी उदाहरण के रूप में प्रस्तुत करना।",
    "संकट, आपदा एवं विपरीत परिस्थितियों में साहसपूर्वक कार्य करने की प्रवृत्ति को प्रोत्साहित करना।",
    "बाल प्रतिभाओं एवं उनके साहसिक कार्यों को उचित पहचान एवं सम्मान प्रदान करना।",
  ];

  const eligibilityCriteria = [
    "आवेदक / नामांकित बच्चा उत्तराखण्ड राज्य का मूल / स्थायी निवासी होना अनिवार्य है।",
    "वीरता की घटना के समय बच्चे की आयु 5 वर्ष से अधिक एवं 18 वर्ष से कम होनी चाहिए।",
    "प्रथम पुरस्कारों हेतु वीरता / साहस का कार्य आवेदन की अन्तिम तिथि से पूर्व अधिकतम 2 वर्ष की अवधि के भीतर का होना चाहिए।",
    "एक ही घटना के लिए एक बच्चे को एक से अधिक बार यह पुरस्कार प्रदान नहीं किया जाएगा। किन्तु राष्ट्रीय या अन्य राज्य पुरस्कार हेतु अर्ह होंगे।",
    "वीर बालक / बालिका की मृत्यु होने पर पुरस्कार परिजनों (माता / पिता / अभिभावक) को प्रदान किया जाएगा।",
    "एक से अधिक बालक / बालिका सम्मिलित हों तो प्रत्येक को प्रशस्ति पत्र एवं मेडल, धनराशि समान अनुपात में।",
  ];

  const schemeInfo = [
    "मुख्यमंत्री राज्य बाल वीरता पुरस्कार का उद्देश्य बच्चों में साहस, आत्मविश्वास, परोपकार एवं मानवीय मूल्यों की भावना को प्रोत्साहित करना है।",
    "इस पुरस्कार के अंतर्गत सांस्कृतिक गतिविधियों, सामाजिक सेवा, पर्यावरण संरक्षण, राष्ट्रिय सेवा, आपदा में साहसी कार्य, बच्चों के अधिकारों के लिए कार्य, खेल में उत्कृष्ट प्रदर्शन आदि के क्षेत्र में विभिन्न कार्य करने वाले बच्चों को सम्मानित किया जाता है।",
    "पुरस्कार में ₹51,000/- की धनराशि (DBT माध्यम से), प्रशस्ति पत्र, मेडल/पदक एवं राज्य स्तरीय सम्मान सहित कई सम्मानित स्तंभ शामिल हैं।",
    "नामांकन प्रक्रिया पूरी ऑनलाइन है। नामांकनकर्ता बच्चे की विस्तृत जानकारी, वीरता की घटना का विवरण, सभी आवश्यक दस्तावेज अपलोड करके पंजीकरण पूरा कर सकता है।",
    "प्रत्येक जनपद से एक बच्चा (कुल अधिकतम 13 बच्चे) को राज्य स्तरीय चयन समिति द्वारा चयन किया जाता है और मुख्य सचिव का अंतिम अनुमोदन प्राप्त होने पर पुरस्कार वितरण कार्यक्रम में सम्मानित किया जाता है।",
  ];

  const nominators = [
    { label: "स्वयं बालक / बालिका", icon: FaUserShield },
    { label: "माता / पिता / अभिभावक", icon: FaUsers },
    { label: "प्रधानाचार्य / प्रधानाध्यापक", icon: FaFileAlt },
    { label: "जिलाधिकारी (संबंधित जनपद)", icon: FaStar },
  ];

  const registrationSteps = [
    {
      step: "A",
      title: "नामांकनकर्ता (Nominator) का विवरण",
      subtitle: "Nominator Details",
      icon: FaAddressCard,
      description:
        "नामांकनकर्ता की व्यक्तिगत जानकारी, पता और पहचान पत्र विवरण",
      color: "#0d6efd",
    },
    {
      step: "B",
      title: "नामांकित बच्चे का व्यक्तिगत विवरण",
      subtitle: "Nominee Details",
      icon: FaUserShield,
      description:
        "बच्चे का नाम, जन्म तिथि, लिंग, पता और विद्यालय संबंधी जानकारी",
      color: "#198754",
    },
    {
      step: "C",
      title: "वीरता की घटना का विवरण",
      subtitle: "Details of Bravery Act",
      icon: FaClipboardList,
      description:
        "वीरता की घटना की तारीख, स्थान, प्रकृति और विस्तृत विवरण",
      color: "#fd7e14",
    },
    {
      step: "D",
      title: "अतिरिक्त जानकारी",
      subtitle: "Additional Information",
      icon: FaInfoCircle,
      description:
        "पूर्व में किसी पुरस्कार से सम्मान, अन्य पुरस्कार और अतिरिक्त टिप्पणी",
      color: "#20c997",
    },
    {
      step: "E",
      title: "आवश्यक अभिलेख अपलोड",
      subtitle: "Document Upload",
      icon: FaUpload,
      description: (
        <div className="document-description">
          <ul>
            <li>नामांकनकर्ता का पहचान पत्र</li>
            <li>बच्चे का आधार कार्ड / पहचान पत्र</li>
            <li>उत्तराखण्ड का स्थायी निवास प्रमाण पत्र</li>
            <li>बच्चे का जन्म प्रमाण पत्र / आयु प्रमाण पत्र</li>
            <li>वीरता की घटना के संबंध में हस्ताक्षरित विस्तृत विवरण</li>
            <li>बच्चे का पासपोर्ट आकार का फोटो</li>
            <li>FIR / पुलिस रिपोर्ट</li>
            <li>समाचार पत्र की कटिंग / मीडिया रिपोर्ट / फोटो</li>
            <li>प्रत्यक्षदर्शियों के बयान / प्रमाण</li>
            <li>वीडियो / फोटो लिंक</li>
            <li>विद्यालय का प्रमाण पत्र</li>
            <li>अन्य सहायक अभिलेख</li>
          </ul>
          <strong>सभी आवश्यक दस्तावेज़ अपलोड करें।</strong>
        </div>
      ),
      color: "#6f42c1",
    },
    {
      step: "F",
      title: "घोषणा एवं सहमति",
      subtitle: "Declaration",
      icon: FaFileSignature,
      description:
        "घोषणा पढ़ें, सहमति दें, और अंतिम प्रस्तुतीकरण करें",
      color: "#dc3545",
    },
  ];

  /* ========== RENDER ========== */

  return (
    <div className="home-page">
      <div className="home-main-card">

        {/* ── FULL-WIDTH SCHEME TITLE ── */}
        <div className="scheme-title-block">
          <div className="scheme-badge">
            ऑनलाइन नामांकन प्रपत्र 2026-27
          </div>
          <h2 className="scheme-title">
            मुख्यमंत्री राज्य बाल वीरता पुरस्कार
          </h2>
          <p className="scheme-name-en">
            Chief Minister State Child Bravery Award
          </p>
        </div>

        <Row className="g-0 home-row">

          {/* ═══════════ LEFT COLUMN ═══════════ */}
          <Col lg={6} className="home-left-col d-flex">
            <div
              className="home-left-content"
              ref={contentRef}
              onScroll={handleContentScroll}
            >

              {/* Mobile-only PDF link */}
              <Link
                to="/CM.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-pdf-link"
              >
                <FaFileAlt className="pdf-icon" />
                योजना की पूरी जानकारी / Scheme Details (PDF)
              </Link>

              {/* ── REGISTRATION STEPS ── */}
              <div className="steps-section">
                <div className="steps-heading-row">
                  <h3 className="steps-heading">
                    <FaClipboardList className="steps-heading-icon" />
                    नामांकन प्रक्रिया
                  </h3>
                  <Link
                    to="/CM.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="steps-pdf-link"
                  >
                    <FaFileAlt className="pdf-icon" />
                    योजना की पूरी जानकारी (PDF)
                  </Link>
                </div>

                <div className="registration-steps">
                  {registrationSteps.map((step, index) => {
                    const IconComponent = step.icon;
                    return (
                      <div
                        key={step.step}
                        className="step-item"
                        style={{ "--step-color": step.color }}
                      >
                        <div className="step-number">{step.step}</div>
                        <div className="step-icon-wrapper">
                          <IconComponent className="step-icon" />
                        </div>
                        <div className="step-content">
                          <div className="step-title-row">
                            <h5 className="step-title">{step.title}</h5>
                            <span className="step-subtitle">
                              {step.subtitle}
                            </span>
                          </div>
                          <p className="step-description">
                            {step.description}
                          </p>
                        </div>
                        {index < registrationSteps.length - 1 && (
                          <div className="step-connector" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── AWARD DETAILS ── */}
              <div className="award-section">
                <h4 className="section-title-sm">
                  <FaTrophy className="section-title-icon" />
                  पुरस्कार स्वरूप
                </h4>
                <div className="award-cards-grid">
                  {awardDetails.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className="award-card"
                        style={{ "--award-color": item.color }}
                      >
                        <div className="award-card-icon">
                          <Icon />
                        </div>
                        <div className="award-card-value">{item.value}</div>
                        <div className="award-card-label">{item.label}</div>
                      </div>
                    );
                  })}
                </div>
                <p className="award-note">
                  प्रत्येक जनपद से एक बच्चा (कुल अधिकतम 13 बच्चे) को
                  सम्मानित किया जाएगा।
                </p>
              </div>

              {/* ── IMPORTANT DATES ── */}
              <div className="dates-section">
                <h4 className="section-title-sm">
                  <FaCalendarAlt className="section-title-icon" />
                  महत्वपूर्ण तिथियां
                </h4>
                <div className="dates-list">
                  {importantDates.map((d, i) => (
                    <div key={i} className="date-item">
                      <span
                        className="date-badge"
                        style={{ background: d.color }}
                      >
                        {d.date}
                      </span>
                      <span className="date-text">{d.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── COLLAPSIBLE: SCHEME INFORMATION ── */}
              <div className="info-section">
                <button
                  ref={schemeInfoHeaderRef}
                  className="info-section-header"
                  onClick={() => toggleSection("schemeInfo")}
                  type="button"
                >
                  <span className="info-section-title">
                    <FaBookOpen
                     className="info-section-icon" />
                    योजना की जानकारी
                  </span>
                  <FaChevronUp
                    className={`info-section-chevron ${openSection === "schemeInfo" ? "rotated" : ""}`}
                  />
                </button>
                <div
                  className={`info-section-body ${openSection === "schemeInfo" ? "open" : ""}`}
                >
                  <ol className="scheme-info-list">
                    {schemeInfo.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* ── COLLAPSIBLE: OBJECTIVES ── */}
              <div className="info-section">
                <button
                  ref={objectivesHeaderRef}
                  className="info-section-header"
                  onClick={() => toggleSection("objectives")}
                  type="button"
                >
                  <span className="info-section-title">
                    <FaBullseye className="info-section-icon" />
                    योजना के उद्देश्य
                  </span>
                  <FaChevronUp
                    className={`info-section-chevron ${openSection === "objectives" ? "rotated" : ""}`}
                  />
                </button>
                <div
                  className={`info-section-body ${openSection === "objectives" ? "open" : ""}`}
                >
                  <ol className="objectives-list">
                    {objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* ── COLLAPSIBLE: ELIGIBILITY ── */}
              <div className="info-section">
                <button
                  ref={eligibilityHeaderRef}
                  className="info-section-header"
                  onClick={() => toggleSection("eligibility")}
                  type="button"
                >
                  <span className="info-section-title">
                    <FaCheckCircle className="info-section-icon" />
                    पात्रता
                  </span>
                  <FaChevronUp
                    className={`info-section-chevron ${openSection === "eligibility" ? "rotated" : ""}`}
                  />
                </button>
                <div
                  className={`info-section-body ${openSection === "eligibility" ? "open" : ""}`}
                >
                  <ul className="eligibility-list">
                    {eligibilityCriteria.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ── COLLAPSIBLE: WHO CAN NOMINATE ── */}
              <div className="info-section">
                <button
                  ref={nominatorsHeaderRef}
                  className="info-section-header"
                  onClick={() => toggleSection("nominators")}
                  type="button"
                >
                  <span className="info-section-title">
                    <FaUsers className="info-section-icon" />
                    नामांकन कौन कर सकता है?
                  </span>
                  <FaChevronUp
                    className={`info-section-chevron ${openSection === "nominators" ? "rotated" : ""}`}
                  />
                </button>
                <div
                  className={`info-section-body ${openSection === "nominators" ? "open" : ""}`}
                >
                  <div className="nominator-chips">
                    {nominators.map((n, i) => {
                      const Icon = n.icon;
                      return (
                        <div key={i} className="nominator-chip">
                          <Icon className="nominator-chip-icon" />
                          {n.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── BOTTOM PDF LINK ── */}
              <div className="scheme-pdf-link">
                <Link
                  to="/CM.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFileAlt className="pdf-icon" />
                  योजना की पूरी जानकारी / Scheme Details (PDF)
                </Link>
              </div>

            </div>

            {/* Scroll fade overlay */}
            <div
              className={`left-content-fade ${!showScrollHint ? "left-content-fade-hidden" : ""}`}
            />

            {/* Scroll hint */}
            {showScrollHint && (
              <div className="scroll-hint">
                <FaChevronDown className="scroll-hint-icon" />
                और जानकारी के लिए नीचे स्क्रॉल करें
              </div>
            )}
          </Col>

          {/* ═══════════ RIGHT COLUMN ═══════════ */}
          <Col
            lg={6}
            className="home-right-col d-flex align-items-start justify-content-center"
          >
            <div className="login-wrapper">
              <Card className="login-card">
                <Card.Body className="login-card-body">
                  <div className="login-header">
                    <div className="login-logo-circle">
                      <FaUserShield size={26} />
                    </div>
                    <h2 className="login-title">लॉगिन</h2>
                    <p className="login-subtitle">
                      अपने खाते में सुरक्षित लॉगिन करें
                    </p>
                  </div>

                  <Form className="login-form" onSubmit={handleLogin}>
                    <Form.Group className="mb-3" controlId="formPhone">
                      <Form.Label className="login-label">
                        <FaUserShield className="login-label-icon" />
                        फ़ोन नंबर
                      </Form.Label>
                      <div className="input-group-wrapper">
                        <Form.Control
                          type="text"
                          placeholder="फ़ोन नंबर दर्ज करें"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="login-input"
                          autoComplete="username"
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="formPassword">
                      <Form.Label className="login-label">
                        <FaKey className="login-label-icon" />
                        पासवर्ड
                      </Form.Label>
                      <div className="input-group-wrapper">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          placeholder="पासवर्ड दर्ज करें"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="login-input"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword
                              ? "पासवर्ड छिपाएं"
                              : "पासवर्ड दिखाएं"
                          }
                          title={
                            showPassword
                              ? "पासवर्ड छिपाएं"
                              : "पासवर्ड दिखाएं"
                          }
                        >
                          {showPassword ? (
                            <FaEyeSlash className="pw-icon" />
                          ) : (
                            <FaEye className="pw-icon" />
                          )}
                        </button>
                      </div>
                    </Form.Group>

                    {error && (
                      <div className="login-error" role="alert">
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
                      </div>
                    )}

                    {success && (
                      <div
                        className="login-success"
                        role="alert"
                        style={{
                          color: "green",
                          textAlign: "center",
                          marginBottom: "1rem",
                        }}
                      >
                        {success}
                      </div>
                    )}

                    <Button
                      variant="primary"
                      type="submit"
                      className="login-submit-btn"
                    >
                      <FaUserShield className="btn-icon" />
                      लॉगिन करें
                    </Button>

                    <div className="login-forgot">
                      <div
                        className="forgot-link"
                        onClick={openForgotModal}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) =>
                          e.key === "Enter" && openForgotModal()
                        }
                      >
                        पासवर्ड भूल गए?
                      </div>
                    </div>

                    <div className="login-footer">
                      <div className="divider">
                        <span>या</span>
                      </div>
                      <p className="login-footer-text">
                        नया खाता बनाएं{" "}
                        <Link
                          to="/StudentRegistration"
                          className="register-link"
                        >
                          पंजीकरण करें →
                        </Link>
                      </p>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              <div className="login-footer-info">
                
                <p className="copyright">
                  © 2026 महिला सशक्तिकरण एवं बाल विकास विभाग, उत्तराखण्ड
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* ═══════════ FORGOT PASSWORD MODAL ═══════════ */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={closeForgotModal}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>पासवर्ड बदलें</h3>
              <button
                type="button"
                className="modal-close"
                onClick={closeForgotModal}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-steps">
                <div
                  className={`modal-step ${forgotStep >= 1 ? "active" : ""}`}
                >
                  <span className="modal-step-num">1</span>
                  <span>OTP भेजें</span>
                </div>
                <div
                  className={`modal-step ${forgotStep >= 2 ? "active" : ""}`}
                >
                  <span className="modal-step-num">2</span>
                  <span>OTP सत्यापित करें</span>
                </div>
                <div
                  className={`modal-step ${forgotStep >= 3 ? "active" : ""}`}
                >
                  <span className="modal-step-num">3</span>
                  <span>नया पासवर्ड</span>
                </div>
              </div>

              {forgotError && (
                <div className="modal-error" role="alert">
                  ⚠️ {forgotError}
                </div>
              )}

              {forgotSuccess && (
                <div className="modal-success" role="alert">
                  ✅ {forgotSuccess}
                </div>
              )}

              {forgotStep === 1 && (
                <Form onSubmit={handleSendOtp} noValidate>
                  <Form.Group className="mb-3">
                    <Form.Label className="modal-label">
                      फ़ोन नंबर
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="10 अंकों का फ़ोन नंबर दर्ज करें"
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                      maxLength={10}
                      className="modal-input"
                      required
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    type="submit"
                    className="modal-submit-btn"
                    disabled={loading}
                  >
                    {loading ? "भेज रहे हैं..." : "OTP भेजें"}
                  </Button>
                </Form>
              )}

              {forgotStep === 2 && (
                <Form onSubmit={handleVerifyOtp} noValidate>
                  <Form.Group className="mb-3">
                    <Form.Label className="modal-label">OTP</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="OTP दर्ज करें"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      maxLength={6}
                      className="modal-input"
                      required
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    type="submit"
                    className="modal-submit-btn"
                    disabled={loading}
                  >
                    {loading
                      ? "सत्यापित कर रहे हैं..."
                      : "OTP सत्यापित करें"}
                  </Button>
                </Form>
              )}

              {forgotStep === 3 && (
                <Form onSubmit={handleChangePassword} noValidate>
                  <Form.Group className="mb-3">
                    <Form.Label className="modal-label">
                      नया पासवर्ड
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="नया पासवर्ड दर्ज करें"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="modal-input"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="modal-label">
                      पासवर्ड पुनः दर्ज करें
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="पासवर्ड पुनः दर्ज करें"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="modal-input"
                      required
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    type="submit"
                    className="modal-submit-btn"
                    disabled={loading}
                  >
                    {loading ? "बदल रहे हैं..." : "पासवर्ड बदलें"}
                  </Button>
                </Form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;