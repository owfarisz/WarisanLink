import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/shared/ProtectedRoute';

import Home from './pages/Home';
import TourismDiscover from './pages/TourismDiscover';
import DestinationDetail from './pages/DestinationDetail';
import History from './pages/History';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TurisDashboard from './pages/TurisDashboard';
import AdminDashboard from './pages/AdminDashboard';
import KontributorDashboard from './pages/KontributorDashboard';
import UploadDestinasi from './pages/UploadDestinasi';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* ── Public ─────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/destination/:slug" element={<DestinationDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Turis dashboard ────────────────────── */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="TURIS">
              <DashboardLayout><TurisDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/wisata" element={
            <ProtectedRoute requiredRole="TURIS">
              <DashboardLayout><TourismDiscover /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/riwayat" element={
            <ProtectedRoute requiredRole="TURIS">
              <DashboardLayout><History /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* ── Kontributor dashboard ──────────────── */}
          <Route path="/kontributor" element={
            <ProtectedRoute requiredRole="KONTRIBUTOR">
              <DashboardLayout><KontributorDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/upload-destinasi" element={
            <ProtectedRoute requiredRole="KONTRIBUTOR">
              <DashboardLayout><UploadDestinasi /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* ── Superadmin dashboard ───────────────── */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <DashboardLayout><AdminDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
