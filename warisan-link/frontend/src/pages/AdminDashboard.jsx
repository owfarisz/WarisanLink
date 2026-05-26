import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api/axios';
import { Users, CheckCircle, MapPin, Globe } from 'lucide-react';

const fetchPendingUsers = () => api.get('/admin/users?status=PENDING').then((r) => r.data.data);
const fetchStats = () => api.get('/admin/stats').then((r) => r.data.data);
const updateStatus = ({ id, status }) =>
  api.put(`/admin/users/${id}/status`, { status }).then((r) => r.data);

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: pending, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-users'],
    queryFn: fetchPendingUsers,
  });
  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: fetchStats });

  const mutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: (_, { status }) => {
      toast.success(status === 'ACTIVE' ? 'Pengguna disetujui ✅' : 'Pengguna ditolak');
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Gagal memperbarui status'),
  });

  const statCards = stats
    ? [
        { label: 'Total Pengguna', value: stats.totalUsers, icon: Users, color: 'blue' },
        { label: 'Menunggu Approval', value: stats.pendingUsers, icon: CheckCircle, color: stats.pendingUsers > 0 ? 'amber' : 'green' },
        { label: 'Total Destinasi', value: stats.totalDestinations, icon: MapPin, color: 'stone' },
        { label: 'Destinasi Aktif', value: stats.publishedDestinations, icon: Globe, color: 'green' },
      ]
    : [];

  const colorMap = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    stone: 'bg-stone-50 border-stone-200 text-stone-700',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-800 mb-2">Admin Dashboard</h1>
      <p className="text-stone-500 mb-8">Kelola pengguna dan konten platform WarisanLink</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`p-4 rounded-xl border ${colorMap[color]}`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-4 w-4" />
              <p className="text-xs font-medium">{label}</p>
            </div>
            <p className="text-3xl font-bold text-stone-800">{value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Pending Users */}
      <h2 className="text-xl font-semibold text-stone-700 mb-4">
        Pendaftaran Menunggu Persetujuan
        {pending?.users?.length > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-sm rounded-full">
            {pending.users.length}
          </span>
        )}
      </h2>

      {pendingLoading ? (
        <p className="text-stone-400">Memuat...</p>
      ) : !pending?.users?.length ? (
        <div className="text-center py-12 bg-stone-50 rounded-xl border border-stone-200">
          <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-2" />
          <p className="text-stone-500">Tidak ada pendaftaran yang menunggu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.users.map((user) => (
            <div key={user.id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-stone-800 truncate">{user.name}</p>
                <p className="text-sm text-stone-500">{user.email} · <span className="text-blue-600">{user.role}</span></p>
                {user.organization && (
                  <p className="text-xs text-stone-400 mt-0.5">{user.organization}</p>
                )}
                <p className="text-xs text-stone-400">
                  Daftar: {new Date(user.createdAt).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => mutation.mutate({ id: user.id, status: 'ACTIVE' })}
                  disabled={mutation.isPending}
                  className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition"
                >
                  Setujui
                </button>
                <button
                  onClick={() => mutation.mutate({ id: user.id, status: 'REJECTED' })}
                  disabled={mutation.isPending}
                  className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 transition"
                >
                  Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
