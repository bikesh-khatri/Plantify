import { useEffect, useState } from "react";
import { Users, Leaf, ShoppingBag, FileCheck, TrendingUp, Clock } from "lucide-react";
import api from "../../api/axios";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/admin/stats");
        setStats(res.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="pt-20 text-center font-black text-green-600 animate-pulse uppercase tracking-widest text-sm">
      Loading Dashboard...
    </div>
  );

  const cards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, bg: "bg-blue-50", color: "text-blue-600", border: "border-blue-100" },
    { label: "Total Plants", value: stats?.totalPlants || 0, icon: Leaf, bg: "bg-green-50", color: "text-green-600", border: "border-green-100" },
    { label: "Total Bookings", value: stats?.totalBookings || 0, icon: ShoppingBag, bg: "bg-purple-50", color: "text-purple-600", border: "border-purple-100" },
    { label: "Pending KYC", value: stats?.pendingKycs || 0, icon: FileCheck, bg: "bg-orange-50", color: "text-orange-600", border: "border-orange-100" },
    { label: "Accepted Bookings", value: stats?.acceptedBookings || 0, icon: TrendingUp, bg: "bg-emerald-50", color: "text-emerald-600", border: "border-emerald-100" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Dashboard</h1>
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Plantify Admin Overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`bg-white rounded-2xl border ${card.border} p-5 shadow-sm`}>
            <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={18} strokeWidth={2.5} />
            </div>
            <p className="text-2xl font-black text-gray-900">{card.value}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
          <Clock size={15} className="text-green-600" />
          <h2 className="font-black text-gray-800 text-xs uppercase tracking-widest">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plant</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!stats?.recentBookings?.length ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-300 font-black uppercase text-xs">
                    No bookings yet
                  </td>
                </tr>
              ) : stats.recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800 text-sm">{b.User?.fullName}</td>
                  <td className="px-6 py-4 font-bold text-gray-600 text-sm">{b.Plant?.name}</td>
                  <td className="px-6 py-4 font-black text-green-600 text-sm">
                    NPR {(b.quantity || 1) * (b.Plant?.price || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      b.status === "accepted" ? "bg-green-100 text-green-600" :
                      b.status === "rejected" ? "bg-red-100 text-red-600" :
                      "bg-orange-100 text-orange-600"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}