import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf, Search, X, Lock } from "lucide-react";
import axios from "axios";

const BASE = "http://localhost:5001";

export default function GuestBrowse() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await axios.get(`${BASE}/api/plants/all`);
        setPlants(res.data || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetchPlants();
  }, []);

  const filtered = plants.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.User?.Kyc?.nurseryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlantClick = () => {
    setShowLoginPrompt(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-green-600 transition-colors font-black text-[10px] uppercase tracking-widest"
          >
            <ArrowLeft size={16} strokeWidth={3} />
            Back
          </button>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-green-600 p-1.5 rounded-lg">
              <Leaf size={14} className="text-white" />
            </div>
            <span className="font-black text-gray-900 text-sm tracking-tight">
              Plantify<span className="text-green-600">.</span>
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
            <input
              type="text"
              placeholder="Search plants or nurseries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-green-500/20 font-bold text-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X size={13} />
              </button>
            )}
          </div>

          <button
            onClick={() => navigate("/?modal=login")}
            className="ml-auto flex-shrink-0 bg-green-600 text-white font-black text-[10px] uppercase px-5 py-2.5 rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-600/20 active:scale-95"
          >
            Login to Buy
          </button>
        </div>
      </div>

      {/* Hero strip */}
      <div className="bg-green-600 py-8 px-6 text-center">
        <p className="text-green-100 font-black text-[10px] uppercase tracking-widest mb-2">Browse Marketplace</p>
        <h1 className="text-3xl font-black text-white">
          {loading ? "Loading plants..." : `${filtered.length} Plants Available`}
        </h1>
        <p className="text-green-200 font-bold text-sm mt-2">Login to book any plant</p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-24 font-black text-green-600 uppercase animate-pulse tracking-widest text-sm">
            Loading Plants...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-300 font-black uppercase tracking-widest text-sm">
            No plants found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((plant) => {
              const nurseryName = plant.User?.Kyc?.nurseryName || plant.User?.fullName;
              const nurseryLogo = plant.User?.Kyc?.image;

              return (
                <div
                  key={plant.id}
                  onClick={handlePlantClick}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group relative"
                >
                  {/* Lock overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 z-10 flex items-center justify-center rounded-2xl">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center gap-2">
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <Lock size={20} className="text-green-600" />
                      </div>
                      <span className="bg-white text-green-700 font-black text-[10px] uppercase px-4 py-1.5 rounded-full shadow-lg tracking-widest">
                        Login to Book
                      </span>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-50">
                    <img
                      src={`${BASE}/${plant.image}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={plant.name}
                      onError={(e) => { e.target.src = "/Icons/placeholder.jpg"; }}
                    />
                    {plant.quantity <= 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-red-500 text-white font-black px-3 py-1 rounded-full text-[10px] uppercase">Out of Stock</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-lg shadow-sm z-20">
                      <p className="text-green-600 font-black text-xs">NPR {plant.price}</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-black text-gray-800 text-sm leading-tight mb-2 truncate">{plant.name}</h3>

                    {/* Nursery */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-green-100 flex items-center justify-center flex-shrink-0">
                        {nurseryLogo ? (
                          <img src={`${BASE}/${nurseryLogo}`} className="w-full h-full object-cover" alt={nurseryName}
                            onError={(e) => { e.target.style.display = "none"; }} />
                        ) : (
                          <span className="text-green-700 font-black text-[8px] uppercase">{nurseryName?.charAt(0)}</span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-gray-400 truncate max-w-[140px]">{nurseryName}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      <span className="bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded-md font-black uppercase">{plant.category}</span>
                      <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-md font-black uppercase">{plant.environment}</span>
                      {plant.seasonality && (
                        <span className="bg-purple-50 text-purple-700 text-[10px] px-2 py-0.5 rounded-md font-black uppercase">{plant.seasonality}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
                      <span className={`text-[11px] font-black ${plant.quantity > 0 ? "text-green-600" : "text-red-500"}`}>
                        {plant.quantity > 0 ? `${plant.quantity} in stock` : "Out of stock"}
                      </span>
                      <span className="text-[10px] font-black text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded-lg">View</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Login prompt modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-green-600" />
            </div>
            <h2 className="text-xl font-black text-gray-900 uppercase mb-2">Login Required</h2>
            <p className="text-sm font-bold text-gray-500 mb-6">You need an account to book plants and connect with nurseries.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/?modal=login")}
                className="w-full bg-green-600 text-white font-black py-3.5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95"
              >
                Login to Continue
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-3 text-gray-400 font-black text-[10px] uppercase hover:text-gray-600 transition-colors"
              >
                Keep Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}