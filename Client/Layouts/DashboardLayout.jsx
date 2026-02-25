import { Outlet } from "react-router-dom";
import UserNavbar from "../Components/NavBars/UserNavbar";

export default function DashboardLayout() {
  return (
    <div className="h-screen w-screen max-w-full overflow-hidden bg-gray-50 flex flex-col">
      <UserNavbar />
      {/* Content area below navbar — scrolls vertically only */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-14">
        <Outlet />
      </div>
    </div>
  );
}