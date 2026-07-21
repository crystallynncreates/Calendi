import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { getSession } from './auth';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';

function RequireAuth({ children }: { children: React.ReactNode }) {
  return getSession() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const hasOnboarded = useStore((s) => s.hasOnboarded);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              {hasOnboarded ? <Dashboard /> : <Navigate to="/onboarding" replace />}
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
