import { X, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import toast from "react-hot-toast";
import { RegistrationSchema } from "./schema.registration";


export default function RegisterModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const closeModal = () => navigate(location.pathname, { replace: true });

  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    role: "",
    password: "",
    rePassword: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    role: "",
    password: "",
    rePassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      const limitedVal = onlyNums.slice(0, 10);
      setFormData({ ...formData, [name]: limitedVal });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({
      fullName: "",
      email: "",
      phone: "",
      dob: "",
      role: "",
      password: "",
      rePassword: "",
    });

    // Validate form data
    const result = RegistrationSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (!field) return;
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(issue.message);
      });
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      setLoading(false);
      return;
    }

    // Simulate registration (no API call)
    setTimeout(() => {
      toast.success("Registration successful! Backend will be connected later.");
      console.log("Registration Data:", formData);
      setLoading(false);
      navigate(`${location.pathname}?modal=login`);
    }, 1000);
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl w-[400px] max-w-[95vw] max-h-[90vh] overflow-y-auto p-8 box-border flex flex-col gap-4">
      
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
        Create your account
      </h2>

      {/* Form Container */}
      <div className="flex flex-col gap-3">
        
        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <input
            type="text"
            name="fullName"
            maxLength={30}
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full px-4 py-3 text-[16px] font-medium bg-gray-50 border-b-2 focus:outline-none transition-all ${
              errors.fullName
                ? "border-red-500"
                : "border-gray-200 focus:border-primary"
            }`}
          />
          {errors.fullName && (
            <p className="text-[13px] font-bold text-red-500 mt-1">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <input
            type="email"
            name="email"
            maxLength={30}
            placeholder="Email Address"
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

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <input
            type="tel"
            name="phone"
            maxLength={10}
            placeholder="Phone Number (10 digits)"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-3 text-[16px] font-medium bg-gray-50 border-b-2 focus:outline-none transition-all ${
              errors.phone
                ? "border-red-500"
                : "border-gray-200 focus:border-primary"
            }`}
          />
          {errors.phone && (
            <p className="text-[13px] font-bold text-red-500 mt-1">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="flex flex-col gap-1">
          <input
            type="date"
            name="dob"
            placeholder="Date of Birth"
            value={formData.dob}
            onChange={handleChange}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
              .toISOString()
              .split("T")[0]}
            className={`w-full px-4 py-3 text-[16px] font-medium bg-gray-50 border-b-2 focus:outline-none transition-all ${
              errors.dob
                ? "border-red-500"
                : "border-gray-200 focus:border-primary"
            }`}
          />
          {errors.dob && (
            <p className="text-[13px] font-bold text-red-500 mt-1">
              {errors.dob}
            </p>
          )}
        </div>

        {/* Role Dropdown */}
        <div className="flex flex-col gap-1">
          <div className="relative">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-4 py-3 text-[16px] font-medium bg-gray-50 border-b-2 focus:outline-none transition-all appearance-none pr-10 ${
                errors.role
                  ? "border-red-500"
                  : "border-gray-200 focus:border-primary"
              } ${formData.role === "" ? "text-gray-400" : "text-gray-900"}`}
            >
              <option value="" disabled hidden>
                Select Role
              </option>
              <option value="customer">Customer (Buy Plants)</option>
              <option value="owner">Owner (Sell Plants)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none text-gray-400" />
          </div>
          {errors.role && (
            <p className="text-[13px] font-bold text-red-500 mt-1">
              {errors.role}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
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
              className="absolute right-4 text-gray-500"
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
          {errors.password && (
            <ul className="text-[11px] font-bold text-red-500 mt-1 space-y-0.5">
              {Array.isArray(errors.password) ? (
                errors.password.map((err, i) => <li key={i}>• {err}</li>)
              ) : (
                <li>• {errors.password}</li>
              )}
            </ul>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1">
          <div className="relative flex items-center">
            <input
              type={showRePassword ? "text" : "password"}
              name="rePassword"
              placeholder="Confirm Password"
              value={formData.rePassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 pr-12 text-[16px] font-medium bg-gray-50 border-b-2 focus:outline-none transition-all ${
                errors.rePassword
                  ? "border-red-500"
                  : "border-gray-200 focus:border-primary"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowRePassword(!showRePassword)}
              className="absolute right-4 text-gray-500"
            >
              {showRePassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
          {errors.rePassword && (
            <p className="text-[13px] font-bold text-red-500 mt-1">
              {errors.rePassword}
            </p>
          )}
        </div>
      </div>

      {/* Register Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-dark
          text-white py-4 rounded-xl text-[18px] font-bold
          transition-all transform active:scale-[0.98] shadow-lg disabled:opacity-50 mt-2"
      >
        {loading ? "Creating Account..." : "REGISTER"}
      </button>

      {/* Login Link */}
      <p className="text-[14px] font-medium text-center text-gray-600">
        Already have an account?
        <span
          onClick={() => navigate(`${location.pathname}?modal=login`)}
          className="text-primary font-bold ml-2 cursor-pointer hover:underline"
        >
          Login here
        </span>
      </p>
    </div>
  );
}