import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Container, Row, Col, Form, Button, Card, Carousel
} from "react-bootstrap";
import {
  FaUserShield, FaKey, FaClipboardList, FaAddressCard,
  FaInfoCircle, FaFileSignature, FaChevronDown, FaChevronUp,
  FaEye, FaEyeSlash, FaFileAlt, FaBookOpen, FaQuoteLeft, FaAward, FaStar
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../login/AuthContext";
import "./Home.css";

// Import Images from Assets Folder
import cmImage from "../../assets/images/cm.png";
import rekhaAryaImage from "../../assets/images/rekha.png";
import directorImage from "../../assets/images/director-wecd.png";
import secretaryImage from "../../assets/images/sec.png";

// Import Carousel Images
import slide1 from "../../assets/images/images-9.jpeg";
import slide2 from "../../assets/images/images-8.jpeg";
import slide3 from "../../assets/images/images-11.jpeg";

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

  // Collapsible section state
  const [openSection, setOpenSection] = useState(null);

  // Scroll state
  const contentRef = useRef(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const schemeInfoHeaderRef = useRef(null);
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
    const check = () => setShowScrollHint(el.scrollHeight > el.clientHeight + 5);
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
          }
        });
      },
      { root: container, rootMargin: "0px 0px -75% 0px", threshold: 0 }
    );
    if (schemeInfoHeaderRef.current) observer.observe(schemeInfoHeaderRef.current);
    return () => observer.disconnect();
  }, []);

  const handleContentScroll = () => {
    const el = contentRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    setShowScrollHint(!atBottom);
  };

  const toggleSection = useCallback((section) => {
    userInteractedRef.current = true;
    setOpenSection((prev) => (prev === section ? null : section));
    setTimeout(() => { userInteractedRef.current = false; }, 1200);
  }, []);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    if (!phone.trim()) { setError("कृपया फ़ोन नंबर दर्ज करें।"); return; }
    if (!password.trim()) { setError("कृपया पासवर्ड दर्ज करें।"); return; }
    try {
      const response = await fetch("https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, role: "user" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "लॉगिन विफल। कृपया क्रेडेंशियल जांचें।");
      login(data);
      navigate("/UserDashBoard");
    } catch (err) {
      setError(err.message);
    }
  }, [phone, password, navigate, login]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotError(null); setForgotSuccess(null);
    if (!forgotPhone.trim() || forgotPhone.length !== 10) {
      setForgotError("कृपया मान्य 10 अंकों का फ़ोन नंबर दर्ज करें।"); return;
    }
    setLoading(true);
    try {
      const response = await fetch("https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/send-otp-password-change/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone, role: "user" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "OTP भेजने में विफल।");
      setForgotSuccess("OTP सफलतापूर्वक भेजा गया है।");
      setForgotStep(2);
    } catch (err) { setForgotError(err.message); } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotError(null); setForgotSuccess(null);
    if (!forgotOtp.trim()) { setForgotError("कृपया OTP दर्ज करें।"); return; }
    setLoading(true);
    try {
      const response = await fetch("https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/verify-otp-password-change/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone, otp: forgotOtp, role: "user" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "OTP सत्यापन विफल।");
      setForgotSuccess("OTP सत्यापित हो गया है।");
      setForgotStep(3);
    } catch (err) { setForgotError(err.message); } finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setForgotError(null); setForgotSuccess(null);
    if (!newPassword.trim() || newPassword.length < 6) {
      setForgotError("पासवर्ड कम से कम 6 अंकों का होना चाहिए।"); return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError("पासवर्ड मेल नहीं खा रहे।"); return;
    }
    setLoading(true);
    try {
      const response = await fetch("https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/change-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone, role: "user", new_password: newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "पासवर्ड बदलने में विफल।");
      setForgotSuccess("पासवर्ड सफलतापूर्वक बदल दिया गया है।");
      setTimeout(() => {
        setShowForgotModal(false); setForgotStep(1); setForgotPhone("");
        setForgotOtp(""); setNewPassword(""); setConfirmPassword("");
        setForgotError(null); setForgotSuccess(null);
      }, 1500);
    } catch (err) { setForgotError(err.message); } finally { setLoading(false); }
  };

  const openForgotModal = () => {
    setShowForgotModal(true); setForgotStep(1); setForgotPhone("");
    setForgotOtp(""); setNewPassword(""); setConfirmPassword("");
    setForgotError(null); setForgotSuccess(null);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false); setForgotStep(1); setForgotPhone("");
    setForgotOtp(""); setNewPassword(""); setConfirmPassword("");
    setForgotError(null); setForgotSuccess(null);
  };

  const schemeInfo = [
    "मुख्यमंत्री राज्य बाल वीरता पुरस्कार का उद्देश्य बच्चों में साहस, आत्मविश्वास, परोपकार एवं मानवीय मूल्यों की भावना को प्रोत्साहित करना है।",
    "इस पुरस्कार के अंतर्गत सांस्कृतिक गतिविधियों, सामाजिक सेवा, पर्यावरण संरक्षण, राष्ट्रीय सेवा, आपदा में साहसी कार्य, बच्चों के अधिकारों के लिए कार्य, खेल में उत्कृष्ट प्रदर्शन आदि के क्षेत्र में विभिन्न कार्य करने वाले बच्चों को सम्मानित किया जाता है।",
    "पुरस्कार में ₹51,000/- की धनराशि (DBT माध्यम से), प्रशस्ति पत्र, मेडल/पदक एवं राज्य स्तरीय सम्मान सहित कई सम्मानित स्तंभ शामिल हैं।",
    "नामांकन प्रक्रिया पूरी ऑनलाइन है। नामांकनकर्ता बच्चे की विस्तृत जानकारी, वीरता की घटना का विवरण, सभी आवश्यक दस्तावेज अपलोड करके पंजीकरण पूरा कर सकता है।",
    "प्रत्येक जनपद से एक बच्चा (कुल अधिकतम 13 बच्चे) को राज्य स्तरीय चयन समिति द्वारा चयन किया जाता है और मुख्य सचिव का अंतिम अनुमोदन प्राप्त होने पर पुरस्कार वितरण कार्यक्रम में सम्मानित किया जाता है।",
  ];

  const registrationSteps = [
    { step: "A", title: "नामांकनकर्ता (Nominator) का विवरण", subtitle: "Nominator Details", icon: FaAddressCard, description: "नामांकनकर्ता की व्यक्तिगत जानकारी, पता और पहचान पत्र विवरण", color: "#0d6efd" },
    { step: "B", title: "नामांकित बच्चे का व्यक्तिगत विवरण", subtitle: "Nominee Details", icon: FaUserShield, description: "बच्चे का नाम, जन्म तिथि, लिंग, पता और विद्यालय संबंधी जानकारी", color: "#198754" },
    { step: "C", title: "वीरता की घटना का विवरण", subtitle: "Details of Bravery Act", icon: FaClipboardList, description: "वीरता की घटना की तारीख, स्थान, प्रकृति और विस्तृत विवरण", color: "#fd7e14" },
    { step: "D", title: "अतिरिक्त जानकारी", subtitle: "Additional Information", icon: FaInfoCircle, description: "पूर्व में किसी पुरस्कार से सम्मान, अन्य पुरस्कार और अतिरिक्त टिप्पणी", color: "#20c997" },
    { 
      step: "E", title: "आवश्यक अभिलेख अपलोड", subtitle: "Document Upload", icon: FaFileAlt, color: "#6f42c1",
      description: (
        <div className="document-description">
          <ul>
            <li>नामांकनकर्ता का पहचान पत्र - <span style={{ color: "red", fontWeight: "bold" }}>अनिवार्य</span></li>
            <li>बच्चे का आधार कार्ड/पहचान पत्र - <span style={{ color: "red", fontWeight: "bold" }}>अनिवार्य</span></li>
            <li>बालक / बालिका  का  उत्तराखण्ड का स्थायी निवास प्रमाण पत्र - <span style={{ color: "red", fontWeight: "bold" }}>अनिवार्य</span></li>
            <li>बच्चे का जन्म प्रमाण पत्र/आयु प्रमाण पत्र - <span style={{ color: "red", fontWeight: "bold" }}>अनिवार्य</span></li>
            <li>वीरता की घटना के संबंध में नामांकनकर्ता द्वारा हस्ताक्षरित विस्तृत विवरण - <span style={{ color: "red", fontWeight: "bold" }}>अनिवार्य</span></li>
            <li>बच्चे का पासपोर्ट आकार का फोटो - <span style={{ color: "red", fontWeight: "bold" }}>अनिवार्य</span></li>
            <li>पासबुक के प्रथम पृष्ठ की प्रति - <span style={{ color: "red", fontWeight: "bold" }}>अनिवार्य</span></li>
            <li>FIR / पुलिस रिपोर्ट</li>
            <li>समाचार पत्र की कटिंग / मीडिया रिपोर्ट / फोटो</li>
            <li>प्रत्यक्षदर्शियों के बयान / प्रमाण</li>
            <li>वीडियो / फोटो लिंक</li>
            <li>विद्यालय का प्रमाण पत्र</li>
            <li>अन्य सहायक अभिलेख</li>
          </ul>
          <strong>सभी आवश्यक दस्तावेज़ अपलोड करें।</strong>
        </div>
      )
    },
    { 
      step: "F", title: "घोषणा एवं सहमति", subtitle: "Declaration", icon: FaFileSignature, color: "#dc3545",
      description: (<div><p>घोषणा पढ़ें, सहमति दें, और अंतिम प्रस्तुतीकरण करें</p></div>)
    },
  ];

  // Officials Data Array
  const officials = [
    { img: cmImage, name: "Sh. Pushkar Singh Dhami", designation: ", Hon'ble Chief Minister,Uttarakhand" },
    { img: rekhaAryaImage, name: "Smt. Rekha Arya", designation: ", Cabinet Minister of Women and Child Welfare" },
    { img: secretaryImage, name: "Sh. Chandresh Kumar Yadav (IAS)", designation: ", Secretary, WECD Government of Uttarakhand "    },
    { img: directorImage, name: "Sh. Banshi Lal Rana (IAS)", designation: "Director, WECD Government of Uttarakhand" }
  ];

  return (
    <div className="home-page">
      <div className="home-main-card">  
        
        <Row className="g-0 home-row">
          <Col lg={8} className="home-left-col d-flex">
            <div className="home-left-content" ref={contentRef} onScroll={handleContentScroll}>
              
              {/* MOBILE PDF LINK */}
              <Link to="/CM.pdf" target="_blank" rel="noopener noreferrer" className="mobile-pdf-link">
                <FaFileAlt className="pdf-icon" /> योजना की पूरी जानकारी (PDF)
              </Link>

              {/* IMAGE SLIDER / CAROUSEL (Using local imports) */}
              <Carousel fade className="gov-carousel mb-4" indicators={false}>
                <Carousel.Item>
                  <img
                    className="d-block w-100"
                    src={slide1}
                    alt="Children bravery award"
                  />
                  <Carousel.Caption>
                    {/* SPLIT LAYOUT: Title Left, Paragraph Right */}
                    <div className="carousel-caption-split">
                      <div className="caption-left">
                        <h3>बच्चों में साहस और वीरता का सम्मान</h3>
                      </div>
                      <div className="caption-right">
                        <p>राज्य स्तर पर असाधारण वीरता के लिए सम्मानित किए जाने वाले बच्चे। यह पुरस्कार उन बच्चों के सम्मान का प्रतीक है जिन्होंने समाज हेतु असाधारण कार्य किए हैं।</p>
                      </div>
                    </div>
                  </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                  <img
                    className="d-block w-100"
                    src={slide2}
                    alt="Uttarakhand landscape"
                  />
                  <Carousel.Caption>
                    {/* SPLIT LAYOUT: Title Left, Paragraph Right */}
                    <div className="carousel-caption-split">
                      <div className="caption-left">
                        <h3>उत्तराखंड के बच्चों का सम्मान</h3>
                      </div>
                      <div className="caption-right">
                        <p>देवभूमि के बच्चों की असाधारण उपलब्धियों को प्रोत्साहित करने की एक पहल। राज्य के विभिन्न जनपदों से चयनित बच्चों को यह सम्मान प्रदान किया जाता है।</p>
                      </div>
                    </div>
                  </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                  <img
                    className="d-block w-100"
                    src={slide3}
                    alt="Award medal"
                  />
                  <Carousel.Caption>
                    {/* SPLIT LAYOUT: Title Left, Paragraph Right */}
                    <div className="carousel-caption-split">
                      <div className="caption-left">
                        <h3>पुरस्कार एवं सम्मान</h3>
                      </div>
                      <div className="caption-right">
                        <p>₹51,000 नकद पुरस्कार, प्रशस्ति पत्र एवं राज्य स्तरीय मेडल प्रदान किया जाता है। साथ ही बच्चों के विकास हेतु आगे भी प्रोत्साहन दिया जाता है।</p>
                      </div>
                    </div>
                  </Carousel.Caption>
                </Carousel.Item>
              </Carousel>

              {/* OFFICIALS / MINISTERS SECTION (After Carousel) */}
              <div className="officials-section">
                <div className="officials-heading-row">
                  <h3 className="officials-heading">
                    <FaStar className="officials-icon" /> सम्मानित अतिथि एवं मार्गदर्शक
                  </h3>
                  <Link to="/LoginPortal" className="officials-login-btn">
                    <FaUserShield className="login-btn-icon" /> लॉगिन
                  </Link>
                </div>
                <Row className="g-3">
                  {officials.map((official, idx) => (
                    <Col xs={6} md={3} key={idx}>
                      <div className="official-card">
                        <div className="official-img-wrapper">
                          <img src={official.img} alt={official.name} className="official-img" />
                        </div>
                        <h5 className="official-name">{official.name}</h5>
                        <span className="official-designation">{official.designation}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* REGISTRATION STEPS */}
              <div className="steps-section mt-4">
                <div className="steps-heading-row">
                  <h3 className="steps-heading">
                    <FaClipboardList className="steps-heading-icon" />
                    नामांकन प्रक्रिया
                  </h3>
                  <Link to="/CM.pdf" target="_blank" rel="noopener noreferrer" className="steps-pdf-link">
                    <FaFileAlt className="pdf-icon" /> योजना की पूरी जानकारी (PDF)
                  </Link>
                </div>

                <div className="registration-steps-grid">
                  <div className="registration-steps-col">
                    {registrationSteps.slice(0, 4).map((step, index) => {
                      const IconComponent = step.icon;
                      return (
                        <div key={step.step} className="step-item" style={{ "--step-color": step.color }}>
                          <div className="step-number">{step.step}</div>
                          <div className="step-icon-wrapper">
                            <IconComponent className="step-icon" />
                          </div>
                          <div className="step-content">
                            <div className="step-title-row">
                              <h5 className="step-title">{step.title}</h5>
                              <span className="step-subtitle">{step.subtitle}</span>
                            </div>
                            <div className="step-description">{step.description}</div>
                          </div>
                          {index < 3 && <div className="step-connector" />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="registration-steps-col">
                    {registrationSteps.slice(4).map((step, index) => {
                      const IconComponent = step.icon;
                      return (
                        <div key={step.step} className="step-item" style={{ "--step-color": step.color }}>
                          <div className="step-number">{step.step}</div>
                          <div className="step-icon-wrapper">
                            <IconComponent className="step-icon" />
                          </div>
                          <div className="step-content">
                            <div className="step-title-row">
                              <h5 className="step-title">{step.title}</h5>
                              <span className="step-subtitle">{step.subtitle}</span>
                            </div>
                            <div className="step-description">{step.description}</div>
                          </div>
                          {index < registrationSteps.slice(4).length - 1 && <div className="step-connector" />}
                        </div>
                      );
                    })}
                    <div className="step-f-pdf-links">
                      <Link to="/declaration1.pdf" target="_blank" rel="noopener noreferrer" className="step-f-pdf-link">
                        <FaFileAlt className="pdf-icon" /> घोषणा 1 डाउनलोड करें
                      </Link>
                      <Link to="/declaration2.pdf" target="_blank" rel="noopener noreferrer" className="step-f-pdf-link">
                        <FaFileAlt className="pdf-icon" /> घोषणा 2 डाउनलोड करें
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLLAPSIBLE: SCHEME INFORMATION */}
              <div className="info-section mt-4">
                <button
                  ref={schemeInfoHeaderRef}
                  className="info-section-header"
                  onClick={() => toggleSection("schemeInfo")}
                  type="button"
                >
                  <span className="info-section-title">
                    <FaBookOpen className="info-section-icon" />
                    योजना की जानकारी
                  </span>
                  <FaChevronUp className={`info-section-chevron ${openSection === "schemeInfo" ? "rotated" : ""}`} />
                </button>
                <div className={`info-section-body ${openSection === "schemeInfo" ? "open" : ""}`}>
                  <ol className="scheme-info-list">
                    {schemeInfo.map((item, i) => (<li key={i}>{item}</li>))}
                  </ol>
                </div>
              </div>

              <div className="scheme-pdf-link">
                <Link to="/CM.pdf" target="_blank" rel="noopener noreferrer">
                  <FaFileAlt className="pdf-icon" /> योजना की पूरी जानकारी / Scheme Details (PDF)
                </Link>
              </div>
            </div>

            <div className={`left-content-fade ${!showScrollHint ? "left-content-fade-hidden" : ""}`} />
            {showScrollHint && (
              <div className="scroll-hint">
                <FaChevronDown className="scroll-hint-icon" /> और जानकारी के लिए नीचे स्क्रॉल करें
              </div>
            )}
          </Col>

         
        </Row>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={closeForgotModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>पासवर्ड बदलें</h3>
              <button type="button" className="modal-close" onClick={closeForgotModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-steps">
                <div className={`modal-step ${forgotStep >= 1 ? "active" : ""}`}><span className="modal-step-num">1</span><span>OTP भेजें</span></div>
                <div className={`modal-step ${forgotStep >= 2 ? "active" : ""}`}><span className="modal-step-num">2</span><span>OTP सत्यापित करें</span></div>
                <div className={`modal-step ${forgotStep >= 3 ? "active" : ""}`}><span className="modal-step-num">3</span><span>नया पासवर्ड</span></div>
              </div>

              {forgotError && (<div className="modal-error" role="alert">⚠️ {forgotError}</div>)}
              {forgotSuccess && (<div className="modal-success" role="alert">✅ {forgotSuccess}</div>)}

              {forgotStep === 1 && (
                <Form onSubmit={handleSendOtp} noValidate>
                  <Form.Group className="mb-3">
                    <Form.Label className="modal-label">फ़ोन नंबर</Form.Label>
                    <Form.Control type="tel" placeholder="10 अंकों का फ़ोन नंबर दर्ज करें" value={forgotPhone} onChange={(e) => setForgotPhone(e.target.value)} maxLength={10} className="modal-input" required />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="modal-submit-btn" disabled={loading}>{loading ? "भेज रहे हैं..." : "OTP भेजें"}</Button>
                </Form>
              )}

              {forgotStep === 2 && (
                <Form onSubmit={handleVerifyOtp} noValidate>
                  <Form.Group className="mb-3">
                    <Form.Label className="modal-label">OTP</Form.Label>
                    <Form.Control type="text" placeholder="OTP दर्ज करें" value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value)} maxLength={6} className="modal-input" required />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="modal-submit-btn" disabled={loading}>{loading ? "सत्यापित कर रहे हैं..." : "OTP सत्यापित करें"}</Button>
                </Form>
              )}

              {forgotStep === 3 && (
                <Form onSubmit={handleChangePassword} noValidate>
                  <Form.Group className="mb-3">
                    <Form.Label className="modal-label">नया पासवर्ड</Form.Label>
                    <Form.Control type="password" placeholder="नया पासवर्ड दर्ज करें" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="modal-input" required />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="modal-label">पासवर्ड पुनः दर्ज करें</Form.Label>
                    <Form.Control type="password" placeholder="पासवर्ड पुनः दर्ज करें" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="modal-input" required />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="modal-submit-btn" disabled={loading}>{loading ? "बदल रहे हैं..." : "पासवर्ड बदलें"}</Button>
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