import { cn } from '@/lib/utils';

const Button = ({ className, variant = 'default', size = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-warisan-gold text-warisan-dark hover:bg-opacity-90',
    secondary: 'border border-warisan-dark text-warisan-dark hover:bg-warisan-dark hover:text-white',
    ghost: 'hover:bg-gray-100',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-gray-300 hover:bg-gray-50',
  };
  const sizes = {
    default: 'px-4 py-2',
    sm: 'px-3 py-1 text-sm',
    lg: 'px-6 py-3',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={cn('rounded-lg font-semibold transition-colors disabled:opacity-50', variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
