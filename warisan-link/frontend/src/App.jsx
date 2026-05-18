import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import TourismDiscover from './pages/TourismDiscover';
import DestinationDetail from './pages/DestinationDetail';
import History from './pages/History';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tourism" element={<TourismDiscover />} />
          <Route path="/destination/:slug" element={<DestinationDetail />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
