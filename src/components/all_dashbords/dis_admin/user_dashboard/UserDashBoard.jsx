import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { FaCogs, FaProjectDiagram, FaBoxOpen, FaServer, FaCube } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import UserTopNav from "./UserTopNav";
import UserLeftNav from "./UserLeftNav";



const UserDashBoard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [counts, setCounts] = useState({ services: 0, projects: 0, products: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

 


   const toggleSidebar = () => {
     setSidebarOpen(!sidebarOpen);
   };

   return (
     <div className="dashboard-container">
       <UserLeftNav
         sidebarOpen={sidebarOpen}
         setSidebarOpen={setSidebarOpen}
         isMobile={isMobile}
         isTablet={isTablet}
       />
       <div className="main-content-dash">
         <UserTopNav toggleSidebar={toggleSidebar} />

         <Container fluid className="dashboard-box mt-3">
          dashbrd
          </Container>
       </div>
     </div>
   );
};

export default UserDashBoard;