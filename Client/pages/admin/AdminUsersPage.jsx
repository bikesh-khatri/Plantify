import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, ShieldCheck, ShieldAlert, ShieldEllipsis, Eye } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import AdminUserDetailCard from "../../Components/admin/AdminUserDetailCard";

const BASE = "http://localhost:5001";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const perPage = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/users");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const kycBadge = (status) => {
    if (status === "verified") return (
      <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase w-fit">
        <ShieldCheck size={11} strokeWidth={3} /> Verified
      </span>
    );
    if (status === "pending") return (
      <span className="flex items-center gap-1 bg-orange-100 text-orange-600 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase w-fit">
        <ShieldEllipsis size={11} strokeWidth={3} /> Pending
      </span>
    );
    if (status === "rejected") return (
      <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase w-fit">
        <ShieldAlert size={11} strokeWidth={3} /> Rejected
      </span>
    );
    return <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase w-fit">No KYC</span>;
  };

  return (
    <div className="space-y-6 pb-6 flex flex-col min-h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Registered Users</h1>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{filtered.length} users</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
          <input
            type="text" placeholder="Search name, email, phone..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-green-500/40 font-bold text-sm shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nursery</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">KYC</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Account</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-24 text-center font-black text-green-600 uppercase animate-pulse text-sm">Loading Users...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="py-24 text-center text-gray-300 font-black uppercase text-sm">No users found</td></tr>
              ) : paginated.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl overflow-hidden bg-green-100 flex items-center justify-center border-2 border-gray-100 shadow-sm flex-shrink-0">
                        {user.Kyc?.image ? (
                          <img src={`${BASE}/${user.Kyc.image}`} className="w-full h-full object-cover" alt={user.fullName} />
                        ) : (
                          <span className="text-green-700 font-black text-lg uppercase">{user.fullName?.charAt(0)}</span>
                        )}
                      </div>
                      <p className="font-black text-gray-900">{user.fullName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-700 text-sm">{user.email}</p>
                    <p className="text-[11px] font-black text-green-600">{user.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-500 italic">{user.Kyc?.nurseryName || "—"}</p>
                  </td>
                  <td className="px-6 py-4">{kycBadge(user.Kyc?.status)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                      !user.status || user.status === "active"
                        ? "bg-blue-50 text-blue-600 border-blue-100"
                        : "bg-red-50 text-red-600 border-red-100"
                    }`}>
                      {user.status || "active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedUserId(user.id)}
                      className="p-2.5 bg-gray-100 text-gray-400 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm active:scale-90">
                      <Eye size={15} strokeWidth={2.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 bg-gray-50/50 flex items-center justify-between border-t border-gray-100 shrink-0">
          <p className="text-[10px] font-black text-gray-400 uppercase">
            <span className="text-gray-800">{Math.min((page - 1) * perPage + 1, filtered.length || 1)}</span> – <span className="text-gray-800">{Math.min(page * perPage, filtered.length)}</span> of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-xl border-2 border-gray-200 bg-white hover:border-green-500 disabled:opacity-20 transition-all">
              <ChevronLeft size={15} />
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg font-black text-[10px] transition-all ${
                    page === i + 1 ? "bg-green-600 text-white shadow-md" : "bg-white border-2 border-gray-100 text-gray-400 hover:text-gray-800"
                  }`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-xl border-2 border-gray-200 bg-white hover:border-green-500 disabled:opacity-20 transition-all">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {selectedUserId && (
        <AdminUserDetailCard userId={selectedUserId} onClose={() => setSelectedUserId(null)} onUpdate={fetchUsers} />
      )}
    </div>
  );
}