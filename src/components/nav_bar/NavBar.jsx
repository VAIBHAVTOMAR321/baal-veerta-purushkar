import React, { useState, useEffect } from "react";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import { NavLink, Link } from "react-router-dom";
import ulLogo from "../../assets/images/uk_logo.jpeg";
import "../../assets/css/navbar.css";

function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Navbar
      expand="lg"
      className={`drc-navbar ${scrolled ? "navbar-scrolled" : ""}`}
      fixed="top"
    >
      <Container>
        {/* Logo & Brand */}
        <Navbar.Brand as={Link} to="/">
          <img
            src={ulLogo}
            height="30"
            className="d-inline-block align-top me-2"
            alt="Child Development Logo"
          />
          Women Empowerment & Child Development
        </Navbar.Brand>

        {/* Mobile Toggle */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          {/* Navigation Links */}
          <Nav className="me-auto">
            {/* Home */}
            <Nav.Link
              as={NavLink}
              to="/"
              end
              className="nav-link-custom"
            >
              Home
            </Nav.Link>
          </Nav>

          {/* Login */}
          <Nav className="align-items-center">
            <Button
              as={Link}
              to="/Login"
              variant="primary"
              className="primary-btn"
              size="sm"
            >
              Login
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;