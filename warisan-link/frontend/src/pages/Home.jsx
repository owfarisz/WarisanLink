import { Link, useNavigate } from 'react-router-dom';
import { Compass, BookOpen, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDestinations } from '@/hooks/useDestinations';
import { useAuthStore } from '@/store/authStore';
import HeritageGrid from '@/components/heritage/HeritageGrid';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const DASHBOARD_PATH = {
  SUPERADMIN: '/admin',
  KONTRIBUTOR: '/kontributor',
  TURIS: '/dashboard',
};

function Home() {
  const { data, isLoading } = useDestinations({ limit: 6, sort: 'popular' });
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const explorasiPath = DASHBOARD_PATH[user?.role] ?? '/tourism';

  return (
    <div>
      <section className="bg-warisan-dark text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold font-serif mb-4">
            WARISAN <span className="text-warisan-gold">LINK</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Temukan hidden gems warisan budaya Indonesia. Cerita lokal, koneksi historis, dan panduan akses lengkap untuk traveler.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="default" size="lg" className="flex items-center gap-2" onClick={() => navigate(explorasiPath)}>
              Mulai Eksplorasi <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Compass}
            title="Access Compass"
            description="Panduan akses lengkap dari gateway terdekat hingga tips perjalanan dan cuaca real-time"
          />
          <FeatureCard
            icon={BookOpen}
            title="Cerita Lokal"
            description="Koneksi historis Indonesia-Malaysia dan makna budaya setiap destinasi"
          />
          <FeatureCard
            icon={MapPin}
            title="Hidden Gems"
            description="Destinasi budaya tersembunyi yang belum banyak dikenal traveler mainstream"
          />
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold font-serif">Destinasi Populer</h2>
            <Link to="/tourism" className="text-warisan-gold hover:underline flex items-center gap-1">
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {isLoading ? <LoadingSpinner /> : <HeritageGrid destinations={data?.data || []} />}
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="text-center p-6">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-warisan-gold rounded-full mb-4">
        <Icon className="h-8 w-8 text-warisan-dark" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default Home;
