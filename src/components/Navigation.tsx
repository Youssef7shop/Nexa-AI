/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Menu, X, Sparkles, MessageSquare, Terminal, Settings, 
  User, LayoutDashboard, Shield, LogOut, Moon, Sun, Cpu, ShieldAlert, Ticket 
} from "lucide-react";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { page: "home", label: "Home", icon: <Cpu className="w-4 h-4" /> },
  ];

  // If logged in, add guarded links
  if (user) {
    navItems.push(
      { page: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
      { page: "chat", label: "AI Chat", icon: <MessageSquare className="w-4 h-4" /> },
      { page: "support", label: "Support", icon: <Ticket className="w-4 h-4" /> },
      { page: "settings", label: "Profile", icon: <User className="w-4 h-4" /> }
    );
    if (user.role === "Admin") {
      navItems.push({ page: "admin", label: "Admin Core", icon: <ShieldAlert className="w-4 h-4 text-purple-400" /> });
    }
  }

  return (
    <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 font-mono text-xs select-none">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Element */}
          <div 
            onClick={() => handleNavClick("home")} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="p-1.5 bg-gradient-to-tr from-purple-500/30 to-indigo-500/10 rounded-xl border border-purple-500/25 group-hover:glow-purple transition-all">
              <Cpu className="w-5 h-5 text-purple-400 animate-spin" />
            </div>
            <span className="font-display font-medium tracking-widest text-white text-[13px] font-black uppercase">
              SENTIENT<span className="text-purple-400 animate-pulse font-bold">.AI</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all font-medium cursor-pointer ${
                  currentPage === item.page
                    ? "bg-purple-500/10 border-purple-500/20 text-purple-300 shadow-sm"
                    : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* User Signout & Theme selection desktop panel */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle icon */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-900 bg-slate-950 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Toggle theme mode"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3 bg-slate-950 p-1.5 pr-3 rounded-xl border border-slate-950">
                <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" alt="Avatar" />
                <div className="text-left leading-tight hidden xl:block">
                  <div className="text-white font-bold max-w-[100px] truncate leading-none mb-0.5">{user.name}</div>
                  <span className="text-[10px] text-slate-500 font-normal block leading-none">{user.role}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    handleNavClick("home");
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 cursor-pointer"
                  title="Purge session (Disconnect)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick("auth")}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 font-bold text-white uppercase text-[11px] tracking-wider transform hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md glow-purple"
              >
                CONNECT_UPLINK
              </button>
            )}
          </div>

          {/* Mobile responsive toggle */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-900 bg-slate-950 text-slate-400"
            >
              {theme === "dark" ? <Sun className="w-4.5 h-4.5 text-yellow-400" /> : <Moon className="w-4.5 h-4.5 text-purple-400" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-slate-900 bg-slate-950 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu options */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-900 bg-slate-950 p-4 space-y-2 font-mono text-xs">
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => handleNavClick(item.page)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer ${
                currentPage === item.page
                  ? "bg-purple-500/10 border-purple-500/20 text-purple-300"
                  : "border-transparent text-slate-400 hover:bg-white/5"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <div className="border-t border-slate-900/60 my-4" />
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl">
                <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" alt="User avatar" />
                <div className="text-left leading-none">
                  <div className="text-white font-bold leading-none mb-1">{user.name}</div>
                  <span className="text-[10px] text-slate-500 block leading-none">{user.role}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  handleNavClick("home");
                }}
                className="w-full flex items-center justify-center gap-2 p-3 border border-red-500/20 hover:border-red-400 text-red-400 bg-red-950/10 rounded-xl transition-all cursor-pointer font-bold uppercase"
              >
                <LogOut className="w-4 h-4" />
                DISCONNECT_SESSION
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick("auth")}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 font-bold text-white rounded-xl uppercase tracking-wider text-center block cursor-pointer"
            >
              CONNECT_UPLINK
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
