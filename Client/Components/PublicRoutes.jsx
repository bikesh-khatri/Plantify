import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = ({ isAuthenticated, isLoading }) => {
  if (isLoading) return null;
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default PublicRoute;