/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  User, Mail, Upload, Sparkles, KeyRound, Monitor, ShieldCheck, 
  RefreshCw, Moon, Sun, AlertCircle, HardDrive 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user, token, updateUser, theme, toggleTheme } = useAuth();
  
  // Forms states
  const [name, setName] = useState(user?.name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "");
  const [emailVerifiedState, setEmailVerifiedState] = useState(user?.emailVerified || false);

  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const presetAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=150&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=150&auto=format&fit=crop"
  ];

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, avatar: selectedAvatar })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Profile rewrite failed.");

      // Sync AuthContext
      updateUser(data.user);
      setSuccessMsg("Uplink bio-identifiers updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Synthesis cluster timeout.");
    } finally {
      setLoading(false);
    }
  };

  const verifySignature = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setVerifyLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEmailVerifiedState(true);
      if (user) {
        updateUser({ ...user, emailVerified: true });
      }
      setSuccessMsg(data.message || "Uplink verified.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Verification parameters validation error.");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 select-text">
      
      {/* Page Title */}
      <div className="mb-8 pb-6 border-b border-slate-900">
        <span className="text-xs font-mono text-purple-400 font-extrabold uppercase tracking-widest block mb-1">
          // SET_PROFILE_AND_COORDINATES
        </span>
        <h1 className="text-3xl font-bold font-display text-white">Profile Settings</h1>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs font-mono flex items-center gap-2.5">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 text-xs font-mono flex items-center gap-2.5">
          <AlertCircle className="w-4.5 h-4.5 text-red-400 flex-shrink-0 animate-pulse" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-8 font-mono text-xs">
        
        {/* Profile Details Edit Form */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950/50 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <h2 className="font-display font-medium text-sm text-white mb-6 uppercase flex items-center gap-2 text-[12px]">
            <User className="w-4.5 h-4.5 text-purple-400" />
            // BIOLOGICAL_IDENTIFIERS
          </h2>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <img 
                src={selectedAvatar} 
                className="w-16 h-16 rounded-full border border-purple-500/30 shadow-md object-cover flex-shrink-0" 
                alt="Selected Identity visual" 
              />
              <div className="flex-1 w-full space-y-3">
                <span className="text-slate-400 block font-bold mb-1">CHOOSE_AVATAR_PRESET</span>
                <div className="flex flex-wrap gap-2">
                  {presetAvatars.map((avUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(avUrl)}
                      className={`relative w-10 h-10 rounded-full overflow-hidden border cursor-pointer transition-all ${
                        selectedAvatar === avUrl ? "border-purple-500 scale-110" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={avUrl} className="w-full h-full object-cover" alt="preset option" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">NAME_STAMP</label>
                <input
                  type="text"
                  required
                  maxLength={30}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-white/5 rounded-xl bg-slate-950 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">AUTHENTIC_EMAIL_STAMP (LOCKS)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full pl-10 pr-4 py-3 border border-white/5 bg-slate-950 rounded-xl text-slate-500 cursor-not-allowed outline-none select-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 font-bold text-white uppercase tracking-wider rounded-xl cursor-pointer glow-purple text-xs"
            >
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              Save coordinates
            </button>
          </form>
        </div>

        {/* Auth Credentials Verify panel */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950/50 p-6">
          <h2 className="font-display font-medium text-sm text-white mb-4 uppercase flex items-center gap-2">
            <Monitor className="w-4.5 h-4.5 text-blue-400" />
            // AUTH_SIGN_VERIFICATION
          </h2>

          <div className="p-4 border border-slate-900 rounded-xl bg-slate-950 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <span className="font-bold text-white block">Email Signature coordinates</span>
              <span className="text-[10px] text-slate-500">
                {emailVerifiedState 
                  ? "Signature validated. Safe to access highly-secured system terminals." 
                  : "Uplink signature is currently unverified. Dispatch validating email code."}
              </span>
            </div>

            {emailVerifiedState ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[10px] uppercase">
                <ShieldCheck className="w-4 h-4" />
                VERIFIED
              </span>
            ) : (
              <button
                type="button"
                onClick={verifySignature}
                disabled={verifyLoading}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 font-bold uppercase rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {verifyLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                DISPATCH_VERIFY
              </button>
            )}
          </div>
        </div>

        {/* Global theme selection parameters */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950/50 p-6">
          <h2 className="font-display font-medium text-sm text-white mb-4 uppercase flex items-center gap-2">
            <Moon className="w-4.5 h-4.5 text-cyan-400" />
            // DISPLAY_THEME_VISUALS
          </h2>

          <div className="p-4 border border-slate-900 rounded-xl bg-slate-950 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Dark Mode Coordinates</span>
              <span className="text-[10px] text-slate-500">Adjust contrast colors for low-light biological reading environments.</span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/20 hover:bg-purple-500/30 transition-all flex items-center gap-2 cursor-pointer uppercase font-black tracking-widest text-[10px]"
            >
              {theme === "dark" ? (
                <>
                  <Moon className="w-4 h-4" />
                  DARK_CORE
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4" />
                  LIGHT_CORE
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
