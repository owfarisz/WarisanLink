import { Badge } from '@/components/ui/badge';

function HeritageBadge({ category }) {
  if (!category) return null;

  return (
    <Badge style={{ backgroundColor: category.colorHex || '#e2b96f', color: '#000' }}>
      {category.name}
    </Badge>
  );
}

export default HeritageBadge;
