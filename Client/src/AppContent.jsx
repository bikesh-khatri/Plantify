import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import DashboardLayout from "../Layouts/DashboardLayout";
import AdminDashboardLayout from "../Layouts/AdminDashboardLayout";
import GuestPage from "../Layouts/GuestWelcome";
import GuestBrowse from "../pages/GuestBrowse";

import Dashboard from "../pages/Dashboard";
import MyPlants from "../pages/MyPlants";
import KycPage from "../pages/KycPage";
import ProfilePage from "../pages/ProfilePage";
import MyBookings from "../pages/MyBookings";
import NurseryPage from "../pages/NurseryPage";

import AdminOverview from "../pages/admin/AdminOverview";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminKycPage from "../pages/admin/AdminKycPage";
import AdminPlantsPage from "../pages/admin/AdminPlantsPage";
import AdminBookingsPage from "../pages/admin/AdminBookingsPage";

import PublicRoute from "../Components/PublicRoutes";
import ProtectedRoute from "../Components/ProtectedRoutes";

export default function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await axios.get("http://localhost:5001/api/auth/verify-token", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.valid) {
          localStorage.setItem("user", JSON.stringify({ ...data.user, token }));
          if (data.user.role === "admin") {
            setIsAdminAuthenticated(true);
          } else {
            setIsAuthenticated(true);
          }
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };
    verify();
  }, []);

  if (isLoading) return null;

  return (
    <Routes>
      {/* Guest landing */}
      <Route path="/" element={
        isAdminAuthenticated
          ? <Navigate to="/admin" replace />
          : isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <GuestPage />
      } />

      {/* Public browse page — accessible without login */}
      <Route path="/browse" element={
        isAdminAuthenticated
          ? <Navigate to="/admin" replace />
          : isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <GuestBrowse />
      } />

      {/* Admin panel */}
      <Route
        path="/admin"
        element={
          isAdminAuthenticated
            ? <AdminDashboardLayout onLogout={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setIsAdminAuthenticated(false);
              }} />
            : <Navigate to="/" replace />
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="kyc" element={<AdminKycPage />} />
        <Route path="plants" element={<AdminPlantsPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
      </Route>

      {/* Regular user routes */}
      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-plants" element={<MyPlants />} />
          <Route path="/kyc" element={<KycPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/nursery/:nurseryId" element={<NurseryPage />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route
        path="*"
        element={
          <Navigate to={isAdminAuthenticated ? "/admin" : isAuthenticated ? "/dashboard" : "/"} replace />
        }
      />
    </Routes>
  );
}