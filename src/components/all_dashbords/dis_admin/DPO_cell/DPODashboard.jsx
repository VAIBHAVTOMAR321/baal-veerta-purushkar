import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Form,
  Modal,
  Button,
  Alert,
  Spinner,
  Image,
} from "react-bootstrap";
import {
  FaUserGraduate,
  FaCheckCircle,
  FaSpinner,
  FaEye,
  FaIdCard,
  FaFileAlt,
  FaFilePdf,
  FaFileExcel,
  FaHourglassHalf,
  FaCheck,
  FaTimes,
  FaTasks,
  FaCommentDots,
  FaUserCircle,
  FaSearch,
} from "react-icons/fa";
import DPOTopNav from "./DPOTopNav";
import DPOLeftNav from "./DPOLeftNav";
import PreviewModal from "../../../child_regis/NominationForm/PreviewModal";
import { exportDashboardExcel, exportDashboardPdf } from "../../../../utils/itCellReportExport";
import "./DPODashboard.css";

// Static mapping function (kept for modal structure)
const mapApiDataToPreviewData = (item) => {
  if (!item) return null;
  const s1 = item["step-1"] || {};
  const s2 = item["step-2"] || {};
  const s3 = item["step-3"] || {};
  const s4 = item["step-4"] || {};
  const s5 = item["step-5"] || {};

  return {
    applicant_id: item.applicant_id || s1.applicant_id || "",
    childName: s1.child_full_name || "",
    fatherName: s1.father_name || "",
    motherName: s1.mother_name || "",
    guardianName: s1.guardian_name || "",
    birthDate: s1.date_of_birth || "",
    gender: s1.gender || "",
    resident: s1.permanent_resident_uttarakhand || "",
    residence_certificate_number: s1.residence_certificate_number || "",
    childMobile: s1.child_guardian_mobile || "",
    bankAccountHolderType: s2.bank_nominee_relation || s1.bank_nominee_relation || "",
    bankAccountHolderName: s2.bank_holder_name || s1.bank_holder_name || "",
    bankName: s2.bank_name || s1.bank_name || "",
    ifscCode: s2.ifsc_code || s1.ifsc_code || "",
    bankAccountNumber: s2.bank_acc_no || s1.bank_acc_no || "",
    schoolName: s1.school_name || "",
    schoolAddress: s1.school_address || "",
    currentClass: s1.current_class || "",
    "currentग्राम/मोहल्ला": s1.current_village || "",
    "currentतहसील ": s1.current_post_office || "",
    "currentजनपद": s1.current_district || "",
    "currentविकासखण्ड/नगर निकाय": s1.current_block_local_body || "",
    "currentपिन कोड": s1.current_pincode || "",
    "permanentग्राम/मोहल्ला": s1.permanent_village || "",
    "permanentतहसील ": s1.permanent_post_office || "",
    "permanentजनपद": s1.permanent_district || "",
    "permanentविकासखण्ड/नगर निकाय": s1.permanent_block_local_body || "",
    "permanentपिन कोड": s1.permanent_pincode || "",
    district: s1.permanent_district || "",
    submissionDate: s1.updated_at || s1.created_at || "",
    step1Status: s1.status || "",
    actTitle: s2.incident_title || "",
    incidentType: s2.incident_type || "",
    actDate: s2.incident_date || "",
    incidentAge: s2.age_at_incident || "",
    actTime: s2.incident_time || "",
    actPlace: s2.incident_location || "",
    actDistrict: s2.incident_district || "",
    shortDescription: s2.incident_description || "",
    rescuedCount: s2.rescued_persons_description || "",
    rescuedPersons: s2.rescued_persons || [],
    rescuedDetails: { people: s2.rescued_persons || [] },
    eyewitnesses: s2.eyewitnesses || [],
    firRegistered: s2.fir_status || "",
    policeStation: s2.police_station || "",
    firNumber: s2.fir_number || "",
    firDate: s2.fir_date || "",
    mediaPublished: s2.media_report_available || "",
    step2Status: s2.status || "",
    otherAward: s3.other_award || "",
    otherAwardDetails: s3.other_award_details || "",
    additionalInformation: s3.additional_information || "",
    step3Status: s3.status || "",
    document0: s4.nominator_id_proof || s5.nominator_id_proof || "",
    document1: s4.child_aadhaar_identity || s5.child_aadhaar_identity || "",
    document2: s4.permanent_residence_certificate || s5.permanent_residence_certificate || "",
    document3: s4.child_birth_age_certificate || s5.child_birth_age_certificate || "",
    document4: s4.bravery_incident_description || s5.bravery_incident_description || "",
    document5: s4.child_passport_photo || s5.child_passport_photo || "",
    document6: s4.fir_police_report || s5.fir_police_report || "",
    document7: s4.media_report || s5.media_report || "",
    document8: s4.eyewitness_statements || s5.eyewitness_statements || "",
    document9: s4.incident_photo_video_url || s5.incident_photo_video_url || "",
    document10: s4.school_certificate || s5.school_certificate || "",
    document11: s4.otherSupporting_documents || s5.otherSupporting_documents || "",
    document12: s4.bank_detail || s5.bank_detail || "",
    step4Status: s4.status || "",
    declarationDocument: s5.declarationDocument || s4.declarationDocument || "",
    parentDeclarationDocument: s5.parentDeclarationDocument || s4.parentDeclarationDocument || "",
    step5Status: s5.status || "",
    rawStep1: s1,
    rawStep2: s2,
    rawStep3: s3,
    rawStep4: s4,
    rawStep5: s5,
    dpoStatus: item.dpo_status || {},
  };
};

// --- STATIC DATA ---
const staticApplications = [
  {
    applicant_id: "APP-2023-001", full_name: "Aarav Sharma", age: 14, class_name: "10th", photo: null,
    district: "Dehradun", incident_title: "Saved child from drowning", step_status: "Final Submitted", dpo_status: "pending",
    nominator_category: "Parent", relat_with_child: "Father", id_proof_type: "Aadhaar", id_proof_no: "XXXX-XXXX-1234",
    village: "FRI Area", post_office: "Dehradun GPO", project: "Project A", pincode: "248001", status: "Active", created_at: "2023-10-01T10:00:00Z"
  },
  {
    applicant_id: "APP-2023-002", full_name: "Diya Verma", age: 12, class_name: "8th", photo: null,
    district: "Haridwar", incident_title: "Rescued people from fire", step_status: "step-3", dpo_status: "approved",
    nominator_category: "Teacher", relat_with_child: "Guardian", id_proof_type: "PAN", id_proof_no: "ABCDE1234F",
    village: "Roorkee", post_office: "Roorkee HO", project: "Project B", pincode: "247667", status: "Active", created_at: "2023-10-05T11:30:00Z"
  },
  {
    applicant_id: "APP-2023-003", full_name: "Vivaan Gupta", age: 16, class_name: "12th", photo: null,
    district: "Nainital", incident_title: "Fought off wild bear", step_status: "Final Submitted", dpo_status: "rejected",
    nominator_category: "Other", relat_with_child: "Neighbor", id_proof_type: "Voter ID", id_proof_no: "XYZ1234567",
    village: "Mallital", post_office: "Nainital HO", project: "Project A", pincode: "263001", status: "Active", created_at: "2023-10-10T09:15:00Z"
  },
  {
    applicant_id: "APP-2023-004", full_name: "Ananya Singh", age: 10, class_name: "6th", photo: null,
    district: "Almora", incident_title: "Saved friend from snake bite", step_status: "step-1", dpo_status: "pending",
    nominator_category: "Parent", relat_with_child: "Mother", id_proof_type: "Aadhaar", id_proof_no: "AAAA-BBBB-5678",
    village: "Someshwar", post_office: "Someshwar SO", project: "Project C", pincode: "263601", status: "Active", created_at: "2023-10-12T14:00:00Z"
  },
];

const staticFormStatusList = staticApplications.map((app) => ({
  applicant_id: app.applicant_id,
  dpo_status: { status: app.dpo_status },
  "step-1": {
    applicant_id: app.applicant_id,
    child_full_name: app.full_name,
    father_name: "Father Name",
    mother_name: "Mother Name",
    permanent_resident_uttarakhand: "Yes",
    status: "completed",
    updated_at: app.created_at,
    school_name: "Local School",
    current_class: app.class_name,
    permanent_district: app.district,
    permanent_village: app.village,
    permanent_post_office: app.post_office,
    permanent_pincode: app.pincode,
    child_guardian_mobile: "9876543210",
  },
  "step-2": { 
    status: "completed", 
    incident_title: app.incident_title 
  },
  "step-3": { status: "completed" },
  "step-4": { status: "completed" },
  "step-5": { status: "completed" },
}));

const DPODashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [applications, setApplications] = useState(staticApplications);
  const [formStatusList] = useState(staticFormStatusList);

  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [stepStatusFilter, setStepStatusFilter] = useState("");
  const [dpoStatusFilter, setDpoStatusFilter] = useState("");
  const [formViewFilter, setFormViewFilter] = useState("all");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showFormPreviewModal, setShowFormPreviewModal] = useState(false);
  const [selectedFormPreviewData, setSelectedFormPreviewData] = useState(null);
  const [noFormDataAlert, setNoFormDataAlert] = useState(false);
  const [exporting, setExporting] = useState("");
  const [exportError, setExportError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentApp, setCommentApp] = useState(null);
  const [commentText, setCommentText] = useState("");

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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const totalApplications = applications.length;
  const completedApplications = applications.filter(
    (app) => app.step_status === "Final Submitted"
  ).length;
  const inProgressApplications = applications.filter(
    (app) => app.step_status && app.step_status.startsWith("step-")
  ).length;
  
  const registeredStepStatusCount = applications.filter(
    (app) => app.step_status && app.step_status.trim() !== ""
  ).length;

  const uniqueProjects = Array.from(
    new Set(applications.map((app) => app.project).filter(Boolean))
  ).sort();

  const uniqueStepStatuses = Array.from(
    new Set(applications.map((app) => app.step_status).filter(Boolean))
  ).sort();

  const uniqueDpoStatuses = Array.from(
    new Set(applications.map((app) => app.dpo_status).filter(Boolean))
  ).sort();

  const getStepBadge = (stepStatus) => {
    if (stepStatus === "Final Submitted") {
      return <Badge bg="success" className="badge-soft">Final Submitted</Badge>;
    }
    if (stepStatus && stepStatus.startsWith("step-")) {
      const stepNum = stepStatus.replace("step-", "");
      return <Badge bg="primary" className="badge-soft">Step {stepNum}</Badge>;
    }
    if (stepStatus === "pending") {
      return <Badge bg="warning" text="dark" className="badge-soft">Pending</Badge>;
    }
    return <Badge bg="secondary" className="badge-soft">{stepStatus || "-"}</Badge>;
  };

  const getDpoStatusBadge = (dpoStatus) => {
    switch (dpoStatus) {
      case "approved":
      case "verified":
        return <Badge bg="success" className="badge-soft"><FaCheck className="me-1" /> Approved</Badge>;
      case "rejected":
        return <Badge bg="danger" className="badge-soft"><FaTimes className="me-1" /> Rejected</Badge>;
      case "pending":
        return <Badge bg="warning" text="dark" className="badge-soft"><FaHourglassHalf className="me-1" /> Pending</Badge>;
      default:
        return <Badge bg="secondary" className="badge-soft">Not Reviewed</Badge>;
    }
  };

  const filteredApplications = applications.filter((app) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (app.applicant_id || "").toLowerCase().includes(term) ||
      (app.full_name || "").toLowerCase().includes(term) ||
      (app.incident_title || "").toLowerCase().includes(term);
      
    const matchesProject = !projectFilter || app.project === projectFilter;
    const matchesStepStatus = !stepStatusFilter || app.step_status === stepStatusFilter;
    const matchesDpoStatus = !dpoStatusFilter || app.dpo_status === dpoStatusFilter;
    
    let matchesFormView = true;
    if (formViewFilter === "completed") {
      matchesFormView = app.step_status === "Final Submitted";
    } else if (formViewFilter === "verified") {
      matchesFormView = app.dpo_status === "approved" || app.dpo_status === "verified";
    }

    return matchesSearch && matchesProject && matchesStepStatus && matchesDpoStatus && matchesFormView;
  });

  const reportFilters = {
    Search: searchTerm.trim() || "All",
    Project: projectFilter || "All",
    "Step Status": stepStatusFilter || "All",
    "DPO Status": dpoStatusFilter || "All",
    "Form View": formViewFilter || "All",
  };

  const handleExportPdf = async () => {
    if (exporting) return;
    setExporting("pdf");
    setExportError(null);
    try {
      await exportDashboardPdf({
        applications: filteredApplications,
        formStatusList,
        filters: reportFilters,
      });
    } catch (err) {
      setExportError(err.message || "PDF export failed");
    } finally {
      setExporting("");
    }
  };

  const handleExportExcel = async () => {
    if (exporting) return;
    setExporting("excel");
    setExportError(null);
    try {
      await exportDashboardExcel({
        applications: filteredApplications,
        formStatusList,
        filters: reportFilters,
      });
    } catch (err) {
      setExportError(err.message || "Excel export failed");
    } finally {
      setExporting("");
    }
  };

  const handleViewClick = (app) => {
    setSelectedApplication(app);
    setNoFormDataAlert(false);
    setShowChoiceModal(true);
  };

  const handleOpenRegistrationDetails = (app = selectedApplication) => {
    setSelectedApplication(app);
    setShowChoiceModal(false);
    setShowModal(true);
  };

  const handleCloseRegistrationModal = () => setShowModal(false);

  const handleOpenFormDetails = async (app = selectedApplication) => {
    if (!app) return;
    setSelectedApplication(app);
    setNoFormDataAlert(false);

    const foundRecord = formStatusList.find(
      (item) => String(item.applicant_id || "").trim() === String(app.applicant_id || "").trim()
    );

    if (!foundRecord || !foundRecord["step-1"]) {
      setNoFormDataAlert(true);
      return;
    }

    setShowChoiceModal(false);
    setShowModal(false);
    const mapped = mapApiDataToPreviewData(foundRecord);
    setSelectedFormPreviewData(mapped);
    setShowFormPreviewModal(true);
  };

  const handleSwitchToForm = (app = selectedApplication) => {
    setShowModal(false);
    handleOpenFormDetails(app);
  };

  const handleSwitchToRegistration = () => {
    setShowFormPreviewModal(false);
    setShowModal(true);
  };

  const handleDpoAction = async (applicantId, action) => {
    if (!applicantId) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newStatus = action === "approve" ? "approved" : "rejected";

      setApplications((prev) =>
        prev.map((app) =>
          app.applicant_id === applicantId ? { ...app, dpo_status: newStatus } : app
        )
      );

      if (selectedApplication?.applicant_id === applicantId) {
        setSelectedApplication((prev) => ({ ...prev, dpo_status: newStatus }));
      }

      setActionMessage({
        type: "success",
        text: `Application ${action} successfully.`,
      });
    } catch (err) {
      setActionMessage({ type: "danger", text: err.message || "Action failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCommentModal = (app) => {
    setCommentApp(app);
    setCommentText("");
    setShowCommentModal(true);
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setCommentApp(null);
    setCommentText("");
  };

  const handleSaveComment = () => {
    setActionMessage({
      type: "info",
      text: `Comment saved for ${commentApp?.full_name}: "${commentText}"`
    });
    handleCloseCommentModal();
  };

  return (
    <div className="dashboard-container">
      <DPOLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <DPOTopNav toggleSidebar={toggleSidebar} />

        <div fluid className="p-4 p-md-5" style={{ background: "#f8fafc", minHeight: "calc(100vh - 60px)" }}>
          
          {/* Page Header */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1 fw-bold text-dark" style={{ fontSize: "1.5rem" }}>
                DPO Verification Dashboard
              </h2>
              <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
                मुख्यमंत्री राज्य बाल वीरता पुरस्कार - Verify student applications
              </p>
            </div>
            <div className="d-flex gap-2 mt-3 mt-md-0">
              <Button 
                variant="light" 
                size="sm" 
                className="d-flex align-items-center border shadow-sm"
                onClick={handleExportExcel}
                disabled={exporting || filteredApplications.length === 0}
              >
                {exporting === "excel" ? <Spinner size="sm" /> : <FaFileExcel className="me-2 text-success" />}
                Excel
              </Button>
              <Button 
                variant="light" 
                size="sm" 
                className="d-flex align-items-center border shadow-sm"
                onClick={handleExportPdf}
                disabled={exporting || filteredApplications.length === 0}
              >
                {exporting === "pdf" ? <Spinner size="sm" /> : <FaFilePdf className="me-2 text-danger" />}
                PDF
              </Button>
            </div>
          </div>

          {actionMessage && (
            <Alert variant={actionMessage.type} className="rounded-3 border-0 shadow-sm" onClose={() => setActionMessage(null)} dismissible>
              {actionMessage.text}
            </Alert>
          )}

          {exportError && (
            <Alert variant="danger" className="rounded-3 border-0 shadow-sm" onClose={() => setExportError(null)} dismissible>
              {exportError}
            </Alert>
          )}

          {/* Compact Stat Cards */}
          <Row className="g-3 mb-4">
            {[
              { label: "Total Applications", value: totalApplications, icon: <FaUserGraduate />, bg: "primary-soft", color: "primary" },
              { label: "Final Submitted", value: completedApplications, icon: <FaCheckCircle />, bg: "success-soft", color: "success" },
              { label: "In Progress", value: inProgressApplications, icon: <FaSpinner />, bg: "info-soft", color: "info" },
              { label: "Registered Step Status", value: registeredStepStatusCount, icon: <FaTasks />, bg: "warning-soft", color: "warning" },
            ].map((stat, idx) => (
              <Col xs={6} lg={3} key={idx}>
                <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
                  <Card.Body className="d-flex align-items-center p-3">
                    <div 
                      className="d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "40px", 
                        height: "40px", 
                        borderRadius: "10px",
                        background: `var(--${stat.bg}, #e2e8f0)`,
                        color: `var(--bs-${stat.color}, #333)`,
                        fontSize: "1.1rem"
                      }}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {stat.label}
                      </div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
                        {stat.value}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Filters & Table Container */}
          <Card className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>
            <Card.Body className="p-4">
              
              {/* Filter Bar */}
              <div className="mb-4 p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <Row className="g-3 align-items-center">
                  <Col xs={12} md={4} lg={4}>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0" style={{ borderRadius: "8px 0 0 8px", borderColor: "#cbd5e1" }}>
                        <FaSearch className="text-muted" size={14} />
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="Search by name, ID, title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-start-0"
                        style={{ borderRadius: "0 8px 8px 0", borderColor: "#cbd5e1", padding: "10px 12px", fontSize: "0.875rem" }}
                      />
                    </div>
                  </Col>
                  <Col xs={6} md={2} lg={2}>
                    <Form.Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="filter-select">
                      <option value="">All Projects</option>
                      {uniqueProjects.map(p => <option key={p} value={p}>{p}</option>)}
                    </Form.Select>
                  </Col>
                  <Col xs={6} md={2} lg={2}>
                    <Form.Select value={stepStatusFilter} onChange={(e) => setStepStatusFilter(e.target.value)} className="filter-select">
                      <option value="">All Steps</option>
                      {uniqueStepStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </Form.Select>
                  </Col>
                  <Col xs={6} md={2} lg={2}>
                    <Form.Select value={dpoStatusFilter} onChange={(e) => setDpoStatusFilter(e.target.value)} className="filter-select">
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </Form.Select>
                  </Col>
                  <Col xs={6} md={2} lg={2}>
                    <Form.Select value={formViewFilter} onChange={(e) => setFormViewFilter(e.target.value)} className="filter-select">
                      <option value="all">All Forms</option>
                      <option value="completed">Completed</option>
                      <option value="verified">Verified/Selected</option>
                    </Form.Select>
                  </Col>
                </Row>
              </div>

              {/* Table */}
              <div className="table-responsive">
                <Table hover className="align-items-center" style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                      <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", width: "50px" }}>#</th>
                      <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Photo</th>
                      <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Name</th>
                      <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Age</th>
                      <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Class</th>
                      <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>District</th>
                      <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>घटना का शीर्षक</th>
                      <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-5 text-muted" style={{ fontSize: "0.9rem" }}>
                          No applications found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app, index) => (
                        <tr key={app.applicant_id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 500 }}>{index + 1}</td>
                          <td style={{ padding: "12px 16px" }}>
                            {app.photo ? (
                              <Image src={app.photo} roundedCircle style={{ width: "36px", height: "36px", objectFit: "cover", border: "2px solid #e2e8f0" }} alt="profile" />
                            ) : (
                              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <FaUserCircle style={{ color: "#cbd5e1", fontSize: "1.2rem" }} />
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.875rem" }}>{app.full_name}</div>
                            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{app.applicant_id}</div>
                          </td>
                          <td style={{ padding: "12px 16px", color: "#475569", fontSize: "0.875rem" }}>{app.age || "-"}</td>
                          <td style={{ padding: "12px 16px", color: "#475569", fontSize: "0.875rem" }}>{app.class_name || "-"}</td>
                          <td style={{ padding: "12px 16px", color: "#475569", fontSize: "0.875rem" }}>{app.district}</td>
                          <td style={{ padding: "12px 16px", color: "#475569", fontSize: "0.875rem", maxWidth: "250px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {app.incident_title || "-"}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>
                            <div className="d-flex gap-2 justify-content-end">
                              <Button 
                                variant="light" 
                                size="sm" 
                                onClick={() => handleOpenCommentModal(app)}
                                className="d-flex align-items-center justify-content-center border"
                                style={{ width: "32px", height: "32px", padding: 0, borderRadius: "8px", borderColor: "#e2e8f0", color: "#64748b" }}
                                title="Add Comment"
                              >
                                <FaCommentDots size={14} />
                              </Button>
                              <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => handleViewClick(app)}
                                className="d-flex align-items-center"
                                style={{ borderRadius: "8px", padding: "0px 12px", height: "32px", fontSize: "0.8rem", fontWeight: 500 }}
                                title="View Details"
                              >
                                <FaEye className="me-1" /> View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </div>

          {/* Registration Details Modal */}
          <Modal show={showModal} onHide={handleCloseRegistrationModal} size="lg" centered contentClassName="border-0 shadow-lg">
            <Modal.Header closeButton className="bg-white border-bottom p-4" style={{ borderRadius: "12px 12px 0 0" }}>
              <Modal.Title className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                Registration Details
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4" style={{ background: "#fff" }}>
              {selectedApplication && (
                <div>
                  <h6 className="text-uppercase text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.5px", fontWeight: 700 }}>
                    Applicant Information
                  </h6>
                  <Row className="g-3 mb-4">
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">Applicant ID</small>
                        <p className="detail-value text-primary fw-bold">{selectedApplication.applicant_id}</p>
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">Full Name</small>
                        <p className="detail-value text-dark fw-bold">{selectedApplication.full_name}</p>
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">Phone</small>
                        <p className="detail-value text-dark">9876543210</p>
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">Email</small>
                        <p className="detail-value text-dark">{selectedApplication.email || "-"}</p>
                      </div>
                    </Col>
                  </Row>

                  <h6 className="text-uppercase text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.5px", fontWeight: 700 }}>
                    Application Status
                  </h6>
                  <Row className="g-3 mb-4">
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">Step Status</small>
                        <div className="mt-1">{getStepBadge(selectedApplication.step_status)}</div>
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">DPO Status</small>
                        <div className="mt-1">{getDpoStatusBadge(selectedApplication.dpo_status)}</div>
                      </div>
                    </Col>
                  </Row>

                  <div className="p-4 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <h6 className="text-uppercase text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.5px", fontWeight: 700 }}>
                      DPO Verification Action
                    </h6>
                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        variant="success"
                        size="sm"
                        className="d-flex align-items-center px-3"
                        disabled={actionLoading || selectedApplication.dpo_status === "approved"}
                        onClick={() => handleDpoAction(selectedApplication.applicant_id, "approve")}
                        style={{ borderRadius: "8px", fontWeight: 500 }}
                      >
                        <FaCheck className="me-2" /> Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="d-flex align-items-center px-3"
                        disabled={actionLoading || selectedApplication.dpo_status === "rejected"}
                        onClick={() => handleDpoAction(selectedApplication.applicant_id, "reject")}
                        style={{ borderRadius: "8px", fontWeight: 500 }}
                      >
                        <FaTimes className="me-2" /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer className="p-4 border-top" style={{ background: "#f8fafc", borderRadius: "0 0 12px 12px" }}>
              <Button 
                variant="link" 
                onClick={() => handleSwitchToForm(selectedApplication)}
                className="me-auto p-0 text-decoration-none fw-bold"
                style={{ fontSize: "0.85rem" }}
              >
                <FaFileAlt className="me-1" /> आवेदन प्रपत्र देखें →
              </Button>
              <Button variant="secondary" onClick={handleCloseRegistrationModal} className="px-4" style={{ borderRadius: "8px", fontSize: "0.85rem" }}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Choice Modal */}
          <Modal show={showChoiceModal} onHide={() => setShowChoiceModal(false)} centered contentClassName="border-0 shadow-lg">
            <Modal.Header closeButton className="bg-white border-bottom p-4" style={{ borderRadius: "12px 12px 0 0" }}>
              <Modal.Title className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                Choose Details to View
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              {selectedApplication && (
                <div className="p-3 mb-4 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <p className="mb-1 text-muted" style={{ fontSize: "0.8rem" }}>
                    Applicant ID: <span className="fw-bold text-dark">{selectedApplication.applicant_id}</span>
                  </p>
                  <h5 className="mb-0 text-dark" style={{ fontSize: "1rem" }}>{selectedApplication.full_name}</h5>
                </div>
              )}

              {noFormDataAlert && (
                <Alert variant="warning" className="rounded-3 border-0 mb-4" style={{ fontSize: "0.85rem" }}>
                  <strong>सूचना:</strong> इस आवेदक द्वारा अभी तक आवेदन प्रपत्र (Step 1) नहीं भरा गया है। आप नीचे दिए गए विकल्प से केवल <strong>पंजीकरण विवरण</strong> देख सकते हैं।
                </Alert>
              )}

              <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>Please select which details you would like to view:</p>

              <div className="d-grid gap-3">
                <div 
                  onClick={() => handleOpenRegistrationDetails(selectedApplication)} 
                  className="d-flex align-items-center p-3 rounded-3 cursor-pointer choice-card-ui"
                >
                  <div className="d-flex align-items-center justify-content-center me-3" style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#eff6ff", color: "#2563eb" }}>
                    <FaIdCard />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-0 text-dark" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Registration Details</h6>
                    <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>Nominator details, address, and ID proof</p>
                  </div>
                  <FaEye className="text-muted" size={16} />
                </div>

                <div 
                  onClick={() => handleOpenFormDetails(selectedApplication)} 
                  className="d-flex align-items-center p-3 rounded-3 cursor-pointer choice-card-ui"
                >
                  <div className="d-flex align-items-center justify-content-center me-3" style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#f0fdf4", color: "#16a34a" }}>
                    <FaFileAlt />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-0 text-dark" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Application Form Details</h6>
                    <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>Step-by-step form (1 to 5) and documents</p>
                  </div>
                  <FaEye className="text-muted" size={16} />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="p-4 border-top" style={{ background: "#f8fafc", borderRadius: "0 0 12px 12px" }}>
              <Button variant="secondary" onClick={() => setShowChoiceModal(false)} className="px-4" style={{ borderRadius: "8px", fontSize: "0.85rem" }}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Add Comment Modal */}
          <Modal show={showCommentModal} onHide={handleCloseCommentModal} centered contentClassName="border-0 shadow-lg">
            <Modal.Header closeButton className="bg-white border-bottom p-4" style={{ borderRadius: "12px 12px 0 0" }}>
              <Modal.Title className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                Add Comment
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              {commentApp && (
                <div className="mb-3 text-muted" style={{ fontSize: "0.85rem" }}>
                  Applicant: <span className="fw-bold text-dark">{commentApp.full_name}</span> ({commentApp.applicant_id})
                </div>
              )}
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Enter your remark/comment here..."
                  style={{ borderRadius: "8px", borderColor: "#cbd5e1", fontSize: "0.875rem" }}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="p-4 border-top" style={{ background: "#f8fafc", borderRadius: "0 0 12px 12px" }}>
              <Button variant="light" onClick={handleCloseCommentModal} className="px-4 border" style={{ borderRadius: "8px", fontSize: "0.85rem" }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveComment} disabled={!commentText.trim()} className="px-4" style={{ borderRadius: "8px", fontSize: "0.85rem", fontWeight: 500 }}>
                Save Comment
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Form Preview Modal */}
          {showFormPreviewModal && selectedFormPreviewData && (
            <PreviewModal
              data={selectedFormPreviewData}
              onClose={() => setShowFormPreviewModal(false)}
              isApplicationCompleted={true}
              isDPO={true}
              onSwitchToRegistration={handleSwitchToRegistration}
            />
          )}
        </div>
      </div>
  );
};

export default DPODashboard;