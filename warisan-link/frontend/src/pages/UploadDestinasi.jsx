import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Upload, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const fetchCategories = () => api.get('/categories').then((r) => r.data);

export default function UploadDestinasi() {
  const navigate = useNavigate();
  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const categories = categoriesData?.data || [];

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', city: '', province: '', categoryId: '',
    shortDesc: '', culturalMeaning: '', localHistory: '',
    malaysiaConnection: '', localEtiquette: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB');
      e.target.value = '';
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) { toast.error('Pilih kategori terlebih dahulu'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (imageFile) fd.append('coverImage', imageFile);

      await api.post('/destinations', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Destinasi berhasil diunggah! Menunggu persetujuan admin.');
      navigate('/kontributor');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const inputCls = 'w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm';
  const labelCls = 'block text-sm font-medium text-stone-700 mb-1';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/kontributor" className="flex items-center gap-1 text-stone-500 hover:text-stone-700 text-sm mb-6">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Upload Destinasi Baru</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Nama Destinasi *</label>
            <input className={inputCls} required value={form.name} onChange={set('name')} placeholder="Candi Borobudur" />
          </div>
          <div>
            <label className={labelCls}>Kota *</label>
            <input className={inputCls} required value={form.city} onChange={set('city')} placeholder="Magelang" />
          </div>
          <div>
            <label className={labelCls}>Provinsi *</label>
            <input className={inputCls} required value={form.province} onChange={set('province')} placeholder="Jawa Tengah" />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Kategori *</label>
            <select className={inputCls} required value={form.categoryId} onChange={set('categoryId')}>
              <option value="">Pilih kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Deskripsi Singkat * <span className="text-stone-400 font-normal">(maks. 500 karakter)</span></label>
          <textarea className={inputCls} rows={2} required maxLength={500} value={form.shortDesc} onChange={set('shortDesc')} />
        </div>

        <div>
          <label className={labelCls}>Makna Budaya *</label>
          <textarea className={inputCls} rows={3} required value={form.culturalMeaning} onChange={set('culturalMeaning')} placeholder="Jelaskan makna dan nilai budaya dari destinasi ini..." />
        </div>

        <div>
          <label className={labelCls}>Sejarah Lokal *</label>
          <textarea className={inputCls} rows={3} required value={form.localHistory} onChange={set('localHistory')} placeholder="Ceritakan sejarah singkat destinasi ini..." />
        </div>

        <div>
          <label className={labelCls}>Koneksi dengan Malaysia <span className="text-stone-400 font-normal">(opsional)</span></label>
          <textarea className={inputCls} rows={2} value={form.malaysiaConnection} onChange={set('malaysiaConnection')} placeholder="Adakah kaitan budaya dengan Malaysia?" />
        </div>

        <div>
          <label className={labelCls}>Etiket Lokal <span className="text-stone-400 font-normal">(opsional)</span></label>
          <textarea className={inputCls} rows={2} value={form.localEtiquette} onChange={set('localEtiquette')} placeholder="Hal-hal yang perlu diperhatikan pengunjung..." />
        </div>

        <div>
          <label className={labelCls}>Foto Cover <span className="text-stone-400 font-normal">(JPG/PNG/WebP, maks 5MB)</span></label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImage}
            className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
          />
          {preview && (
            <img src={preview} alt="preview" className="mt-3 h-40 w-full object-cover rounded-lg" />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white py-3 rounded-xl hover:bg-amber-700 font-medium transition disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {loading ? 'Mengunggah...' : 'Upload Destinasi'}
        </button>
      </form>
    </div>
  );
}
