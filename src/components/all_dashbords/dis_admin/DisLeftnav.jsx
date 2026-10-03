import React, { useState, useEffect } from "react";
import { Nav, Offcanvas, Collapse } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaImages,
  FaUsers,
  FaBook,
  FaBuilding,
  FaImage,
  FaTools,
  FaComments, 
  FaCube,
  FaProjectDiagram,
  FaServer,
  FaUserCircle,
  FaCalendarAlt,
  FaPlusSquare,
  FaEdit,
  FaMusic,
  FaGlassCheers,
  FaIndustry,
  FaQuestionCircle,
  FaTrophy,
  FaBriefcase,
  FaGraduationCap, 
  FaUsersCog, // Added for Our Team icon
  FaAward,
  FaTasks,
  FaClock
} from "react-icons/fa";

import "../../../../src/assets/css/adminleftnav.css";


import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../login/AuthContext";
import {
  FaInfoCircle,
  FaBullseye,
  
} from "react-icons/fa";




const DisLeftnav = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet, onNavClick }) => {
  
  const { logout } = useAuth();
  const location = useLocation();
  const userRole = null;

 
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  // Automatically close sidebar when navigating on mobile or tablet views
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
      // Only close sidebar if navigating to a different page
      setSidebarOpen(false);
    }
  };

 const menuItems = [
      {
        icon: <FaAward />,
        label: "मुख्यमंत्री राज्य बाल वीरता पुरस्कार",
        path: "/DisDashBoard",
        active: true,
      },
      {
        icon: <FaTrophy />,
        label: "राज्य स्तरीय आंगनवाड़ी कार्यकर्त्री पुरस्कार",
        path: null,
        active: false,
        disabled: true,
      },
      {
        icon: <FaTrophy />,
        label: "राराज्य स्तरीय आंगनवाड़ी कार्यकर्त्री पुरस्कार",
        path: null,
        active: false,
        disabled: true,
      },
      
      
      
     ];

  //  Auto-close sidebar when switching to mobile or tablet

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`user-left-nav ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="sidebar-header">
          {sidebarOpen ? (
            <div className="logo-container">
              <div className="logo">
                  Directorate Panel
              </div>
            </div>
          ) : (
            <div className="logo-container logo-collapsed">
            </div>
          )}
        </div>

        <Nav className="sidebar-nav flex-column">
          
         {menuItems
   .filter((item) => (item.allowedRoles ? item.allowedRoles.includes(userRole) : true))
   .map((item, index) => (
    <div key={index}>
      {item.submenu ? (
        <Nav.Link
          className={`nav-item ${item.active ? "active" : ""}`}
          onClick={() => toggleSubmenu(index)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-text">{item.label}</span>
          <span className="submenu-arrow">
            {openSubmenu === index ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        </Nav.Link>
      ) : item.disabled ? (
        <span className="nav-item nav-link nav-item-disabled" aria-disabled="true">
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-text">{item.label}</span>
        </span>
      ) : (
         <Link
           to={item.path}
           className={`nav-item nav-link ${item.active ? "active" : ""}`}
           onClick={(e) => handleItemClick(e, item.path, item.active)}
         >
           <span className="nav-icon">{item.icon}</span>
           <span className="nav-text">{item.label}</span>
         </Link>
      )}

      {/* Submenu */}
      {item.submenu && (
        <Collapse in={openSubmenu === index}>
          <div className="submenu-container-user">
            {item.submenu.map((subItem, subIndex) => (
                 <Link
                   key={subIndex}
                   to={subItem.path}
                   className="submenu-item-user nav-link"
                   onClick={(e) => handleItemClick(e, subItem.path, false)}
                 >
                   <span className="submenu-icon">{subItem.icon}</span>
                   <span className="nav-text br-text-sub">{subItem.label}</span>
                 </Link>
            ))}
          </div>
        </Collapse>
      )}
    </div>
  ))}

        </Nav>

        <div className="sidebar-footer">
          <Nav.Link
            className="nav-item logout-btn"
            onClick={() => {
              logout();
            }}
          >
            <span className="nav-icon">
              <FaSignOutAlt />
            </span>
            <span className="nav-text">Logout</span>
          </Nav.Link>
        </div>
      </div>

      {/*  Mobile / Tablet Sidebar (Offcanvas) */}
  <Offcanvas
  show={(isMobile || isTablet) && sidebarOpen}
  onHide={() => setSidebarOpen(false)}
  className="user-mobile-offcanvas"
  placement="start"
  backdrop={true}
  scroll={false}
  enforceFocus={false} //  ADD THIS LINE — fixes close button focus issue
>
  <Offcanvas.Header closeButton className="user-offcanvas-header">
    <Offcanvas.Title className="br-off-title">Menu</Offcanvas.Title>
  </Offcanvas.Header>

  <Offcanvas.Body className="user-offcanvas-body">
    <Nav className="flex-column">
      {menuItems.map((item, index) => (
        <div key={index}>
          {item.submenu ? (
            <Nav.Link
              className={`nav-item ${item.active ? "active" : ""}`}
              onClick={() => toggleSubmenu(index)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text br-nav-text-mob">{item.label}</span>
              <span className="submenu-arrow">
                {openSubmenu === index ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            </Nav.Link>
          ) : item.disabled ? (
            <span className="nav-item nav-link nav-item-disabled" aria-disabled="true">
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text br-nav-text-mob">{item.label}</span>
            </span>
          ) : (
             <Link
               to={item.path}
               className={`nav-item nav-link ${item.active ? "active" : ""}`}
               onClick={(e) => handleItemClick(e, item.path, item.active)}
             >
               <span className="nav-icon">{item.icon}</span>
               <span className="nav-text br-nav-text-mob">{item.label}</span>
             </Link>
          )}

          {item.submenu && (
            <Collapse in={openSubmenu === index}>
              <div className="submenu-container-user">
                {item.submenu.map((subItem, subIndex) => (
                   <Link
                     key={subIndex}
                     to={subItem.path}
                     className="submenu-item nav-link"
                     onClick={(e) => handleItemClick(e, subItem.path, false)}
                   >
                     <span className="nav-text">{subItem.label}</span>
                   </Link>
                ))}
              </div>
            </Collapse>
          )}
        </div>
      ))}
    </Nav>
  </Offcanvas.Body>
</Offcanvas>

    </>
  );
};

export default DisLeftnav;