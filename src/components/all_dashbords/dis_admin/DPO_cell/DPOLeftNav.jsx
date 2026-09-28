import React, { useState, useEffect } from "react";
import { Nav, Offcanvas, Collapse } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaUserCircle,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";

const DPOLeftNav = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet, onNavClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile, isTablet, setSidebarOpen]);

  const handleItemClick = (e, path, isActive) => {
    if (onNavClick) {
      e.preventDefault();
      onNavClick(path);
    } else if (!isActive) {
      setSidebarOpen(false);
    }
  };

  const menuItems = [
    {
      icon: <FaTachometerAlt />,
      label: "DashBoard",
      path: "/DPODashBoard",
      active: true,
    },
  ];

  return (
    <>
      <div
        className={`user-left-nav ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="sidebar-header">
          {sidebarOpen ? (
            <div className="logo-container">
              <div className="logo">
                DPO Panel
              </div>
            </div>
          ) : (
            <div className="logo-container logo-collapsed">
            </div>
          )}
        </div>

        <Nav className="sidebar-nav flex-column">
          {menuItems
            .map((item, index) => (
              <div key={index}>
                <Link
                  to={item.path}
                  className={`nav-item nav-link ${location.pathname === item.path ? "active" : ""}`}
                  onClick={(e) => handleItemClick(e, item.path, location.pathname === item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                </Link>
              </div>
            ))}
        </Nav>

        <div className="sidebar-footer">
          <Nav.Link
            className="nav-item logout-btn"
            onClick={() => {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("userRole");
              localStorage.removeItem("userDetails");
              navigate("/LoginPortal");
            }}
          >
            <span className="nav-icon">
              <FaSignOutAlt />
            </span>
            <span className="nav-text">Logout</span>
          </Nav.Link>
        </div>
      </div>

      <Offcanvas
        show={(isMobile || isTablet) && sidebarOpen}
        onHide={() => setSidebarOpen(false)}
        className="user-mobile-offcanvas"
        placement="start"
        backdrop={true}
        scroll={false}
        enforceFocus={false}
      >
        <Offcanvas.Header closeButton className="user-offcanvas-header">
          <Offcanvas.Title className="br-off-title">Menu</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="user-offcanvas-body">
          <Nav className="flex-column">
            {menuItems.map((item, index) => (
              <div key={index}>
                <Link
                  to={item.path}
                  className={`nav-item nav-link ${location.pathname === item.path ? "active" : ""}`}
                  onClick={(e) => handleItemClick(e, item.path, location.pathname === item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text br-nav-text-mob">{item.label}</span>
                </Link>
              </div>
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default DPOLeftNav;