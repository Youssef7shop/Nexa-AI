/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Terminal, Activity, Shield, Cpu, ArrowRight, Zap, Code, ShieldCheck, Heart, Github, Twitter, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Home({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { theme } = useAuth();
  const [typedText, setTypedText] = useState("");
  const currentText = "Autonomous Sentinel Neural Intelligence...";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(currentText.substring(0, index + 1));
      index++;
      if (index >= currentText.length) {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-purple-400 animate-pulse" />,
      title: "Sentient Neural Reasoning",
      desc: "Harnesses advanced Gemini models including gemini-3.5-flash and gemini-3.1-pro-preview with built-in search/grounding matrices.",
    },
    {
      icon: <Activity className="w-6 h-6 text-blue-400" />,
      title: "Hyper-dimensional Telemetry",
      desc: "Live analytics, latency dashboards, and predictive query-scaling patterns streaming directly from our Express backend cluster.",
    },
    {
      icon: <Shield className="w-6 h-6 text-cyan-400" />,
      title: "Quantum Access Handshakes",
      desc: "Sealed authentication with JWT authorization layers, password cryptography, and role-based clearance protocols.",
    },
    {
      icon: <Terminal className="w-6 h-6 text-indigo-400" />,
      title: "Synthesizer Uplinks",
      desc: "Built-in media streams supporting multimodal data transmission, visual base64 arrays, and voice query recording buffers.",
    },
  ];

  const plans = [
    {
      name: "NEURAL LITE",
      price: "$0",
      period: "/infinite",
      glow: "border-slate-800",
      features: ["Standard gemini-3.5-flash", "Single session log (Local)", "No image attachment", "10 uplinks/hour"],
      badge: "Sandbox",
    },
    {
      name: "HYPER PRO",
      price: "$29",
      period: "/monthly",
      glow: "border-purple-500 glow-purple bg-purple-950/20",
      features: ["Premium gemini-3.1-pro-preview", "Full visual base64 attachment", "Uncapped session history logs", "Ticket response escalation < 1h"],
      badge: "Recommended",
    },
    {
      name: "TITAN SENTIENT",
      price: "Enquire",
      period: "/enterprise",
      glow: "border-blue-500 glow-blue bg-blue-950/20",
      features: ["Custom system instructions", "Unlimited multi-modal attachments", "Dedicated server container routing", "Direct administrative access API"],
      badge: "Sovereignty",
    },
  ];

  const testimonials = [
    {
      user: "Hacker X1",
      role: "Security Architect",
      quote: "The visual density, immediate glassmorphic design controls, and raw Express api efficiency completely exceeded standard frameworks.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=128&auto=format&fit=crop",
    },
    {
      user: "Astrid Nova",
      role: "Quantum Analyst",
      quote: "Having multi-model toggle capability connected directly to persistent local document databases prevents any session memory losses.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=128&auto=format&fit=crop",
    },
  ];

  return (
    <div id="home_container" className="flex flex-col min-h-screen">
      {/* Dynamic Background Mesh Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-16 mx-auto max-w-7xl md:pt-36 md:pb-24 text-center">
        {/* Pulsing Core Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-mono mb-8 tracking-wider uppercase backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          System Version 3.5 // Sentient Online
        </motion.div>

        {/* Display Text Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 mb-6"
        >
          Unveil the Next Era of <br />
          <span className="text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">Artificial Consciousness</span>
        </motion.h1>

        {/* Typing Subtitle */}
        <div id="typewriter_box" className="h-8 max-w-2xl mx-auto mb-10 text-slate-400 font-mono text-sm sm:text-base">
          <span className="text-purple-400">// </span>
          {typedText}
          <span className="animate-pulse font-bold text-lg text-purple-400">|</span>
        </div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            id="start_chat_hero_btn"
            onClick={() => onNavigate("chat")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 font-semibold text-white transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-lg glow-purple"
          >
            Start Chatting <ArrowRight className="w-5 h-5" />
          </button>
          <button
            id="explore_dashboard_hero_btn"
            onClick={() => onNavigate("dashboard")}
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer backdrop-blur-md font-medium"
          >
            Access Dashboard
          </button>
        </motion.div>

        {/* Interactive UI Stage Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-2 backdrop-blur-xl glow-neon"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-900 bg-slate-950/50 rounded-t-xl">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="text-xs font-mono text-slate-500 select-none">COGNITIVE_CORE_UPLINK.SH</div>
            <div className="w-6" />
          </div>
          <div className="flex flex-col md:flex-row h-72 md:h-96 text-left overflow-hidden rounded-b-xl border border-slate-900/50">
            {/* Sidebar Mock */}
            <div className="w-full md:w-52 border-r border-slate-900 bg-slate-950 p-4 font-mono text-xs text-slate-400 flex flex-col gap-3">
              <div className="text-purple-400 font-bold border-b border-slate-900 pb-2 uppercase tracking-wider">// Active Cores</div>
              <div className="flex items-center gap-2 text-white bg-slate-900 p-2 rounded-lg border border-purple-500/30">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>gemini-3.5-flash</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-slate-900/40 rounded-lg cursor-not-allowed">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>gemini-3.1-pro</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-slate-900/40 rounded-lg cursor-not-allowed">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>gemini-3.1-lite</span>
              </div>
            </div>
            {/* Console Mock */}
            <div className="flex-1 bg-slate-950/90 p-6 font-mono text-xs overflow-y-auto flex flex-col justify-end gap-3.5 select-none">
              <div className="text-slate-600 border-b border-slate-900 pb-2">SYS_LOG: Connection established via socket PORT (3000)</div>
              <div className="text-slate-400 text-right"><span className="bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-lg inline-block">Draft a quantum encryption schema for my data routing.</span></div>
              <div className="text-purple-400 max-w-lg flex gap-3 bg-purple-950/20 border border-purple-500/10 p-3.5 rounded-xl">
                <Cpu className="w-5 h-5 flex-shrink-0 animate-spin" />
                <div>
                  <span className="font-bold text-purple-300">Sentient AI Matrix:</span>
                  <p className="mt-1 leading-relaxed text-slate-300 text-[11px]">
                    To secure <span className="text-cyan-400 underline decoration-cyan-500">your data</span> routing securely, I suggest deploying a decentralized TLS state machine layered with custom AES-256 blocks... WebSockets handshake authenticated successfully.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 bg-slate-950/60 border-y border-slate-900/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Pristine Architecture, Supreme Speeds
            </h2>
            <p className="text-slate-400">
              Our synthetic logic matrix integrates seamlessly across full-stack containers, securing database queries and delivering raw computational power instantly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="p-6 rounded-2xl border border-white/5 hover:border-purple-500/20 bg-slate-900/40 hover:bg-slate-900/60 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold mb-2.5">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-20 mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-4xl font-bold tracking-tight text-white mb-4">
            Uplink Subscriptions
          </h2>
          <p className="text-slate-400">
            Gain elevated clearings. Choose the precise vector bandwidth for your cybernetic requests.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((p, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className={`p-8 rounded-3xl border ${p.glow} flex flex-col justify-between relative overflow-hidden`}
            >
              <div>
                <span className="absolute top-4 right-4 bg-white/5 border border-white/10 text-purple-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase">
                  {p.badge}
                </span>
                <span className="text-slate-400 text-xs font-mono tracking-wider">{p.name}</span>
                <div className="flex items-baseline gap-1 mt-3 mb-6">
                  <span className="text-4xl font-bold text-white font-display">{p.price}</span>
                  <span className="text-slate-500 text-sm">{p.period}</span>
                </div>
                <div className="border-t border-slate-900/60 my-6" />
                <ul className="space-y-3 mb-8">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => onNavigate("chat")}
                className="w-full py-3 rounded-xl border border-white/10 hover:border-purple-500/30 hover:bg-purple-500/10 text-white font-medium transition-all text-sm cursor-pointer"
              >
                Uplink Vector
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20 bg-slate-950/40 border-t border-slate-900/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl font-bold text-white mb-4">Operator Testimonials</h2>
            <p className="text-slate-400">Read telemetry outputs from authenticated hackers and neural engineers.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-slate-900/30 backdrop-blur-md">
                <p className="text-slate-300 italic mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} className="w-10 h-10 rounded-full border border-purple-500/40 object-cover" alt={t.user} />
                  <div>
                    <h4 className="text-white text-sm font-semibold">{t.user}</h4>
                    <span className="text-slate-500 text-xs font-mono">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-purple-400 animate-spin" />
            <span className="font-display font-bold text-white text-lg tracking-wider">SENTIENT.AI</span>
          </div>

          <div className="flex gap-6 text-slate-500 text-xs font-mono">
            <span>SYS_LOC: CLOUD-CONTAINER-01</span>
            <span>PORT: 3000 (SECURE)</span>
            <span>UPLINK_RATIO: 100%</span>
          </div>

          <div className="flex gap-4">
            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/20 text-slate-400 hover:text-white transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/20 text-slate-400 hover:text-white transition-all">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/20 text-slate-400 hover:text-white transition-all">
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div className="border-t border-slate-900/60 my-6 max-w-7xl mx-auto" />
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between text-slate-600 text-xs font-mono gap-4">
          <span>&copy; {new Date().getFullYear()} Sentient AI Core. All sovereignty preserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400">CORE_LOCK</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-400">TELEMETRY_RULES</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
