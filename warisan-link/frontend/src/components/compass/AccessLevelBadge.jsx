import { Badge } from '@/components/ui/badge';
import { ACCESS_LEVELS } from '@/lib/constants';

function AccessLevelBadge({ level }) {
  const config = ACCESS_LEVELS[level] || ACCESS_LEVELS.MODERATE;

  return (
    <Badge variant={level === 'EASY' ? 'success' : level === 'REMOTE' ? 'danger' : 'warning'}>
      {config.label}
    </Badge>
  );
}

export default AccessLevelBadge;
