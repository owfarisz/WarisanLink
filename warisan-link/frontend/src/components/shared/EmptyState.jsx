import { FolderOpen } from 'lucide-react';

function EmptyState({ title = 'Tidak ada data', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FolderOpen className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {description && <p className="text-gray-500 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
