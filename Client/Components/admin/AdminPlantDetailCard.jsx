import { useEffect, useState } from "react";
import { X, Trash2, Leaf, ShoppingBag, TrendingUp } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const BASE = "http://localhost:5001";

export default function AdminPlantDetailCard({ plantId, onClose, onUpdate }) {
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (plantId) fetchPlant(); }, [plantId]);

  const fetchPlant = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/plant/${plantId}`);
      setPlant(res.data);
    } catch {
      toast.error("Could not load plant");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Remove "${plant.name}" from the marketplace?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/api/admin/plant/${plantId}`);
      toast.success("Plant removed");
      onUpdate?.();
      onClose();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1100]">
      <div className="bg-white px-8 py-5 rounded-2xl font-black text-green-600 animate-pulse uppercase text-sm tracking-widest">
        Loading Plant...
      </div>
    </div>
  );

  const nurseryName = plant.User?.Kyc?.nurseryName || plant.User?.fullName;
  const nurseryLogo = plant.User?.Kyc?.image;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">

        <button onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md z-50 text-gray-600 hover:bg-white active:scale-90 transition-all">
          <X size={18} strokeWidth={3} />
        </button>

        {/* Image */}
        <div className="h-56 overflow-hidden rounded-t-3xl relative bg-gray-100">
          <img
            src={`${BASE}/${plant.image}`}
            className="w-full h-full object-cover"
            alt={plant.name}
            onError={(e) => { e.target.src = "/Icons/placeholder.jpg"; }}
          />
          {plant.quantity <= 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-500 text-white font-black px-4 py-2 rounded-full text-xs uppercase">Out of Stock</span>
            </div>
          )}
          <div className="absolute top-3 right-12 bg-white/95 px-3 py-1.5 rounded-xl shadow-sm">
            <p className="text-green-600 font-black text-sm">NPR {plant.price}</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            <span className="bg-green-50 text-green-700 text-[10px] px-3 py-1 rounded-full font-black uppercase">{plant.category}</span>
            <span className="bg-blue-50 text-blue-700 text-[10px] px-3 py-1 rounded-full font-black uppercase">{plant.environment}</span>
            {plant.seasonality && (
              <span className="bg-purple-50 text-purple-700 text-[10px] px-3 py-1 rounded-full font-black uppercase">{plant.seasonality}</span>
            )}
          </div>

          <h2 className="text-xl font-black text-gray-900 leading-tight">{plant.name}</h2>

          {/* Nursery */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-green-100 flex items-center justify-center flex-shrink-0">
              {nurseryLogo ? (
                <img src={`${BASE}/${nurseryLogo}`} className="w-full h-full object-cover" alt={nurseryName}
                  onError={(e) => { e.target.style.display = "none"; }} />
              ) : (
                <span className="text-green-700 font-black text-sm uppercase">{nurseryName?.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nursery</p>
              <p className="font-black text-gray-800 text-sm">{nurseryName}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Stock", value: plant.quantity, color: plant.quantity > 0 ? "text-green-600" : "text-red-500", icon: Leaf },
              { label: "Bookings", value: plant.bookingCount || 0, color: "text-gray-900", icon: ShoppingBag },
              { label: "Accepted", value: plant.acceptedCount || 0, color: "text-gray-900", icon: TrendingUp },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <p className={`text-xl font-black ${color}`}>{value}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Care guide */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Care Guide</p>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">{plant.guide}</p>
          </div>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Trash2 size={15} />
            {deleting ? "Removing..." : "Remove Plant from Marketplace"}
          </button>
        </div>
      </div>
    </div>
  );
}