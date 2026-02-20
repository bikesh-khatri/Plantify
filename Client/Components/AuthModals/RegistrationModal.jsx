import { X, Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { RegistrationSchema } from "./schema.registration";

export default function RegisterModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", dob: "", password: "", rePassword: ""
  });
  const [errors, setErrors] = useState({});

  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) setFormData({ ...formData, [name]: numericValue });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    const result = RegistrationSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((is) => fieldErrors[is.path[0]] = is.message);
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Registration Successful! Please login.");
        navigate(`${location.pathname}?modal=login`);
      } else {
        const d = await res.json();
        toast.error(d.message || "Registration failed");
      }
    } catch {
      toast.error("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl w-[400px] relative shadow-2xl flex flex-col gap-4">
      <button onClick={() => navigate(location.pathname)} className="absolute top-5 right-5 text-gray-400 hover:text-black">
        <X size={24} />
      </button>

      <div className="flex justify-center mb-2">
        <div className="w-[84px] h-[84px] bg-green-500 rounded-full flex items-center justify-center shadow-md overflow-hidden">
          <img src="/Icons/logo.png" alt="Plantify Logo" className="w-full h-full object-cover" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center text-gray-800">Create your account</h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <input name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-50 border-b-2 outline-none focus:border-green-600 ${errors.fullName ? "border-red-500" : "border-gray-200"}`} />
          {errors.fullName && <p className="text-red-500 text-[12px] font-bold ml-1">{errors.fullName}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-50 border-b-2 outline-none focus:border-green-600 ${errors.email ? "border-red-500" : "border-gray-200"}`} />
          {errors.email && <p className="text-red-500 text-[12px] font-bold ml-1">{errors.email}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <input name="phone" placeholder="Phone Number (10 digits)" value={formData.phone} onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-50 border-b-2 outline-none focus:border-green-600 ${errors.phone ? "border-red-500" : "border-gray-200"}`} />
          {errors.phone && <p className="text-red-500 text-[12px] font-bold ml-1">{errors.phone}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-gray-500 ml-1">Date of Birth (Must be 18+)</label>
          <input name="dob" type="date" max={maxDate} value={formData.dob} onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-50 border-b-2 outline-none focus:border-green-600 ${errors.dob ? "border-red-500" : "border-gray-200"}`} />
          {errors.dob && <p className="text-red-500 text-[12px] font-bold ml-1">{errors.dob}</p>}
        </div>

        {/* FIX: value={formData.password} added - was missing causing Zod to always see empty string */}
        <div className="flex flex-col gap-1 relative">
          <input name="password" type={showPassword ? "text" : "password"} placeholder="Password"
            value={formData.password} onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-50 border-b-2 outline-none focus:border-green-600 ${errors.password ? "border-red-500" : "border-gray-200"}`} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-gray-400">
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
          {errors.password && <p className="text-red-500 text-[12px] font-bold ml-1">{errors.password}</p>}
        </div>

        <div className="flex flex-col gap-1 relative">
          <input name="rePassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password"
            value={formData.rePassword} onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-50 border-b-2 outline-none focus:border-green-600 ${errors.rePassword ? "border-red-500" : "border-gray-200"}`} />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-3 text-gray-400">
            {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
          {errors.rePassword && <p className="text-red-500 text-[12px] font-bold ml-1">{errors.rePassword}</p>}
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold shadow-lg mt-2 transition-all disabled:opacity-50">
          {loading ? "REGISTERING..." : "REGISTER"}
        </button>

        <p className="text-[14px] font-medium text-center text-gray-600 mt-2">
          Already have an account?
          <button onClick={() => navigate(`${location.pathname}?modal=login`)} className="text-green-600 font-bold ml-2 hover:underline">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}