import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';

export default function App() {
  const hasOnboarded = useStore((s) => s.hasOnboarded);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/*"
          element={hasOnboarded ? <Dashboard /> : <Navigate to="/onboarding" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
