import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTourism, useTourismProvinces, useTourismCategories, usePlaceWeather } from '@/hooks/useTourism';
import { MapPin, Globe, ExternalLink, Clock, DollarSign, Phone, Mail, Globe2, ChevronRight, ArrowLeft, Search, SlidersHorizontal, X, Droplets, Wind, Thermometer, CloudSun, CloudRain, Cloud, Sun, CloudLightning, CloudFog } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';

const CATEGORY_ICONS = {
  attraction: '🎯',
  museum: '🏛️',
  beach: '🏖️',
  park: '🌳',
  temple: '⛩️',
  mosque: '🕌',
  church: '⛪',
  monument: '🗿',
  viewpoint: '👁️',
  waterfall: '💧',
  volcano: '🌋',
  island: '🏝️',
  zoo: '🦁',
  theme_park: '🎢',
  garden: '🌺',
  marina: '⛵',
  stadium: '🏟️',
  swimming_pool: '🏊',
  other: '📍',
};

const COUNTRIES = [
  {
    code: 'ID',
    name: 'Indonesia',
    flag: '🇮🇩',
    description: 'Nusantara — 17.000+ pulau warisan budaya',
    bounds: { south: -11.0, west: 95.0, north: 6.0, east: 141.0 },
  },
  {
    code: 'MY',
    name: 'Malaysia',
    flag: '🇲🇾',
    description: 'Tanah Melayu — warisan Kesultanan dan kolonial',
    bounds: { south: 0.8, west: 99.5, north: 7.5, east: 120.0 },
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    description: 'Kota modern dengan akar Melayu yang kuat',
    bounds: { south: 1.15, west: 103.6, north: 1.47, east: 104.1 },
  },
  {
    code: 'TH',
    name: 'Thailand',
    flag: '🇹🇭',
    description: 'Kerajaan Siam — kuil, pantai, dan budaya',
    bounds: { south: 5.6, west: 97.3, north: 20.5, east: 105.6 },
  },
  {
    code: 'PH',
    name: 'Philippines',
    flag: '🇵🇭',
    description: 'Kepulauan Austronesia — alam dan sejarah',
    bounds: { south: 4.5, west: 116.0, north: 21.0, east: 127.0 },
  },
  {
    code: 'VN',
    name: 'Vietnam',
    flag: '🇻🇳',
    description: 'Warisan Champa dan Dinasti Nguyen',
    bounds: { south: 8.5, west: 102.0, north: 23.5, east: 110.0 },
  },
];

function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.other;
}

function getWeatherIcon(code) {
  if (code === 0) return <Sun className="h-5 w-5 text-yellow-500" />;
  if (code <= 2) return <CloudSun className="h-5 w-5 text-yellow-400" />;
  if (code === 3) return <Cloud className="h-5 w-5 text-gray-500" />;
  if (code <= 48) return <CloudFog className="h-5 w-5 text-gray-400" />;
  if (code <= 55) return <Droplets className="h-5 w-5 text-blue-300" />;
  if (code <= 65) return <CloudRain className="h-5 w-5 text-blue-500" />;
  if (code === 80) return <CloudRain className="h-5 w-5 text-blue-400" />;
  if (code >= 95) return <CloudLightning className="h-5 w-5 text-purple-500" />;
  return <CloudSun className="h-5 w-5 text-gray-400" />;
}

function WeatherCard({ lat, lon }) {
  const { data: weather, isLoading } = usePlaceWeather(lat, lon);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center gap-2 text-gray-400">
          <CloudSun className="h-5 w-5 animate-pulse" />
          <span className="text-sm">Memuat cuaca...</span>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-100">
      <div className="flex items-center gap-3 mb-3">
        {getWeatherIcon(weather.weatherCode)}
        <div>
          <span className="text-2xl font-bold text-gray-800">{weather.temperature}°C</span>
          <p className="text-sm text-gray-600">{weather.weatherDescription}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-red-400" />
          <div>
            <p className="text-gray-500 text-xs">Tertinggi</p>
            <p className="font-medium">{weather.tempMax}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-blue-400" />
          <div>
            <p className="text-gray-500 text-xs">Terendah</p>
            <p className="font-medium">{weather.tempMin}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          <div>
            <p className="text-gray-500 text-xs">Kelembaban</p>
            <p className="font-medium">{weather.humidity}%</p>
          </div>
        </div>
      </div>
      {weather.windSpeed && (
        <div className="flex items-center gap-2 mt-2 text-sm">
          <Wind className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Angin: {weather.windSpeed} km/j</span>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i < currentStep
                ? 'bg-warisan-gold text-warisan-dark'
                : i === currentStep
                ? 'bg-warisan-dark text-white ring-4 ring-warisan-gold/30'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {i < currentStep ? '✓' : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`flex-1 h-1 rounded transition-all ${i < currentStep ? 'bg-warisan-gold' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function CountrySelector({ selected, onSelect }) {
  return (
    <div>
      <h2 className="text-2xl font-bold font-serif mb-2">Pilih Negara</h2>
      <p className="text-gray-600 mb-6">Mau jelajahi wisata di mana?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COUNTRIES.map((country) => (
          <button
            key={country.code}
            onClick={() => onSelect(country)}
            className={`text-left p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
              selected?.code === country.code
                ? 'border-warisan-gold bg-warisan-gold/5 shadow-lg'
                : 'border-gray-200 bg-white hover:border-warisan-gold/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{country.flag}</span>
              <div>
                <h3 className="font-bold text-lg">{country.name}</h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{country.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProvinceSelector({ country, selected, onSelect, provinces, isLoading }) {
  const provinceList = provinces || [];

  return (
    <div>
      <button
        onClick={() => onSelect(null)}
        className="flex items-center gap-2 text-gray-500 hover:text-warisan-gold mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Ganti Negara
      </button>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{country.flag}</span>
        <div>
          <h2 className="text-2xl font-bold font-serif">{country.name}</h2>
          <p className="text-gray-600 text-sm">Pilih provinsi atau daerah</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Memuat daftar provinsi..." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
          {provinceList.map((p) => (
            <button
              key={p.name}
              onClick={() => onSelect(p.name)}
              className={`p-4 rounded-xl border-2 text-center transition-all hover:shadow-md ${
                selected === p.name
                  ? 'border-warisan-gold bg-warisan-gold/5 shadow-md'
                  : 'border-gray-200 bg-white hover:border-warisan-gold/50'
              }`}
            >
              <MapPin className="h-5 w-5 mx-auto mb-2 text-gray-400" />
              <span className="text-sm font-medium">{p.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CategorySelector({ selected, onSelect, categories }) {
  const categoryList = categories || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif">Pilih Kategori (Opsional)</h2>
          <p className="text-gray-600 text-sm">Lewati untuk lihat semua jenis tempat</p>
        </div>
      </div>

      <button
        onClick={() => onSelect(null)}
        className="px-4 py-2 rounded-full bg-warisan-dark text-white text-sm font-medium mb-4"
      >
        Semua Kategori
      </button>

      <div className="flex flex-wrap gap-2">
        {categoryList.map((c) => (
          <button
            key={c.slug}
            onClick={() => onSelect(c.slug)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selected === c.slug
                ? 'bg-warisan-gold text-warisan-dark'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-warisan-gold/50'
            }`}
          >
            <span>{getCategoryIcon(c.slug)}</span>
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function TourismDiscover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedId, setExpandedId] = useState(null);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const countryParam = searchParams.get('country');
    const provinceParam = searchParams.get('province');
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    if (countryParam) {
      const country = COUNTRIES.find((c) => c.code === countryParam);
      if (country) setSelectedCountry(country);
    }
    if (provinceParam) setSelectedProvince(provinceParam);
    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam) setSearch(searchParam);
  }, []);

  const shouldFetch = !!selectedProvince;

  const params = {
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 30,
    province: selectedProvince || undefined,
    category: selectedCategory || undefined,
    search: search || undefined,
    country: selectedCountry?.code || 'ID',
  };

  const { data, isLoading } = useTourism(params, { enabled: shouldFetch });
  const { data: provincesData, isLoading: isLoadingProvinces } = useTourismProvinces(selectedCountry?.code);
  const { data: categoriesData } = useTourismCategories();

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setSelectedProvince(null);
    setSelectedCategory(null);
    setSearch('');
    setSearchParams({ country: country.code });
  };

  const handleProvinceSelect = (province) => {
    setSelectedProvince(province);
    setExpandedId(null);
    const newParams = { country: selectedCountry.code };
    if (province) newParams.province = province;
    setSearchParams(newParams);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setExpandedId(null);
    const newParams = { country: selectedCountry.code, province: selectedProvince };
    if (category) newParams.category = category;
    setSearchParams(newParams);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setExpandedId(null);
    const newParams = { country: selectedCountry?.code, province: selectedProvince };
    if (selectedCategory) newParams.category = selectedCategory;
    if (value) newParams.search = value;
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    searchParams.set('page', page);
    setSearchParams(searchParams);
  };

  const resetAll = () => {
    setSelectedCountry(null);
    setSelectedProvince(null);
    setSelectedCategory(null);
    setSearch('');
    setExpandedId(null);
    setSearchParams({});
  };

  const places = data?.data || [];
  const pagination = data?.pagination || {};
  const provinces = provincesData?.data || [];
  const categories = categoriesData?.data || [];

  const step = !selectedCountry ? 0 : !selectedProvince ? 1 : 2;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif mb-1">Jelajahi Wisata</h1>
            <p className="text-gray-600">Data real-time dari OpenStreetMap</p>
          </div>
          {selectedCountry && (
            <button
              onClick={resetAll}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
              Reset
            </button>
          )}
        </div>
      </div>

      <StepIndicator currentStep={step} totalSteps={3} />

      {!selectedCountry && (
        <CountrySelector selected={selectedCountry} onSelect={handleCountrySelect} />
      )}

      {selectedCountry && !selectedProvince && (
        <ProvinceSelector
          country={selectedCountry}
          selected={selectedProvince}
          onSelect={handleProvinceSelect}
          provinces={provinces}
          isLoading={isLoadingProvinces}
        />
      )}

      {selectedProvince && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">{selectedCountry.flag}</span>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{selectedProvince}</h2>
              <p className="text-gray-500 text-sm">{selectedCountry.name}</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-warisan-gold/50 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm">Filter</span>
            </button>
          </div>

          {showFilters && (
            <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
              <CategorySelector
                selected={selectedCategory}
                onSelect={handleCategorySelect}
                categories={categories}
              />
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Cari tempat wisata..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-warisan-gold"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {isLoading ? 'Memuat...' : pagination.total ? `${pagination.total} tempat ditemukan` : ''}
            </span>
          </div>

          {isLoading ? (
            <LoadingSpinner text="Memuat tempat wisata..." />
          ) : places.length > 0 ? (
            <>
              <div className="space-y-3">
                {places.map((place) => (
                  <div
                    key={place.id}
                    className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setExpandedId(expandedId === place.id ? null : place.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-1">{getCategoryIcon(place.category)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-lg">{place.name}</h3>
                              <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                                <MapPin className="h-4 w-4 shrink-0" />
                                <span className="truncate">
                                  {[place.address.city, place.address.province].filter(Boolean).join(', ') || selectedCountry.name}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 whitespace-nowrap">
                              {place.category}
                            </span>
                          </div>

                          {expandedId === place.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                              {place.description && (
                                <p className="text-gray-700 text-sm">{place.description}</p>
                              )}

                              {place.lat && place.lon && (
                                <WeatherCard lat={place.lat} lon={place.lon} />
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                {place.openingHours && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="h-4 w-4 shrink-0" />
                                    <span>{place.openingHours}</span>
                                  </div>
                                )}
                                {place.fee && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <DollarSign className="h-4 w-4 shrink-0" />
                                    <span>{place.fee}</span>
                                  </div>
                                )}
                                {place.website && (
                                  <a
                                    href={place.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-warisan-gold hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Globe2 className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{place.website}</span>
                                  </a>
                                )}
                                {place.phone && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="h-4 w-4 shrink-0" />
                                    <span>{place.phone}</span>
                                  </div>
                                )}
                                {place.email && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{place.email}</span>
                                  </div>
                                )}
                                {place.wheelchair && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <span>♿</span>
                                    <span>Akses kursi roda: {place.wheelchair}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-400 pt-2">
                                <Globe className="h-3 w-3" />
                                <span>Lat: {place.lat?.toFixed(4)}, Lon: {place.lon?.toFixed(4)}</span>
                                <a
                                  href={`https://www.openstreetmap.org/${place.type}/${place.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-warisan-gold hover:underline ml-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Lihat di OSM <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="Tidak ada tempat wisata ditemukan"
              description="Coba ubah filter atau kata kunci pencarian"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default TourismDiscover;
