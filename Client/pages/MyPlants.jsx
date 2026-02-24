import { useEffect, useState, useRef } from "react";
import { Clock, ShieldCheck, BookOpen, Plus } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import KycForm from "../Components/Kyc/KycForm";
import MyPlantCard from "../Components/Plant/MyPlantCard";
import AddPlantDialog from "../Components/Plant/AddPlantDialog";
import BookingList from "../Components/Plant/BookingList";

export default function MyPlants() {
  const [kycStatus, setKycStatus] = useState("loading");
  const [nurseryName, setNurseryName] = useState("My Nursery");
  const [plants, setPlants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");

  // Track previous status to detect changes and show toast
  const prevStatusRef = useRef(null);
  const pollRef = useRef(null);

  const fetchData = async (silent = false) => {
    try {
      const kycRes = await api.get("/api/kyc/status");
      const status = kycRes.data.status || "none";

      // Detect status change while user is on this page (admin acted)
      if (prevStatusRef.current && prevStatusRef.current !== status && !silent) {
        if (status === "verified") {
          toast.success("🎉 Your nursery has been verified! You can now add plants.", { duration: 5000 });
        } else if (status === "rejected") {
          toast.error("Your KYC application was rejected. Please review and resubmit.", { duration: 5000 });
        }
      }

      prevStatusRef.current = status;
      setKycStatus(status);

      if (kycRes.data.kyc?.nurseryName) {
        setNurseryName(kycRes.data.kyc.nurseryName);
      }
      if (status === "verified") {
        const plantRes = await api.get("/api/plants/my-plants");
        setPlants(plantRes.data || []);
      }
    } catch {
      setKycStatus("none");
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData(true);

    // Poll every 8 seconds while status is pending
    pollRef.current = setInterval(() => {
      setKycStatus((current) => {
        // Only keep polling if status is pending
        if (current === "pending") {
          fetchData(false);
        }
        return current;
      });
    }, 8000);

    return () => clearInterval(pollRef.current);
  }, []);

  // Stop polling once verified or rejected
  useEffect(() => {
    if (kycStatus !== "pending" && kycStatus !== "loading") {
      clearInterval(pollRef.current);
    }
  }, [kycStatus]);

  if (kycStatus === "loading") {
    return <div className="pt-40 text-center font-black animate-pulse text-green-600">Loading...</div>;
  }

  if (kycStatus === "pending") {
    return (
      <div className="pt-40 flex flex-col items-center justify-center text-center px-10">
        <Clock size={56} className="text-orange-500 mb-5 animate-bounce" />
        <h1 className="text-3xl font-black uppercase mb-2">Reviewing Your Nursery</h1>
        <p className="text-gray-400 font-bold max-w-sm text-sm">
          Your KYC has been submitted and is under review. This usually takes 24-48 hours.
        </p>
        <div className="mt-8 p-4 bg-gray-50 rounded-2xl flex items-center gap-2">
          <ShieldCheck className="text-green-600" size={18} />
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">Verification Pending</span>
        </div>
        {/* Subtle live indicator */}
        <p className="mt-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest animate-pulse">
          Checking for updates...
        </p>
      </div>
    );
  }

  if (kycStatus === "none" || kycStatus === "rejected") {
    return (
      <div className="pt-10 max-w-4xl mx-auto px-6 pb-20">
        <KycForm status={kycStatus} onRefresh={() => fetchData(true)} />
      </div>
    );
  }

  return (
    <div className="pt-6 px-6 lg:px-10 max-w-[1600px] mx-auto pb-20">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 capitalize">{nurseryName}</h1>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
            {plants.length} plants listed
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-colors shadow-sm"
        >
          <Plus size={15} /> Add Plant
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-100">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-5 py-2.5 font-black text-xs uppercase tracking-widest transition-all border-b-2 -mb-px ${
            activeTab === "inventory"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          My Plants ({plants.length})
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-5 py-2.5 font-black text-xs uppercase tracking-widest transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === "bookings"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <BookOpen size={12} /> Booking Requests
        </button>
      </div>

      {activeTab === "inventory" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {plants.map((p) => (
            <MyPlantCard key={p.id} plant={p} refresh={() => fetchData(true)} />
          ))}
          <div
            onClick={() => setIsModalOpen(true)}
            className="bg-white rounded-2xl border-2 border-dashed border-gray-100 min-h-[250px] flex flex-col items-center justify-center cursor-pointer hover:border-green-300 hover:bg-green-50/30 transition-all group"
          >
            <div className="w-11 h-11 bg-gray-100 group-hover:bg-green-100 rounded-full flex items-center justify-center mb-2.5 transition-colors">
              <Plus size={20} className="text-gray-400 group-hover:text-green-600" />
            </div>
            <p className="font-black text-gray-400 group-hover:text-green-600 text-xs uppercase tracking-widest transition-colors">
              Add New Plant
            </p>
          </div>
        </div>
      )}

      {activeTab === "bookings" && <BookingList />}

      <AddPlantDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchData(true)}
      />
    </div>
  );
}