import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Table, Badge, Form, Modal, Button } from "react-bootstrap";
import { FaCogs, FaProjectDiagram, FaBoxOpen, FaServer, FaCube, FaUserGraduate, FaCheckCircle, FaSpinner, FaSearch, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ITCellTopNav from "./ITCellTopNav";
import ITCellLeftNav from "./ITCellLeftNav";


const ITCellDashBoard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [counts, setCounts] = useState({ services: 0, projects: 0, products: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [stepStatusFilter, setStepStatusFilter] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch("https://mahadevaaya.com/balvirtaawardproject/balvirtaawardproject_backend/api/bravery/it-cell/applications/", {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setApplications(result.data);
        } else {
          setApplications([]);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch applications");
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

   const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
    };

    const totalApplications = applications.length;
    const completedApplications = applications.filter(app => app.step_status === "Final Submitted").length;
    const inProgressApplications = applications.filter(app => app.step_status && app.step_status.startsWith("step-")).length;

    const uniqueProjects = Array.from(new Set(applications.map(app => app.project).filter(Boolean))).sort();
    const uniqueDistricts = Array.from(new Set(applications.map(app => app.district).filter(Boolean))).sort();
    const uniqueStepStatuses = Array.from(new Set(applications.map(app => app.step_status).filter(Boolean))).sort();

    const getStepBadge = (stepStatus) => {
      if (stepStatus === "Final Submitted") {
        return <Badge style={{ backgroundColor: "#16715b", color: "#fff", fontSize: "0.7rem", padding: "0.35em 0.6em", fontWeight: 600 }}>Final Submitted</Badge>;
      }
      if (stepStatus && stepStatus.startsWith("step-")) {
        const stepNum = stepStatus.replace("step-", "");
        return <Badge style={{ backgroundColor: "#1d85e9", color: "#fff", fontSize: "0.7rem", padding: "0.35em 0.6em", fontWeight: 600 }}>Step {stepNum}</Badge>;
      }
      if (stepStatus === "pending") {
        return <Badge style={{ backgroundColor: "#f59e0b", color: "#fff", fontSize: "0.7rem", padding: "0.35em 0.6em", fontWeight: 600 }}>Pending</Badge>;
      }
      return <Badge style={{ backgroundColor: "#6b7280", color: "#fff", fontSize: "0.7rem", padding: "0.35em 0.6em", fontWeight: 600 }}>{stepStatus || "-"}</Badge>;
    };

    const filteredApplications = applications.filter(app => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch = !term || (
        (app.applicant_id || "").toLowerCase().includes(term) ||
        (app.full_name || "").toLowerCase().includes(term) ||
        (app.phone || "").toLowerCase().includes(term) ||
        (app.email || "").toLowerCase().includes(term)
      );
      const matchesProject = !projectFilter || app.project === projectFilter;
      const matchesDistrict = !districtFilter || app.district === districtFilter;
      const matchesStepStatus = !stepStatusFilter || app.step_status === stepStatusFilter;
      return matchesSearch && matchesProject && matchesDistrict && matchesStepStatus;
    });

    const handleViewDetails = (app) => {
      setSelectedApplication(app);
      setShowModal(true);
    };

    const handleCloseModal = () => {
      setShowModal(false);
      setSelectedApplication(null);
    };

   return (
      <div className="dashboard-container">
        <ITCellLeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />
        <div className="main-content-dash">
          <ITCellTopNav toggleSidebar={toggleSidebar} />

          <Container fluid className="dashboard-box mt-3">
            <div className="dashboard-header-section" style={{ marginBottom: "24px" }}>
              <h1 className="dashboard-main-title" style={{ fontSize: "clamp(16px, 3vw, 22px)", margin: 0 }}>
                मुख्यमंत्री राज्य बाल वीरता पुरस्कार
              </h1>
              <p className="dashboard-subtitle" style={{ margin: 0, opacity: 0.95 }}>
                IT Cell Dashboard - Student Registration Details
              </p>
            </div>

            <Row className="g-3 mb-4">
              <Col xs={12} sm={6} lg={3}>
                <Card className="stat-card h-100" style={{ border: "1px solid #e5e7eb", borderRadius: "12px" }}>
                  <Card.Body className="d-flex align-items-center">
                    <div className="stat-icon" style={{ backgroundColor: "#eef2ff", color: "#4f46e5", borderRadius: "12px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", marginRight: "1rem" }}>
                      <FaUserGraduate />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280", fontWeight: 500 }}>Total Applications</p>
                      <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "#111827" }}>{totalApplications}</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <Card className="stat-card h-100" style={{ border: "1px solid #e5e7eb", borderRadius: "12px" }}>
                  <Card.Body className="d-flex align-items-center">
                    <div className="stat-icon" style={{ backgroundColor: "#ecfdf5", color: "#16715b", borderRadius: "12px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", marginRight: "1rem" }}>
                      <FaCheckCircle />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280", fontWeight: 500 }}>Final Submitted</p>
                      <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "#111827" }}>{completedApplications}</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <Card className="stat-card h-100" style={{ border: "1px solid #e5e7eb", borderRadius: "12px" }}>
                  <Card.Body className="d-flex align-items-center">
                    <div className="stat-icon" style={{ backgroundColor: "#eff6ff", color: "#1d85e9", borderRadius: "12px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", marginRight: "1rem" }}>
                      <FaSpinner />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280", fontWeight: 500 }}>In Progress</p>
                      <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "#111827" }}>{inProgressApplications}</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div style={{ marginBottom: "8px" }}>
              <h2 className="section-title" style={{ fontSize: "clamp(14px, 3vw, 20px)", fontWeight: 700, color: "#2c3e50", marginBottom: "4px", paddingBottom: "4px", borderBottom: "3px solid #667eea", display: "inline-block" }}>
                छात्र पंजीकरण विवरण
              </h2>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#667085" }}>Student Registration Details</p>
            </div>

            <Row className="mb-3">
              <Col xs={12} md={6} lg={4}>
                <Form.Control
                  type="text"
                  placeholder="Search by Applicant ID, Name, Phone, Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    padding: "8px 12px",
                    fontSize: "0.875rem",
                  }}
                />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <Form.Select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.875rem" }}
                >
                  <option value="">All Projects</option>
                  {uniqueProjects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} md={6} lg={3}>
                <Form.Select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.875rem" }}
                >
                  <option value="">All Districts</option>
                  {uniqueDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} md={6} lg={2}>
                <Form.Select
                  value={stepStatusFilter}
                  onChange={(e) => setStepStatusFilter(e.target.value)}
                  style={{ borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.875rem" }}
                >
                  <option value="">All Status</option>
                  {uniqueStepStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {loading && (
              <div className="text-center mt-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading applications...</p>
              </div>
            )}
            {error && (
              <Alert variant="danger" className="mt-3">
                {error}
              </Alert>
            )}
            {!loading && !error && (
              <div className="table-responsive" style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
                <Table striped bordered hover size="sm" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f9fafb" }}>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px", width: "70px" }}>S.No.</th>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px" }}>Applicant ID</th>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px" }}>Full Name</th>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px" }}>Phone</th>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px" }}>Email</th>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px" }}>Project</th>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px" }}>District</th>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px" }}>Step Status</th>
                      <th style={{ fontWeight: 600, color: "#374151", padding: "12px 8px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center" style={{ padding: "24px", color: "#6b7280" }}>No applications found.</td>
                      </tr>
                    ) : (
                      filteredApplications.map((app, index) => (
                        <tr key={app.applicant_id} style={{ verticalAlign: "middle" }}>
                          <td style={{ padding: "10px 8px", fontWeight: 500, color: "#374151", textAlign: "center" }}>{index + 1}</td>
                          <td style={{ padding: "10px 8px", fontWeight: 500, color: "#17324d" }}>{app.applicant_id}</td>
                          <td style={{ padding: "10px 8px", fontWeight: 600, color: "#172033" }}>{app.full_name}</td>
                          <td style={{ padding: "10px 8px" }}>{app.phone}</td>
                          <td style={{ padding: "10px 8px" }}>{app.email || "-"}</td>
                          <td style={{ padding: "10px 8px" }}>{app.project}</td>
                          <td style={{ padding: "10px 8px" }}>{app.district}</td>
                          <td style={{ padding: "10px 8px" }}>{getStepBadge(app.step_status)}</td>
                          <td style={{ padding: "10px 8px", textAlign: "center" }}>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewDetails(app)}
                              style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", fontSize: "0.75rem", borderRadius: "6px" }}
                            >
                              <FaEye /> View
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            )}

            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
              <Modal.Header closeButton style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <Modal.Title style={{ fontSize: "1.1rem", fontWeight: 700, color: "#17324d" }}>
                  Registration Details
                </Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ padding: "20px" }}>
                {selectedApplication && (
                  <div>
                    <h6 style={{ fontWeight: 700, color: "#2c3e50", marginBottom: "12px", paddingBottom: "8px", borderBottom: "2px solid #667eea" }}>
                      Applicant Information
                    </h6>
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Applicant ID</small>
                          <p style={{ margin: 0, fontWeight: 600, color: "#17324d", fontSize: "0.9rem" }}>{selectedApplication.applicant_id}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Name</small>
                          <p style={{ margin: 0, fontWeight: 600, color: "#172033", fontSize: "0.9rem" }}>{selectedApplication.full_name}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nominator Category</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.nominator_category || "-"}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Relation With Child</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.relat_with_child || "-"}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phone</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.phone}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.email || "-"}</p>
                        </div>
                      </Col>
                    </Row>

                    <h6 style={{ fontWeight: 700, color: "#2c3e50", margin: "20px 0 12px", paddingBottom: "8px", borderBottom: "2px solid #667eea" }}>
                      ID Proof Details
                    </h6>
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>ID Proof Type</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.id_proof_type || "-"}{selectedApplication.id_proof_type_other ? ` (${selectedApplication.id_proof_type_other})` : ""}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>ID Proof Number</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.id_proof_no || "-"}</p>
                        </div>
                      </Col>
                    </Row>

                    <h6 style={{ fontWeight: 700, color: "#2c3e50", margin: "20px 0 12px", paddingBottom: "8px", borderBottom: "2px solid #667eea" }}>
                      Address Details
                    </h6>
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Village</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.village || "-"}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Post Office</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.post_office || "-"}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Project</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.project || "-"}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>District</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.district || "-"}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pincode</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.pincode || "-"}</p>
                        </div>
                      </Col>
                    </Row>

                    <h6 style={{ fontWeight: 700, color: "#2c3e50", margin: "20px 0 12px", paddingBottom: "8px", borderBottom: "2px solid #667eea" }}>
                      Application Status
                    </h6>
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>{selectedApplication.status || "-"}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Step Status</small>
                          <p style={{ margin: 0 }}>{getStepBadge(selectedApplication.step_status)}</p>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div style={{ marginBottom: "10px" }}>
                          <small style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Created At</small>
                          <p style={{ margin: 0, fontWeight: 500, color: "#374151", fontSize: "0.9rem" }}>
                            {selectedApplication.created_at ? new Date(selectedApplication.created_at).toLocaleString("en-IN") : "-"}
                          </p>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer style={{ borderTop: "1px solid #e5e7eb", padding: "12px 20px" }}>
                <Button variant="secondary" onClick={handleCloseModal} style={{ borderRadius: "6px", fontSize: "0.875rem" }}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </Container>
        </div>
      </div>
    );
};

export default ITCellDashBoard;