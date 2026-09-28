import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Dropdown,
  Image,
  Alert,
} from "react-bootstrap";
import {
  FaBars,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function DPOTopNav({ toggleSidebar }) {
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState({
    full_name: "",
    profile_picture: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch("https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/dpo/profile/", {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && result.data) {
          setUserDetails(result.data);
        } else {
          setError("Failed to load user profile");
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError(err.message || "Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  const getDisplayName = () => {
    return userDetails.full_name || "DPO Officer";
  };

  const getUserPhotoUrl = () => {
    const profilePicture = userDetails.profile_picture;
    if (profilePicture && !imageError) {
      return profilePicture;
    }
    return null;
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userDetails");
    navigate("/LoginPortal");
  };

  return (
    <header className="dashboard-header">
      <Container fluid>
        <Row className="align-items-center">
          <Col xs="auto">
            <Button
              variant="light"
              className="sidebar-toggle"
              onClick={toggleSidebar}
            >
              <FaBars />
            </Button>
          </Col>

          <Col>
            {error && (
              <Alert variant="warning" className="mb-0 py-1">
                <small>{error}</small>
              </Alert>
            )}
          </Col>

          <Col xs="auto">
            <div className="header-actions d-flex align-items-center">
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  className="user-profile-btn d-flex align-items-center"
                  style={{
                    gap: "4px",
                    border: "1px solid #e5e7eb",
                    padding: "2px 6px",
                  }}
                >
                  {getUserPhotoUrl() ? (
                    <Image
                      src={getUserPhotoUrl()}
                      roundedCircle
                      className="user-avatar"
                      onError={handleImageError}
                      style={{
                        width: 28,
                        height: 28,
                        objectFit: "cover",
                      }}
                      alt="User"
                    />
                  ) : (
                    <FaUserCircle style={{ fontSize: 24, color: "rgb(250 93 77)" }} />
                  )}
                  <span style={{ fontWeight: 500, fontSize: "0.85rem" }} className="">
                    {getDisplayName()}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>
        </Row>
      </Container>
    </header>
  );
}

export default DPOTopNav;