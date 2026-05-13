// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import CourseCatalogPage from './pages/CourseCatalogPage';
import MySchedulePage from './pages/MySchedulePage';
import LoadingSpinner from './components/LoadingSpinner';
import OnboardingModal from './components/OnboardingModal';

// ── Protected Route ───────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner message="Authenticating…" />;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}

// ── Layout ────────────────────────────────────────────────────────────────────
function AppLayout({ children }) {
  const { student, updateStudent } = useAuth();

  // Show onboarding when logged in but major is empty (new Google/social user)
  const needsOnboarding = student && (student.major === '' || student.major === undefined);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>

      {needsOnboarding && (
        <OnboardingModal
          onComplete={(patch) => updateStudent(patch)}
        />
      )}
    </div>
  );
}

// ── Routes ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Starting EduPortal…" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/catalog" replace /> : <LoginPage />}
      />
      <Route
        path="/catalog"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CourseCatalogPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MySchedulePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={user ? '/catalog' : '/login'} replace />} />
    </Routes>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
