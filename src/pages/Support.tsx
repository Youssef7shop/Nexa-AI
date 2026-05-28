/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Ticket, AlertTriangle, ShieldCheck, Mail, Send, HelpCircle, 
  MessageCircle, Clock, Loader, Plus, AlertCircle, ChevronRight, CornerDownRight 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Ticket as TicketType } from "../types";

export default function Support() {
  const { token, user } = useAuth();
  
  // Data State
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  
  // Form coordinates
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [replyText, setReplyText] = useState("");
  
  // UI Coordinates
  const [loading, setLoading] = useState(true);
  const [ticketSubmitLoading, setTicketSubmitLoading] = useState(false);
  const [replySubmitLoading, setReplySubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (token) {
      loadTickets();
    }
  }, [token]);

  const loadTickets = async (selectId?: string) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/support/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets || []);
        
        // Select logic
        if (data.tickets && data.tickets.length > 0) {
          const defaultTicket = selectId 
            ? (data.tickets.find((t: any) => t.id === selectId) || data.tickets[0])
            : data.tickets[0];
          setSelectedTicket(defaultTicket);
        } else {
          setSelectedTicket(null);
        }
      }
    } catch (err) {
      console.error("Support records load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;
    setErrorMsg("");
    setSuccessMsg("");
    setTicketSubmitLoading(true);

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create support thread.");

      setSubject("");
      setDescription("");
      setSuccessMsg("Support ticket successfully files in systemregisters!");
      setShowCreateForm(false);
      await loadTickets(data.ticket.id);
      
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to finalize ticket transmission.");
    } finally {
      setTicketSubmitLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    setErrorMsg("");
    setReplySubmitLoading(true);

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
      // Sync update back to list
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? data.ticket : t));
    } catch (err: any) {
      setErrorMsg(err.message || "Uplink response dispatch aborted.");
    } finally {
      setReplySubmitLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Dynamic Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-900">
        <div>
          <span className="text-xs font-mono text-purple-400 font-extrabold uppercase tracking-widest block mb-1">
            // SUPPORT_PORTAL_CORE_ONLINE
          </span>
          <h1 className="text-3xl font-bold font-display text-white">Support Handshakes</h1>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setErrorMsg("");
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 hover:border-purple-500/50 text-purple-300 font-mono text-xs uppercase font-bold transition-all cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" />
          {showCreateForm ? "ACTIVE_CHANNEL" : "FILE_TICKET"}
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs font-mono flex items-center gap-2.5">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 text-xs font-mono flex items-center gap-2.5">
          <AlertCircle className="w-4.5 h-4.5 text-red-400 flex-shrink-0 animate-bounce" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-10 h-10 text-purple-500 animate-spin" />
            <span className="font-mono text-xs text-slate-500">PULLING BIOLOGICAL COMMUNICATIONS OVERVIEW...</span>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 select-text">
          
          {/* Create ticket form drawer/container */}
          {showCreateForm ? (
            <div className="lg:col-span-3 rounded-2xl border border-slate-900 bg-slate-950/60 p-6 max-w-2xl mx-auto w-full">
              <h2 className="font-display font-medium text-lg text-white mb-6 uppercase">// FILE_SUPPORT_COORDINATES</h2>
              
              <form onSubmit={handleCreateTicket} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Subject Title</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Rate limits, account parameters reset..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3 border border-white/5 rounded-xl bg-slate-950 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Detailed Description of Coordinates</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your issue with clarity as possible..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3.5 border border-white/5 rounded-xl bg-slate-950 text-white focus:outline-none focus:border-purple-500/50 leading-relaxed"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={ticketSubmitLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl font-bold text-white uppercase tracking-wider cursor-pointer shadow-md text-xs"
                  >
                    {ticketSubmitLoading ? (
                      <>
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                        TRANSMITTING...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        SUBMIT_TICKET
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 border border-slate-900 bg-slate-950 text-slate-300 font-bold uppercase rounded-xl text-xs hover:bg-slate-900"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Left sidebar listing user tickets */}
              <div className="border border-slate-900 bg-slate-950/40 rounded-3xl p-4 font-mono text-xs max-h-[550px] overflow-y-auto space-y-2">
                <span className="font-bold text-slate-400 block pb-3 border-b border-slate-900 mb-3 uppercase">// MY_SUPPORT_FILES ({tickets.length})</span>
                {tickets.length === 0 ? (
                  <div className="text-center p-6 text-slate-500 italic block">No active support channels. Press "FILE_TICKET" above.</div>
                ) : (
                  tickets.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-3.5 border rounded-xl cursor-pointer transition-all ${
                        selectedTicket?.id === t.id 
                          ? "border-purple-500 bg-purple-500/10 text-white" 
                          : "border-transparent bg-slate-950 hover:bg-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[9px] text-purple-300 font-bold">#{t.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                          t.status === "Open" ? "bg-red-500/10 text-red-400" : t.status === "Replied" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-[11px] truncate">{t.subject}</h4>
                      <span className="text-[9px] text-slate-600 block mt-1">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Major ticket message trace window */}
              <div className="lg:col-span-2 border border-slate-900 bg-slate-950/20 rounded-3xl p-6 font-mono text-xs h-[500px] flex flex-col justify-between">
                {selectedTicket ? (
                  <>
                    <div className="border-b border-slate-900 pb-4 mb-4 flex justify-between items-start">
                      <div>
                        <span className="text-purple-400 text-[10px] font-black uppercase block">TICKET #{selectedTicket.id}</span>
                        <h3 className="text-white font-bold text-sm mb-1">{selectedTicket.subject}</h3>
                        <p className="text-[11px] text-slate-500">Status: <span className="text-purple-300 font-bold">{selectedTicket.status}</span></p>
                      </div>
                    </div>

                    {/* Messages history logs */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1">
                      {selectedTicket.messages.map((m) => {
                        const isUser = m.sender === "user";
                        return (
                          <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                            <div className={`p-4 rounded-2xl border max-w-[85%] text-[11px] leading-relaxed relative overflow-hidden ${
                              isUser 
                                ? "bg-slate-900 border-slate-900 text-slate-300"
                                : "bg-slate-950 border-purple-500/15 text-purple-200"
                            }`}>
                              {!isUser && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50" />
                              )}
                              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wide block mb-1">
                                {m.senderName} ({m.sender.toUpperCase()})
                              </span>
                              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{m.text}</p>
                              <span className="text-[8px] text-slate-600 block text-right mt-1.5">{new Date(m.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reply sending container box */}
                    {selectedTicket.status !== "Closed" ? (
                      <form onSubmit={handleReplySubmit} className="flex gap-2 text-xs">
                        <input
                          type="text"
                          required
                          placeholder="Draft message to support admin..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 p-3.5 border border-white/5 rounded-xl bg-slate-950 text-white font-mono text-[11px] focus:outline-none focus:border-purple-500/50"
                        />
                        <button
                          type="submit"
                          disabled={replySubmitLoading}
                          className="px-5 bg-gradient-to-r from-purple-500 to-indigo-600 font-bold text-white font-mono rounded-xl hover:scale-105 transition-all uppercase cursor-pointer"
                        >
                          Send
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
                    <MessageCircle className="w-10 h-10 mb-4 text-slate-600 animate-pulse" />
                    <span>Select an active support channel from the left sidebar to coordinate messages or review administration logs.</span>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}
