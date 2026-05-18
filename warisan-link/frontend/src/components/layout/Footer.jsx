import { Link } from 'react-router-dom';
import { Compass, Github } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-warisan-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Compass className="h-6 w-6 text-warisan-gold" />
              <span className="text-lg font-bold font-serif">WARISAN LINK</span>
            </div>
            <p className="text-gray-400 text-sm">
              Connecting hidden heritage, local stories, and cross-border travelers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/tourism" className="hover:text-warisan-gold">Jelajahi Wisata</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Open Source</h4>
            <p className="text-gray-400 text-sm mb-4">100% Free & Open Source</p>
            <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white">
              <Github className="h-4 w-4" /> GitHub
            </a>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} WARISAN LINK. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
