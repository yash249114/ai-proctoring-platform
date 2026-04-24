import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import LandingPage from "./pages/LandingPage";
import LoginSelector from "./pages/LoginSelector";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ReportPage from "./pages/ReportPage";

// Albus
import AlbusLogin from "./pages/AlbusLogin";
import AlbusDashboard from "./pages/AlbusDashboard";

// Company
import CompanyRegister from "./pages/CompanyRegister";
import CompanyLogin from "./pages/CompanyLogin";
import CompanyDashboard from "./pages/CompanyDashboard";
import CreateAssessment from "./pages/CreateAssessment";
import CreateQuestion from "./pages/CreateQuestion";
import SendAssessment from "./pages/SendAssessment";
import CompanyResults from "./pages/CompanyResults";

// Student
import StudentLogin from "./pages/StudentLogin";
import StudentDashboard from "./pages/StudentDashboard";
import ExamPage from "./pages/ExamPage";
import ResultsPage from "./pages/ResultsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Albus */}
        <Route path="/albus/login" element={<AlbusLogin />} />
        <Route path="/albus/dashboard" element={<AlbusDashboard />} />

        {/* Company */}
        <Route path="/company/register" element={<CompanyRegister />} />
        <Route path="/company/login" element={<CompanyLogin />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/assessments/create" element={<CreateAssessment />} />
        <Route path="/company/questions/create" element={<CreateQuestion />} />
        <Route path="/company/assessments/:id/send" element={<SendAssessment />} />
        <Route path="/company/results/:id" element={<CompanyResults />} />

        {/* Student */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/exam/:sessionId" element={<ExamPage />} />
        <Route path="/results/:sessionId" element={<ResultsPage />} />

        {/* Default */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginSelector />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
