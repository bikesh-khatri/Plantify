import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

const EMPTY_FORM = {
  name: "",
  category: "flowering",
  environment: "outdoor",
  seasonality: "perennial",
  price: "",
  quantity: "",
  guide: ""
};

export default function AddPlantDialog({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Reset every time the dialog opens fresh
  useEffect(() => {
    if (isOpen) {
      setFormData(EMPTY_FORM);
      setImageFile(null);
      setPreview(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return toast.error("Please upload a plant photo");
    if (!formData.name.trim()) return toast.error("Plant name is required");
    if (!formData.price || parseFloat(formData.price) <= 0) return toast.error("Valid price is required");
    if (!formData.quantity || parseInt(formData.quantity) <= 0) return toast.error("Valid quantity is required");
    if (!formData.guide.trim()) return toast.error("Care guide is required");

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    data.append("image", imageFile);

    try {
      setLoading(true);
      await api.post("/api/plants/add", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Plant added to nursery!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add plant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Add New Plant</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Nursery Inventory Listing</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-gray-400 hover:text-red-500 shadow-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto text-left custom-scrollbar">

          {/* Image upload */}
          <div className="md:col-span-2">
            <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-6 hover:bg-green-50 transition-all text-center cursor-pointer relative min-h-[180px] flex flex-col items-center justify-center group">
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleImageChange} />
              {preview ? (
                <img src={preview} alt="Preview" className="h-32 w-48 object-cover rounded-[1.5rem] shadow-md border-2 border-white" />
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-white transition-colors">
                    <Upload className="text-gray-400" size={20} />
                  </div>
                  <p className="text-sm font-bold text-gray-500">Upload Plant Picture</p>
                </div>
              )}
            </div>
          </div>

          {/* Plant name */}
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Plant Name</label>
            <input required type="text"
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-green-500/20 transition-all"
              placeholder="e.g. Rare Monstera Adansonii"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>

          {/* REQ 6: Category - matches Plant model ENUM */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Category</label>
            <select className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-gray-700"
              value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              <option value="flowering">Flowering</option>
              <option value="non-flowering">Non-Flowering</option>
            </select>
          </div>

          {/* REQ 6: Environment - matches Plant model ENUM */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Environment</label>
            <select className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-gray-700"
              value={formData.environment} onChange={(e) => setFormData({ ...formData, environment: e.target.value })}>
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </div>

          {/* REQ 6: Seasonality - matches Plant model ENUM */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Seasonality</label>
            <select className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-gray-700"
              value={formData.seasonality} onChange={(e) => setFormData({ ...formData, seasonality: e.target.value })}>
              <option value="perennial">Perennial (All Year)</option>
              <option value="seasonal">Seasonal</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Price (NPR)</label>
            <input required type="number" min="1"
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-gray-700"
              placeholder="e.g. 500"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
          </div>

          {/* Quantity */}
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Stock Quantity</label>
            <input required type="number" min="1"
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-gray-700"
              placeholder="e.g. 10"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
          </div>

          {/* Care guide */}
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Care Guide Instructions</label>
            <textarea required rows="4"
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-gray-700 resize-none placeholder:text-gray-300"
              placeholder="Watering, sunlight, soil needs..."
              value={formData.guide}
              onChange={(e) => setFormData({ ...formData, guide: e.target.value })} />
          </div>

          <button disabled={loading} type="submit"
            className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? "Adding Plant..." : "Add to Nursery"}
          </button>
        </form>
      </div>
    </div>
  );
}