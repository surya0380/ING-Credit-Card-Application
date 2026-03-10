import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Spin } from 'antd';
import { useAppDispatch, useAuth } from './hooks/useRedux';
import { restoreSession } from './slices/authSlice';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ApplicationDashboardPage } from './pages/ApplicationDashboardPage';
import { KYCPage } from './pages/KYCPage';
import { EmploymentDetailsPage } from './pages/EmploymentDetailsPage';
import { IncomeDetailsPage } from './pages/IncomeDetailsPage';
import { ReviewPage } from './pages/ReviewPage';
import { ConfirmationPage } from './pages/ConfirmationPage';

// Protected Route Component
interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const dispatch = useAppDispatch();

  // Restore session on app load
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
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
          path="/application"
          element={
            <PrivateRoute>
              <ApplicationDashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/application/kyc"
          element={
            <PrivateRoute>
              <KYCPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/application/employment"
          element={
            <PrivateRoute>
              <EmploymentDetailsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/application/income"
          element={
            <PrivateRoute>
              <IncomeDetailsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/application/review"
          element={
            <PrivateRoute>
              <ReviewPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/application/confirmation"
          element={
            <PrivateRoute>
              <ConfirmationPage />
            </PrivateRoute>
          }
        />

        {/* Catch-all reroute */}
        <Route path="/" element={<Navigate to="/application" />} />
        <Route path="*" element={<Navigate to="/application" />} />
      </Routes>
    </Router>
  );
}

export default App;
