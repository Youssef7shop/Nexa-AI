/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, Send, Image as ImageIcon, Mic, MicOff, Trash2, Copy, 
  Sparkles, Check, Paperclip, RefreshCw, AlertCircle, Plus, ChevronLeft, Volume2, Cpu 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Chat, Message } from "../types";

export default function ChatPage() {
  const { token } = useAuth();
  
  // States
  const [threads, setThreads] = useState<Chat[]>([]);
  const [activeThread, setActiveThread] = useState<Chat | null>(null);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash");
  
  const [loading, setLoading] = useState(false);
  const [fetchingThreads, setFetchingThreads] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Audio Recording States
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load threads on load
  useEffect(() => {
    loadThreads();
  }, [token]);

  // Scroll to bottom when active message trace modifies
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeThread?.messages, loading]);

  const loadThreads = async (selectId?: string) => {
    if (!token) return;
    setFetchingThreads(true);
    try {
      const res = await fetch("/api/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setThreads(data.chats || []);
        
        // Setup initial default thread
        if (data.chats && data.chats.length > 0) {
          const defaultThread = selectId 
            ? (data.chats.find((c: Chat) => c.id === selectId) || data.chats[0])
            : data.chats[0];
          setActiveThread(defaultThread);
          setSelectedModel(defaultThread.model || "gemini-3.5-flash");
        } else {
          setActiveThread(null);
        }
      }
    } catch (err) {
      console.error("Threads load crash:", err);
    } finally {
      setFetchingThreads(false);
    }
  };

  const createNewThread = async () => {
    if (!token) return;
    setErrorMsg("");
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "New Cybernetic Thread",
          model: selectedModel,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        await loadThreads(data.chat.id);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to trigger core thread allocation.");
    }
  };

  const deleteThread = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    if (!confirm("Are you sure you want to purge this conversation log?")) return;

    try {
      const res = await fetch(`/api/chats/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setThreads(prev => prev.filter(t => t.id !== id));
        if (activeThread?.id === id) {
          setActiveThread(null);
        }
        await loadThreads();
      }
    } catch (err) {
      console.error("Critical thread deletion crash:", err);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert("Maximum image upload size coordinates truncated to 8MB max.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // HTML Audio Recording integration
  const startRecording = async () => {
    setErrorMsg("");
    setAudioUrl(null);
    audioChunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg("Recording blocked: Microphones require browser permissions or SSL coordinates.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioUrl(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all track nodes
        stream.getTracks().forEach((tk) => tk.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err: any) {
      setErrorMsg("Uplink media parameters rejected: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeThread) return;
    if (!inputText.trim() && !selectedImage && !audioUrl) return;

    setErrorMsg("");
    setLoading(true);

    const userQuery = inputText;
    const userImage = selectedImage;
    const userAudio = audioUrl;

    // Flush inputs
    setInputText("");
    setSelectedImage(null);
    setAudioUrl(null);

    // Optimistic local update to UI first
    const optimisticUserMsg: Message = {
      id: "msg_opt_" + Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: userQuery,
      image: userImage || undefined,
      voice: userAudio || undefined,
      timestamp: new Date().toISOString()
    };

    setActiveThread(prev => prev ? {
      ...prev,
      messages: [...prev.messages, optimisticUserMsg]
    } : null);

    try {
      const res = await fetch(`/api/chats/${activeThread.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          text: userQuery,
          image: userImage,
          voice: userAudio
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Sync active thread with server state returning exact answers
        setActiveThread(data.chat);
        // Refresh sidebar titles
        setThreads(prev => prev.map(t => t.id === data.chat.id ? data.chat : t));
      } else {
        throw new Error(data.error || "Cognitive core gateway timeout.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Synthesis cluster timeout.");
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex md:h-[82vh] bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl relative">
      
      {/* Thread list sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 bg-slate-950 border-r border-slate-900 flex flex-col h-full z-10"
          >
            <div className="p-4 border-b border-slate-900 flex justify-between items-center bg-slate-950/20">
              <span className="font-mono text-xs font-bold text-slate-400">// CACHED_TRACE</span>
              <button
                onClick={createNewThread}
                className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 transition-all flex items-center gap-1 font-mono text-[10px] uppercase font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                NEW_CORE
              </button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
              {fetchingThreads ? (
                <div className="p-4 text-center font-mono text-[11px] text-slate-500">PULLING STREAM RECORDS...</div>
              ) : threads.length === 0 ? (
                <div className="p-6 text-center font-mono text-[11px] text-slate-500 italic block">No active cores available. Push allocation button.</div>
              ) : (
                threads.map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveThread(t);
                      setSelectedModel(t.model || "gemini-3.5-flash");
                    }}
                    className={`group w-full flex items-center justify-between p-3 rounded-xl border font-mono text-xs text-left cursor-pointer transition-all ${
                      activeThread?.id === t.id
                        ? "border-purple-500/30 bg-purple-500/10 text-white shadow-sm"
                        : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />
                      <span className="truncate font-semibold text-[11px]">
                        {t.title || "Allocated Uplink"}
                      </span>
                    </div>
                    <button
                      onClick={(e) => deleteThread(t.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                      title="Purge session thread"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat viewer window */}
      <div className="flex-1 flex flex-col h-full bg-slate-950/20 relative">
        
        {/* Chat Control Topbar */}
        <div className="p-4 border-b border-slate-900 bg-slate-950/40 flex flex-wrap justify-between items-center gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft className={`w-4 h-4 transform transition-transform ${sidebarOpen ? "" : "rotate-180"}`} />
            </button>
            <div className="font-mono text-xs">
              <span className="text-purple-400 font-bold block">// THREAD_UPLINK</span>
              <span className="text-slate-400 text-[10px] truncate max-w-[200px] inline-block">{activeThread?.title || "Establish terminal session"}</span>
            </div>
          </div>

          {/* Model toggle selection */}
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-slate-500 uppercase font-black tracking-widest text-[9px] hidden sm:inline">COGNITIVE_MODEL:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="p-1 px-3 border border-slate-900 rounded-lg bg-slate-950 text-purple-300 focus:outline-none focus:border-purple-500/50"
            >
              <option value="gemini-3.5-flash">gemini-3.5-flash (Fast)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Smart)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Lite)</option>
            </select>
          </div>
        </div>

        {/* Message Trace scroll logs */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth select-text"
        >
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 text-red-300 font-mono text-xs flex gap-2.5 items-center">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!activeThread ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto relative px-4">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="p-4 rounded-3xl border border-purple-500/10 bg-purple-500/5 text-purple-400 mb-6">
                <Sparkles className="w-12 h-12 text-purple-400 animate-spin" />
              </div>
              <h3 className="font-display font-medium text-white text-lg tracking-wide mb-2 uppercase">Initial Neural Handshake Required</h3>
              <p className="text-slate-400 text-xs font-mono leading-relaxed mb-6">
                No session core allocated to current visual. Press "NEW CORE" in the sidebar control panel to dispatch an uplink.
              </p>
              <button
                onClick={createNewThread}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 font-bold text-white text-xs font-mono rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                EXECUTE_ALLOCATION
              </button>
            </div>
          ) : activeThread.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto p-8 font-mono">
              <Cpu className="w-8 h-8 text-purple-400 mb-4 animate-pulse" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">SYS_READY_AWAIT_FEED</span>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Send your prompt vector. Attach base64 visual references or record high-density voice logs as preferred.
              </p>
            </div>
          ) : (
            activeThread.messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div 
                  key={m.id}
                  className={`flex gap-4 p-1 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-3xl p-5 border shadow-md font-mono text-xs leading-relaxed ${
                    isUser
                      ? "bg-slate-900 border-purple-500/10 text-slate-200 rounded-tr-none"
                      : "bg-slate-950 border-white/5 text-slate-300 rounded-tl-none relative overflow-hidden"
                  }`}>
                    {/* Glowing background in AI traces */}
                    {!isUser && (
                      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-purple-500 to-indigo-500 opacity-60" />
                    )}

                    {/* Sender and Model info details */}
                    <div className="flex justify-between items-center mb-3 text-[9px] font-mono font-bold tracking-widest text-slate-500 border-b border-slate-900/40 pb-2 uppercase text-[10px]">
                      <span>{isUser ? "EXPLORER_UPLINK" : `SENTIENT_CORE (${selectedModel})`}</span>
                      <span className="text-[9px] lowercase font-normal">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>

                    {/* Renders image attachments */}
                    {m.image && (
                      <div className="mb-3.5 rounded-xl overflow-hidden border border-slate-900">
                        <img src={m.image} alt="Trace upload attachment" className="max-h-56 object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    {/* Renders custom voice streams */}
                    {m.voice && (
                      <div className="mb-3.5 p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 items-center flex gap-2.5">
                        <Volume2 className="w-4 h-4 text-blue-400 flex-shrink-0 animate-pulse" />
                        <audio src={m.voice} controls className="h-6 w-full max-w-[200px]" />
                        <span className="text-[9px] text-blue-300 font-mono">VOICE_LOG.WAV</span>
                      </div>
                    )}

                    {/* Main payload text */}
                    <div id={`text_${m.id}`} className="whitespace-pre-wrap select-text leading-relaxed text-[11px] text-slate-300">
                      {m.text}
                    </div>

                    {/* Access Action tools */}
                    <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-900/30">
                      <button
                        onClick={() => copyMessage(m.text, m.id)}
                        className={`p-1 rounded text-slate-500 hover:text-slate-300 transition-all cursor-pointer`}
                        title="Copy text logs"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing indicators */}
          {loading && (
            <div className="flex gap-4 justify-start p-1 font-mono text-xs">
              <div className="max-w-[85%] rounded-3xl p-5 border border-white/5 bg-slate-950 text-slate-300 rounded-tl-none relative overflow-hidden flex items-center gap-3">
                <div className="absolute top-0 left-0 w-2 h-full bg-purple-500/60 animate-pulse" />
                <Cpu className="w-4 h-4 text-purple-400 animate-spin" />
                <span className="text-[10px] text-purple-300 uppercase font-black">SYNTHESIZING MATRIX RESPONSES...</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:200ms]" />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:400ms]" />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input trace form controls */}
        {activeThread && (
          <div className="p-4 border-t border-slate-900 bg-slate-950/60 relative z-10">
            <form onSubmit={handleSendMessage} className="space-y-3 font-mono text-xs">
              
              {/* Preview parameters */}
              <div className="flex flex-wrap gap-2">
                {selectedImage && (
                  <div className="relative p-1 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                    <img src={selectedImage} alt="Attachment mockup preview" className="w-10 h-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                    <span className="text-[9px] text-slate-400 font-mono">IMAGE_ATTACHED</span>
                    <button 
                      type="button" 
                      onClick={() => setSelectedImage(null)}
                      className="p-1 rounded bg-red-950/20 text-red-400 text-[10px] uppercase font-bold hover:bg-red-950/40 cursor-pointer"
                    >
                      Purge
                    </button>
                  </div>
                )}

                {audioUrl && (
                  <div className="relative p-2 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-[9px] text-slate-300 font-mono">VOICE_CAPTURED</span>
                    <button 
                      type="button" 
                      onClick={() => setAudioUrl(null)}
                      className="p-1 rounded bg-red-950/20 text-red-400 text-[10px] uppercase font-bold hover:bg-red-950/40 cursor-pointer"
                    >
                      Purge
                    </button>
                  </div>
                )}
              </div>

              {/* Console Prompt container bar */}
              <div className="relative flex items-center">
                
                {/* Visual attachments */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 border border-slate-900 rounded-xl bg-slate-950 text-slate-400 hover:text-white transition-all cursor-pointer hover:border-slate-800"
                  title="Attach screenshot mapping"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <input
                  type="text"
                  required={!selectedImage && !audioUrl}
                  placeholder="Draft system queries or prompts here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent border-none focus:outline-none focus:ring-0 text-white font-mono text-xs px-4"
                  disabled={loading}
                />

                {/* Voice message interaction */}
                {recording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="p-3 border border-red-500/30 rounded-xl bg-red-950/20 text-red-400 animate-pulse transition-all cursor-pointer"
                    title="Stop Voice uplink"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="p-3 border border-slate-900 rounded-xl bg-slate-950 text-blue-400 hover:text-blue-300 transition-all cursor-pointer hover:border-slate-800"
                    title="Initialize Voice uplink"
                  >
                    <MicOff className="w-4 h-4 text-slate-500" />
                  </button>
                )}

                {/* Submit query */}
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-2 p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white hover:scale-105 active:scale-95 transition-all shadow-md group cursor-pointer"
                >
                  <Send className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <div className="text-[10px] text-slate-600 flex justify-between px-1.5 font-mono">
                <span>SECURED AES_256 SHAKE_HANDS</span>
                <span>MAX_UPLINK: 8MB DATA VECTOR</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
