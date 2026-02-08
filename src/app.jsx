import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import SplashScreen from "../Layouts/SplashScreen";
import AppContent from "./AppContent";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Splash duration (1 second)
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <Toaster />
      {loading ? <SplashScreen /> : <AppContent />}
    </BrowserRouter>
  );
}