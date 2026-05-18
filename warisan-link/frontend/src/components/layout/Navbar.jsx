import { Link } from 'react-router-dom';
import { Menu, X, Compass, Clock } from 'lucide-react';
import { useState } from 'react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-warisan-dark text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Compass className="h-8 w-8 text-warisan-gold" />
            <span className="text-xl font-bold font-serif">WARISAN LINK</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/discover" className="hover:text-warisan-gold transition-colors">Discover</Link>
            <Link to="/history" className="flex items-center gap-1 hover:text-warisan-gold transition-colors">
              <Clock className="h-4 w-4" /> Riwayat
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-warisan-dark border-t border-gray-700 px-4 py-4 space-y-3">
          <Link to="/discover" className="block hover:text-warisan-gold" onClick={() => setIsOpen(false)}>Discover</Link>
          <Link to="/history" className="flex items-center gap-1 hover:text-warisan-gold" onClick={() => setIsOpen(false)}>
            <Clock className="h-4 w-4" /> Riwayat
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
