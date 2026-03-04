import { useEffect, useState } from "react";
import { X, ShieldAlert, ShieldCheck, Mail, Phone, MapPin, Leaf, ShoppingBag, TrendingUp } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const BASE = "http://localhost:5001";

export default function AdminUserDetailCard({ userId, onClose, onUpdate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { if (userId) fetchUser(); }, [userId]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/user/${userId}`);
      setData(res.data);
    } catch {
      toast.error("Could not load user");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    setActionLoading(true);
    try {
      await api.patch(`/api/admin/user-status/${userId}`, { status });
      toast.success(`User ${status === "active" ? "activated" : "suspended"}`);
      fetchUser();
      onUpdate?.();
    } catch {
      toast.error("Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1100]">
      <div className="bg-white px-8 py-5 rounded-2xl font-black text-green-600 animate-pulse uppercase text-sm tracking-widest">
        Loading User...
      </div>
    </div>
  );

  const kyc = data?.Kyc;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">

        <button onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all z-10">
          <X size={20} strokeWidth={3} />
        </button>

        <div className="flex flex-col items-center text-center p-8 gap-4">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-green-100 flex items-center justify-center">
            {kyc?.image ? (
              <img src={`${BASE}/${kyc.image}`} className="w-full h-full object-cover" alt={data.fullName} />
            ) : (
              <span className="text-green-700 font-black text-3xl uppercase">{data.fullName?.charAt(0)}</span>
            )}
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{data.fullName}</h2>
            {kyc?.nurseryName && (
              <p className="text-xs font-bold text-green-600 mt-0.5">{kyc.nurseryName}</p>
            )}
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
              !data.status || data.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
            }`}>
              {data.status || "active"}
            </span>
          </div>

          {/* Contact info */}
          <div className="w-full space-y-2 text-left">
            {[
              { icon: Mail, label: "Email", value: data.email },
              { icon: Phone, label: "Phone", value: data.phone },
              { icon: MapPin, label: "Address", value: kyc?.addressName || "Not provided" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                  <Icon size={14} className="text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* KYC badge */}
          <div className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">KYC Status</span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
              data.kycStatus === "verified" ? "bg-green-100 text-green-600" :
              data.kycStatus === "pending" ? "bg-orange-100 text-orange-600" :
              "bg-gray-100 text-gray-500"
            }`}>
              {data.kycStatus || "none"}
            </span>
          </div>

          {/* Stats */}
          <div className="w-full grid grid-cols-3 gap-2">
            {[
              { label: "Bookings", value: data.stats?.totalBookings || 0, icon: ShoppingBag },
              { label: "Accepted", value: data.stats?.acceptedBookings || 0, icon: TrendingUp },
              { label: "Plants", value: data.stats?.totalPlants || 0, icon: Leaf },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <p className="text-xl font-black text-gray-900">{value}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Suspend / Activate */}
          <div className="w-full">
            {!data.status || data.status === "active" ? (
              <button
                onClick={() => handleStatusChange("suspended")}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3.5 rounded-2xl font-black text-[10px] uppercase hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50 border border-red-100"
              >
                <ShieldAlert size={15} /> Suspend User
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange("active")}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-600 py-3.5 rounded-2xl font-black text-[10px] uppercase hover:bg-green-100 transition-all active:scale-95 disabled:opacity-50 border border-green-100"
              >
                <ShieldCheck size={15} /> Activate User
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}