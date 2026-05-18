import { useNavigate, useSearchParams } from 'react-router-dom';
import { CATEGORIES } from '@/lib/constants';

function CategoryFilter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');

  const handleFilter = (slug) => {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    navigate(`/discover?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => handleFilter(null)}
        className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
          !activeCategory ? 'bg-warisan-gold text-warisan-dark' : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        Semua
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => handleFilter(cat.slug)}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            activeCategory === cat.slug ? 'bg-warisan-gold text-warisan-dark' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
