/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ChatPage from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/Admin";
import Support from "./pages/Support";
import Settings from "./pages/Settings";

function SentientApp() {
  const { user, loading, theme } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>("home");

  // Route protection rules mapping
  useEffect(() => {
    const guardedPages = ["dashboard", "chat", "support", "settings", "admin"];
    
    // Redirect if trying to load guarded coordinates without auth
    if (!loading && !user && guardedPages.includes(currentPage)) {
      setCurrentPage("auth");
    }

    // Direct away from auth if already logged in
    if (!loading && user && currentPage === "auth") {
      setCurrentPage("dashboard");
    }

    // Role-check boundary for Admin Cell
    if (!loading && user && currentPage === "admin" && user.role !== "Admin") {
      setCurrentPage("dashboard");
    }
  }, [user, currentPage, loading]);

  const navigateToPage = (pageName: string) => {
    setCurrentPage(pageName);
  };

  // Render proper subpage fragment
  const renderActivePage = () => {
    switch (currentPage) {
      case "home":
        return <Home onNavigate={navigateToPage} />;
      case "auth":
        return <Auth onNavigate={navigateToPage} />;
      case "chat":
        return <ChatPage />;
      case "dashboard":
        return <Dashboard onNavigate={navigateToPage} />;
      case "admin":
        return user?.role === "Admin" ? <AdminPanel /> : <Dashboard onNavigate={navigateToPage} />;
      case "support":
        return <Support />;
      case "settings":
        return <Settings />;
      default:
        return <Home onNavigate={navigateToPage} />;
    }
  };

  // Switch display theme overlays
  const themeContainerClass = theme === "dark" 
    ? "bg-slate-950 text-slate-100 min-h-screen relative" 
    : "bg-slate-50 text-slate-900 min-h-screen relative transition-colors duration-200";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs">
        <div className="flex flex-col items-center gap-3">
          <span className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin inline-block" />
          <span>AUTHENTICATING NEURAL PARADIGM...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="sentient_application" className={themeContainerClass}>
      {/* Absolute visual noise mesh backdrops */}
      {theme === "dark" && (
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950 pointer-events-none z-0" />
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation currentPage={currentPage} onNavigate={navigateToPage} />
        
        {/* Main Content Viewport Frame */}
        <main className="flex-grow">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SentientApp />
    </AuthProvider>
  );
}
