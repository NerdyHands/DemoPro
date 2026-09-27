import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import Auth from './pages/Auth/Auth.jsx';
import Login from './pages/Login/Login.jsx';
import Signup from './pages/Signup/Signup.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import UploadInspectionReport from './pages/UploadInspectionReport/UploadInspectionReport.jsx';
import ProjectDetails from './pages/ProjectDetails/ProjectDetails.jsx';
import Settings from './pages/Settings/Settings.jsx';
import PipelineDashboard from './pages/AdminDashboard/PipelineDashboard.jsx';
import Customers from './pages/Customers/Customers.jsx';
import CustomerEdit from './pages/Customers/CustomerEdit.jsx';
import Estimates from './pages/Estimates/Estimates.jsx';
import EstimateEdit from './pages/Estimates/EstimateEdit.jsx';
import EstimateView from './pages/Estimates/EstimateView.jsx';
import Contracts from './pages/Contracts/Contracts.jsx';
import ContractEdit from './pages/Contracts/ContractEdit.jsx';
import ContractView from './pages/Contracts/ContractView.jsx';
import AmendmentEdit from './pages/Amendments/AmendmentEdit.jsx';
import AmendmentView from './pages/Amendments/AmendmentView.jsx';
import PICRAUpload from './pages/PICRAUpload/PICRAUpload.jsx';
import RequireAdmin from './components/RouteGuards/RequireAdmin.jsx';
import QuotesList from './pages/Quotes/QuotesList.jsx';
import QuoteView from './pages/Quotes/QuoteView.jsx';
import QuoteEdit from './pages/Quotes/QuoteEdit.jsx';
import MyDocuments from './pages/MyDocuments/MyDocuments.jsx';
import InspectionReportInput from './pages/InspectionReport/InspectionReportInput.jsx';
import PreWorkInspectionInput from './pages/PreWorkInspection/PreWorkInspectionInput.jsx';
import PreWorkInspections from './pages/PreWorkInspection/PreWorkInspections.jsx';
import ClientReportView from './pages/ClientReports/ClientReportView.jsx';
import PropertyListings from './pages/PropertyListings/PropertyListings.jsx';

function App() {
  // Google OAuth Client ID - you'll need to replace this with your actual client ID
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id-here';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <div className="App">
          <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project-dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/project-details/:projectId" element={<ProjectDetails />} />
          <Route path="/project-details" element={<ProjectDetails />} />
          <Route path="/upload" element={<UploadInspectionReport />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin/pipeline" element={<RequireAdmin><PipelineDashboard /></RequireAdmin>} />
          <Route path="/admin/quotes" element={<RequireAdmin><QuotesList /></RequireAdmin>} />
          <Route path="/admin/quotes/new" element={<RequireAdmin><QuoteEdit /></RequireAdmin>} />
          <Route path="/admin/quotes/:id" element={<RequireAdmin><QuoteView /></RequireAdmin>} />
          <Route path="/admin/quotes/edit/:id" element={<RequireAdmin><QuoteEdit /></RequireAdmin>} />
          
          {/* Contract Management Routes */}
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/new" element={<CustomerEdit />} />
          <Route path="/customers/edit/:id" element={<CustomerEdit />} />
          <Route path="/estimates" element={<Estimates />} />
          <Route path="/estimates/new" element={<EstimateEdit />} />
          <Route path="/estimates/:id" element={<EstimateView />} />
          <Route path="/estimates/edit/:id" element={<EstimateEdit />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/contracts/new" element={<ContractEdit />} />
          <Route path="/contracts/:id" element={<ContractView />} />
          <Route path="/contracts/edit/:id" element={<ContractEdit />} />
          
          {/* Amendment Routes */}
          <Route path="/amendments/create" element={<AmendmentEdit />} />
          <Route path="/amendments/:id" element={<AmendmentView />} />
          <Route path="/amendments/edit/:id" element={<AmendmentEdit />} />
          
          {/* Inspection Report Routes */}
          <Route path="/inspection-report/:contractId" element={<InspectionReportInput />} />
          <Route path="/inspection-report/edit" element={<InspectionReportInput />} />
          
          {/* Pre-Work Inspection Routes */}
          <Route path="/prework-inspection/:contractId" element={<PreWorkInspectionInput />} />
          <Route path="/prework-inspection/edit" element={<PreWorkInspectionInput />} />
          <Route path="/prework-inspections" element={<PreWorkInspections />} />
          
          {/* Client Report Routes */}
          <Route path="/client-reports/:reportId" element={<ClientReportView />} />
          
          {/* Property Listings Route */}
          <Route path="/properties" element={<PropertyListings />} />
          
          <Route path="/picra-upload" element={<PICRAUpload />} />
          <Route path="/my-documents" element={<MyDocuments />} />
          
          <Route path="/" element={<Navigate to="/auth" replace />} />
        </Routes>
      </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App; 