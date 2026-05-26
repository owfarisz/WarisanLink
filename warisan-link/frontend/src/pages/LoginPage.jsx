import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { Compass } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      setAuth(data.user, data.token);
      toast.success(`Selamat datang, ${data.user.name}!`);
      if (data.user.role === 'SUPERADMIN') navigate('/admin');
      else if (data.user.role === 'KONTRIBUTOR') navigate('/kontributor');
      else navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login gagal';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <Compass className="h-7 w-7 text-amber-600" />
          <span className="text-xl font-bold font-serif text-stone-800">WARISAN LINK</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Masuk</h1>
        <p className="text-stone-500 mb-6 text-sm">Temukan warisan budaya Indonesia–Malaysia</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 font-medium transition disabled:opacity-50"
          >
            {loading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Belum punya akun?{' '}
          <Link to="/register" className="text-amber-600 hover:underline font-medium">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
