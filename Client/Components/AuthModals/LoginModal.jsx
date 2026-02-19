import { X, Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { LoginSchema } from "./schema.login";

export default function LoginModal() {
  const navigate = useNavigate();
  const location = useLocation();

  const closeModal = () => navigate(location.pathname, { replace: true });

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    setLoading(true);
    setErrors({ email: "", password: "" });

    const result = LoginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe, // REQ 1: backend uses this to set 1h vs 7d expiry
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // REQ 1: Store token separately for AppContent + merged into user for axios interceptor
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({ ...data.user, token: data.token }));

        toast.success("Welcome back to Plantify!");
        window.location.href = "/dashboard";
      } else {
        toast.error(data.message || "Invalid Email or Password");
      }
    } catch {
      toast.error("Server connection failed. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl w-[400px] max-w-[95vw] p-8 flex flex-col gap-5">
      <button onClick={closeModal} className="absolute top-5 right-5 text-gray-500 hover:text-black transition-colors">
        <X size={24} />
      </button>

      <div className="flex justify-center">
        <div className="w-[84px] h-[84px] bg-green-500 rounded-full flex items-center justify-center shadow-md overflow-hidden">
          <img src="/Icons/logo.png" alt="Plantify Logo" className="w-full h-full object-cover" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center text-gray-800">Login to Plantify</h2>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-gray-700 ml-1">Email Address</label>
        <input
          type="email" name="email" placeholder="Enter your email"
          value={formData.email} onChange={handleChange}
          className={`w-full px-4 py-3 bg-gray-50 border-b-2 focus:outline-none transition-all ${errors.email ? "border-red-500" : "border-gray-200 focus:border-green-500"}`}
        />
        {errors.email && <p className="text-[13px] font-bold text-red-500">{errors.email}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-gray-700 ml-1">Password</label>
        <div className="relative flex items-center">
          <input
            type={showPassword ? "text" : "password"} name="password"
            placeholder="Enter your password" value={formData.password} onChange={handleChange}
            className={`w-full px-4 py-3 bg-gray-50 border-b-2 focus:outline-none transition-all ${errors.password ? "border-red-500" : "border-gray-200 focus:border-green-500"}`}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </div>
        {errors.password && <p className="text-[13px] font-bold text-red-500">{errors.password}</p>}
      </div>

      <div className="flex items-center gap-2 mb-1">
        <input
          type="checkbox" id="remember" checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-4 h-4 accent-green-600"
        />
        <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
          Remember me <span className="text-xs text-gray-400">(stay logged in for 7 days)</span>
        </label>
      </div>

      <button
        onClick={handleLogin} disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 active:scale-[0.98]"
      >
        {loading ? "AUTHENTICATING..." : "LOG IN"}
      </button>

      <p className="text-[14px] font-medium text-center text-gray-600 mt-2">
        Don't have an account?
        <button onClick={() => navigate(`${location.pathname}?modal=register`)} className="text-green-600 font-bold ml-2 hover:underline">
          Register here
        </button>
      </p>
    </div>
  );
}