import { cn } from '@/lib/utils';

const Badge = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-warisan-gold text-warisan-dark',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    outline: 'border border-current',
  };

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

export { Badge };
