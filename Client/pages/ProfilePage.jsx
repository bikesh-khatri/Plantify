import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, User as UserIcon, Phone, Mail, Calendar, ShieldCheck, Clock,
  FileText, Edit2, X, Lock, Trash2, LogOut, Eye, EyeOff, Check, Camera
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon, shadowUrl: markerShadow,
  iconSize: [25, 41], iconAnchor: [12, 41]
});

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showEdit, setShowEdit] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState({ fullName: "", phone: "" });
  const [editLoading, setEditLoading] = useState(false);

  // Logo edit
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoLoading, setLogoLoading] = useState(false);

  // Change password form
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassFields, setShowPassFields] = useState({ current: false, new: false, confirm: false });
  const [passLoading, setPassLoading] = useState(false);

  // Delete account form
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePass, setShowDeletePass] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/auth/profile");
      setProfile(res.data);
    } catch {
      const saved = localStorage.getItem("user");
      if (saved) setProfile(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  // ── EDIT PROFILE ────────────────────────────────────────────────────────────
  const openEdit = () => {
    setEditForm({ fullName: profile.fullName, phone: profile.phone });
    setLogoFile(null);
    setLogoPreview(null);
    setShowEdit(true);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleEditSubmit = async () => {
    if (!editForm.fullName.trim() || !editForm.phone.trim()) {
      toast.error("Name and phone are required"); return;
    }
    setEditLoading(true);
    try {
      // Update name/phone
      await api.patch("/api/auth/update-profile", editForm);

      // If new logo selected, upload it separately
      if (logoFile) {
        setLogoLoading(true);
        const formData = new FormData();
        formData.append("image", logoFile);
        await api.patch("/api/kyc/update-logo", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setLogoLoading(false);
      }

      toast.success("Profile updated!");
      setShowEdit(false);
      fetchProfile(); // refresh to show new logo
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setEditLoading(false);
      setLogoLoading(false);
    }
  };

  // ── CHANGE PASSWORD ──────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!passForm.currentPassword || !passForm.newPassword || !passForm.confirmPassword) {
      toast.error("All fields required"); return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error("New passwords don't match"); return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters"); return;
    }
    setPassLoading(true);
    try {
      await api.patch("/api/auth/change-password", {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      toast.success("Password changed successfully!");
      setShowChangePass(false);
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPassLoading(false);
    }
  };

  // ── DELETE ACCOUNT ───────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (!deletePassword) { toast.error("Enter your password"); return; }
    setDeleteLoading(true);
    try {
      await api.delete("/api/auth/delete-account", { data: { password: deletePassword } });
      toast.success("Account deleted");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect password");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) return <div className="pt-40 text-center font-black text-green-600 animate-pulse">Loading Profile...</div>;
  if (!profile) return <div className="pt-40 text-center font-black text-gray-400">Could not load profile.</div>;

  const isOwner = profile.kycStatus === "verified";
  const isPending = profile.kycStatus === "pending";
  const kyc = profile.kyc;

  // The logo to show — if user picked a new one in the modal show preview, else show saved
  const displayLogo = logoPreview || (kyc?.image ? `http://localhost:5001/${kyc.image}` : null);

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">

      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className={`h-28 ${isOwner ? "bg-green-600" : isPending ? "bg-orange-400" : "bg-gray-200"}`} />
        <div className="px-8 pb-8">
          <div className="-mt-14 mb-6 flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl font-black text-green-600 uppercase overflow-hidden flex-shrink-0">
                {isOwner && kyc?.image ? (
                  <img src={`http://localhost:5001/${kyc.image}`} className="w-full h-full object-cover" alt="Logo"
                    onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <span>{profile.fullName?.charAt(0)}</span>
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-black text-gray-900">{profile.fullName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {isOwner ? (
                    <span className="flex items-center gap-1 text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                      <ShieldCheck size={11} /> Verified Nursery Owner
                    </span>
                  ) : isPending ? (
                    <span className="flex items-center gap-1 text-xs font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                      <Clock size={11} /> KYC Pending
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-black text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      <UserIcon size={11} /> Customer
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={openEdit}
              className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-100 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-green-600 hover:text-white transition-all active:scale-95 mt-16">
              <Edit2 size={13} /> Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Mail, label: "Email", value: profile.email },
              { icon: Phone, label: "Phone", value: profile.phone },
              { icon: Calendar, label: "Date of Birth", value: profile.dob },
              { icon: UserIcon, label: "Account Type", value: isOwner ? "Nursery Owner" : "Customer" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <Icon size={16} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="font-bold text-gray-700 text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <button onClick={() => setShowChangePass(true)}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all active:scale-95">
              <Lock size={13} /> Change Password
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-100 text-gray-600 border border-gray-200 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase hover:bg-gray-700 hover:text-white transition-all active:scale-95">
              <LogOut size={13} /> Logout
            </button>
            <button onClick={() => setShowDelete(true)}
              className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all active:scale-95">
              <Trash2 size={13} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Nursery Details */}
      {isOwner && kyc && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-green-600 p-7 text-white">
            <h2 className="text-xl font-black uppercase tracking-tight">Nursery Details</h2>
            <p className="text-green-100 font-bold opacity-80 text-sm mt-1">Your verified nursery information</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Nursery Name", value: kyc.nurseryName },
                { label: "Business Email", value: kyc.email },
                { label: "Phone", value: kyc.phone },
                { label: "Established", value: kyc.dob },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                  <p className="font-bold text-gray-700">{value}</p>
                </div>
              ))}
            </div>
            {kyc.documentImage && (
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText size={12} /> Registration Document
                </p>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <img src={`http://localhost:5001/${kyc.documentImage}`}
                    className="w-full max-h-64 object-contain bg-gray-50 p-2" alt="Document"
                    onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                  <a href={`http://localhost:5001/${kyc.documentImage}`} target="_blank" rel="noreferrer"
                    style={{ display: "none" }}
                    className="items-center gap-2 p-4 text-green-600 font-bold text-sm hover:underline">
                    <FileText size={16} /> View Document
                  </a>
                </div>
              </div>
            )}
            {kyc.lat && kyc.lng && (
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MapPin size={12} className="text-green-600" /> Nursery Location
                </p>
                {kyc.addressName && (
                  <p className="text-sm font-bold text-gray-600 mb-3 bg-gray-50 p-3 rounded-xl border border-gray-100">{kyc.addressName}</p>
                )}
                <div className="rounded-2xl overflow-hidden h-56 border border-gray-100">
                  <MapContainer center={[kyc.lat, kyc.lng]} zoom={14} scrollWheelZoom={false} className="h-full w-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[kyc.lat, kyc.lng]} />
                  </MapContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isPending && (
        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-8 text-center">
          <Clock size={36} className="text-orange-400 mx-auto mb-3" />
          <h3 className="font-black text-orange-700 mb-1">KYC Under Review</h3>
          <p className="text-orange-600 text-sm">Your nursery details will appear here once approved (24-48 hours).</p>
        </div>
      )}

      {/* ── EDIT PROFILE MODAL ─────────────────────────────────────────────── */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => setShowEdit(false)}
              className="absolute top-5 right-5 text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-all">
              <X size={20} strokeWidth={3} />
            </button>
            <h2 className="text-xl font-black text-gray-900 uppercase mb-6">Edit Profile</h2>

            <div className="space-y-4">

              {/* Nursery logo — only for verified owners */}
              {isOwner && (
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                    Nursery Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {/* Current/preview logo */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-100 flex items-center justify-center flex-shrink-0">
                      {displayLogo ? (
                        <img src={displayLogo} className="w-full h-full object-cover" alt="Logo" />
                      ) : (
                        <span className="text-2xl font-black text-gray-400 uppercase">{profile.fullName?.charAt(0)}</span>
                      )}
                    </div>
                    {/* Upload button */}
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 text-gray-500 hover:text-green-600 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all">
                      <Camera size={14} />
                      {logoFile ? "Change Again" : "Upload New Logo"}
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                    </label>
                  </div>
                  {logoFile && (
                    <p className="text-[10px] text-green-600 font-bold mt-2 ml-1">✓ New logo selected — will save on submit</p>
                  )}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Full Name</label>
                <input type="text" value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-green-500/20 font-bold text-sm text-gray-700" />
              </div>

              {/* Phone */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Phone</label>
                <input type="text" value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-green-500/20 font-bold text-sm text-gray-700" />
              </div>

              <p className="text-[10px] text-gray-400 font-bold">Email and date of birth cannot be changed.</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEdit(false)}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-100 font-black text-[10px] uppercase text-gray-400 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={handleEditSubmit} disabled={editLoading || logoLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50">
                <Check size={14} />
                {editLoading || logoLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CHANGE PASSWORD MODAL ──────────────────────────────────────────── */}
      {showChangePass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => { setShowChangePass(false); setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
              className="absolute top-5 right-5 text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-all">
              <X size={20} strokeWidth={3} />
            </button>
            <h2 className="text-xl font-black text-gray-900 uppercase mb-6">Change Password</h2>
            <div className="space-y-4">
              {[
                { key: "currentPassword", label: "Current Password", showKey: "current" },
                { key: "newPassword", label: "New Password", showKey: "new" },
                { key: "confirmPassword", label: "Confirm New Password", showKey: "confirm" },
              ].map(({ key, label, showKey }) => (
                <div key={key}>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      type={showPassFields[showKey] ? "text" : "password"}
                      value={passForm[key]}
                      onChange={(e) => setPassForm({ ...passForm, [key]: e.target.value })}
                      className="w-full pl-4 pr-11 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-green-500/20 font-bold text-sm text-gray-700"
                      placeholder="••••••••"
                    />
                    <button type="button"
                      onClick={() => setShowPassFields({ ...showPassFields, [showKey]: !showPassFields[showKey] })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                      {showPassFields[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowChangePass(false); setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-100 font-black text-[10px] uppercase text-gray-400 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={handleChangePassword} disabled={passLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
                <Lock size={14} /> {passLoading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE ACCOUNT MODAL ──────────────────────────────────────────── */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => { setShowDelete(false); setDeletePassword(""); }}
              className="absolute top-5 right-5 text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-all">
              <X size={20} strokeWidth={3} />
            </button>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h2 className="text-xl font-black text-gray-900 uppercase">Delete Account</h2>
              <p className="text-sm text-gray-500 font-bold mt-2">This action is permanent and cannot be undone.</p>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Enter Password to Confirm</label>
              <div className="relative">
                <input
                  type={showDeletePass ? "text" : "password"}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 bg-gray-50 rounded-xl border border-red-100 outline-none focus:ring-2 focus:ring-red-500/20 font-bold text-sm text-gray-700"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowDeletePass(!showDeletePass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                  {showDeletePass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowDelete(false); setDeletePassword(""); }}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-100 font-black text-[10px] uppercase text-gray-400 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} disabled={deleteLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50">
                <Trash2 size={14} /> {deleteLoading ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}