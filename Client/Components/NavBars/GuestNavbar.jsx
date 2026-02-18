import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react"; // Optional: if you want a burger icon for mobile later

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGetStarted = () => {
    navigate(`${location.pathname}?modal=login`);
  };

  return (
    <nav className="w-full bg-white/95 backdrop-blur-sm fixed top-0 left-0 z-50 border-b border-gray-100">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          
          
          <Link to="/" className="flex flex-col select-none group shrink-0">
            <span className="text-2xl md:text-3xl font-black text-gray-800 tracking-tighter">
              Plant<span className="text-green-600">ify</span>
            </span>
            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-gray-400 font-bold -mt-1">
              Grow your garden
            </span>
          </Link>

       
          <div className="flex items-center gap-6 md:gap-12">
            <Link
              to="/about-us"
              className="text-sm md:text-base font-bold text-gray-700 hover:text-green-600 transition-colors whitespace-nowrap"
            >
              About Us
            </Link>

            <button
              onClick={handleGetStarted}
              className="bg-green-600 hover:bg-green-700 text-white font-bold
                px-6 md:px-10 py-2.5 md:py-3.5 rounded-xl
                text-sm md:text-base transition-all 
                shadow-lg shadow-green-100 active:scale-95 whitespace-nowrap"
            >
              Get Started
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}