import { Link } from 'react-router-dom';
import { MapPin, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HeritageBadge from './HeritageBadge';
import { truncateText } from '@/lib/utils';

function HeritageCard({ destination }) {
  return (
    <Card className="hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="relative">
        <img
          src={destination.coverImageUrl || '/placeholder.jpg'}
          alt={destination.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 left-2">
          <HeritageBadge category={destination.category} />
        </div>
      </div>
      <CardContent className="p-4">
        <div>
          <h3 className="font-semibold text-lg">{destination.name}</h3>
          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
            <MapPin className="h-4 w-4" />
            {destination.city}, {destination.province}
          </div>
        </div>
        <p className="text-gray-600 text-sm mt-2">{truncateText(destination.shortDesc, 100)}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <Eye className="h-4 w-4" />
            {destination.viewCount || 0}
          </div>
          <Link to={`/destination/${destination.slug}`}>
            <Button variant="default" size="sm">Lihat Detail</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default HeritageCard;
