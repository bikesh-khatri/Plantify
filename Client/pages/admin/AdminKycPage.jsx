import { useState, useEffect } from "react";
import { Eye, ChevronLeft, ChevronRight, X, Mail, Phone, MapPin, FileText } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const BASE = "http://localhost:5001";

export default function AdminKycPage() {
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => { fetchKycs(); setPage(1); }, [status]);

  const fetchKycs = async () => {
    setLoading(true);
    try {
      const res = await api.post("/api/admin/kycs", { status });
      setKycs(res.data);
    } catch {
      toast.error("Failed to load KYC records");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (newStatus) => {
    try {
      await api.patch(`/api/admin/kyc-status/${selected.id}`, {
        status: newStatus,
        remarks: newStatus === "rejected" ? remarks : "Verified by Admin"
      });
      toast.success(`KYC ${newStatus}`);
      setSelected(null);
      setShowReject(false);
      setRemarks("");
      fetchKycs();
    } catch {
      toast.error("Action failed");
    }
  };

  const totalPages = Math.ceil(kycs.length / perPage);
  const paginated = kycs.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6 pb-6 flex flex-col min-h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">KYC Verification</h1>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{kycs.length} requests</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border-2 border-gray-100 shadow-sm">
          {["pending", "verified", "rejected"].map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                status === s ? "bg-green-600 text-white shadow-md" : "text-gray-400 hover:text-gray-800"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50 border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Owner</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nursery Name</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-24 text-center font-black text-green-600 uppercase animate-pulse text-sm">Loading Records...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center text-gray-300 font-black uppercase text-sm">No {status} requests</td></tr>
              ) : paginated.map((kyc) => (
                <tr key={kyc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm bg-green-100 flex items-center justify-center flex-shrink-0">
                        {kyc.image ? (
                          <img src={`${BASE}/${kyc.image}`} className="w-full h-full object-cover" alt={kyc.nurseryName} />
                        ) : (
                          <span className="text-green-700 font-black uppercase">{kyc.nurseryName?.charAt(0)}</span>
                        )}
                      </div>
                      <p className="font-black text-gray-900">{kyc.User?.fullName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-700 text-sm">{kyc.nurseryName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-700 text-sm">{kyc.email}</p>
                    <p className="text-[11px] font-black text-green-600">{kyc.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase">
                    {new Date(kyc.updatedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelected(kyc)}
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
            <span className="text-gray-800">{Math.min((page - 1) * perPage + 1, kycs.length || 1)}</span> – <span className="text-gray-800">{Math.min(page * perPage, kycs.length)}</span> of {kycs.length}
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

      {/* KYC Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[1500] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 relative shadow-2xl max-h-[95vh] overflow-y-auto">
            <button onClick={() => { setSelected(null); setShowReject(false); setRemarks(""); }}
              className="absolute top-6 right-6 text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-all">
              <X size={22} strokeWidth={3} />
            </button>

            {/* Nursery logo + name */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-gray-100 overflow-hidden bg-green-100 flex items-center justify-center mb-3 shadow-lg">
                {selected.image ? (
                  <img src={`${BASE}/${selected.image}`} className="w-full h-full object-cover" alt={selected.nurseryName} />
                ) : (
                  <span className="text-green-700 font-black text-3xl uppercase">{selected.nurseryName?.charAt(0)}</span>
                )}
              </div>
              <h3 className="font-black text-xl text-gray-900 uppercase text-center">{selected.nurseryName}</h3>
              <p className="text-xs font-bold text-gray-400 mt-0.5">Submitted by {selected.User?.fullName}</p>
            </div>

            {/* Details */}
            <div className="space-y-2.5 mb-6">
              {[
                { icon: Mail, label: "Email", value: selected.email },
                { icon: Phone, label: "Phone", value: selected.phone },
                { icon: MapPin, label: "Address", value: selected.addressName || "Not provided" },
                { icon: FileText, label: "Established", value: selected.dob },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                    <Icon size={14} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                    <p className="text-sm font-bold text-gray-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Document */}
            <div className="mb-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Registration Document</p>
              <div className="aspect-video w-full bg-gray-50 rounded-2xl border-2 border-gray-100 overflow-hidden relative group">
                <img src={`${BASE}/${selected.documentImage}`}
                  className="w-full h-full object-contain" alt="Document" />
                <a href={`${BASE}/${selected.documentImage}`} target="_blank" rel="noreferrer"
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-[10px] font-black uppercase bg-white text-gray-900 px-4 py-2 rounded-full">Open Full Size</span>
                </a>
              </div>
            </div>

            {/* Actions */}
            {showReject ? (
              <div>
                <textarea
                  className="w-full bg-gray-50 text-gray-800 text-sm font-bold p-4 rounded-2xl border-2 border-gray-200 h-24 outline-none focus:border-red-400 transition-colors resize-none"
                  placeholder="Enter rejection reason..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setShowReject(false)}
                    className="flex-1 py-3.5 text-[10px] font-black uppercase bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors">
                    Back
                  </button>
                  <button onClick={() => handleAction("rejected")}
                    className="flex-[2] py-3.5 text-[10px] font-black uppercase bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors">
                    Confirm Rejection
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setShowReject(true)}
                  className="flex-1 bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-100 py-4 rounded-2xl font-black text-[10px] uppercase transition-all">
                  Reject
                </button>
                <button onClick={() => handleAction("verified")}
                  className="flex-1 bg-green-600 text-white shadow-lg shadow-green-600/20 hover:bg-green-700 py-4 rounded-2xl font-black text-[10px] uppercase transition-all">
                  Verify Nursery
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}