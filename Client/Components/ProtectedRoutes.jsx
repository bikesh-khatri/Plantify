import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, isLoading }) => {
  if (isLoading) return null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/?modal=login" replace />;
};

export default ProtectedRoute;