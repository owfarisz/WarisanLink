import { Link } from 'react-router-dom';
import { MapPin, Eye, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HeritageBadge from './HeritageBadge';
import { truncateText } from '@/lib/utils';

function HeritageCard({ destination }) {
  return (
    <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-l-4" style={{ borderLeftColor: destination.category?.colorHex || '#e2b96f' }}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <HeritageBadge category={destination.category} />
            </div>
            <h3 className="font-semibold text-lg truncate">{destination.name}</h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{destination.city}, {destination.province}</span>
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-sm mt-3 line-clamp-2">{truncateText(destination.shortDesc, 120)}</p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <Eye className="h-4 w-4" />
            {destination.viewCount || 0}
          </div>
          <Link to={`/destination/${destination.slug}`}>
            <Button variant="default" size="sm" className="flex items-center gap-1">
              Detail <ArrowUpRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default HeritageCard;
