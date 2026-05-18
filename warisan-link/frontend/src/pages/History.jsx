import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Trash2 } from 'lucide-react';
import { historyApi } from '@/api/compass.api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = localStorage.getItem('warisan-session-id');
    if (!sessionId) {
      setLoading(false);
      return;
    }

    historyApi
      .get(sessionId)
      .then((res) => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('warisan-session-id');
    setHistory([]);
  };

  if (loading) return <LoadingSpinner text="Memuat riwayat..." />;
  if (!history.length) return <EmptyState title="Belum ada riwayat" description="Destinasi yang kamu kunjungi akan muncul di sini" />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-serif">Riwayat Kunjungan</h1>
        <Button variant="destructive" size="sm" onClick={clearHistory} className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" /> Hapus Semua
        </Button>
      </div>
      <div className="space-y-4">
        {history.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <img
                src={item.destination.coverImageUrl || '/placeholder.jpg'}
                alt={item.destination.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <Link to={`/destination/${item.destination.slug}`} className="font-semibold hover:text-warisan-gold">
                  {item.destination.name}
                </Link>
                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                  <MapPin className="h-4 w-4" />
                  {item.destination.city}, {item.destination.province}
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                  <Clock className="h-3 w-3" />
                  {new Date(item.visitedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <Link to={`/destination/${item.destination.slug}`}>
                <Button variant="default" size="sm">Lihat</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default History;
