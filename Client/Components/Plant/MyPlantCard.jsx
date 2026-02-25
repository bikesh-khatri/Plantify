import { useState, useEffect } from "react";
import { Trash2, Edit2, X, Upload, Check } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function MyPlantCard({ plant: initialPlant, refresh }) {
  const [plant, setPlant] = useState(initialPlant);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (showEdit) {
      setFormData({
        name: plant.name || "",
        category: plant.category || "flowering",
        environment: plant.environment || "outdoor",
        seasonality: plant.seasonality || "perennial",
        price: plant.price || "",
        quantity: plant.quantity ?? "",
        guide: plant.guide || ""
      });
      setPreview(`http://localhost:5001/${plant.image}`);
      setImageFile(null);
    }
  }, [showEdit]);

  
  const handleDelete = async () => {
    try {
      await api.delete(`/api/plants/${plant.id}`);
      toast.success("Plant removed successfully");
      refresh();
    } catch {
      toast.error("Failed to delete plant");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Plant name is required");
    if (!formData.price || parseFloat(formData.price) <= 0) return toast.error("Valid price is required");
    if (formData.quantity === "" || parseInt(formData.quantity) < 0) return toast.error("Valid quantity is required");
    if (!formData.guide.trim()) return toast.error("Care guide is required");

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (imageFile) data.append("image", imageFile);

    try {
      setLoading(true);
      const res = await api.patch(`/api/plants/${plant.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Plant updated!");
      setPlant(res.data);
      setShowEdit(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update plant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── PLANT CARD ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
        <div className="relative h-48 overflow-hidden bg-gray-50">
          <img
            src={`http://localhost:5001/${plant.image}`}
            alt={plant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = "/Icons/placeholder.jpg"; }}
          />
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
            <p className="text-green-600 font-black text-xs">NPR {plant.price}</p>
          </div>
          <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setShowEdit(true)}
              className="p-1.5 bg-white rounded-lg shadow-sm text-gray-400 hover:text-blue-600 transition-colors">
              <Edit2 size={14} />
            </button>
            <button onClick={handleDelete}
              className="p-1.5 bg-white rounded-lg shadow-sm text-gray-400 hover:text-red-600 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-black text-gray-800 text-base leading-tight mb-1 truncate">{plant.name}</h3>
          <div className="flex gap-1.5 flex-wrap mb-3">
            <span className="bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded-md font-black uppercase">{plant.category}</span>
            <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-md font-black uppercase">{plant.environment}</span>
            <span className="bg-purple-50 text-purple-700 text-[10px] px-2 py-0.5 rounded-md font-black uppercase">{plant.seasonality}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Stock</span>
            <span className={`text-sm font-black ${plant.quantity < 5 ? "text-red-500" : "text-green-600"}`}>
              {plant.quantity} units
            </span>
          </div>
          {plant.quantity < 5 && (
            <p className="text-[10px] text-red-500 font-bold mt-2 text-center animate-pulse">⚠️ Low stock</p>
          )}
        </div>
      </div>

      {/* ── EDIT MODAL ─────────────────────────────────────────────────────── */}
      {showEdit && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEdit(false)} />

          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">Edit Plant</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Update listing details</p>
              </div>
              <button onClick={() => setShowEdit(false)}
                className="p-2 hover:bg-white rounded-full transition-all text-gray-400 hover:text-red-500 shadow-sm">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto text-left">

              {/* Image */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                  Photo <span className="normal-case font-bold text-gray-300">(leave unchanged to keep current)</span>
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-6 hover:bg-green-50 transition-all text-center cursor-pointer relative min-h-[160px] flex items-center justify-center group">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleImageChange} />
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="Preview" className="h-32 w-48 object-cover rounded-[1.5rem] shadow-md border-2 border-white" />
                      {imageFile && (
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-full">New</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="text-gray-400 mb-2" size={24} />
                      <p className="text-sm font-bold text-gray-500">Upload New Photo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Plant Name</label>
                <input required type="text"
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Category</label>
                <select className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-gray-700"
                  value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="flowering">Flowering</option>
                  <option value="non-flowering">Non-Flowering</option>
                </select>
              </div>

              {/* Environment */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Environment</label>
                <select className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-gray-700"
                  value={formData.environment} onChange={(e) => setFormData({ ...formData, environment: e.target.value })}>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>

              {/* Seasonality */}
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
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>

              {/* Quantity */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Stock Quantity</label>
                <input required type="number" min="0"
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-gray-700"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
              </div>

              {/* Care guide */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Care Guide</label>
                <textarea required rows="4"
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-gray-700 resize-none"
                  value={formData.guide}
                  onChange={(e) => setFormData({ ...formData, guide: e.target.value })} />
              </div>

              <button disabled={loading} type="submit"
                className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">
                <Check size={18} />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}