/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Mail, Lock, User as UserIcon, Keyboard, Terminal, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Auth({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { login } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (activeTab === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Uplink authentication failure.");

        // Log in successfully
        login(data.token, data.user);
        onNavigate("dashboard");
      } 
      
      else if (activeTab === "register") {
        if (!name) throw new Error("Bio-identifier name required.");
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Neural network registration halted.");

        // Reg successfully
        login(data.token, data.user);
        onNavigate("dashboard");
      } 
      
      else {
        // Forgot password
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Dispatched coordinates failed.");

        setSuccessMsg(data.message || "Coordinate logs emitted.");
        setTimeout(() => {
          setActiveTab("login");
          setSuccessMsg("");
        }, 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Synthesizer offline.");
    } finally {
      setLoading(false);
    }
  };

  const setTestUser = (isAdmin: boolean) => {
    setEmail(isAdmin ? "admin@gemini.ai" : "user@gemini.ai");
    setPassword(isAdmin ? "admin" : "password");
    setName(isAdmin ? "Neo Administrator" : "Seraph Explorer");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative my-10">
      {/* Background neon orbs */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-white/5 bg-slate-950/80 p-8 backdrop-blur-2xl shadow-2xl glow-purple"
        >
          {/* Logo element */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-purple-500/25 to-indigo-500/5 border border-purple-500/30 mb-4 animate-bounce">
              <ShieldCheck className="w-7 h-7 text-purple-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white tracking-wide">
              {activeTab === "login" && "UPLINK SECURITY HANDSHAKE"}
              {activeTab === "register" && "INITIALIZE COGNITIVE UPLINK"}
              {activeTab === "forgot" && "DECRYPT RECOVERY VECTOR"}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-1">
              {activeTab === "login" && "Access your personalized neural core directory"}
              {activeTab === "register" && "Establish authorization coordinates for your data"}
              {activeTab === "forgot" && "Re-generate authentication key coordinates via email"}
            </p>
          </div>

          {/* Form Tabs */}
          {activeTab !== "forgot" && (
            <div className="grid grid-cols-2 rounded-xl bg-slate-950 p-1 border border-slate-900 mb-6 font-mono text-xs">
              <button
                onClick={() => {
                  setActiveTab("login");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`py-2.5 rounded-lg text-center font-medium transition-all cursor-pointer ${
                  activeTab === "login"
                    ? "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/20"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                SECURE_LOGIN
              </button>
              <button
                onClick={() => {
                  setActiveTab("register");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`py-2.5 rounded-lg text-center font-medium transition-all cursor-pointer ${
                  activeTab === "register"
                    ? "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/20"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                NEURAL_REGISTER
              </button>
            </div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-4 p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 text-xs flex gap-2.5 items-center font-mono"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 animate-bounce" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-4 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs flex gap-2.5 items-center font-mono"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Actual inputs */}
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            {activeTab === "register" && (
              <div>
                <label className="text-slate-400 block mb-1 text-[11px] font-bold">BIOLOGICAL_IDENTIFIER_NAME</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={30}
                    placeholder="e.g. Neo Carter"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-white/5 rounded-xl bg-slate-950/80 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-bold">UPLINK_EMAIL_COORDS</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@domain-matrix.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-white/5 rounded-xl bg-slate-950/80 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            {activeTab !== "forgot" && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-400 block text-[11px] font-bold">MUTUAL_AUTHENTICATION_KEY</label>
                  {activeTab === "login" && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("forgot")}
                      className="text-purple-400 hover:text-purple-300 text-[10px] hover:underline cursor-pointer"
                    >
                      FORGOT_KEY?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="Enter decryption key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-white/5 rounded-xl bg-slate-950/80 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold transition-all transform hover:scale-[1.01] active:scale-[0.99] mt-6 cursor-pointer glow-purple"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  SYNTHESIZING_MATRIX...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {activeTab === "login" && "ESTABLISH_CONNECTION"}
                  {activeTab === "register" && "INITIALIZE_UPLINK"}
                  {activeTab === "forgot" && "EMIT_COORDINATE_DECRYPT"}
                </>
              )}
            </button>

            {activeTab === "forgot" && (
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 rounded-xl text-center text-[10px] uppercase font-bold tracking-wide mt-2"
              >
                Back to Handshake login
              </button>
            )}
          </form>

          {/* Preseed test logs for simple evaluation */}
          <div className="mt-8 border-t border-slate-900 pt-6">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-black block tracking-widest mb-3 text-center">
              🌍 SEED ACCOUNTS FOR IMMEDIATE TESTING
            </span>
            <div className="grid grid-cols-2 gap-3.5 text-[10px] font-mono">
              <button
                onClick={() => setTestUser(false)}
                className="p-2 border border-blue-500/10 hover:border-blue-500/30 bg-blue-500/5 text-blue-300 rounded-lg text-left"
              >
                👥 <span className="font-bold block text-white text-[11px]">Regular Explorer</span>
                Email: user@gemini.ai<br />
                Pass: password
              </button>
              <button
                onClick={() => setTestUser(true)}
                className="p-2 border border-purple-500/10 hover:border-purple-500/30 bg-purple-500/5 text-purple-300 rounded-lg text-left"
              >
                👑 <span className="font-bold block text-white text-[11px]">Admin Sentinel</span>
                Email: admin@gemini.ai<br />
                Pass: admin
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
