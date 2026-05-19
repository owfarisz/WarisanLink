import { cn } from '@/lib/utils';

const Input = ({ className, type = 'text', ...props }) => (
  <input
    type={type}
    className={cn('w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warisan-gold focus:border-transparent outline-none', className)}
    {...props}
  />
);

export { Input };
