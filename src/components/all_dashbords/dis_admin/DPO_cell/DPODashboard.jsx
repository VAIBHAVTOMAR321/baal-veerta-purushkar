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
  FaPaperclip,
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

/* STATIC DATA DEFINITIONS REMOVED - fetch data dynamically below */

const mapApiToApp = (item) => {
  if (!item) return null;
  const s1 = item["step-1"] || {};
  const nomination = item.nomination || {};

  const age = s1.date_of_birth
    ? Math.floor((Date.now() - new Date(s1.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const DpoStatusObj = item.dpo_status || {};
  let dpoStatus = DpoStatusObj.status_dpo || "pending";
  if (dpoStatus === "accepted") dpoStatus = "approved";
  const dpoComment = DpoStatusObj.comment_dpo || s1.comment_dpo || "";

  const s2 = item["step-2"] || {};
  const s3 = item["step-3"] || {};
  const s4 = item["step-4"] || {};
  const s5 = item["step-5"] || {};
  const allStepsCompleted =
    s1.status === "completed" &&
    s2.status === "completed" &&
    s3.status === "completed" &&
    s4.status === "completed" &&
    s5.status === "completed";

  let stepStatus = "step-1";
  if (allStepsCompleted) {
    stepStatus = "Final Submitted";
  } else if (s1.status === "completed" && s2.status === "completed" && s3.status === "completed" && s4.status === "completed") {
    stepStatus = "step-5";
  } else if (s1.status === "completed" && s2.status === "completed" && s3.status === "completed") {
    stepStatus = "step-4";
  } else if (s1.status === "completed" && s2.status === "completed") {
    stepStatus = "step-3";
  } else if (s1.status === "completed") {
    stepStatus = "step-2";
  }

  return {
    applicant_id: item.applicant_id || nomination.applicant_id || "",
    full_name: s1.child_full_name || nomination.full_name || "",
    age: age || "-",
    class_name: s1.current_class || "",
    photo: null,
    district: nomination.district || s1.permanent_district || "",
    incident_title: "",
    step_status: stepStatus,
    dpo_status: dpoStatus,
    dpo_comment: dpoComment,
    nominator_category: nomination.nominator_category || "",
    relat_with_child: nomination.relat_with_child || "",
    id_proof_type: nomination.id_proof_type || "",
    id_proof_type_other: nomination.id_proof_type_other || "",
    id_proof_no: nomination.id_proof_no || "",
    village: nomination.village || "",
    post_office: nomination.post_office || "",
    project: nomination.project || "",
    pincode: nomination.pincode || "",
    status: nomination.status || "",
    created_at: nomination.created_at || nomination.updated_at || "",
    email: nomination.email || "",
    phone: nomination.phone || "",
  };
};

const MEDIA_BASE_URL =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend";

const SITE_ORIGIN = "https://wecdukaward.in";

// Directory the backend stores recommendation uploads in.
const RECOMMENDATION_MEDIA_DIR = "media/bravery/recommended_application";

const joinMediaPath = (path) => {
  const withoutLeadingSlash = path.replace(/^\/+/, "");

  // Already points at the backend, e.g. "balvirtaawardproject/.../media/..."
  if (withoutLeadingSlash.startsWith("balvirtaawardproject/")) {
    return `${SITE_ORIGIN}/${withoutLeadingSlash}`;
  }

  // Already carries the media path, e.g. "media/bravery/.../file.pdf"
  if (withoutLeadingSlash.startsWith("media/")) {
    return `${MEDIA_BASE_URL}/${withoutLeadingSlash}`;
  }

  // App-relative path without the media prefix, e.g. "bravery/.../file.pdf"
  if (withoutLeadingSlash.startsWith("bravery/")) {
    return `${MEDIA_BASE_URL}/media/${withoutLeadingSlash}`;
  }

  // Bare file name, e.g. "applicant_file_abc.pdf"
  if (!withoutLeadingSlash.includes("/")) {
    return `${MEDIA_BASE_URL}/${RECOMMENDATION_MEDIA_DIR}/${withoutLeadingSlash}`;
  }

  return `${MEDIA_BASE_URL}/${withoutLeadingSlash}`;
};

const getFileSrc = (file) => {
  if (!file) return null;
  if (file instanceof File) return URL.createObjectURL(file);

  const trimmed = String(file).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const isOurSite = url.hostname.toLowerCase() === "wecdukaward.in";
      // The API returns site-root absolute URLs that serve the SPA instead of
      // the file, so re-point our own links that lack the backend prefix.
      if (
        isOurSite &&
        !url.pathname.replace(/^\/+/, "").startsWith("balvirtaawardproject/")
      ) {
        return joinMediaPath(url.pathname);
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  return joinMediaPath(trimmed);
};

const DPODashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [applications, setApplications] = useState([]);
  const [formStatusList, setFormStatusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formStatusListLoading, setFormStatusListLoading] = useState(false);
  const [formStatusListError, setFormStatusListError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [stepStatusFilter, setStepStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showFormPreviewModal, setShowFormPreviewModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [recommendationApp, setRecommendationApp] = useState(null);
  const [selectedFormPreviewData, setSelectedFormPreviewData] = useState(null);
  const [noFormDataAlert, setNoFormDataAlert] = useState(false);
  const [exporting, setExporting] = useState("");
  const [exportError, setExportError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentApp, setCommentApp] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentStatus, setCommentStatus] = useState("rejected");
  const [savingComment, setSavingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);

  const [recommendedApplications, setRecommendedApplications] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [recommendedError, setRecommendedError] = useState(null);
  const [recommendationFile, setRecommendationFile] = useState(null);
  const [recommendationRemark, setRecommendationRemark] = useState("");
  const [savingRecommendation, setSavingRecommendation] = useState(false);
  const [uploadRecommendationError, setUploadRecommendationError] = useState(null);
  const [deletingRecommendation, setDeletingRecommendation] = useState(false);

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

  const fetchApplicationsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/dpo/application/status/",
        {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const mapped = result.data.map(mapApiToApp);
        setApplications(mapped);
        setFormStatusList(result.data);
        return result.data;
      } else {
        setApplications([]);
        setFormStatusList([]);
        return [];
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError(err.message || "Failed to fetch applications");
      setApplications([]);
      setFormStatusList([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchFormStatusData = async () => {
    setFormStatusListLoading(true);
    setFormStatusListError(null);
    try {
      const data = await fetchApplicationsData();
      return data;
    } catch (err) {
      setFormStatusListError(err.message || "Failed to fetch form status details");
      return [];
    } finally {
      setFormStatusListLoading(false);
    }
  };

  const fetchRecommendedApplications = async () => {
    try {
      setRecommendedLoading(true);
      setRecommendedError(null);
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/recommended-application/",
        {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setRecommendedApplications(result.data);
        return result.data;
      } else {
        setRecommendedApplications([]);
        return [];
      }
    } catch (err) {
      console.error("Failed to fetch recommended applications:", err);
      setRecommendedError(err.message || "Failed to fetch recommended applications");
      return [];
    } finally {
      setRecommendedLoading(false);
    }
  };

  const DPO_STATUS_URL =
    "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/dpo/application/status/";

  const setDpoStatus = async (applicantId, statusDpo, comment) => {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(DPO_STATUS_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        applicant_id: applicantId,
        status_dpo: statusDpo,
        comment_dpo: comment || "",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(
        `HTTP error! status: ${response.status}${errorBody ? ` - ${errorBody}` : ""}`
      );
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Failed to update DPO status");
    }
    return result;
  };

  const RECOMMENDATION_URL =
    "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/recommended-application/";

  const readErrorBody = async (response) => {
    const text = await response.text().catch(() => "");
    if (!text) return "";
    try {
      const parsed = JSON.parse(text);
      const details = parsed.errors
        ? Object.entries(parsed.errors)
            .map(([field, messages]) => `${field}: ${[].concat(messages).join(", ")}`)
            .join(" | ")
        : parsed.message || "";
      return details ? ` - ${details}` : ` - ${text}`;
    } catch {
      return ` - ${text}`;
    }
  };

  const requestRecommendation = async ({ method, payload, file }) => {
    const accessToken = localStorage.getItem("accessToken");
    const authHeaders = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

    // The endpoint expects a file upload, so send multipart first to avoid a
    // rejected JSON request. applicant_file is appended separately because a
    // File cannot go through the string form of FormData.
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === "applicant_file") return;
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    // Only send the file part when there is a real file. A remark-only update
    // omits it so the stored file is left untouched.
    if (file) {
      formData.append("applicant_file", file, file.name);
    }

    let response = await fetch(RECOMMENDATION_URL, {
      method,
      headers: { ...authHeaders },
      body: formData,
    });

    // Fall back to a JSON body if multipart is not accepted. A file cannot be
    // carried in JSON, so applicant_file is sent as null on that path.
    if (!response.ok && [400, 415, 422].includes(response.status)) {
      const jsonPayload = { ...payload, applicant_file: null };
      response = await fetch(RECOMMENDATION_URL, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(jsonPayload),
      });
    }

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}${await readErrorBody(response)}`
      );
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Failed to save recommendation");
    }
    return result;
  };

  const handleSaveRecommendation = async () => {
    const applicantId = recommendationApp?.applicant_id;
    if (!applicantId || savingRecommendation) return;

    const existing = getRecommendation(applicantId);
    if (!existing && hasAnyRecommendation) {
      setUploadRecommendationError(
        "An applicant has already been recommended for the award. No other applicant can be forwarded."
      );
      return;
    }

    setSavingRecommendation(true);
    setUploadRecommendationError(null);
    try {
      // A remark-only update sends no file, so the stored file is kept.
      const payload = {
        applicant_id: applicantId,
        remark: recommendationRemark,
        applicant_file: recommendationFile ? recommendationFile.name : null,
      };
      if (existing?.id) {
        payload.id = existing.id;
      }

      await requestRecommendation({
        method: existing ? "PUT" : "POST",
        payload,
        file: recommendationFile,
      });

      setActionMessage({
        type: "success",
        text: existing
          ? "Recommendation updated successfully."
          : "Recommendation saved and application forwarded successfully.",
      });

      await fetchRecommendedApplications();
      await fetchApplicationsData();
      setRecommendationFile(null);
      setRecommendationRemark("");
    } catch (err) {
      setUploadRecommendationError(err.message || "Failed to save recommendation");
    } finally {
      setSavingRecommendation(false);
    }
  };

  const handleDeleteRecommendation = async () => {
    const existing = getRecommendation(recommendationApp?.applicant_id);
    if (!existing?.id || deletingRecommendation) return;

    const isConfirmed = window.confirm(
      "Are you sure you want to remove this recommendation?\n\nThe application will no longer be forwarded."
    );
    if (!isConfirmed) return;

    setDeletingRecommendation(true);
    setUploadRecommendationError(null);
    try {
      await requestRecommendation({
        method: "DELETE",
        payload: { id: existing.id, applicant_id: existing.applicant_id },
      });

      setActionMessage({ type: "success", text: "Recommendation removed successfully." });
      await fetchRecommendedApplications();
      await fetchApplicationsData();
      setRecommendationFile(null);
      setRecommendationRemark("");
    } catch (err) {
      setUploadRecommendationError(err.message || "Failed to delete recommendation");
    } finally {
      setDeletingRecommendation(false);
    }
  };

  useEffect(() => {
    fetchApplicationsData();
    fetchRecommendedApplications();
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
      case "accepted":
        return <Badge bg="success" className="badge-soft"><FaCheck className="me-1" /> Approved</Badge>;
      case "rejected":
        return <Badge bg="danger" className="badge-soft"><FaTimes className="me-1" /> Rejected</Badge>;
      case "pending":
        return <Badge bg="warning" text="dark" className="badge-soft"><FaHourglassHalf className="me-1" /> Pending</Badge>;
      default:
        return <Badge bg="secondary" className="badge-soft">Not Reviewed</Badge>;
    }
  };

  const recommendedById = new Map(
    recommendedApplications.map((item) => [String(item.applicant_id || "").trim(), item])
  );

  const getRecommendation = (applicantId) =>
    recommendedById.get(String(applicantId || "").trim()) || null;

  const getRecommendationFileSrc = (applicantId) =>
    getFileSrc(getRecommendation(applicantId)?.applicant_file);

  const isRecommended = (applicantId) => Boolean(getRecommendation(applicantId));

  const hasAnyRecommendation = recommendedApplications.length > 0;

  const getRecommendationBadge = (applicantId) => {
    if (!isRecommended(applicantId)) {
      return <Badge bg="secondary" className="badge-soft">Not Recommended</Badge>;
    }
    return (
      <Badge bg="success" className="badge-soft">
        <FaCheck className="me-1" /> Recommended
      </Badge>
    );
  };

  const filteredApplications = applications.filter((app) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (app.applicant_id || "").toLowerCase().includes(term) ||
      (app.full_name || "").toLowerCase().includes(term) ||
      (app.phone || "").toLowerCase().includes(term) ||
      (app.email || "").toLowerCase().includes(term) ||
      (app.village || "").toLowerCase().includes(term);

    const matchesProject = !projectFilter || app.project === projectFilter;
    const matchesStepStatus = !stepStatusFilter || app.step_status === stepStatusFilter;

    let matchesTab = true;
    if (activeTab === "completed") {
      matchesTab = app.step_status === "Final Submitted";
    } else if (activeTab === "verified") {
      matchesTab = isRecommended(app.applicant_id);
    }

    return matchesSearch && matchesProject && matchesStepStatus && matchesTab;
  });

  const uniqueProjects = Array.from(
    new Set(filteredApplications.map((app) => app.project).filter(Boolean))
  ).sort();

  const uniqueStepStatuses = Array.from(
    new Set(filteredApplications.map((app) => app.step_status).filter(Boolean))
  ).sort();

  const reportFilters = {
    Search: searchTerm.trim() || "All",
    Project: projectFilter || "All",
    "Step Status": stepStatusFilter || "All",
    "Tab": activeTab === "all" ? "All Forms" : activeTab === "completed" ? "Completed" : "Recommended/Verified",
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
    setShowRecommendationModal(false);
    setShowModal(true);
  };

  const handleCloseRegistrationModal = () => setShowModal(false);

  const handleOpenFormDetails = async (app = selectedApplication) => {
    if (!app) return;
    setSelectedApplication(app);
    setNoFormDataAlert(false);

    let currentList = formStatusList;
    if (!currentList || currentList.length === 0) {
      currentList = await fetchFormStatusData();
    }

    const foundRecord = currentList.find(
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

  const handleOpenRecommendationDetails = (app = selectedApplication) => {
    if (!app) return;
    setSelectedApplication(app);
    setShowChoiceModal(false);
    setShowModal(false);
    setShowRecommendationModal(true);
  };

  const handleOpenRecommendationForm = (app) => {
    if (!app) return;
    const existing = getRecommendation(app.applicant_id);
    setRecommendationApp(app);
    setSelectedApplication(app);
    setRecommendationFile(null);
    setRecommendationRemark(existing?.remark || "");
    setUploadRecommendationError(null);
    setShowRecommendationModal(true);
  };

  const handleSaveComment = async () => {
    const applicantId = commentApp?.applicant_id;
    if (!applicantId || savingComment) return;
    if (!commentText.trim()) return;

    setSavingComment(true);
    setCommentError(null);
    try {
      await setDpoStatus(applicantId, commentStatus, commentText.trim());

      setActionMessage({
        type: "success",
        text: `Comment saved for ${commentApp?.full_name}.`,
      });
      handleCloseCommentModal();
      await fetchApplicationsData();
    } catch (err) {
      setCommentError(
        `Comment could not be saved. ${err.message} Please check the applicant ID and try again.`
      );
    } finally {
      setSavingComment(false);
    }
  };

  const handleOpenCommentModal = (app) => {
    setCommentApp(app);
    setCommentText(app?.dpo_comment || "");
    // Preselect the status the save would apply, but let the DPO override it,
    // including sending an already accepted or rejected record back to pending.
    const current = app?.dpo_status === "approved" ? "accepted" : app?.dpo_status;
    setCommentStatus(
      isRecommended(app?.applicant_id) ? "accepted" : current || "rejected"
    );
    setCommentError(null);
    setShowCommentModal(true);
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setCommentApp(null);
    setCommentText("");
    setCommentError(null);
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

           {loading && (
             <div className="text-center mt-4">
               <Spinner animation="border" variant="primary" />
               <p className="mt-2">Loading applications...</p>
             </div>
           )}
           {error && (
             <Alert variant="danger" className="rounded-3 border-0 shadow-sm">
               {error}
             </Alert>
           )}
            {!loading && !error && (
              <>
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
              <div className="mb-4">
                <div className="d-flex flex-wrap gap-2 mb-3" style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <button
                    type="button"
                    className={`px-4 py-2 border-0 rounded-top ${activeTab === "all" ? "active-tab" : "inactive-tab"}`}
                    style={{
                      background: activeTab === "all" ? "#2563eb" : "#f1f5f9",
                      color: activeTab === "all" ? "#fff" : "#64748b",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      borderBottom: activeTab === "all" ? "3px solid #2563eb" : "3px solid transparent",
                      borderRadius: "8px 8px 0 0",
                    }}
                    onClick={() => { setActiveTab("all"); setStepStatusFilter(""); }}
                  >
                    All Forms
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 border-0 rounded-top ${activeTab === "completed" ? "active-tab" : "inactive-tab"}`}
                    style={{
                      background: activeTab === "completed" ? "#16a34a" : "#f1f5f9",
                      color: activeTab === "completed" ? "#fff" : "#64748b",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      borderBottom: activeTab === "completed" ? "3px solid #16a34a" : "3px solid transparent",
                      borderRadius: "8px 8px 0 0",
                    }}
                    onClick={() => { setActiveTab("completed"); setStepStatusFilter(""); }}
                  >
                    Completed Forms
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 border-0 rounded-top ${activeTab === "verified" ? "active-tab" : "inactive-tab"}`}
                    style={{
                      background: activeTab === "verified" ? "#7c3aed" : "#f1f5f9",
                      color: activeTab === "verified" ? "#fff" : "#64748b",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      borderBottom: activeTab === "verified" ? "3px solid #7c3aed" : "3px solid transparent",
                      borderRadius: "8px 8px 0 0",
                    }}
                    onClick={() => { setActiveTab("verified"); setStepStatusFilter(""); }}
                  >
                    Verified / Recommended
                  </button>
                </div>
                <Row className="g-3 align-items-center">
                  <Col xs={12} md={activeTab === "completed" ? 6 : 4} lg={activeTab === "completed" ? 4 : 4}>
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
                  {activeTab !== "completed" && activeTab !== "verified" && (
                  <Col xs={6} md={2} lg={2}>
                    <Form.Select value={stepStatusFilter} onChange={(e) => setStepStatusFilter(e.target.value)} className="filter-select">
                      <option value="">All Steps</option>
                      {uniqueStepStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </Form.Select>
                  </Col>
                  )}
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
                      <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Recommendation</th>
                      <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>DPO Comment</th>
                      <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.length === 0 ? (
                      <tr>
                            <td colSpan="10" className="text-center py-5 text-muted" style={{ fontSize: "0.9rem" }}>
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
                          <td style={{ padding: "12px 16px" }}>{getRecommendationBadge(app.applicant_id)}</td>
                          <td style={{ padding: "12px 16px" }}>
                            {app.dpo_comment ? (
                              <div
                                style={{ fontSize: "0.8rem", color: "#475569", maxWidth: "180px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
                                title={app.dpo_comment}
                              >
                                {app.dpo_comment}
                              </div>
                            ) : (
                              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>
                            <div className="d-flex gap-2 justify-content-end">
                              <Button
                                variant="light"
                                size="sm"
                                onClick={() => handleOpenCommentModal(app)}
                                className="d-flex align-items-center justify-content-center border"
                                style={{ width: "32px", height: "32px", padding: 0, borderRadius: "8px", borderColor: "#e2e8f0", color: "#64748b" }}
                                title="Add / Edit Comment"
                              >
                                <FaCommentDots size={14} />
                              </Button>
                              <Button
                                variant={isRecommended(app.applicant_id) ? "success" : "warning"}
                                size="sm"
                                onClick={() => handleOpenRecommendationForm(app)}
                                disabled={!isRecommended(app.applicant_id) && hasAnyRecommendation}
                                className="d-flex align-items-center"
                                style={{ borderRadius: "8px", padding: "0px 10px", height: "32px", fontSize: "0.78rem", fontWeight: 500 }}
                                title={
                                  isRecommended(app.applicant_id)
                                    ? "Edit Recommendation"
                                    : hasAnyRecommendation
                                      ? "Only one application can be forwarded"
                                      : "Add Recommendation & Forward"
                                }
                              >
                                <FaPaperclip size={13} className="me-1" />
                                {isRecommended(app.applicant_id) ? "Edit Reco" : "Recommend"}
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
            </>
          )}
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
                        <small className="detail-label">Nominator Category</small>
                        <p className="detail-value text-dark">{selectedApplication.nominator_category || "-"}</p>
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">Relation With Child</small>
                        <p className="detail-value text-dark">{selectedApplication.relat_with_child || "-"}</p>
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">Phone</small>
                        <p className="detail-value text-dark">{selectedApplication.phone || "-"}</p>
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
                    ID Proof Details
                  </h6>
                  <Row className="g-3 mb-4">
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">ID Proof Type</small>
                        <p className="detail-value text-dark">
                          {selectedApplication.id_proof_type || "-"}
                          {selectedApplication.id_proof_type_other ? ` (${selectedApplication.id_proof_type_other})` : ""}
                        </p>
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">ID Proof Number</small>
                        <p className="detail-value text-dark">{selectedApplication.id_proof_no || "-"}</p>
                      </div>
                    </Col>
                  </Row>

                  <h6 className="text-uppercase text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.5px", fontWeight: 700 }}>
                    Address Details
                  </h6>
                  <Row className="g-3 mb-4">
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">Village</small>
                        <p className="detail-value text-dark">{selectedApplication.village || "-"}</p>
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">Post Office</small>
                        <p className="detail-value text-dark">{selectedApplication.post_office || "-"}</p>
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">Project</small>
                        <p className="detail-value text-dark">{selectedApplication.project || "-"}</p>
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">District</small>
                        <p className="detail-value text-dark">{selectedApplication.district || "-"}</p>
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">Pincode</small>
                        <p className="detail-value text-dark">{selectedApplication.pincode || "-"}</p>
                      </div>
                    </Col>
                  </Row>

                  <h6 className="text-uppercase text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.5px", fontWeight: 700 }}>
                    Application Status
                  </h6>
                  <Row className="g-3 mb-4">
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">Status</small>
                        <p className="detail-value text-dark">{selectedApplication.status || "-"}</p>
                      </div>
                    </Col>
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
                    <Col xs={12} md={6}>
                      <div className="detail-block">
                        <small className="detail-label">Created At</small>
                        <p className="detail-value text-dark">
                          {selectedApplication.created_at
                            ? new Date(selectedApplication.created_at).toLocaleString("en-IN")
                            : "-"}
                        </p>
                      </div>
                    </Col>
                    <Col xs={12}>
                      <div className="detail-block">
                        <small className="detail-label">DPO Comment</small>
                        <p className="detail-value text-dark" style={{ whiteSpace: "pre-wrap" }}>
                          {selectedApplication.dpo_comment || "No comment added yet."}
                        </p>
                      </div>
                    </Col>
                  </Row>

                   {(selectedApplication.dpo_status === "approved" || isRecommended(selectedApplication.applicant_id)) && (
                     <div className="p-4 rounded-3 mt-3" style={{ background: "#f0fdf4", border: "1px solid #86efac" }}>
                       <div className="d-flex justify-content-between align-items-center mb-3">
                         <h6 className="text-uppercase text-muted mb-0" style={{ fontSize: "0.75rem", letterSpacing: "0.5px", fontWeight: 700 }}>
                           Recommendation
                         </h6>
                         <Button
                           variant="link"
                           onClick={() => handleOpenRecommendationForm(selectedApplication)}
                           className="p-0 text-decoration-none fw-bold"
                           style={{ fontSize: "0.8rem" }}
                         >
                           {isRecommended(selectedApplication.applicant_id) ? "Edit" : "Add Recommendation"}
                         </Button>
                       </div>
                       {(() => {
                         const recommendation = getRecommendation(selectedApplication.applicant_id);
                         if (!recommendation) {
                           return (
                             <Alert variant="info" className="rounded-3 border-0 mb-0" style={{ fontSize: "0.85rem" }}>
                               <FaHourglassHalf className="me-1" /> This application is approved but not recommended yet.
                             </Alert>
                           );
                         }
                         return (
                           <Row className="g-3">
                             <Col xs={12} md={6}>
                               <div className="detail-block">
                                 <small className="detail-label">Recommended On</small>
                                 <p className="detail-value text-dark">
                                   {recommendation.created_at
                                     ? new Date(recommendation.created_at).toLocaleString("en-IN")
                                     : "-"}
                                 </p>
                               </div>
                             </Col>
                             <Col xs={12} md={6}>
                               <div className="detail-block">
                                <small className="detail-label">Recommendation File</small>
                                {getRecommendationFileSrc(selectedApplication.applicant_id) ? (
                                  <a
                                    href={getRecommendationFileSrc(selectedApplication.applicant_id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="d-inline-flex align-items-center text-decoration-none fw-bold"
                                    style={{ fontSize: "0.85rem", color: "#2563eb" }}
                                  >
                                    <FaPaperclip className="me-1" /> View / Download File
                                  </a>
                                ) : (
                                  <p className="detail-value text-dark">-</p>
                                )}
                               </div>
                             </Col>
                             <Col xs={12}>
                               <div className="detail-block">
                                 <small className="detail-label">Remark</small>
                                 <p className="detail-value text-dark" style={{ whiteSpace: "pre-wrap" }}>
                                   {recommendation.remark || "-"}
                                 </p>
                               </div>
                             </Col>
                           </Row>
                         );
                       })()}
                     </div>
                   )}
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

               {formStatusListLoading && (
                 <div className="text-center py-2 mb-3">
                   <Spinner animation="border" size="sm" variant="primary" />
                   <span className="ms-2" style={{ fontSize: "0.85rem", color: "#64748b" }}>फॉर्म डेटा लोड हो रहा है...</span>
                 </div>
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

                <div
                  onClick={() => handleOpenRecommendationDetails(selectedApplication)}
                  className="d-flex align-items-center p-3 rounded-3 cursor-pointer choice-card-ui"
                >
                  <div className="d-flex align-items-center justify-content-center me-3" style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#f5f3ff", color: "#7c3aed" }}>
                    <FaPaperclip />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-0 text-dark" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Recommendation Details</h6>
                    <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>
                      {isRecommended(selectedApplication?.applicant_id)
                        ? "Selected for the award: file, remark and date"
                        : "Not recommended yet"}
                    </p>
                  </div>
                  {isRecommended(selectedApplication?.applicant_id) ? (
                    <Badge bg="success" className="badge-soft">Recommended</Badge>
                  ) : (
                    <FaEye className="text-muted" size={16} />
                  )}
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="p-4 border-top" style={{ background: "#f8fafc", borderRadius: "0 0 12px 12px" }}>
              <Button variant="secondary" onClick={() => setShowChoiceModal(false)} className="px-4" style={{ borderRadius: "8px", fontSize: "0.85rem" }}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Recommendation Modal: add / edit / delete */}
          <Modal show={showRecommendationModal} onHide={() => setShowRecommendationModal(false)} size="lg" centered contentClassName="border-0 shadow-lg">
            <Modal.Header closeButton className="bg-white border-bottom p-4" style={{ borderRadius: "12px 12px 0 0" }}>
              <Modal.Title className="fw-bold text-dark" style={{ fontSize: "1.1rem" }}>
                {getRecommendation((recommendationApp || selectedApplication)?.applicant_id)
                  ? "Edit Recommendation"
                  : "Add Recommendation"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4" style={{ background: "#fff" }}>
              {(() => {
                const target = recommendationApp || selectedApplication;
                const recommendation = getRecommendation(target?.applicant_id);
                const locked = !recommendation && hasAnyRecommendation;

                if (!target) return null;

                return (
                  <div>
                    <div className="p-3 mb-4 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <p className="mb-1 text-muted" style={{ fontSize: "0.8rem" }}>
                        Applicant ID: <span className="fw-bold text-dark">{target.applicant_id}</span>
                      </p>
                      <h5 className="mb-0 text-dark" style={{ fontSize: "1rem" }}>{target.full_name}</h5>
                      <p className="mb-0 mt-1 text-muted" style={{ fontSize: "0.8rem" }}>
                        District: <span className="fw-bold text-dark">{target.district || "-"}</span>
                      </p>
                    </div>

                    {recommendation && (
                      <Row className="g-3 mb-3">
                        <Col xs={12} md={6}>
                          <div className="detail-block">
                            <small className="detail-label">Recommended On</small>
                            <p className="detail-value text-dark">
                              {recommendation.created_at
                                ? new Date(recommendation.created_at).toLocaleString("en-IN")
                                : "-"}
                            </p>
                          </div>
                        </Col>
                        <Col xs={12} md={6}>
                          <div className="detail-block">
                            <small className="detail-label">Current File</small>
                            {getRecommendationFileSrc(target.applicant_id) ? (
                              <a
                                href={getRecommendationFileSrc(target.applicant_id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="d-inline-flex align-items-center text-decoration-none fw-bold"
                                style={{ fontSize: "0.85rem", color: "#2563eb" }}
                              >
                                <FaPaperclip className="me-1" /> View / Download File
                              </a>
                            ) : (
                              <p className="detail-value text-dark">No file uploaded</p>
                            )}
                          </div>
                        </Col>
                      </Row>
                    )}

                    {locked ? (
                      <Alert variant="warning" className="rounded-3 border-0 mb-0" style={{ fontSize: "0.85rem" }}>
                        An applicant has already been forwarded for the award. Only one application can be
                        recommended, so this applicant can only be commented on.
                      </Alert>
                    ) : (
                      <>
                        <div className="mb-3">
                          <Form.Label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                            Recommendation File (optional - leave empty to keep the current file)
                          </Form.Label>
                          <Form.Control
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => setRecommendationFile(e.target.files[0])}
                            className="border"
                            style={{ borderRadius: "8px", borderColor: "#cbd5e1", fontSize: "0.85rem" }}
                          />
                        </div>
                        <div className="mb-3">
                          <Form.Label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                            Remark
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={recommendationRemark}
                            onChange={(e) => setRecommendationRemark(e.target.value)}
                            placeholder="Enter remarks for recommendation..."
                            className="border"
                            style={{ borderRadius: "8px", borderColor: "#cbd5e1", fontSize: "0.85rem" }}
                          />
                        </div>
                        {uploadRecommendationError && (
                          <Alert variant="danger" className="rounded-3 py-2 mb-3" style={{ fontSize: "0.8rem" }}>
                            {uploadRecommendationError}
                          </Alert>
                        )}
                        <div className="d-flex gap-2 flex-wrap">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={handleSaveRecommendation}
                            disabled={savingRecommendation}
                            className="d-flex align-items-center"
                            style={{ borderRadius: "8px", fontWeight: 500 }}
                          >
                            {savingRecommendation ? <Spinner size="sm" /> : <FaCheck className="me-1" />}
                            {savingRecommendation
                              ? "Saving..."
                              : recommendation
                                ? "Update Recommendation"
                                : "Save & Forward"}
                          </Button>
                          {recommendation && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={handleDeleteRecommendation}
                              disabled={deletingRecommendation}
                              className="d-flex align-items-center"
                              style={{ borderRadius: "8px", fontWeight: 500 }}
                            >
                              {deletingRecommendation ? <Spinner size="sm" /> : <FaTimes className="me-1" />}
                              {deletingRecommendation ? "Deleting..." : "Delete"}
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </Modal.Body>
            <Modal.Footer className="p-4 border-top" style={{ background: "#f8fafc", borderRadius: "0 0 12px 12px" }}>
              <Button
                variant="link"
                onClick={() => {
                  setShowRecommendationModal(false);
                  handleOpenRegistrationDetails(recommendationApp || selectedApplication);
                }}
                className="me-auto p-0 text-decoration-none fw-bold"
                style={{ fontSize: "0.85rem" }}
              >
                <FaIdCard className="me-1" /> पंजीकरण विवरण देखें →
              </Button>
              <Button variant="secondary" onClick={() => setShowRecommendationModal(false)} className="px-4" style={{ borderRadius: "8px", fontSize: "0.85rem" }}>
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
                 <div className="mb-3">
                   <p className="mb-1 text-muted" style={{ fontSize: "0.85rem" }}>
                     Applicant: <span className="fw-bold text-dark">{commentApp.full_name}</span> ({commentApp.applicant_id})
                   </p>
                   <div className="mt-2">{getDpoStatusBadge(commentApp.dpo_status)}</div>
                 </div>
               )}

                <div className="p-4 rounded-3 mb-4" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <h6 className="text-uppercase text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.5px", fontWeight: 700 }}>
                    DPO Comment
                  </h6>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                      DPO Status
                    </Form.Label>
                    <Form.Select
                      value={commentStatus}
                      onChange={(e) => setCommentStatus(e.target.value)}
                      className="filter-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Approved / Forwarded</option>
                      <option value="rejected">Rejected</option>
                    </Form.Select>
                  </Form.Group>
                  {isRecommended(commentApp?.applicant_id) ? (
                    <Alert variant="info" className="rounded-3 border-0 mb-0" style={{ fontSize: "0.85rem" }}>
                      <FaCheck className="me-1" /> This applicant is forwarded for the award. The comment is
                      recorded against it and the status can be changed if needed.
                    </Alert>
                  ) : (
                    <Alert variant="warning" className="rounded-3 border-0 mb-0" style={{ fontSize: "0.85rem" }}>
                      Saving this comment updates the DPO status to <strong>{commentStatus}</strong>.
                    </Alert>
                  )}
                </div>

                <Form.Group>
                  <Form.Label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                    Comment / Remark
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Enter your remark/comment here..."
                    style={{ borderRadius: "8px", borderColor: "#cbd5e1", fontSize: "0.875rem" }}
                  />
                  {commentError && (
                    <Alert variant="danger" className="rounded-3 py-2 mt-3 mb-0" style={{ fontSize: "0.8rem" }}>
                      {commentError}
                    </Alert>
                  )}
                </Form.Group>
              </Modal.Body>
             <Modal.Footer className="p-4 border-top" style={{ background: "#f8fafc", borderRadius: "0 0 12px 12px" }}>
               <Button variant="light" onClick={handleCloseCommentModal} className="px-4 border" style={{ borderRadius: "8px", fontSize: "0.85rem" }}>
                 Cancel
               </Button>
               <Button
                 variant="primary"
                 onClick={handleSaveComment}
                 disabled={savingComment || !commentText.trim()}
                 className="px-4 d-flex align-items-center"
                 style={{ borderRadius: "8px", fontSize: "0.85rem", fontWeight: 500 }}
               >
                 {savingComment ? <Spinner size="sm" className="me-1" /> : <FaCheck className="me-1" />}
                 {savingComment ? "Saving..." : "Save Comment"}
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