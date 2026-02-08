import { X, Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { LoginSchema } from "./schema.login";



export default function LoginModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const closeModal = () => navigate(location.pathname, { replace: true });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    setLoading(true);
    setErrors({ email: "", password: "" });

    // Validate form data
    const result = LoginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (!field) return;
        fieldErrors[field] = issue.message;
      });
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      setLoading(false);
      return;
    }

    // Simulate login (no API call)
    setTimeout(() => {
      toast.success("Login functionality will be connected to backend!");
      console.log("Login Data:", { ...formData, rememberMe });
      setLoading(false);
      closeModal();
    }, 1000);
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl w-[400px] max-w-[95vw] p-8 box-border flex flex-col gap-5">
      
      {/* Close Button */}
      <button
        onClick={closeModal}
        className="absolute top-5 right-5 text-gray-500 hover:text-black transition-colors"
      >
        <X size={24} />
      </button>

      {/* Logo */}
      <div className="flex justify-center">
        <div className="w-[84px] h-[84px] bg-primary rounded-full flex items-center justify-center shadow-md">
          <span className="text-4xl">🌱</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center text-gray-800">
        Login to your account
      </h2>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-gray-700 ml-1">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          maxLength={30}
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-3 text-[16px] font-medium bg-gray-50 border-b-2 focus:outline-none transition-all ${
            errors.email
              ? "border-red-500"
              : "border-gray-200 focus:border-primary"
          }`}
        />
        {errors.email && (
          <p className="text-[13px] font-bold text-red-500 mt-1">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-gray-700 ml-1">
          Password
        </label>
        <div className="relative flex items-center">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-3 pr-12 text-[16px] font-medium bg-gray-50 border-b-2 focus:outline-none transition-all ${
              errors.password
                ? "border-red-500"
                : "border-gray-200 focus:border-primary"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-gray-500 hover:text-primary"
          >
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[13px] font-bold text-red-500 mt-1">
            {errors.password}
          </p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2 px-1">
        <input
          type="checkbox"
          id="rememberMe"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-5 h-5 cursor-pointer accent-primary"
        />
        <label
          htmlFor="rememberMe"
          className="text-[14px] font-bold text-gray-600 cursor-pointer"
        >
          Remember me
        </label>
      </div>

      {/* Login Button */}
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-dark
          text-white py-4 rounded-xl text-[16px] font-bold
          transition-all transform active:scale-[0.98] shadow-lg disabled:opacity-50"
      >
        {loading ? "Logging in..." : "LOG IN"}
      </button>

      {/* Register Link */}
      <p className="text-[14px] font-medium text-center text-gray-600 mt-2">
        Don't have an account?
        <span
          onClick={() => navigate(`${location.pathname}?modal=register`)}
          className="text-primary font-bold ml-2 cursor-pointer hover:underline"
        >
          Register here
        </span>
      </p>
    </div>
  );
}