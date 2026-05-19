import { cn } from '@/lib/utils';

const Select = ({ className, children, ...props }) => (
  <select
    className={cn('w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warisan-gold focus:border-transparent outline-none bg-white', className)}
    {...props}
  >
    {children}
  </select>
);

const SelectOption = ({ value, children, ...props }) => (
  <option value={value} {...props}>
    {children}
  </option>
);

export { Select, SelectOption };
