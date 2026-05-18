import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDestinations } from '@/hooks/useDestinations';
import HeritageGrid from '@/components/heritage/HeritageGrid';
import CategoryFilter from '@/components/heritage/CategoryFilter';
import SearchBar from '@/components/shared/SearchBar';
import Pagination from '@/components/shared/Pagination';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { Select } from '@/components/ui/select';

function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const params = {
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 12,
    category: searchParams.get('category') || undefined,
    province: searchParams.get('province') || undefined,
    accessLevel: searchParams.get('accessLevel') || undefined,
    search: searchParams.get('search') || undefined,
    sort: searchParams.get('sort') || 'newest',
  };

  const { data, isLoading } = useDestinations(params);

  const handlePageChange = (page) => {
    searchParams.set('page', page);
    setSearchParams(searchParams);
  };

  const handleSearch = (value) => {
    setSearch(value);
    if (value) {
      searchParams.set('search', value);
    } else {
      searchParams.delete('search');
    }
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handleSort = (e) => {
    searchParams.set('sort', e.target.value);
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-serif mb-6">Heritage Discover</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar value={search} onChange={handleSearch} />
        </div>
        <Select value={params.sort} onChange={handleSort} className="w-full md:w-48">
          <option value="newest">Terbaru</option>
          <option value="popular">Terpopuler</option>
        </Select>
      </div>

      <CategoryFilter />

      <div className="mt-8">
        {isLoading ? (
          <LoadingSpinner text="Memuat destinasi..." />
        ) : data?.data?.length ? (
          <>
            <HeritageGrid destinations={data.data} />
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <EmptyState title="Tidak ada destinasi ditemukan" description="Coba ubah filter atau kata kunci pencarian" />
        )}
      </div>
    </div>
  );
}

export default Discover;
