import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { Compass } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'TURIS', organization: '', bio: '',
  });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.organization) delete payload.organization;
      if (!payload.bio) delete payload.bio;

      const { data } = await register(payload);
      if (data.token) {
        setAuth(data.user, data.token);
        toast.success('Registrasi berhasil! Selamat datang.');
        navigate('/');
      } else {
        toast.success(data.message || 'Registrasi berhasil. Menunggu persetujuan admin.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <Compass className="h-7 w-7 text-amber-600" />
          <span className="text-xl font-bold font-serif text-stone-800">WARISAN LINK</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-800 mb-6">Buat Akun</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Jenis Akun</label>
            <select
              className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={form.role}
              onChange={set('role')}
            >
              <option value="TURIS">Turis / Wisatawan</option>
              <option value="KONTRIBUTOR">Kontributor / Penyedia Jasa Travel</option>
            </select>
            {form.role === 'KONTRIBUTOR' && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Akun Kontributor memerlukan persetujuan Superadmin sebelum dapat login.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nama Lengkap</label>
            <input
              className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required minLength={2}
              value={form.name} onChange={set('name')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required value={form.email} onChange={set('email')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password <span className="text-stone-400 font-normal">(min. 8 karakter)</span></label>
            <input
              type="password"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required minLength={8}
              value={form.password} onChange={set('password')}
            />
          </div>

          {form.role === 'KONTRIBUTOR' && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Nama Organisasi / Agen Travel</label>
              <input
                className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={form.organization} onChange={set('organization')}
                placeholder="Opsional"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 font-medium transition disabled:opacity-50"
          >
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-4">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-amber-600 hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
