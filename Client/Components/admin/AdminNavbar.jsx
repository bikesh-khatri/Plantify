import { Link } from "react-router-dom";
import { Leaf, LogOut } from "lucide-react";

export default function AdminNavbar({ onLogout }) {
  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-100 fixed top-0 left-0 z-[60] h-16 flex items-center">
      <div className="w-full flex justify-between items-center px-6 md:px-10">
        {/* Logo */}
        <Link to="/admin" className="flex items-center gap-2 group">
          <div className="bg-green-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <Leaf className="text-white" size={17} />
          </div>
          <span className="text-lg font-black tracking-tighter text-gray-900">
            Plantify<span className="text-green-600">.</span>
          </span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            Admin Panel
          </span>
          <button
            onClick={onLogout}
            className="hidden lg:flex items-center gap-2 bg-red-50 text-red-600 font-black px-4 py-2 rounded-xl text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all active:scale-95"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}