import HeritageCard from './HeritageCard';

function HeritageGrid({ destinations }) {
  if (!destinations?.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {destinations.map((dest) => (
        <HeritageCard key={dest.id} destination={dest} />
      ))}
    </div>
  );
}

export default HeritageGrid;
