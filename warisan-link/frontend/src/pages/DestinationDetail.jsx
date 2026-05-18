import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDestination } from '@/hooks/useDestinations';
import CompassCard from '@/components/compass/CompassCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import HeritageBadge from '@/components/heritage/HeritageBadge';
import { historyApi } from '@/api/compass.api';

function DestinationDetail() {
  const { slug } = useParams();
  const { data: destination, isLoading } = useDestination(slug);

  useEffect(() => {
    if (destination) {
      let sessionId = localStorage.getItem('warisan-session-id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('warisan-session-id', sessionId);
      }
      historyApi.track(sessionId, destination.id).catch(() => {});
    }
  }, [destination]);

  if (isLoading) return <LoadingSpinner text="Memuat destinasi..." />;
  if (!destination) return <div className="max-w-4xl mx-auto px-4 py-16 text-center">Destinasi tidak ditemukan</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="relative mb-8">
        <img
          src={destination.coverImageUrl || '/placeholder.jpg'}
          alt={destination.name}
          className="w-full h-96 object-cover rounded-xl"
        />
        <div className="absolute top-4 left-4">
          <HeritageBadge category={destination.category} />
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-4xl font-bold font-serif">{destination.name}</h1>
        <p className="text-gray-600 mt-2">{destination.city}, {destination.province}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Section title="Cerita Singkat">
            <p className="text-gray-700">{destination.shortDesc}</p>
          </Section>

          <Section title="Makna Budaya">
            <p className="text-gray-700 whitespace-pre-line">{destination.culturalMeaning}</p>
          </Section>

          <Section title="Sejarah Lokal">
            <p className="text-gray-700 whitespace-pre-line">{destination.localHistory}</p>
          </Section>

          <div className="bg-warisan-gold/10 p-6 rounded-xl border border-warisan-gold/30">
            <h3 className="text-xl font-bold mb-3">Koneksi Malaysia</h3>
            <p className="text-gray-700 whitespace-pre-line">{destination.malaysiaConnection}</p>
          </div>

          {destination.localEtiquette && (
            <Section title="Etika Lokal">
              <p className="text-gray-700 whitespace-pre-line">{destination.localEtiquette}</p>
            </Section>
          )}

          {destination.galleryUrls?.length > 0 && (
            <Section title="Galeri">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {destination.galleryUrls.map((url, i) => (
                  <img key={i} src={url} alt={`Gallery ${i + 1}`} className="w-full h-40 object-cover rounded-lg" />
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="space-y-6">
          {destination.accessCompass && <CompassCard compass={destination.accessCompass} />}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default DestinationDetail;
