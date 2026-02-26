import { useEffect, useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import PlantDetailCard from "../Components/Plant/PlantDetailCard";

const BASE = "http://localhost:5001";

export default function Dashboard() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [nurseries, setNurseries] = useState([]);
  const [filters, setFilters] = useState({ category: "", environment: "", seasonality: "" });
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState("plant");

  const categoryRef = useRef();
  const environmentRef = useRef();
  const seasonalityRef = useRef();

  useEffect(() => { fetchPlants(); }, [filters]);
  useEffect(() => { fetchNurseries(); }, []);

  const fetchPlants = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.environment) params.environment = filters.environment;
      if (filters.seasonality) params.seasonality = filters.seasonality;
      if (user?.id) params.excludeUserId = user.id;
      const res = await api.get("/api/plants/all", { params });
      setPlants(res.data || []);
    } catch {}
  };

  const fetchNurseries = async () => {
    try {
      const res = await api.get("/api/plants/nurseries");
      setNurseries(res.data || []);
    } catch {}
  };

  const handleClearFilters = () => {
    setFilters({ category: "", environment: "", seasonality: "" });
    setSearchTerm("");
    setSearchMode("plant");
    if (categoryRef.current) categoryRef.current.value = "";
    if (environmentRef.current) environmentRef.current.value = "";
    if (seasonalityRef.current) seasonalityRef.current.value = "";
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value) { setSearchMode("plant"); return; }
    const matchesNursery = nurseries.some(n =>
      n.nurseryName?.toLowerCase().includes(value.toLowerCase())
    );
    const matchesPlant = plants.some(p =>
      p.name?.toLowerCase().includes(value.toLowerCase())
    );
    if (matchesNursery && !matchesPlant) setSearchMode("nursery");
    else setSearchMode("plant");
  };

  const filteredPlants = plants.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredNurseries = nurseries.filter(n =>
    n.nurseryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const showNurseries = searchMode === "nursery" && searchTerm.length > 0 && filteredNurseries.length > 0;

  return (
    <div className="flex h-full w-full overflow-hidden">

      {/* ── Sidebar — fixed height, scrolls its own content vertically ── */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-gray-100 bg-white overflow-y-auto overflow-x-hidden hidden lg:flex">
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Filters</h2>
            <button onClick={handleClearFilters}
              className="text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors uppercase">
              Clear All
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Plant Type</label>
              <select ref={categoryRef}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-100 font-bold text-sm outline-none focus:ring-2 focus:ring-green-500/20 text-gray-700">
                <option value="">All Types</option>
                <option value="flowering">Flowering</option>
                <option value="non-flowering">Non-Flowering</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Environment</label>
              <select ref={environmentRef}
                onChange={(e) => setFilters({ ...filters, environment: e.target.value })}
                className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-100 font-bold text-sm outline-none focus:ring-2 focus:ring-green-500/20 text-gray-700">
                <option value="">Any Environment</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Seasonality</label>
              <select ref={seasonalityRef}
                onChange={(e) => setFilters({ ...filters, seasonality: e.target.value })}
                className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-100 font-bold text-sm outline-none focus:ring-2 focus:ring-green-500/20 text-gray-700">
                <option value="">All Seasons</option>
                <option value="seasonal">Seasonal</option>
                <option value="perennial">Perennial</option>
              </select>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main — takes remaining width, scrolls vertically only ── */}
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-gray-50">
        <div className="p-6 lg:p-8 pb-20">

          {/* Header row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-7 gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Browse Plants</h1>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                {showNurseries
                  ? `${filteredNurseries.length} nurseries found`
                  : `${filteredPlants.length} plants available`}
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
              <input
                type="text"
                placeholder="Search plants, nurseries, location..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-green-500/20 font-bold text-sm"
              />
              {searchTerm && (
                <button onClick={() => { setSearchTerm(""); setSearchMode("plant"); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Nursery results */}
          {showNurseries ? (
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                Nurseries matching "{searchTerm}"
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredNurseries.map((nursery) => (
                  <div
                    key={nursery.userId}
                    onClick={() => navigate(`/nursery/${nursery.userId}`)}
                    className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col items-center text-center gap-3"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-green-100 flex items-center justify-center border-2 border-white shadow-md">
                      {nursery.image ? (
                        <img src={`${BASE}/${nursery.image}`} className="w-full h-full object-cover" alt={nursery.nurseryName}
                          onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <span className="text-green-700 font-black text-2xl uppercase">{nursery.nurseryName?.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-black text-gray-800">{nursery.nurseryName}</p>
                      <p className="text-xs text-gray-400 font-bold mt-0.5">View all plants →</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {filteredPlants.length > 0 ? filteredPlants.map((plant) => {
                const kyc = plant.User?.Kyc;
                const nurseryName = kyc?.nurseryName || plant.User?.fullName;
                const nurseryLogo = kyc?.image;

                return (
                  <div
                    key={plant.id}
                    onClick={() => setSelectedPlantId(plant.id)}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="relative h-44 overflow-hidden bg-gray-50">
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
                      <div className="absolute top-2.5 right-2.5 bg-white/95 px-2.5 py-1 rounded-lg shadow-sm">
                        <p className="text-green-600 font-black text-xs">NPR {plant.price}</p>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-black text-gray-800 text-sm leading-tight mb-1.5 truncate">{plant.name}</h3>

                      <div
                        className="flex items-center gap-1.5 mb-3 w-fit group/nursery"
                        onClick={(e) => { e.stopPropagation(); navigate(`/nursery/${plant.User?.id}`); }}
                      >
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-green-100 flex items-center justify-center flex-shrink-0 border border-green-50">
                          {nurseryLogo ? (
                            <img src={`${BASE}/${nurseryLogo}`} className="w-full h-full object-cover" alt={nurseryName}
                              onError={(e) => { e.target.style.display = "none"; }} />
                          ) : (
                            <span className="text-green-700 font-black text-[8px] uppercase">{nurseryName?.charAt(0)}</span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 group-hover/nursery:text-green-600 transition-colors truncate max-w-[130px]">
                          {nurseryName}
                        </span>
                      </div>

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
              }) : (
                <div className="col-span-full py-24 text-center">
                  <p className="text-gray-300 font-black uppercase tracking-widest text-sm">No plants found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {selectedPlantId && (
        <PlantDetailCard plantId={selectedPlantId} onClose={() => setSelectedPlantId(null)} />
      )}
    </div>
  );
}