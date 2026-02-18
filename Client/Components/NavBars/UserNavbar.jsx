import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Leaf, LayoutDashboard, Flower2, LogOut, User as UserIcon, Menu, X, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

export default function UserNavbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem("user");
      if (saved) setUser(JSON.parse(saved));
    };
    load();
    window.addEventListener("storage", load);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out");
    window.location.href = "/";
  };

  const isOwner = user?.kycStatus === "verified";

  const links = [
    { name: "Browse Plants", path: "/dashboard", icon: <LayoutDashboard size={15} /> },
    { name: "My Nursery", path: "/my-plants", icon: <Flower2 size={15} /> },
    ...(!isOwner ? [{ name: "My Bookings", path: "/my-bookings", icon: <BookOpen size={15} /> }] : []),
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] h-14 flex items-center transition-all ${
      scrolled ? "bg-white/95 backdrop-blur-lg shadow-sm" : "bg-white border-b border-gray-100"
    }`}>
      <div className="max-w-7xl mx-auto px-5 w-full flex justify-between items-center">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="bg-green-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <Leaf className="text-white" size={17} />
          </div>
          <span className="text-lg font-black tracking-tighter text-gray-900">
            Plantify<span className="text-green-600">.</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-0.5 bg-gray-100/80 p-1 rounded-xl">
            {links.map((link) => (
              <Link key={link.path} to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  location.pathname === link.path
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}>
                {link.icon}{link.name}
              </Link>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-200" />

          <div className="flex items-center gap-2.5">
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-75 transition-opacity">
              <div className="text-right">
                <p className="text-[11px] font-black text-gray-900 leading-none uppercase">{user?.fullName || "User"}</p>
                <p className={`text-[9px] font-bold uppercase tracking-wider ${isOwner ? "text-green-600" : "text-gray-400"}`}>
                  {isOwner ? "Nursery Owner" : "Customer"}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-black text-sm border-2 border-white shadow-sm uppercase">
                {user?.fullName?.charAt(0) || <UserIcon size={14} />}
              </div>
            </Link>
            <button onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-1.5 text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl font-bold text-sm ${
                  location.pathname === link.path ? "bg-green-50 text-green-600" : "text-gray-600 hover:bg-gray-50"
                }`}>
                {link.icon}{link.name}
              </Link>
            ))}
            <Link to="/profile" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50">
              <UserIcon size={15} /> My Profile
            </Link>
            <hr className="border-gray-100 my-1" />
            <button onClick={handleLogout}
              className="flex items-center gap-3 p-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}