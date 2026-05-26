import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Compass, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';

const ROLE_BADGE = {
  SUPERADMIN: 'bg-purple-100 text-purple-700',
  KONTRIBUTOR: 'bg-blue-100 text-blue-700',
  TURIS: 'bg-green-100 text-green-700',
};

const DASHBOARD_PATH = {
  SUPERADMIN: '/admin',
  KONTRIBUTOR: '/kontributor',
  TURIS: '/dashboard',
};

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
    navigate('/');
    setIsOpen(false);
  };

  const dashboardPath = DASHBOARD_PATH[user?.role] ?? '/';

  return (
    <nav className="bg-warisan-dark text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Compass className="h-8 w-8 text-warisan-gold" />
            <span className="text-xl font-bold font-serif">WARISAN LINK</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Link to="/login" className="px-3 py-1.5 text-sm text-gray-200 hover:text-warisan-gold transition-colors">
                  Masuk
                </Link>
                <Link to="/register" className="px-3 py-1.5 bg-warisan-gold text-warisan-dark rounded-lg text-sm font-medium hover:opacity-90 transition">
                  Daftar
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[user.role]}`}>
                  {user.role}
                </span>
                <span className="text-sm text-gray-200 max-w-[120px] truncate">{user.name}</span>
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-1 text-sm hover:text-warisan-gold transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-red-300 hover:text-red-200 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Keluar
                </button>
              </div>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-warisan-dark border-t border-gray-700 px-4 py-4 space-y-3">
          {!user ? (
            <>
              <Link to="/login" className="block hover:text-warisan-gold" onClick={() => setIsOpen(false)}>
                Masuk
              </Link>
              <Link to="/register" className="block hover:text-warisan-gold" onClick={() => setIsOpen(false)}>
                Daftar
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-300">
                {user.name} <span className="text-xs text-gray-400">({user.role})</span>
              </p>
              <Link
                to={dashboardPath}
                className="flex items-center gap-1 hover:text-warisan-gold"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1 text-red-300">
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
