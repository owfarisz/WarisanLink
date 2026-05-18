import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

function SearchBar({ value, onChange, placeholder = 'Cari destinasi...' }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  );
}

export default SearchBar;
