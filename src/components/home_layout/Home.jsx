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
      description: "पूर्व में किसी पुरस्कार से सम्मान, अन्य पुरस्कार और अतिरिक्ट टिप्पणी",
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
      <Container fluid className="home-container">
        <div className="home-main-card">
          <Row className="g-0 home-row">
            {/* LEFT - LANDING & REGISTRATION STEPS */}
            <Col lg={6} className="home-left-col d-none d-lg-flex">
              <div className="home-left-content">
                <div className="govt-header">
                  <img
                    src="/assets/images/uk_logo.jpeg"
                    alt="Uttarakhand Logo"
                    className="uk-logo"
                  />
                  <div className="govt-text">
                    <h4 className="govt-title">उत्तराखण्ड सरकार</h4>
                    <p className="govt-subtitle">Government of Uttarakhand</p>
                  </div>
                </div>

                <div className="scheme-title-block">
                  <h2 className="scheme-title">ऑनलाइन नामांकन प्रपत्र</h2>
                  <h3 className="scheme-name">
                    मुख्यमंत्री राज्य बाल वीरता पुरस्कार
                  </h3>
                  <p className="scheme-name-en">
                    Chief Minister State Child Bravery Award
                  </p>
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
            </Col>

            {/* RIGHT - LOGIN */}
            <Col lg={6} className="home-right-col d-flex align-items-center justify-content-center">
              <div className="login-wrapper">
                <div className="login-header">
                  <div className="login-logo-circle">
                    <FaUserShield size={32} />
                  </div>
                  <h3 className="login-title">लॉगिन</h3>
                  <p className="login-subtitle">अपने खाते में लॉगिन करें</p>
                </div>

                <Card className="login-card">
                  <Card.Body className="login-card-body">
                    <Form className="login-form" onSubmit={handleLogin}>
                      <Form.Group className="mb-3" controlId="formUsername">
                        <Form.Label className="login-label">
                          <FaUserShield className="login-label-icon" />
                          उपयोगकर्ता नाम
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="उपयोगकर्ता नाम दर्ज करें"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="login-input"
                          autoComplete="username"
                        />
                      </Form.Group>

                      <Form.Group className="mb-4" controlId="formPassword">
                        <Form.Label className="login-label">
                          <FaKey className="login-label-icon" />
                          पासवर्ड
                        </Form.Label>
                        <div className="password-wrapper">
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
                          {error}
                        </div>
                      )}

                      <Button
                        variant="primary"
                        type="submit"
                        className="login-submit-btn w-100"
                      >
                        <FaUserShield className="btn-icon" />
                        लॉगिन
                      </Button>

                      <div className="login-footer">
                        <span className="login-footer-text">
                          खाता नहीं है?{" "}
                          <Link to="/StudentRegistration" className="register-link">
                            पंजीकरण करें
                          </Link>
                        </span>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>

                <div className="login-footer-info">
                  <p>सुरक्षित लॉगिन | Secure Login</p>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}

export default Home;
