import { Link } from 'react-router-dom';
import { Globe, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const CARDS = [
  {
    to: '/dashboard/wisata',
    icon: Globe,
    title: 'Jelajah Wisata',
    desc: 'Temukan destinasi wisata heritage Indonesia & Malaysia',
    iconBg: 'bg-amber-50 group-hover:bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    to: '/dashboard/riwayat',
    icon: Clock,
    title: 'Riwayat Kunjungan',
    desc: 'Lihat kembali destinasi yang pernah kamu kunjungi',
    iconBg: 'bg-stone-100 group-hover:bg-stone-200',
    iconColor: 'text-stone-600',
  },
];

export default function TurisDashboard() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] ?? 'Wisatawan';

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">
          Selamat datang, {firstName}!
        </h1>
        <p className="text-stone-500 mt-1">
          Jelajahi warisan budaya Indonesia &amp; Malaysia dari sini.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {CARDS.map(({ to, icon: Icon, title, desc, iconBg, iconColor }) => (
          <Link
            key={to}
            to={to}
            className="group bg-white border border-stone-200 rounded-2xl p-6 hover:border-amber-300 hover:shadow-md transition-all"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${iconBg}`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <h2 className="font-semibold text-stone-800 mb-1">{title}</h2>
            <p className="text-sm text-stone-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
