import React, { useState, useCallback } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { FaUserShield, FaKey, FaClipboardList, FaAddressCard, FaPhone, FaMapMarkerAlt, FaEnvelope, FaFileAlt, FaCheckCircle, FaEdit, FaUpload, FaInfoCircle, FaFileSignature } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../login/AuthContext";
import "./Home.css";

function Home() {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);

      if (!username.trim()) {
        setError("कृपया उपयोगकर्ता नाम दर्ज करें।");
        return;
      }

      if (!password.trim()) {
        setError("कृपया पासवर्ड दर्ज करें।");
        return;
      }

      try {
        const response = await fetch(
          "https://mahadevaaya.com/srcproject/srcproject_backend/api/login/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, role: "user" }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "लॉगिन विफल। कृपया क्रेडेंशियल जांचें।"
          );
        }

        login(data);
        navigate("/UserDashBoard");
      } catch (err) {
        setError(err.message);
      }
    },
    [username, password, navigate, login]
  );

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
          {/* LEFT - LANDING & REGISTRATION STEPS */}
          <Col lg={6} className="home-left-col d-flex">
            <div className="home-left-content">
            

              <div className="scheme-title-block">
                <div className="scheme-badge">ऑनलाइन नामांकन प्रपत्र</div>
                <h2 className="scheme-title">मुख्यमंत्री राज्य बाल वीरता पुरस्कार</h2>
                <p className="scheme-name-en">Chief Minister State Child Bravery Award</p>
              </div>

              <div className="steps-section">
                <h3 className="steps-heading">
                  <FaClipboardList className="steps-heading-icon" />
                  नामांकन प्रक्रिया
                </h3>
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
              </div>
            </div>
          </Col>

          {/* RIGHT - LOGIN */}
          <Col lg={6} className="home-right-col d-flex align-items-start justify-content-center">
            <div className="login-wrapper">
              <Card className="login-card">
                <Card.Body className="login-card-body">
                  <div className="login-header">
                    <div className="login-logo-circle">
                      <FaUserShield size={28} />
                    </div>
                    <h2 className="login-title">लॉगिन</h2>
                    <p className="login-subtitle">अपने खाते में सुरक्षित लॉगिन करें</p>
                  </div>

                  <Form className="login-form" onSubmit={handleLogin}>
                    <Form.Group className="mb-3" controlId="formUsername">
                      <Form.Label className="login-label">
                        <FaUserShield className="login-label-icon" />
                        उपयोगकर्ता नाम
                      </Form.Label>
                      <div className="input-group-wrapper">
                        <Form.Control
                          type="text"
                          placeholder="उपयोगकर्ता नाम दर्ज करें"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
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
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </Form.Group>

                    {error && (
                      <div className="login-error" role="alert">
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
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
                      <Link to="/forgot-password" className="forgot-link">
                        पासवर्ड भूल गए?
                      </Link>
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

              <div className="login-footer-info">
                <div className="security-badges">
                  <span className="badge">🔒 सुरक्षित</span>
                  <span className="badge">✓ सत्यापित</span>
                </div>
                <p className="copyright">© 2026 उत्तराखण्ड सरकार</p>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Home;
