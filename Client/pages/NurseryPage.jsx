import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api/axios";
import PlantDetailCard from "../Components/Plant/PlantDetailCard";

const BASE = "http://localhost:5001";

export default function NurseryPage() {
  const { nurseryId } = useParams();
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [nurseryInfo, setNurseryInfo] = useState(null);
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/api/plants/all?nurseryId=${nurseryId}`);
        setPlants(res.data || []);
        if (res.data?.length > 0) {
          const first = res.data[0];
          setNurseryInfo({
            name: first.User?.Kyc?.nurseryName || first.User?.fullName,
            logo: first.User?.Kyc?.image,
          });
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [nurseryId]);

  if (loading) {
    return <div className="pt-40 text-center font-black text-green-600 animate-pulse">Loading Nursery...</div>;
  }

  return (
    <div className="pt-6 pb-20 px-6 lg:px-10 max-w-7xl mx-auto">

      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-700 font-bold text-sm mb-7 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Nursery header */}
      {nurseryInfo && (
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-green-100 flex items-center justify-center border-2 border-white shadow-md flex-shrink-0">
            {nurseryInfo.logo ? (
              <img src={`${BASE}/${nurseryInfo.logo}`} className="w-full h-full object-cover" alt={nurseryInfo.name}
                onError={(e) => { e.target.style.display = "none"; }} />
            ) : (
              <span className="text-green-700 font-black text-xl uppercase">{nurseryInfo.name?.charAt(0)}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 capitalize">{nurseryInfo.name}</h1>
            <p className="text-gray-400 font-bold text-xs mt-0.5">{plants.length} plants available</p>
          </div>
        </div>
      )}

      {plants.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
          <p className="text-gray-300 font-black uppercase tracking-widest text-sm">No plants listed yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {plants.map((plant) => (
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
                <h3 className="font-black text-gray-800 text-sm leading-tight mb-2 truncate">{plant.name}</h3>
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
                  <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg uppercase">View</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPlantId && (
        <PlantDetailCard plantId={selectedPlantId} onClose={() => setSelectedPlantId(null)} />
      )}
    </div>
  );
}