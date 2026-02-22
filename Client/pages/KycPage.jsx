import { useEffect, useState } from "react";
import api from "../api/axios";
import KycForm from "../Components/Kyc/KycForm";

export default function KycPage() {
  const [status, setStatus] = useState("loading");

  const fetchKycStatus = async () => {
    try {
      const res = await api.get("/api/kyc/status");
      setStatus(res.data.status);
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => { fetchKycStatus(); }, []);

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50 px-6">
      <div className="max-w-3xl mx-auto">
        {status === "loading" && (
          <p className="text-center font-bold text-green-600">Loading verification details...</p>
        )}
        {status === "verified" && (
          <div className="bg-white p-10 rounded-3xl shadow-sm text-center border-t-4 border-green-500">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
            <h2 className="text-2xl font-black mb-2">Nursery Verified!</h2>
            <p className="text-gray-500 mb-6">Your nursery is officially listed. You can now add and manage plants.</p>
            <button onClick={() => window.location.href = "/my-plants"} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold">
              Go to My Nursery
            </button>
          </div>
        )}
        {/* REQ 8: Pending shows 24hr message */}
        {status === "pending" && (
          <div className="bg-white p-10 rounded-3xl shadow-sm text-center border-t-4 border-orange-400">
            <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⏳</div>
            <h2 className="text-2xl font-black mb-2">Verification Pending</h2>
            <p className="text-gray-500">Your KYC application is under review. Our team will verify your nursery within <strong>24-48 hours</strong>.</p>
          </div>
        )}
        {status === "error" && (
          <div className="bg-white p-10 rounded-3xl shadow-sm text-center border-t-4 border-red-400">
            <h2 className="text-2xl font-black mb-2">Something went wrong</h2>
            <p className="text-gray-500">Could not load your verification status. Please refresh.</p>
          </div>
        )}
        {/* REQ 8: "none" matches backend, "rejected" shows resubmit form */}
        {(status === "none" || status === "rejected") && (
          <KycForm status={status} onRefresh={fetchKycStatus} />
        )}
      </div>
    </div>
  );
}