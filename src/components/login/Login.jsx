import React, { useState, useCallback } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import {
  FaDatabase,
  FaUserShield,
  FaKey,
  FaUserPlus,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./Login.css";

function Login() {
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("director");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);

      if (!username) {
        setError("Please enter your username.");
        return;
      }

      if (!password) {
        setError("Please enter your password.");
        return;
      }

      try {
        const response = await fetch(
          "https://mahadevaaya.com/srcproject/srcproject_backend/api/login/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              password,
              role: loginType,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Login failed. Please check your credentials."
          );
        }

        // Store user data and tokens
        login(data);

        // Redirect based on role
        switch (data.role) {
          case "director":
            navigate("/DirectorDashBoard");
            break;

          case "dpo":
            navigate("/DPODashBoard");
            break;

          case "cdpo":
            navigate("/CDPODashBoard");
            break;

          case "user":
            navigate("/UserDashBoard");
            break;

          default:
            navigate("/");
        }
      } catch (err) {
        setError(err.message);
      }
    },
    [username, password, loginType, navigate, login]
  );

  return (
    <div className="login-page">
      <Container>
        <Row className="g-0 login-container align-items-stretch">

          {/* LEFT IMAGE SECTION */}
          <Col lg={6} className="login-image-col d-none d-lg-flex">
            <div className="login-image-overlay">
              <h2 className="login-image-title">
                Child Development
              </h2>

              <p>
                Empowering Children Through Information
              </p>
            </div>
          </Col>

          {/* RIGHT LOGIN SECTION */}
          <Col
            lg={6}
            className="login-form-col d-flex align-items-center justify-content-center p-2"
          >
            <div className="login-card border-0 w-100">
              <div className="p-3">

                {/* HEADER */}
                <div className="text-center mb-4">
                  <FaDatabase
                    size={40}
                    className="text-primary mb-3"
                  />

                  <h3 className="fw-bold">
                    Child Development Portal Login
                  </h3>

                  <p className="text-muted">
                    Welcome! Please login to your account.
                  </p>
                </div>

                <Form
                  className="login-form"
                  onSubmit={handleLogin}
                >

                  {/* LOGIN AS */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Login as
                    </Form.Label>

                    <div className="d-flex flex-wrap">

                      {/* DIRECTOR */}
                      <Form.Check
                        className="me-3 mb-2"
                        label="Director"
                        name="loginType"
                        type="radio"
                        id="director-radio"
                        value="director"
                        checked={loginType === "director"}
                        onChange={(e) =>
                          setLoginType(e.target.value)
                        }
                      />

                      {/* DPO */}
                      <Form.Check
                        className="me-3 mb-2"
                        label="DPO"
                        name="loginType"
                        type="radio"
                        id="dpo-radio"
                        value="dpo"
                        checked={loginType === "dpo"}
                        onChange={(e) =>
                          setLoginType(e.target.value)
                        }
                      />

                      {/* CDPO */}
                      <Form.Check
                        className="me-3 mb-2"
                        label="CDPO"
                        name="loginType"
                        type="radio"
                        id="cdpo-radio"
                        value="cdpo"
                        checked={loginType === "cdpo"}
                        onChange={(e) =>
                          setLoginType(e.target.value)
                        }
                      />

                      {/* USER */}
                      <Form.Check
                        className="mb-2"
                        label="User"
                        name="loginType"
                        type="radio"
                        id="user-radio"
                        value="user"
                        checked={loginType === "user"}
                        onChange={(e) =>
                          setLoginType(e.target.value)
                        }
                      />
                    </div>
                  </Form.Group>

                  {/* USERNAME */}
                  <Form.Group
                    className="mb-3"
                    controlId="formUsername"
                  >
                    <Form.Label>
                      <FaUserShield className="me-2" />
                      Username
                    </Form.Label>

                    <Form.Control
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value)
                      }
                      required
                    />
                  </Form.Group>

                  {/* PASSWORD */}
                  <Form.Group
                    className="mb-3"
                    controlId="formPassword"
                  >
                    <Form.Label>
                      <FaKey className="me-2" />
                      Password
                    </Form.Label>

                    <Form.Control
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                    />
                  </Form.Group>

                  {/* ERROR */}
                  {error && (
                    <p className="text-danger text-center">
                      {error}
                    </p>
                  )}

                  {/* LOGIN BUTTON */}
                  <div className="text-center mt-4">
                    <Button
                      variant="primary"
                      type="submit"
                      className="login-submit-btn w-100"
                    >
                      Login
                    </Button>
                  </div>

                  {/* REGISTRATION SECTION */}
                  <div className="registration-section text-center mt-4">

                    <div className="registration-divider">
  <span>
    Don't have an account?{" "}
  <Link
  to="/StudentRegistration"
  className="register-link"
>
  Register
</Link>
  </span>
</div>

                  
                  </div>

                </Form>
              </div>
            </div>
          </Col>

        </Row>
      </Container>
    </div>
  );
}

export default Login;