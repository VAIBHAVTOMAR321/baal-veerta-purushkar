import React from "react";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./components/home_layout/Home";
import Login from "./components/login/Login";
import NavBar from "./components/nav_bar/NavBar";

import DisDashBoard from "./components/all_dashbords/dis_admin/DisDashBoard";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Footer from "./components/footer/Footer";

import { LanguageProvider } from "./context/LanguageContext";
import StepF from "./components/child_regis/NominationForm/StepF";
import StepE from "./components/child_regis/NominationForm/StepE";
import StepD from "./components/child_regis/NominationForm/StepD";
import StepC from "./components/child_regis/NominationForm/StepC";
import StepB from "./components/child_regis/NominationForm/StepB";
import NominationForm from "./components/child_regis/NominationForm/NominationForm";
import StudentRegistration from "./components/child_regis/StudentRegistration/StudentRegistration";


// A wrapper component to conditionally render the NavBar
const AppContent = () => {
  const location = useLocation();
  const isDisRoute = ["/DisDashBoard"].some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <>
      {!isDisRoute && <NavBar />}
      <div className={!isDisRoute ? "main-content" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/StepC" element={<StepC />} />
          <Route path="/StudentRegistration" element={<StudentRegistration />} />
          <Route path="/StepB" element={<StepB />} />
          <Route path="/NominationForm" element={<NominationForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/StepD" element={<StepD />} />
          <Route path="/StepE" element={<StepE />} />
          <Route path="/StepF" element={<StepF />} />
   
          

          {/* Dis Routes */}
          <Route path="/DisDashboard" element={<DisDashBoard />} />
          
          
          
          {/* Add other Dis routes from DisLeftNav here as needed */}
        </Routes>
      </div>
      {!isDisRoute && <Footer />}
    </>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;