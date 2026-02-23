import { useEffect, useState } from "react";
import { X, ShoppingCart, Droplets, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";

const BASE = "http://localhost:5001";

export default function PlantDetailCard({ plantId, onClose }) {
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [booking, setBooking] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/api/plants/${plantId}`);
        setPlant(res.data);
        setQuantity(1);
      } catch {
        toast.error("Could not load plant details");
        onClose();
      }
    };
    fetchDetail();
  }, [plantId]);

  // ✅ FIXED: removed window.confirm, only toast now
  const handleBooking = async () => {
    try {
      setBooking(true);
      await api.post("/api/bookings/book", { plantId: plant.id, quantity });
      toast.success(`Booking request sent for ${quantity} plant(s)!`, { duration: 4000, icon: "⏳" });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  if (!plant) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
        <div className="relative bg-white rounded-3xl p-16">
          <p className="font-black text-green-600 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  const kyc = plant.User?.Kyc;
  const nurseryName = kyc?.nurseryName || plant.User?.fullName;
  const nurseryLogo = kyc?.image;
  const totalPrice = plant.price * quantity;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">

        {/* Image side */}
        <div className="md:w-5/12 h-56 md:h-auto relative shrink-0">
          <img
            src={`${BASE}/${plant.image}`}
            className="w-full h-full object-cover"
            alt={plant.name}
            onError={(e) => { e.target.src = "/Icons/placeholder.jpg"; }}
          />
          <button onClick={onClose}
            className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-md rounded-full text-gray-700 shadow-md hover:scale-105 transition-transform">
            <X size={16} />
          </button>
          {plant.quantity <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white font-black px-4 py-2 rounded-full text-xs uppercase">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info side */}
        <div className="flex-1 p-7 md:p-8 overflow-y-auto">
          {/* Tags */}
          <div className="flex gap-2 flex-wrap mb-3">
            <span className="bg-green-50 text-green-700 text-[10px] px-3 py-1 rounded-full font-black uppercase">{plant.category}</span>
            <span className="bg-blue-50 text-blue-700 text-[10px] px-3 py-1 rounded-full font-black uppercase">{plant.environment}</span>
            {plant.seasonality && (
              <span className="bg-purple-50 text-purple-700 text-[10px] px-3 py-1 rounded-full font-black uppercase">{plant.seasonality}</span>
            )}
          </div>

          <h2 className="text-2xl font-black text-gray-900 leading-tight mb-1">{plant.name}</h2>

          {/* Nursery - clickable */}
          <div
            className="flex items-center gap-2 mb-3 cursor-pointer w-fit group"
            onClick={() => { onClose(); navigate(`/nursery/${plant.User?.id}`); }}
          >
            <div className="w-6 h-6 rounded-full overflow-hidden bg-green-100 flex items-center justify-center border border-white shadow-sm flex-shrink-0">
              {nurseryLogo ? (
                <img src={`${BASE}/${nurseryLogo}`} className="w-full h-full object-cover" alt={nurseryName}
                  onError={(e) => { e.target.style.display = "none"; }} />
              ) : (
                <span className="text-green-700 font-black text-[9px] uppercase">{nurseryName?.charAt(0)}</span>
              )}
            </div>
            <span className="text-sm font-bold text-gray-400 group-hover:text-green-600 transition-colors">{nurseryName}</span>
          </div>

          <p className="text-xl font-black text-green-600 mb-4">
            NPR {plant.price} <span className="text-xs text-gray-400 font-bold">/ plant</span>
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Stock</p>
              <p className={`font-black text-lg ${plant.quantity > 0 ? "text-green-600" : "text-red-500"}`}>{plant.quantity}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Environment</p>
              <p className="font-black text-gray-800 capitalize text-sm">{plant.environment}</p>
            </div>
          </div>

          {/* Care guide */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
            <h4 className="flex items-center gap-2 text-gray-800 font-black text-xs mb-2 uppercase tracking-widest">
              <Droplets size={14} className="text-blue-500" /> Care Guide
            </h4>
            <p className="text-gray-600 leading-relaxed text-sm font-medium whitespace-pre-line">{plant.guide}</p>
          </div>

          {/* Quantity selector + total price */}
          {plant.quantity > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-black text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(plant.quantity, q + 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="flex-1 bg-green-50 rounded-xl p-2.5 border border-green-100 text-center">
                  <p className="text-[10px] font-black text-green-500 uppercase">Total</p>
                  <p className="text-lg font-black text-green-700">NPR {totalPrice}</p>
                </div>
              </div>
            </div>
          )}

          {/* Book button */}
          <button
            onClick={handleBooking}
            disabled={booking || plant.quantity <= 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <ShoppingCart size={18} />
            {plant.quantity <= 0 ? "OUT OF STOCK" : booking ? "SENDING..." : `BOOK NOW · NPR ${totalPrice}`}
          </button>

          {plant.quantity > 0 && (
            <p className="text-center text-xs text-gray-400 font-bold mt-2">
              Confirmed only after owner approval
            </p>
          )}
        </div>
      </div>
    </div>
  );
}