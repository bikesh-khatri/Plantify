import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Components/NavBars/GuestNavbar";
import Welcome from "../pages/Welcome";
import LoginModal from "../Components/AuthModals/LoginModal";
import RegisterModal from "../Components/AuthModals/RegistrationModal";

export default function GuestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const modalType = searchParams.get("modal");

  const isLogin = modalType === "login";
  const isRegister = modalType === "register";
  const showModal = isLogin || isRegister;

  const closeModal = () => navigate(location.pathname, { replace: true });

  return (
    <div className="relative min-h-screen">
      <div className={showModal ? "filter blur-md brightness-90 transition-all duration-300" : "transition-all duration-300"}>
        <Navbar />
        <Welcome />
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative z-[60] animate-in fade-in zoom-in duration-200">
            {isLogin && <LoginModal />}
            {isRegister && <RegisterModal />}
          </div>
        </div>
      )}
    </div>
  );
}