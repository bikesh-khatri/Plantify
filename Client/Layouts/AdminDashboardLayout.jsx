import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Users, Leaf, FileCheck, ShoppingBag, LayoutDashboard, Menu, X, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import AdminNavbar from "../Components/admin/AdminNavbar";
import api from "../api/axios";

export default function AdminDashboardLayout({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingKycCount, setPendingKycCount] = useState(0);

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message, { id: "admin-login" });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Fetch pending KYC count and poll every 30s
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await api.post("/api/admin/kycs", { status: "pending" });
        setPendingKycCount(res.data?.length || 0);
      } catch {}
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Re-fetch count when navigating away from KYC page (admin just reviewed one)
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await api.post("/api/admin/kycs", { status: "pending" });
        setPendingKycCount(res.data?.length || 0);
      } catch {}
    };
    fetchPendingCount();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    setSidebarOpen(false);
    onLogout?.();
    navigate("/");
  };

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/kyc", label: "KYC Requests", icon: FileCheck, badge: pendingKycCount },
    { path: "/admin/plants", label: "Plants", icon: Leaf },
    { path: "/admin/bookings", label: "Bookings", icon: ShoppingBag },
  ];

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden">
      <AdminNavbar onLogout={handleLogout} />

      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-[100] w-64 bg-white border-r border-gray-100 pt-16 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-0 lg:h-full
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all
                  ${isActive
                    ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
                    : "text-gray-400 hover:bg-gray-50 hover:text-green-600"}
                `}
              >
                <item.icon size={17} strokeWidth={2.5} />
                <span className="flex-1">{item.label}</span>

                {/* Red badge for pending KYC count */}
                {item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[9px] font-black min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-sm shadow-red-500/30 animate-pulse">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Mobile logout */}
          <div className="p-4 lg:hidden border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-500 font-black text-[10px] uppercase rounded-2xl hover:bg-red-50 transition-colors"
            >
              <LogOut size={17} strokeWidth={2.5} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 h-full overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-8 right-8 z-[110] bg-green-600 text-white p-4 rounded-full shadow-2xl active:scale-90 transition-transform"
      >
        {sidebarOpen ? <X size={22} strokeWidth={3} /> : <Menu size={22} strokeWidth={3} />}
      </button>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}