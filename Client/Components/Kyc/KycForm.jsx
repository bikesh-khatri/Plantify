import { useState, useEffect } from "react";
import { Upload, MapPin, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import api from "../../api/axios";
import NurseryMapPicker from "./NurseryMapPicker";

const today = new Date().toISOString().split("T")[0];

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function KycForm({ status, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [addressName, setAddressName] = useState("");
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nurseryName: "",
    phone: "",
    email: "",
    dob: "",
    lat: 27.7172,
    lng: 85.3240,
  });
  const [docs, setDocs] = useState({
    documentImage: null,
    nurseryLogo: null,
    docPreview: null,
    logoPreview: null,
  });

  useEffect(() => {
    if (loading) window.onbeforeunload = () => "Submission in progress!";
    else window.onbeforeunload = null;
  }, [loading]);

  const handleLocationSelect = async (lat, lng) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      setAddressName(res.data.display_name || "Custom Location");
    } catch {
      setAddressName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const previewKey = type === "documentImage" ? "docPreview" : "logoPreview";
      setDocs((prev) => ({ ...prev, [type]: file, [previewKey]: URL.createObjectURL(file) }));
    }
  };

  // ── Phone: digits only, max 10
  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: digits }));
    if (digits.length > 0 && digits.length < 10)
      setErrors((prev) => ({ ...prev, phone: "Phone must be exactly 10 digits" }));
    else
      setErrors((prev) => ({ ...prev, phone: "" }));
  };

  // ── Email: format check on blur
  const handleEmailBlur = () => {
    if (formData.email && !validateEmail(formData.email))
      setErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
    else
      setErrors((prev) => ({ ...prev, email: "" }));
  };

  // ── Date: cannot be in the future
  const handleDateChange = (e) => {
    const val = e.target.value;
    if (val > today) {
      setErrors((prev) => ({ ...prev, dob: "Established date cannot be in the future" }));
      return;
    }
    setErrors((prev) => ({ ...prev, dob: "" }));
    setFormData((prev) => ({ ...prev, dob: val }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nurseryName.trim()) newErrors.nurseryName = "Nursery name is required";
    if (!formData.phone || formData.phone.length !== 10) newErrors.phone = "Phone must be exactly 10 digits";
    if (!formData.email || !validateEmail(formData.email)) newErrors.email = "Enter a valid email address";
    if (!formData.dob) newErrors.dob = "Established date is required";
    if (formData.dob > today) newErrors.dob = "Established date cannot be in the future";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors before submitting");
      return;
    }

    if (!docs.documentImage || !docs.nurseryLogo) {
      return toast.error("Both document and logo are required!");
    }
    if (!formData.lat || !formData.lng) {
      return toast.error("Please select a location on the map!");
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    data.append("addressName", addressName);
    data.append("documentImage", docs.documentImage);
    data.append("image", docs.nurseryLogo);

    try {
      setLoading(true);
      const res = await api.post("/api/kyc/submit", data);
      if (res.status === 201 || res.status === 200) {
        window.onbeforeunload = null;
        toast.success("Nursery details submitted successfully!");
        setTimeout(() => {
          if (onRefresh) onRefresh();
          setLoading(false);
        }, 500);
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Submission failed. Please try again.");
    }
  };

  const inputClass = (field) =>
    `w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 font-bold outline-none focus:ring-2 transition-all ${
      errors[field]
        ? "border-red-300 focus:ring-red-500/20"
        : "border-transparent focus:ring-green-500/20"
    }`;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-green-600 p-10 text-white">
        <h2 className="text-3xl font-black uppercase tracking-tighter">Nursery Verification</h2>
        <p className="text-green-100 font-bold opacity-80">
          Verify your business to start selling on Plantify.
        </p>
        {status === "rejected" && (
          <div className="mt-4 bg-red-500/30 border border-red-300/40 rounded-2xl px-5 py-3">
            <p className="text-white font-bold text-sm">
              ⚠️ Your previous application was rejected. Please review and resubmit.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Nursery Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nursery Name</label>
            <input
              required type="text"
              placeholder="e.g. Green Valley Nursery"
              className={inputClass("nurseryName")}
              value={formData.nurseryName}
              onChange={(e) => {
                setFormData({ ...formData, nurseryName: e.target.value });
                if (e.target.value.trim()) setErrors((p) => ({ ...p, nurseryName: "" }));
              }}
            />
            {errors.nurseryName && <p className="text-red-500 text-[11px] font-bold ml-1">{errors.nurseryName}</p>}
          </div>

          {/* Established Date — max today */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Established Date
            </label>
            <input
              required type="date"
              max={today}
              className={inputClass("dob")}
              value={formData.dob}
              onChange={handleDateChange}
            />
            {errors.dob
              ? <p className="text-red-500 text-[11px] font-bold ml-1">{errors.dob}</p>
              : <p className="text-[10px] text-gray-400 font-bold ml-1">Cannot be a future date</p>
            }
          </div>

          {/* Business Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Email</label>
            <input
              required type="email"
              placeholder="e.g. info@nursery.com"
              className={inputClass("email")}
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (validateEmail(e.target.value)) setErrors((p) => ({ ...p, email: "" }));
              }}
              onBlur={handleEmailBlur}
            />
            {errors.email && <p className="text-red-500 text-[11px] font-bold ml-1">{errors.email}</p>}
          </div>

          {/* Phone — digits only, exactly 10 */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
            <div className="relative">
              <input
                required type="tel"
                placeholder="e.g. 9800000000"
                className={inputClass("phone")}
                value={formData.phone}
                onChange={handlePhoneChange}
                maxLength={10}
                inputMode="numeric"
              />
              {/* digit counter */}
              <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black ${
                formData.phone.length === 10 ? "text-green-500" : "text-gray-300"
              }`}>
                {formData.phone.length}/10
              </span>
            </div>
            {errors.phone
              ? <p className="text-red-500 text-[11px] font-bold ml-1">{errors.phone}</p>
              : <p className="text-[10px] text-gray-400 font-bold ml-1">Numbers only, exactly 10 digits</p>
            }
          </div>
        </div>

        {/* Map */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={14} className="text-green-600" /> Pin Nursery Location
          </label>
          <div className="rounded-2xl overflow-hidden border-2 border-gray-50 h-64">
            <NurseryMapPicker onLocationSelect={handleLocationSelect} />
          </div>
          <div className="mt-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Detected Address:</p>
            <p className="text-sm font-bold text-gray-700">
              {addressName || "Please select a point on the map"}
            </p>
          </div>
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3 text-center">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registration Document</label>
            <div className="relative border-2 border-dashed border-gray-100 rounded-3xl p-4 hover:bg-green-50 transition-all min-h-[160px] flex flex-col items-center justify-center">
              <input type="file" accept="image/*,.pdf" required={status !== "rejected"}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => handleFileChange(e, "documentImage")} />
              {docs.docPreview ? (
                <div className="w-full flex flex-col items-center gap-2">
                  <img src={docs.docPreview} className="w-full h-32 object-contain rounded-xl" alt="Document Preview" />
                  <p className="text-[10px] font-black text-green-600 uppercase">✓ Document Selected</p>
                </div>
              ) : (
                <>
                  <Upload className="text-gray-300 mb-2" size={32} />
                  <p className="text-[10px] font-black text-gray-400">SELECT DOCUMENT</p>
                  <p className="text-[9px] text-gray-300 mt-1">JPG, PNG or PDF</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3 text-center">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nursery Logo</label>
            <div className="relative border-2 border-dashed border-gray-100 rounded-3xl p-4 hover:bg-green-50 transition-all min-h-[160px] flex flex-col items-center justify-center">
              <input type="file" accept="image/*" required={status !== "rejected"}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => handleFileChange(e, "nurseryLogo")} />
              {docs.logoPreview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={docs.logoPreview} className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md" alt="Logo Preview" />
                  <p className="text-[10px] font-black text-green-600 uppercase">✓ Logo Selected</p>
                </div>
              ) : (
                <>
                  <Upload className="text-gray-300 mb-2" size={32} />
                  <p className="text-[10px] font-black text-gray-400">SELECT LOGO</p>
                  <p className="text-[9px] text-gray-300 mt-1">JPG or PNG recommended</p>
                </>
              )}
            </div>
          </div>
        </div>

        <button disabled={loading} type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-3xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              PROCESSING...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle size={20} />
              {status === "rejected" ? "Resubmit Application" : "Submit Application"}
            </span>
          )}
        </button>
      </form>
    </div>
  );
}