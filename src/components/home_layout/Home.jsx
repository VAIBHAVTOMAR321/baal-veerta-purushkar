import React, { useState, useCallback, useRef, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { FaUserShield, FaKey, FaClipboardList, FaAddressCard, FaPhone, FaMapMarkerAlt, FaEnvelope, FaFileAlt, FaCheckCircle, FaEdit, FaUpload, FaInfoCircle, FaFileSignature, FaChevronDown, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../login/AuthContext";
import "./Home.css";

const VISIBLE_STEPS = 4;

function Home() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: send OTP, 2: verify OTP, 3: change password
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState(null);
  const [forgotSuccess, setForgotSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  const stepsRef = useRef(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    if (location.state?.registrationSuccess) {
      setSuccess("Registration successful! Please login.");
      navigate("/", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const el = stepsRef.current;
    if (!el) return;

    const setHeight = () => {
      const steps = el.querySelectorAll(".step-item");
      if (steps.length >= VISIBLE_STEPS) {
        let total = 0;
        for (let i = 0; i < VISIBLE_STEPS; i++) {
          total += steps[i].offsetHeight;
        }
        const style = window.getComputedStyle(el);
        const gap = parseFloat(style.rowGap || style.gap || "0") || 0;
        total += gap * (VISIBLE_STEPS - 1);
        el.style.maxHeight = `${total + 2}px`;
      }
      setShowScrollHint(el.scrollHeight > el.clientHeight + 5);
    };

    const timer = setTimeout(setHeight, 100);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(setHeight).catch(() => {});
    }
    window.addEventListener("resize", setHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", setHeight);
    };
  }, []);

  const handleStepsScroll = () => {
    const el = stepsRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    setShowScrollHint(!atBottom);
  };

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);

      if (!phone.trim()) {
        setError("कृपया फ़ोन नंबर दर्ज करें।");
        return;
      }

      if (!password.trim()) {
        setError("कृपया पासवर्ड दर्ज करें।");
        return;
      }

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
          throw new Error(
            data.detail || data.message || "लॉगिन विफल। कृपया क्रेडेंशियल जांचें।"
          );
        }

        login(data);
        navigate("/UserDashBoard");
      } catch (err) {
        setError(err.message);
      }
    },
    [phone, password, navigate, login]
  );

  // Forgot password handlers
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
      const response = await fetch("https://mahadevaaya.com/balvirtaawardproject/balvirtaawardproject_backend/api/send-otp-password-change/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone, role: "user" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "OTP भेजने में विफल।");
      }

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

    if (!forgotOtp.trim()) {
      setForgotError("कृपया OTP दर्ज करें।");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://mahadevaaya.com/balvirtaawardproject/balvirtaawardproject_backend/api/verify-otp-password-change/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone, otp: forgotOtp, role: "user" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "OTP सत्यापन विफल।");
      }

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
      const response = await fetch("https://mahadevaaya.com/balvirtaawardproject/balvirtaawardproject_backend/api/change-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone, role: "user", new_password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "पासवर्ड बदलने में विफल।");
      }

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

  const registrationSteps = [
    {
      step: "A",
      title: "नामांकनकर्ता (Nominator) का विवरण",
      subtitle: "Nominator Details",
      icon: FaAddressCard,
      description: "नामांकनकर्ता की व्यक्तिगत जानकारी, पता और पहचान पत्र विवरण",
      color: "#0d6efd"
    },
    {
      step: "B",
      title: "नामांकित बच्चे का व्यक्तिगत विवरण",
      subtitle: "Nominee Details",
      icon: FaUserShield,
      description: "बच्चे का नाम, जन्म तिथि, लिंग, पता और विद्यालय संबंधी जानकारी",
      color: "#198754"
    },
    {
      step: "C",
      title: "वीरता की घटना का विवरण",
      subtitle: "Details of Bravery Act",
      icon: FaClipboardList,
      description: "वीरता की घटना की तारीख, स्थान, प्रकृति और विस्तृत विवरण",
      color: "#fd7e14"
    },
    {
      step: "D",
      title: "आवश्यक अभिलेख अपलोड",
      subtitle: "Document Upload",
      icon: FaUpload,
      description: "आधार कार्ड, जन्म प्रमाण पत्र, FIR/पुलिस रिपोर्ट आदि अपलोड करें",
      color: "#6f42c1"
    },
    {
      step: "E",
      title: "अतिरिक्त जानकारी",
      subtitle: "Additional Information",
      icon: FaInfoCircle,
      description: "पूर्व में किसी पुरस्कार से सम्मान, अन्य पुरस्कार और अतिरिक्त टिप्पणी",
      color: "#20c997"
    },
    {
      step: "F",
      title: "घोषणा एवं सहमति",
      subtitle: "Declaration",
      icon: FaFileSignature,
      description: "घोषणा पढ़ें, सहमति दें, OTP सत्यापन और अंतिम प्रस्तुतीकरण",
      color: "#dc3545"
    }
  ];

  return (
    <div className="home-page">
      <div className="home-main-card">
        <Row className="g-0 home-row">
          <div className="scheme-title-block">
            <div className="scheme-badge">ऑनलाइन नामांकन प्रपत्र 2026-27</div>
            <h2 className="scheme-title">मुख्यमंत्री राज्य बाल वीरता पुरस्कार</h2>
            <p className="scheme-name-en">Chief Minister State Child Bravery Award</p>
          </div>

          {/* LEFT - LANDING & REGISTRATION STEPS (6 col) */}
          <Col lg={6} className="home-left-col d-flex">
            <div className="home-left-content">

                <div className="steps-section">
                  <div className="steps-heading-row">
                    <h3 className="steps-heading">
                      <FaClipboardList className="steps-heading-icon" />
                      नामांकन प्रक्रिया
                    </h3>
                    <a href="/CM Rajya baal veerta purskar.pdf" target="_blank" rel="noopener noreferrer" className="steps-pdf-link">
                      <FaFileAlt className="pdf-icon" />
                      योजना की पूरी जानकारी / Scheme Details (PDF)
                    </a>
                  </div>

                <div className="steps-scroll-wrap">
                  <div
                    className="registration-steps"
                    ref={stepsRef}
                    onScroll={handleStepsScroll}
                  >
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
                            <h5 className="step-title">{step.title}</h5>
                            <p className="step-subtitle">{step.subtitle}</p>
                            <p className="step-description">{step.description}</p>
                          </div>
                          {index < registrationSteps.length - 1 && (
                            <div className="step-connector" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className={`steps-fade ${showScrollHint ? "" : "steps-fade-hidden"}`}
                  />
                </div>

                {showScrollHint && (
                  <div className="scroll-hint">
                    <FaChevronDown className="scroll-hint-icon" />
                    और चरण देखने के लिए नीचे स्क्रॉल करें
                  </div>
                )}
              </div>

            </div>
          </Col>

          {/* RIGHT - LOGIN (6 col) */}
          <Col lg={6} className="home-right-col d-flex align-items-start justify-content-center">
            <div className="login-wrapper">
              <Card className="login-card">
                <Card.Body className="login-card-body">
                  <div className="login-header">

                    <h2 className="login-title">लॉगिन</h2>
                    <p className="login-subtitle">अपने खाते में सुरक्षित लॉगिन करें</p>
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
                          aria-label={showPassword ? "पासवर्ड छिपाएं" : "पासवर्ड दिखाएं"}
                          title={showPassword ? "पासवर्ड छिपाएं" : "पासवर्ड दिखाएं"}
                        >
                          {showPassword ? <FaEyeSlash className="pw-icon" /> : <FaEye className="pw-icon" />}
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
                      <div className="login-success" role="alert" style={{ color: "green", textAlign: "center", marginBottom: "1rem" }}>
                        ✅ {success}
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
                        <Link to="/StudentRegistration" className="register-link">
                          पंजीकरण करें →
                        </Link>
                      </p>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              
            </div>
          </Col>
        </Row>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={closeForgotModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>पासवर्ड बदलें</h3>
              <button type="button" className="modal-close" onClick={closeForgotModal}>×</button>
            </div>

            <div className="modal-body">
              {/* Step indicator */}
              <div className="modal-steps">
                <div className={`modal-step ${forgotStep >= 1 ? "active" : ""}`}>
                  <span className="modal-step-num">1</span>
                  <span>OTP भेजें</span>
                </div>
                <div className={`modal-step ${forgotStep >= 2 ? "active" : ""}`}>
                  <span className="modal-step-num">2</span>
                  <span>OTP सत्यापित करें</span>
                </div>
                <div className={`modal-step ${forgotStep >= 3 ? "active" : ""}`}>
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

              {/* Step 1: Send OTP */}
              {forgotStep === 1 && (
                <Form onSubmit={handleSendOtp} noValidate>
                  <Form.Group className="mb-3">
                    <Form.Label className="modal-label">फ़ोन नंबर</Form.Label>
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

              {/* Step 2: Verify OTP */}
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
                    {loading ? "सत्यापित कर रहे हैं..." : "OTP सत्यापित करें"}
                  </Button>
                </Form>
              )}

              {/* Step 3: Change Password */}
              {forgotStep === 3 && (
                <Form onSubmit={handleChangePassword} noValidate>
                  <Form.Group className="mb-3">
                    <Form.Label className="modal-label">नया पासवर्ड</Form.Label>
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
                    <Form.Label className="modal-label">पासवर्ड पुनः दर्ज करें</Form.Label>
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
