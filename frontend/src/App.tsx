import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { PipelinePage } from './pages/PipelinePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { PrivateRoute } from './components/PrivateRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/integritetspolicy" element={<PrivacyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/leads/:id"
          element={
            <PrivateRoute>
              <LeadDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/pipeline"
          element={
            <PrivateRoute>
              <PipelinePage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
