import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import SplashScreen from "../Layouts/SplashScreen";
import AppContent from "./AppContent";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      {loading ? <SplashScreen /> : <AppContent />}
    </BrowserRouter>
  );
}