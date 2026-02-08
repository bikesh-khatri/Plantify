import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGetStarted = () => {
    navigate(`${location.pathname}?modal=login`);
  };

  return (
    <nav className="w-full bg-white/95 backdrop-blur-sm fixed top-0 left-0 z-50 px-6 md:px-20 border-b border-gray-100">
      <div className="max-w-[1536px] mx-auto flex justify-between items-center h-20 md:h-24">
        
        {/* Brand Text (Logo removed as requested) */}
        <Link to="/" className="flex flex-col select-none group">
          <span className="text-2xl md:text-3xl font-black text-gray-800 tracking-tighter">
            Plant<span className="text-primary">ify</span>
          </span>
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-gray-400 font-bold -mt-1">
            Grow your garden
          </span>
        </Link>

        {/* Navigation & Button aligned to the right like AaWAS */}
        <div className="flex items-center gap-10 md:gap-16">
          <Link
            to="/about-us"
            className="text-sm md:text-base font-bold text-gray-700 hover:text-primary transition-colors whitespace-nowrap"
          >
            About Us
          </Link>

          <button
            onClick={handleGetStarted}
            className="bg-primary hover:bg-primary-dark text-white font-bold
              px-10 py-3.5 rounded-xl
              text-sm md:text-base transition-all 
              shadow-lg shadow-green-100 active:scale-95 whitespace-nowrap"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}