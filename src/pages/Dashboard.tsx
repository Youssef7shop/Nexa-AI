/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Cpu, MessageSquare, Ticket, Settings, ShieldCheck, UserCheck, Activity, Terminal, Calendar, ArrowRight, BellRing } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    chatsCount: 0,
    ticketsCount: 0,
    verificationStatus: false,
    systemLoad: "Normal",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!token) return;
      try {
        const [cRes, tRes] = await Promise.all([
          fetch("/api/chats", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/support/tickets", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const cData = await cRes.json();
        const tData = await tRes.json();

        setStats({
          chatsCount: cData.chats?.length || 0,
          ticketsCount: tData.tickets?.length || 0,
          verificationStatus: user?.emailVerified || false,
          systemLoad: "OPTIMIZED (0.01s)",
        });
      } catch (err) {
        console.error("Dashboard database check failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [token, user]);

  const cards = [
    {
      icon: <Activity className="w-5 h-5 text-purple-400" />,
      label: "COGNITIVE_SESSIONS",
      value: stats.chatsCount,
      desc: "Active machine conversation threads cached on Express container.",
    },
    {
      icon: <Ticket className="w-5 h-5 text-blue-400" />,
      label: "SUPPORT_TICKETS",
      value: stats.ticketsCount,
      desc: "Open queries undergoing review by biological root monitors.",
    },
    {
      icon: <UserCheck className="w-5 h-5 text-cyan-400" />,
      label: "CREDENTIALS_STATUS",
      value: stats.verificationStatus ? "VERIFIED" : "DE-AUTHORIZED",
      desc: stats.verificationStatus
        ? "Decryption certificates loaded. Complete system access allowed."
        : "Pending authorization. Launch settings panel to verify signature.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header telemetry blocks */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-900 pb-6">
        <div>
          <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block font-bold mb-1">// SECURE CONTAINER GRANTED</span>
          <h1 className="text-3xl font-bold text-white font-display flex items-center gap-3">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">{user?.name}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-900 font-mono text-[11px] text-slate-400">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>SYS_EPOCH: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Cpu className="w-10 h-10 text-purple-500 animate-spin" />
            <span className="font-mono text-xs text-slate-400">PULLING DATABASE CLUSTER TELEMETRY...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Stat Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {cards.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-slate-900 bg-slate-950/50 backdrop-blur-xl relative overflow-hidden group hover:border-purple-500/25 transition-all"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-all" />
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-mono text-slate-500 font-black uppercase tracking-wider">{c.label}</span>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">{c.icon}</div>
                </div>
                <div className="text-2xl font-bold text-white font-display mb-2">{c.value}</div>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">{c.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions & Log list split */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions Panel */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="font-display font-bold text-white text-lg tracking-wider block border-l-2 border-purple-500 pl-3">SYSTEM_LAUNCHERS</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => onNavigate("chat")}
                  className="p-6 rounded-2xl border border-purple-500/30 hover:border-purple-400 bg-purple-950/10 hover:bg-purple-950/20 text-left transition-all justify-between flex items-center group cursor-pointer glow-purple"
                >
                  <div>
                    <span className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30 inline-block mb-4">
                      <MessageSquare className="w-5 h-5 text-purple-300" />
                    </span>
                    <h3 className="text-white font-semibold mb-1 text-sm font-mono">NEURAL_CHAT</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Initialize stream coordinates using Gemini-3.5 cognitive modeling.</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-400 transform group-hover:translate-x-2 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate("support")}
                  className="p-6 rounded-2xl border border-slate-900 hover:border-slate-800 bg-slate-950/50 hover:bg-slate-950/80 text-left transition-all justify-between flex items-center group cursor-pointer"
                >
                  <div>
                    <span className="p-3 bg-white/5 rounded-xl border border-white/5 inline-block mb-4">
                      <Ticket className="w-5 h-5 text-blue-300" />
                    </span>
                    <h3 className="text-white font-semibold mb-1 text-sm font-mono">SUPPORT_MATRIX</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Transmit questions to administrators and review communications.</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 transform group-hover:translate-x-2 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate("settings")}
                  className="p-6 rounded-2xl border border-slate-900 hover:border-slate-800 bg-slate-950/50 hover:bg-slate-950/80 text-left transition-all justify-between flex items-center group cursor-pointer"
                >
                  <div>
                    <span className="p-3 bg-white/5 rounded-xl border border-white/5 inline-block mb-4">
                      <Settings className="w-5 h-5 text-cyan-300" />
                    </span>
                    <h3 className="text-white font-semibold mb-1 text-sm font-mono">USER_SETTINGS</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Configure avatars, biological names, and verify cryptographic access.</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 transform group-hover:translate-x-2 transition-transform" />
                </button>

                {user?.role === "Admin" && (
                  <button
                    onClick={() => onNavigate("admin")}
                    className="p-6 rounded-2xl border border-blue-500/20 hover:border-blue-400 bg-blue-950/10 hover:bg-blue-950/20 text-left transition-all justify-between flex items-center group cursor-pointer glow-blue"
                  >
                    <div>
                      <span className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30 inline-block mb-4">
                        <Terminal className="w-5 h-5 text-blue-300" />
                      </span>
                      <h3 className="text-white font-semibold mb-1 text-sm font-mono">ADMIN_CELL</h3>
                      <p className="text-[11px] text-slate-400 font-mono">Ban users, decrypt analytics telemetry, configure neural limits.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-400 transform group-hover:translate-x-2 transition-transform" />
                  </button>
                )}
              </div>
            </div>

            {/* Right sidebar announcements */}
            <div className="space-y-6">
              <h2 className="font-display font-bold text-white text-lg tracking-wider block border-l-2 border-cyan-400 pl-3">SYSTEM_SIGNALS</h2>
              <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/50 backdrop-blur-xl relative overflow-hidden">
                <div className="flex gap-3.5 mb-4 items-center">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs text-white font-bold tracking-wide">BROADCAST_LOCK: ACTIVE</span>
                </div>
                <div className="space-y-4 font-mono text-[11px] text-slate-400">
                  <div className="border-l border-purple-500 pl-3">
                    <span className="text-purple-300 font-bold block text-[10px]">COGNITIVE LOAD: LOW</span>
                    <p className="mt-0.5 leading-relaxed">System analytics report standard request queue latencies under 0.05 seconds.</p>
                  </div>
                  <div className="border-l border-blue-500 pl-3">
                    <span className="text-blue-300 font-bold block text-[10px]">DATABASE EXCELLENCE (PERSISTENT JSON)</span>
                    <p className="mt-0.5 leading-relaxed">Data persists completely across Node process restarts inside container storage.</p>
                  </div>
                  <div className="border-l border-emerald-500 pl-3">
                    <span className="text-emerald-300 font-bold block text-[10px]">ROLE CLEARANCES ALLOWED</span>
                    <p className="mt-0.5 leading-relaxed">Your assigned permission identifier is: <strong className="text-white underline">{user?.role}</strong>.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
