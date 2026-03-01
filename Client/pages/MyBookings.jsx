import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const BASE = "http://localhost:5001";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/api/bookings/my-bookings");
        setBookings(res.data);
      } catch {
        toast.error("Failed to load your bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const statusColor = (status) => {
    if (status === "accepted") return "bg-green-100 text-green-600 border-green-200";
    if (status === "rejected") return "bg-red-100 text-red-600 border-red-200";
    return "bg-orange-100 text-orange-600 border-orange-200";
  };

  const statusBar = (status) => {
    if (status === "accepted") return "bg-green-500";
    if (status === "rejected") return "bg-red-500";
    return "bg-orange-400";
  };

  if (loading) {
    return <div className="pt-40 text-center font-black text-green-600 animate-pulse">Loading your bookings...</div>;
  }

  return (
    <div className="pt-6 px-6 max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-6">My Bookings</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-7 flex-wrap">
        {["all", "pending", "accepted", "rejected"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              filter === s ? "bg-green-600 text-white shadow-sm" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
            }`}>
            {s === "all" ? "All" : s}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${filter === s ? "bg-white/20" : "bg-gray-100"}`}>
              {s === "all" ? bookings.length : bookings.filter((b) => b.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 border-2 border-dashed border-gray-100 rounded-2xl text-center">
          <p className="text-gray-300 font-black uppercase tracking-widest text-sm">
            No {filter === "all" ? "" : filter} bookings found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => {
            const qty = booking.quantity || 1;
            const price = booking.Plant?.price || 0;
            const total = qty * price;

            return (
              <div key={booking.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex">
                {/* Status bar on left */}
                <div className={`w-1.5 shrink-0 ${statusBar(booking.status)}`} />

                <div className="flex items-center gap-5 p-5 flex-1 flex-wrap sm:flex-nowrap">
                  <img
                    src={`${BASE}/${booking.Plant?.image}`}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    alt={booking.Plant?.name}
                    onError={(e) => { e.target.src = "/Icons/placeholder.jpg"; }}
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-800 text-base leading-tight truncate">{booking.Plant?.name}</h3>
                    <p className="text-xs text-gray-400 font-bold mt-0.5">
                      by {booking.Plant?.User?.fullName}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs font-bold text-gray-500">
                        {qty} × NPR {price}
                      </span>
                      <span className="font-black text-green-600 text-sm">= NPR {total}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(booking.createdAt).toLocaleDateString("en-NP", {
                        year: "numeric", month: "short", day: "numeric"
                      })}
                    </p>
                  </div>

                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border flex-shrink-0 ${statusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}