import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, MapPin } from 'lucide-react';
import api from '../api/axios';

const fetchMyDestinations = () =>
  api.get('/destinations/my/destinations').then((r) => r.data.data);

const STATUS_STYLE = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
};

const STATUS_LABEL = {
  PENDING: 'Menunggu Review',
  PUBLISHED: 'Dipublikasikan',
  REJECTED: 'Ditolak',
};

export default function KontributorDashboard() {
  const { data: destinations, isLoading } = useQuery({
    queryKey: ['my-destinations'],
    queryFn: fetchMyDestinations,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Dashboard Kontributor</h1>
          <p className="text-stone-500 mt-1">Kelola destinasi warisan budaya Anda</p>
        </div>
        <Link
          to="/upload-destinasi"
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-medium transition"
        >
          <Plus className="h-4 w-4" />
          Upload Destinasi
        </Link>
      </div>

      {isLoading ? (
        <p className="text-stone-400">Memuat...</p>
      ) : !destinations?.length ? (
        <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
          <MapPin className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 mb-4">Belum ada destinasi yang diunggah.</p>
          <Link
            to="/upload-destinasi"
            className="text-amber-600 hover:underline font-medium"
          >
            Upload destinasi pertama Anda →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {destinations.map((d) => (
            <div
              key={d.id}
              className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4"
            >
              {d.coverImageUrl ? (
                <img
                  src={d.coverImageUrl}
                  alt={d.name}
                  className="w-16 h-16 object-cover rounded-lg shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-stone-100 rounded-lg shrink-0 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-stone-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-800 truncate">{d.name}</p>
                <p className="text-sm text-stone-500">{d.city}, {d.province}</p>
                <p className="text-xs text-stone-400">{d.category?.name}</p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${STATUS_STYLE[d.destStatus]}`}
              >
                {STATUS_LABEL[d.destStatus]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
