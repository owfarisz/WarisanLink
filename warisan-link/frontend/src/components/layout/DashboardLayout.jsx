import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Globe, Clock, Plus, BarChart3,
} from 'lucide-react';

const MENUS = {
  TURIS: [
    { to: '/dashboard', label: 'Beranda', icon: LayoutDashboard, exact: true },
    { to: '/dashboard/wisata', label: 'Jelajah Wisata', icon: Globe, exact: true },
    { to: '/dashboard/riwayat', label: 'Riwayat Kunjungan', icon: Clock, exact: true },
  ],
  KONTRIBUTOR: [
    { to: '/kontributor', label: 'Beranda', icon: LayoutDashboard, exact: true },
    { to: '/upload-destinasi', label: 'Upload Destinasi', icon: Plus, exact: true },
  ],
  SUPERADMIN: [
    { to: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
  ],
};

const ROLE_INFO = {
  TURIS:       { label: 'Wisatawan',   badge: 'bg-green-50 text-green-700' },
  KONTRIBUTOR: { label: 'Kontributor', badge: 'bg-blue-50 text-blue-700' },
  SUPERADMIN:  { label: 'Super Admin', badge: 'bg-purple-50 text-purple-700' },
};

export default function DashboardLayout({ children }) {
  const { user } = useAuthStore();
  const location = useLocation();
  const items = MENUS[user?.role] || [];
  const roleInfo = ROLE_INFO[user?.role] || {};

  const isActive = ({ to, exact }) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="flex">
      {/* ── Desktop sidebar ─────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-stone-200 bg-white sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-4 border-b border-stone-100">
          <p className="text-sm font-semibold text-stone-800 truncate">{user?.name}</p>
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${roleInfo.badge}`}>
            {roleInfo.label}
          </span>
        </div>

        <nav className="p-3 space-y-0.5 flex-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-amber-50 text-amber-700 font-medium'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-amber-600' : 'text-stone-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Mobile: bottom tab bar ───────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 flex shadow-lg">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors ${
                active ? 'text-amber-600' : 'text-stone-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="w-full text-center px-1 truncate">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Main content ────────────────────────────── */}
      <div className="flex-1 min-w-0 pb-16 md:pb-0">
        {children}
      </div>
    </div>
  );
}
