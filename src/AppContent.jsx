import { Routes, Route, Navigate } from "react-router-dom";
import GuestPage from "../Layouts/GuestWelcome";

export default function AppContent() {
  return (
    <Routes>
      {/* This ensures the GuestWelcome page shows up regardless of the URL */}
      <Route path="/" element={<GuestPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}