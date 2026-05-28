/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, Terminal, Settings2, Sliders, ShieldX, UserMinus, ShieldAlert, 
  Settings, Loader, MessageSquare, Ticket, FileSpreadsheet, Cpu, Sparkles, CheckCircle2, ChevronRight, XCircle
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "../context/AuthContext";
import { User, Ticket as TicketType, AISettings, UserStatus, UserRole } from "../types";

export default function AdminPanel() {
  const { token, user } = useAuth();
  
  // Tabs
  const [adminTab, setAdminTab] = useState<"analytics" | "users" | "config" | "tickets">("analytics");
  
  // Data
  const [usersList, setUsersList] = useState<User[]>([]);
  const [ticketsList, setTicketsList] = useState<TicketType[]>([]);
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Replier box for ticket
  const [replyText, setReplyText] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  // Settings Fields
  const [defaultModel, setDefaultModel] = useState("gemini-3.5-flash");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [systemInstruction, setSystemInstruction] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    if (token) {
      loadAllAdminData();
    }
  }, [token, adminTab]);

  const loadAllAdminData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      if (adminTab === "analytics") {
        const res = await fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) {
          setAnalytics(data);
        } else throw new Error(data.error);
      } 
      
      else if (adminTab === "users") {
        const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) {
          setUsersList(data.users || []);
        } else throw new Error(data.error);
      } 
      
      else if (adminTab === "config") {
        const res = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) {
          setAiSettings(data.settings);
          setDefaultModel(data.settings.defaultModel);
          setTemperature(data.settings.temperature);
          setMaxTokens(data.settings.maxTokens);
          setSystemInstruction(data.settings.systemInstruction);
          setMaintenanceMode(data.settings.maintenanceMode);
        } else throw new Error(data.error);
      } 
      
      else if (adminTab === "tickets") {
        const res = await fetch("/api/admin/tickets", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) {
          setTicketsList(data.tickets || []);
          if (selectedTicket) {
            // Hotreload active ticket messaging
            const updatedtkt = data.tickets.find((t: any) => t.id === selectedTicket.id);
            if (updatedtkt) setSelectedTicket(updatedtkt);
          }
        } else throw new Error(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load admin nodes.");
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const toggleUserBan = async (uId: string, currentStatus: UserStatus) => {
    setUpdatingId(uId);
    setErrorMsg("");
    const newStatus = currentStatus === UserStatus.ACTIVE ? UserStatus.BANNED : UserStatus.ACTIVE;
    try {
      const res = await fetch(`/api/admin/users/${uId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setUsersList(prev => prev.map(u => u.id === uId ? { ...u, status: newStatus } : u));
      setSuccessMsg(`User status updated to: ${newStatus}`);
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Banning sequence halted.");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (uId: string) => {
    if (!confirm("Permanently purge this user and all related records?")) return;
    setUpdatingId(uId);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/admin/users/${uId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setUsersList(prev => prev.filter(u => u.id !== uId));
      setSuccessMsg("User node successfully purged.");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "De-allocation sequence halted.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Systems configs update
  const saveAiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          defaultModel,
          temperature,
          maxTokens,
          systemInstruction,
          maintenanceMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccessMsg("AI logical configurations committed to server.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Settings locks failed.");
    }
  };

  // Submit admin reply to ticket
  const submitTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    setErrorMsg("");

    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: replyText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReplyText("");
      setSelectedTicket(data.ticket);
      setTicketsList(prev => prev.map(t => t.id === selectedTicket.id ? data.ticket : t));
    } catch (err: any) {
      setErrorMsg(err.message || "Action terminated.");
    }
  };

  const closeTicket = async (tId: string) => {
    setErrorMsg("");
    try {
      const res = await fetch(`/api/admin/tickets/${tId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Closed" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTicketsList(prev => prev.map(t => t.id === tId ? { ...t, status: "Closed" } : t));
      if (selectedTicket?.id === tId) {
        setSelectedTicket(prev => prev ? { ...prev, status: "Closed" } : null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update status coordinates.");
    }
  };

  // Color constants for charts
  const COLORS = ["#8b5cf6", "#3b82f6", "#06b6d4"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-900">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-extrabold uppercase tracking-widest block mb-1">
            ⚠️ SYSTEM_ADMINISTRATOR_DOCK_CONTROL
          </span>
          <h1 className="text-3xl font-bold font-display text-white">Administrative Interface</h1>
        </div>

        {/* Section selectors */}
        <div className="flex flex-wrap gap-2.5 rounded-xl bg-slate-950 p-1 border border-slate-900 font-mono text-xs text-slate-400">
          <button
            onClick={() => setAdminTab("analytics")}
            className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${
              adminTab === "analytics" ? "bg-purple-500/20 text-purple-300 border border-purple-500/20" : "hover:text-slate-200"
            }`}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => setAdminTab("users")}
            className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${
              adminTab === "users" ? "bg-purple-500/20 text-purple-300 border border-purple-500/20" : "hover:text-slate-200"
            }`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setAdminTab("config")}
            className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${
              adminTab === "config" ? "bg-purple-500/20 text-purple-300 border border-purple-500/20" : "hover:text-slate-200"
            }`}
          >
            ⚙️ AI Settings
          </button>
          <button
            onClick={() => setAdminTab("tickets")}
            className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${
              adminTab === "tickets" ? "bg-purple-500/20 text-purple-300 border border-purple-500/20" : "hover:text-slate-200"
            }`}
          >
            ✉️ Tickets
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs font-mono flex items-center gap-2.5">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 text-xs font-mono flex items-center gap-2.5">
          <ShieldAlert className="w-4.5 h-4.5 text-red-400 flex-shrink-0 animate-bounce" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading && !selectedTicket ? (
        <div className="h-96 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-10 h-10 text-cyan-400 animate-spin" />
            <span className="font-mono text-xs text-slate-500">POLLING BACKEND DATABASE HANDSHAKES...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-8 select-text">

          {/* Tab 1: Real-time Analytics Visualizer (RECHARTS) */}
          {adminTab === "analytics" && analytics && (
            <div className="space-y-8">
              {/* Little stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: analytics.summary.totalUsers, label: "TOTAL_USERS", color: "text-purple-400" },
                  { value: analytics.summary.totalChats, label: "CORES_ACTIVE", color: "text-blue-400" },
                  { value: analytics.summary.totalMessages, label: "TOTAL_MESSAGES", color: "text-cyan-400" },
                  { value: analytics.summary.openTickets, label: "OPEN_TICKETS", color: "text-red-400" },
                ].map((s, idx) => (
                  <div key={idx} className="p-5 border border-slate-900 bg-slate-950/60 rounded-xl font-mono text-center">
                    <span className="text-[9px] text-slate-500 block font-bold mb-1 tracking-wider">{s.label}</span>
                    <span className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Graphical grids */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* 1. AreaChart tracking Queries volume */}
                <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-900 bg-slate-950/40">
                  <h3 className="font-mono text-xs text-white font-bold mb-6 tracking-wide">// QUANTUM MESSAGE VOLUME TRACES</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.chatActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorUplinks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.2} />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1f2937", borderRadius: "12px", fontFamily: "monospace", fontSize: "11px" }} />
                        <Area type="monotone" dataKey="uplinks" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorUplinks)" name="Uplink queries" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. PieChart tracking preferred LLM structures */}
                <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 font-mono text-xs">
                  <h3 className="text-white font-bold mb-6 tracking-wide text-center">// PREFERRED COGNITIVE MODELS</h3>
                  <div className="h-56 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.modelPreference}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {analytics.modelPreference.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1f2937", borderRadius: "10px", fontFamily: "monospace", fontSize: "10px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4 text-[10px]">
                    {analytics.modelPreference.map((pt: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span>{pt.name}</span>
                        </div>
                        <span className="text-white font-bold">{pt.value} trace sessions</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Users Management terminal interface */}
          {adminTab === "users" && (
            <div className="overflow-hidden border border-slate-900 bg-slate-950/50 rounded-2xl font-mono text-xs">
              <div className="p-4 border-b border-slate-900 bg-slate-950/30 flex justify-between items-center flex-wrap gap-2">
                <span className="font-bold text-slate-400">// ENROLLED_BIOLOGICAL_IDENTITIES ({usersList.length})</span>
                <span className="text-[10px] text-slate-500">Root credentials bypass locks are fully active.</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 text-[10px] uppercase font-semibold">
                      <th className="p-4">Explorer Profile</th>
                      <th className="p-4">Auth Coordinate Email</th>
                      <th className="p-4">Assigned Clearance</th>
                      <th className="p-4">Uplink Status</th>
                      <th className="p-4">Account Birth</th>
                      <th className="p-4 text-right">Emergency Purges</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 text-slate-300">
                    {usersList.map(u => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={u.avatar} className="w-8 h-8 rounded-full border border-purple-500/20 object-cover flex-shrink-0" alt="Avatar" />
                          <span className="font-bold text-white text-[12px]">{u.name}</span>
                        </td>
                        <td className="p-4 text-slate-400 select-text">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            u.role === UserRole.ADMIN ? "bg-purple-500/10 text-purple-300 border border-purple-500/20" : "bg-slate-900 text-slate-400"
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === UserStatus.ACTIVE ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-[10px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {u.id !== "usr_admin" && (
                              <>
                                <button
                                  onClick={() => toggleUserBan(u.id, u.status)}
                                  disabled={updatingId === u.id}
                                  className={`p-1.5 rounded-lg border border-slate-900 hover:border-red-500/30 font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                    u.status === UserStatus.ACTIVE 
                                      ? "hover:bg-red-500/10 text-red-300"
                                      : "hover:bg-emerald-500/10 text-emerald-300"
                                  }`}
                                  title={u.status === UserStatus.ACTIVE ? "Suspend user uplink" : "Reinstate user uplink"}
                                >
                                  <ShieldX className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteUser(u.id)}
                                  disabled={updatingId === u.id}
                                  className="p-1.5 rounded-lg border border-slate-900 hover:border-red-500 hover:bg-red-500/10 text-red-400 font-bold hover:scale-105 transition-all cursor-pointer"
                                  title="Permanently erase account"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Core AI Settings update */}
          {adminTab === "config" && aiSettings && (
            <div className="max-w-2xl mx-auto rounded-2xl border border-slate-900 bg-slate-950/40 p-6">
              <h3 className="font-mono text-xs text-white font-bold mb-6 tracking-wide flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                // COGNITIVE_LOGIC_PARAMETERS
              </h3>

              <form onSubmit={saveAiSettings} className="space-y-6 font-mono text-xs">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 block mb-1">DEFAULT_UPLINK_MODEL</label>
                    <select
                      value={defaultModel}
                      onChange={(e) => setDefaultModel(e.target.value)}
                      className="w-full p-3 border border-white/5 rounded-xl bg-slate-950 text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="gemini-3.5-flash">gemini-3.5-flash</option>
                      <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
                      <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">MAX_RESPONSE_TOKENS</label>
                    <input
                      type="number"
                      required
                      min={512}
                      max={8192}
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(Number(e.target.value))}
                      className="w-full p-3 border border-white/5 rounded-xl bg-slate-950 text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-400 block">CREATIVE_TEMPERATURE ({temperature})</label>
                    <span className="text-[10px] text-slate-500">Stochastic probability factor</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full Accent-purple-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                    <span>0.0 (Strictly deterministic)</span>
                    <span>1.0 (Highly synthetic)</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">GLOBAL_SYSTEM_INSTRUCTIONS</label>
                  <textarea
                    required
                    rows={4}
                    value={systemInstruction}
                    onChange={(e) => setSystemInstruction(e.target.value)}
                    className="w-full p-3.5 border border-white/5 rounded-xl bg-slate-950 text-white font-mono text-[11px] leading-relaxed focus:outline-none focus:border-purple-500/50"
                    placeholder="Instruct all AI models how to identify themselves..."
                  />
                </div>

                {/* Maintenance switch */}
                <div className="p-4 border border-slate-900 rounded-xl bg-slate-950 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">COGNITIVE_MAINTENANCE_LOCKS</span>
                    <span className="text-[10px] text-slate-500">Flipped on to guard clusters and halt non-admin requests.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="w-4 h-4 accent-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 font-bold text-white text-xs uppercase cursor-pointer rounded-xl glow-purple"
                >
                  <Cpu className="w-4 h-4" />
                  Save configurations
                </button>
              </form>
            </div>
          )}

          {/* Tab 4: Tickets Resolver */}
          {adminTab === "tickets" && (
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Left tickets selection */}
              <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-4 font-mono text-xs max-h-[600px] overflow-y-auto space-y-2">
                <span className="font-bold text-slate-400 block pb-3 border-b border-slate-900 mb-3 uppercase">// GLOBAL_TICKETS_RECORDS ({ticketsList.length})</span>
                {ticketsList.length === 0 ? (
                  <div className="text-center p-6 text-slate-500">No support tickets found in system.</div>
                ) : (
                  ticketsList.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-3 border rounded-xl cursor-pointer transition-all ${
                        selectedTicket?.id === t.id 
                          ? "border-purple-500 bg-purple-500/10" 
                          : "border-transparent bg-slate-950 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[10px] text-purple-300 font-bold">#{t.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          t.status === "Open" ? "bg-red-500/10 text-red-400" : t.status === "Replied" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <h4 className="text-white font-bold text-[11px] truncate mb-0.5">{t.subject}</h4>
                      <p className="text-[10px] text-slate-500 truncate mb-1">{t.userEmail}</p>
                      <span className="text-[9px] text-slate-600 block">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Right ticket active conversation messaging */}
              <div className="lg:col-span-2 border border-slate-900 bg-slate-950/30 rounded-2xl p-6 font-mono text-xs h-[500px] flex flex-col justify-between">
                {selectedTicket ? (
                  <>
                    <div className="border-b border-slate-900 pb-4 mb-4 flex justify-between items-start">
                      <div>
                        <span className="text-purple-400 text-[10px] font-bold uppercase tracking-wider block">ID: #{selectedTicket.id}</span>
                        <h3 className="text-white font-bold text-sm mb-1">{selectedTicket.subject}</h3>
                        <p className="text-[11px] text-slate-500">Submitted by: {selectedTicket.userEmail}</p>
                      </div>
                      {selectedTicket.status !== "Closed" && (
                        <button
                          onClick={() => closeTicket(selectedTicket.id)}
                          className="px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-400 bg-red-950/10 text-red-300 font-bold text-[10px] uppercase cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>

                    {/* Messages history */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1">
                      {selectedTicket.messages.map((m) => {
                        const isUser = m.sender === "user";
                        return (
                          <div key={m.id} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
                            <div className={`p-4 rounded-xl border max-w-[85%] text-[11px] leading-relaxed ${
                              isUser 
                                ? "bg-slate-950 border-slate-900 text-slate-300"
                                : "bg-slate-900 border-purple-500/10 text-purple-200"
                            }`}>
                              <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block mb-1">
                                {m.senderName} ({m.sender.toUpperCase()})
                              </span>
                              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{m.text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedTicket.status !== "Closed" ? (
                      <form onSubmit={submitTicketReply} className="flex gap-2.5 pt-4 border-t border-slate-900">
                        <input
                          type="text"
                          required
                          placeholder="Draft administrative responses parameters here..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 p-3 border border-white/5 rounded-xl bg-slate-950 text-white font-mono text-[10px] focus:outline-none focus:border-purple-500/50"
                        />
                        <button
                          type="submit"
                          className="px-5 bg-gradient-to-r from-purple-500 to-indigo-600 font-bold text-white text-[10px] uppercase rounded-xl cursor-pointer"
                        >
                          Transmit response
                        </button>
                      </form>
                    ) : (
                      <div className="p-4 border border-slate-900 rounded-xl bg-slate-950 text-center text-slate-500 font-black">
                        🔒 THIS CHANNEL LOG HAS BEEN SEED-RESOLVED (CLOSED)
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <CheckCircle2 className="w-10 h-10 mb-4 text-slate-600" />
                    <span>Select a support ticket node from the records on the left to verify coordinates and send replies.</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
