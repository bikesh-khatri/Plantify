import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import AdminUserDetailCard from "../../Components/admin/AdminUserDetailCard";


const BASE = "http://localhost:5001";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => { fetchBookings(); }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.post("/api/admin/bookings", { status: filter });
      setBookings(res.data);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filtered = bookings.filter(b =>
    b.User?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    b.Plant?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s) => {
    if (s === "accepted") return "bg-green-100 text-green-600 border-green-200";
    if (s === "rejected") return "bg-red-100 text-red-600 border-red-200";
    return "bg-orange-100 text-orange-600 border-orange-200";
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">All Bookings</h1>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{filtered.length} bookings</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex bg-white p-1.5 rounded-2xl border-2 border-gray-100 shadow-sm">
            {["all", "pending", "accepted", "rejected"].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  filter === s ? "bg-green-600 text-white shadow-md" : "text-gray-400 hover:text-gray-800"
                }`}>
                {s}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
            <input type="text" placeholder="Search customer, plant..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-green-500/40 font-bold text-sm shadow-sm" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[750px]">
            <thead className="bg-gray-50 border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plant</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-24 text-center font-black text-green-600 uppercase animate-pulse text-sm">Loading Bookings...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-24 text-center text-gray-300 font-black uppercase text-sm">No bookings found</td></tr>
              ) : filtered.map((b) => {
                const qty = b.quantity || 1;
                const price = b.Plant?.price || 0;
                return (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedUserId(b.User?.id)}
                        className="flex items-center gap-3 hover:opacity-75 transition-opacity text-left">
                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black uppercase text-sm flex-shrink-0 shadow-sm">
                          {b.User?.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm hover:text-green-600 transition-colors">{b.User?.fullName}</p>
                          <p className="text-[10px] text-gray-400">{b.User?.email}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <img src={`${BASE}/${b.Plant?.image}`}
                          className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                          alt={b.Plant?.name}
                          onError={(e) => { e.target.src = "/Icons/placeholder.jpg"; }} />
                        <p className="font-bold text-gray-800 text-sm">{b.Plant?.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="font-black text-gray-800">{qty}</span></td>
                    <td className="px-6 py-4"><span className="font-bold text-gray-500 text-sm">NPR {price}</span></td>
                    <td className="px-6 py-4"><span className="font-black text-green-600">NPR {qty * price}</span></td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-gray-400">
                        {new Date(b.createdAt).toLocaleDateString("en-NP", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${statusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUserId && (
        <AdminUserDetailCard userId={selectedUserId} onClose={() => setSelectedUserId(null)} onUpdate={fetchBookings} />
      )}
    </div>
  );
}