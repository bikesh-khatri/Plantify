import { useState, useEffect } from "react";
import { Search, Eye } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import AdminPlantDetailCard from "../../Components/admin/AdminPlantDetailCard";

const BASE = "http://localhost:5001";

export default function AdminPlantsPage() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState(null);

  useEffect(() => { fetchPlants(); }, [filter]);

  const fetchPlants = async () => {
    setLoading(true);
    try {
      const res = await api.post("/api/admin/plants", { status: filter });
      setPlants(res.data);
    } catch {
      toast.error("Failed to load plants");
    } finally {
      setLoading(false);
    }
  };

  const filtered = plants.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.User?.Kyc?.nurseryName?.toLowerCase().includes(search.toLowerCase()) ||
    p.User?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Plants Management</h1>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{filtered.length} plants</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex bg-white p-1.5 rounded-2xl border-2 border-gray-100 shadow-sm">
            {[
              { val: "all", label: "All" },
              { val: "active", label: "In Stock" },
              { val: "out_of_stock", label: "Out of Stock" },
            ].map(({ val, label }) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                  filter === val ? "bg-green-600 text-white shadow-md" : "text-gray-400 hover:text-gray-800"
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
            <input
              type="text" placeholder="Search plant or nursery..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-green-500/40 font-bold text-sm shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plant</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nursery</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-24 text-center font-black text-green-600 uppercase animate-pulse text-sm">Loading Plants...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-24 text-center text-gray-300 font-black uppercase text-sm">No plants found</td></tr>
              ) : filtered.map((plant) => {
                const nurseryName = plant.User?.Kyc?.nurseryName || plant.User?.fullName;
                const nurseryLogo = plant.User?.Kyc?.image;
                return (
                  <tr key={plant.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={`${BASE}/${plant.image}`}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-gray-100 shadow-sm flex-shrink-0"
                          alt={plant.name}
                          onError={(e) => { e.target.src = "/Icons/placeholder.jpg"; }} />
                        <p className="font-black text-gray-900">{plant.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-green-100 flex items-center justify-center flex-shrink-0">
                          {nurseryLogo ? (
                            <img src={`${BASE}/${nurseryLogo}`} className="w-full h-full object-cover" alt={nurseryName}
                              onError={(e) => { e.target.style.display = "none"; }} />
                          ) : (
                            <span className="text-green-700 font-black text-[10px] uppercase">{nurseryName?.charAt(0)}</span>
                          )}
                        </div>
                        <p className="font-bold text-gray-600 text-sm">{nurseryName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded-md font-black uppercase">{plant.category}</span>
                        <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-md font-black uppercase">{plant.environment}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-gray-900">NPR {plant.price}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-black text-sm ${plant.quantity > 0 ? "text-green-600" : "text-red-500"}`}>
                        {plant.quantity > 0 ? `${plant.quantity} left` : "Out of stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedPlantId(plant.id)}
                        className="p-2.5 bg-gray-100 text-gray-400 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm active:scale-90">
                        <Eye size={15} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPlantId && (
        <AdminPlantDetailCard plantId={selectedPlantId} onClose={() => setSelectedPlantId(null)} onUpdate={fetchPlants} />
      )}
    </div>
  );
}