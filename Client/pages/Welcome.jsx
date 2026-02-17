import { ChevronDown, Search, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");

  return (
    <div
      className="w-full h-screen bg-cover bg-center pt-20"
      style={{ backgroundImage: "url('/Icons/background.png')" }}
    >
      <div className="bg-black/30 w-full h-full flex items-center">
        <div className="max-w-5xl mx-auto px-6 w-full relative">

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black drop-shadow-2xl leading-tight animate-fade-in-up">
            <span className="text-white">Discover your </span>
            <span className="text-green-400 italic font-extrabold">green</span>
            <br />
            <span className="text-white">Grow your </span>
            <span className="bg-gradient-to-r from-green-300 via-emerald-400 to-teal-400 bg-clip-text text-transparent font-black">
              garden.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mt-4 font-medium drop-shadow-lg animate-fade-in-up">
            Connect with trusted nurseries across Nepal
          </p>

          {/* Search Section */}
          <div className="mt-8 md:mt-10 flex flex-col md:flex-row items-center gap-4 md:gap-3 animate-slide-in-up">

            {/* Search Bar */}
            <div className="bg-white rounded-[2rem] md:rounded-full shadow-2xl flex flex-col md:flex-row flex-1 items-stretch md:items-center md:divide-x divide-gray-100 w-full max-w-3xl overflow-hidden border border-white/20">

              {/* Search input */}
              <div className="flex items-center gap-3 px-6 md:px-7 flex-1 border-b md:border-b-0 border-gray-100">
                <Search className="text-gray-400 shrink-0" size={22} />
                <input
                  type="text"
                  placeholder="Search plants..."
                  className="w-full py-4 text-base md:text-lg font-bold focus:outline-none placeholder:text-gray-400 placeholder:font-medium bg-transparent"
                />
              </div>

              {/* Category Select */}
              <div className="relative flex items-center px-6 md:px-6 w-full md:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full py-4 text-base md:text-lg font-bold focus:outline-none appearance-none bg-transparent pr-6 cursor-pointer ${
                    selectedCategory === "" ? "text-gray-400" : "text-black"
                  }`}
                >
                  <option value="" disabled hidden>Category</option>
                  <option value="flowering">Flowering</option>
                  <option value="non-flowering">Non-Flowering</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="perennial">Perennial</option>
                </select>
                <ChevronDown className="absolute right-6 h-5 w-5 pointer-events-none text-gray-400" />
              </div>
            </div>

            {/* Browse Arrow Button */}
            <button
              onClick={() => navigate("/browse")}
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 active:scale-95 text-white font-black text-sm uppercase tracking-widest px-6 py-4 rounded-full shadow-2xl transition-all duration-200 whitespace-nowrap border-2 border-green-300/30 group flex-shrink-0"
              title="Browse all plants"
            >
              Browse
              <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>

          </div>

         
          

        </div>
      </div>
    </div>
  );
}