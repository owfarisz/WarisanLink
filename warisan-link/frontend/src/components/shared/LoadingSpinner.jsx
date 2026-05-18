import { Loader2 } from 'lucide-react';

function LoadingSpinner({ size = 'md', text }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className={`${sizes[size]} animate-spin text-warisan-gold`} />
      {text && <p className="mt-2 text-gray-500">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;
