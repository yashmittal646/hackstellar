import React from "react";
import LaptopDashboard from "./components/LaptopDashboard.jsx";
import PhoneScanner from "./components/PhoneScanner.jsx";

export default function App() {
  // If URL has /phone route, show phone scanner
  const isPhone = window.location.pathname === "/phone";
  return isPhone ? <PhoneScanner /> : <LaptopDashboard />;
}

