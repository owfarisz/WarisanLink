import { cn } from '@/lib/utils';

const Card = ({ className, children, ...props }) => (
  <div className={cn('bg-white rounded-xl shadow-md overflow-hidden', className)} {...props}>
    {children}
  </div>
);

const CardHeader = ({ className, children, ...props }) => (
  <div className={cn('px-6 py-4', className)} {...props}>
    {children}
  </div>
);

const CardContent = ({ className, children, ...props }) => (
  <div className={cn('px-6 py-4 pt-0', className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ className, children, ...props }) => (
  <div className={cn('px-6 py-4 border-t', className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn('text-lg font-semibold', className)} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ className, children, ...props }) => (
  <p className={cn('text-sm text-gray-500', className)} {...props}>
    {children}
  </p>
);

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription };
