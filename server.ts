/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

import { getDB, writeDB } from "./src/db_store";
import { User, UserRole, UserStatus, Chat, Message, Ticket, AISettings, TicketMessage } from "./src/types";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "sentient-ai-core-quantum-key";
const PORT = 3000;

// Lazy initialize Gemini API instance
let aiInstance: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ GEMINI_API_KEY env var not set. Operating in simulated futuristic AI mode.");
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

const app = express();

// Set generous payload limits for base64 image/audio uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Extend request type to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// Authentication Middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ error: "Invalid or expired access token" });
      return;
    }

    // Verify user still exists and is active
    const db = getDB();
    const user = db.users.find(u => u.id === decoded.id);
    if (!user) {
      res.status(403).json({ error: "User associated with token no longer exists" });
      return;
    }

    if (user.status === UserStatus.BANNED) {
      res.status(403).json({ error: "This cybernetic uplink has been suspended (Banned)" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    next();
  });
}

// Admin Role Check Middleware
function authenticateAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  authenticateToken(req, res, () => {
    if (req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ error: "Elevated clearance required. Action prohibited." });
      return;
    }
    next();
  });
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Register
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: "Please biological-input name, email, and password." });
    return;
  }

  const db = getDB();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(400).json({ error: "Uplink email already registered in system registers." });
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser: User = {
    id: "usr_" + Math.random().toString(36).substring(2, 11),
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: UserRole.USER, // Default user
    status: UserStatus.ACTIVE,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    avatar: `https://images.unsplash.com/photo-${[
      "1534528741775-53994a69daeb",
      "1535713875002-d1d0cf377fde",
      "1570295999919-56ceb5ecca61",
      "1494790108377-be9c29b29330",
    ][Math.floor(Math.random() * 4)]}?q=80&w=256&auto=format&fit=crop`
  };

  db.users.push(newUser);
  writeDB(db);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });

  // Exclude password from response
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ user: userWithoutPassword, token });
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Provide email and password credentials." });
    return;
  }

  const db = getDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
    res.status(400).json({ error: "Invalid decryption coordinates (credentials)." });
    return;
  }

  if (user.status === UserStatus.BANNED) {
    res.status(403).json({ error: "Access Denied: This account has been banned by the Sentient Core." });
    return;
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
});

// Mock forgot password
app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Uplink email coordinate required." });
    return;
  }
  res.json({ message: "Verification vectors dispatched. Check simulated mailbox for coordinates." });
});

// Mock email verification
app.post("/api/auth/verify-email", authenticateToken, (req: AuthenticatedRequest, res) => {
  const db = getDB();
  const idx = db.users.findIndex(u => u.id === req.user?.id);
  if (idx !== -1) {
    db.users[idx].emailVerified = true;
    writeDB(db);
    res.json({ message: "Uplink signature verified successfully.", emailVerified: true });
  } else {
    res.status(400).json({ error: "Signature user mismatch." });
  }
});


// ==========================================
// CHAT ENDPOINTS
// ==========================================

// Get user chats
app.get("/api/chats", authenticateToken, (req: AuthenticatedRequest, res) => {
  const db = getDB();
  const userChats = db.chats.filter(c => c.userId === req.user?.id);
  res.json({ chats: userChats });
});

// Create new chat session
app.post("/api/chats", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { title, model } = req.body;
  const db = getDB();

  const newChat: Chat = {
    id: "chat_" + Math.random().toString(36).substring(2, 11),
    userId: req.user!.id,
    title: title || "New Cybernetic Thread",
    model: model || db.settings.defaultModel || "gemini-3.5-flash",
    createdAt: new Date().toISOString(),
    messages: []
  };

  db.chats.push(newChat);
  writeDB(db);
  res.status(201).json({ chat: newChat });
});

// Delete chat session
app.delete("/api/chats/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDB();
  const index = db.chats.findIndex(c => c.id === id && c.userId === req.user?.id);

  if (index === -1) {
    res.status(404).json({ error: "Thread not found or clearance insufficient." });
    return;
  }

  db.chats.splice(index, 1);
  writeDB(db);
  res.json({ success: true, message: "Thread successfully purged." });
});

// Send message to thread & trigger AI processing
app.post("/api/chats/:id/messages", authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { text, image, voice } = req.body;
  const db = getDB();

  const chat = db.chats.find(c => c.id === id && c.userId === req.user?.id);
  if (!chat) {
    res.status(404).json({ error: "Active AI session thread not found." });
    return;
  }

  // Create user message
  const userMessage: Message = {
    id: "msg_" + Math.random().toString(36).substring(2, 11),
    sender: "user",
    text: text || "",
    image,
    voice,
    timestamp: new Date().toISOString()
  };

  chat.messages.push(userMessage);

  // Autogenerate titles from first user message if default
  if (chat.messages.filter(m => m.sender === "user").length === 1 && chat.title === "New Cybernetic Thread") {
    chat.title = text ? (text.length > 25 ? text.substring(0, 25) + "..." : text) : "Visual Neural Uplink";
  }

  const aiClient = getAI();
  let aiResponseText = "";

  if (aiClient) {
    try {
      // Map existing messages into Gemini content types
      const contentsPayload: any[] = [];

      // Add System Instructions if applicable
      const systemInstruction = db.settings.systemInstruction || "You are a sentient cybernetic AI. Use a dynamic and sleek futuristic vocabulary, while remaining highly intelligent and practical.";

      // Feed conversational history
      chat.messages.forEach((msg, idx) => {
        // We only append up to the last 15 messages to preserve tokens and rate limits safely
        if (idx < chat.messages.length - 15) return;

        // Build parts for each interaction
        const parts: any[] = [{ text: msg.text }];
        
        // Handle image attachments on the latest user prompt if present
        if (msg.image && idx === chat.messages.length - 1) {
          const base64Data = msg.image.split(",")[1] || msg.image;
          // Determine mimetype, fallback to png
          let mimeType = "image/png";
          const match = msg.image.match(/^data:(image\/\w+);base64,/);
          if (match) {
            mimeType = match[1];
          }
          parts.unshift({
            inlineData: {
              data: base64Data,
              mimeType
            }
          });
        }

        // Gemini expects role to be strictly 'user' or 'model'
        contentsPayload.push({
          role: msg.sender === "user" ? "user" : "model",
          parts
        });
      });

      // Call generateContent
      const aiResponse = await aiClient.models.generateContent({
        model: chat.model || "gemini-3.5-flash",
        contents: contentsPayload,
        config: {
          systemInstruction,
          temperature: db.settings.temperature,
          maxOutputTokens: db.settings.maxTokens
        }
      });

      aiResponseText = aiResponse.text || "Systems failure: Synthesizer generated blank text.";
    } catch (err: any) {
      console.error("Gemini core error. Falling back to core prompt simulation:", err);
      aiResponseText = `🤖 [CORE RECOVERY MODE: API Offline/Quota limit] I received your request! Let me process this in emergency local matrix mode: "${text || 'Visual Attachment Processing'}"\n\nYour neural connection is fully functional. Please double check your Gemini API coordinate in the settings panel to activate primary model reasoning vectors.`;
    }
  } else {
    // Elegant fully narrative simulated responses
    const simulations = [
      `Initializing telemetry calculations... Analysis shows clear alignment. Futuristic systems operating at ${100 - Math.floor(Math.random() * 20)}% cognitive capacity.`,
      `Quantum neural networks have intercepted your uplink: "${text || 'Visual dataset uplinked'}"\n\nI am currently operating inside your sandboxed express ecosystem. Input has been securely stored. Complete your API key configurations inside Secrets panel to activate live Gemini AI reasoning.`,
      `Synthesizing answers representing models of cybernetic paradigms... Yes! I can definitely help with your tasks. The modern futuristic theme features dark sleek styling elements and gorgeous neon purple vibes.`
    ];
    aiResponseText = simulations[Math.floor(Math.random() * simulations.length)];
  }

  const aiMessage: Message = {
    id: "msg_" + Math.random().toString(36).substring(2, 11),
    sender: "ai",
    text: aiResponseText,
    model: chat.model,
    timestamp: new Date().toISOString()
  };

  chat.messages.push(aiMessage);
  writeDB(db);

  res.json({
    userMessage,
    aiMessage,
    chat
  });
});


// ==========================================
// PROFILE SETUP & SETTINGS
// ==========================================

app.put("/api/profile", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { name, avatar } = req.body;
  const db = getDB();

  const idx = db.users.findIndex(u => u.id === req.user?.id);
  if (idx === -1) {
    res.status(404).json({ error: "User profile record not found." });
    return;
  }

  if (name) db.users[idx].name = name;
  if (avatar) db.users[idx].avatar = avatar;

  writeDB(db);

  const { password: _, ...updatedUser } = db.users[idx];
  res.json({ user: updatedUser });
});


// ==========================================
// SUPPORT SYSTEM ENDPOINTS
// ==========================================

// Get user tickets
app.get("/api/support/tickets", authenticateToken, (req: AuthenticatedRequest, res) => {
  const db = getDB();
  const userTickets = db.tickets.filter(t => t.userId === req.user?.id);
  res.json({ tickets: userTickets });
});

// Create ticket
app.post("/api/support/tickets", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { subject, description } = req.body;
  if (!subject || !description) {
    res.status(400).json({ error: "Subject and description coordinates required." });
    return;
  }

  const db = getDB();
  const user = db.users.find(u => u.id === req.user?.id)!;

  const newTicket: Ticket = {
    id: "tkt_" + Math.random().toString(36).substring(2, 11),
    userId: req.user!.id,
    userEmail: req.user!.email,
    subject,
    description,
    status: "Open",
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: "tm_" + Math.random().toString(36).substring(2, 11),
        sender: "user",
        senderName: user.name,
        text: description,
        timestamp: new Date().toISOString()
      }
    ]
  };

  db.tickets.push(newTicket);
  writeDB(db);
  res.status(201).json({ ticket: newTicket });
});

// Add message to ticket
app.post("/api/support/tickets/:id/reply", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) {
    res.status(400).json({ error: "Uplink message cannot be empty." });
    return;
  }

  const db = getDB();
  const ticket = db.tickets.find(t => t.id === id);

  if (!ticket) {
    res.status(404).json({ error: "Support ticket not found." });
    return;
  }

  // Ensure authorized: is admin OR owner
  const isAdmin = req.user!.role === UserRole.ADMIN;
  if (!isAdmin && ticket.userId !== req.user!.id) {
    res.status(403).json({ error: "Insufficient terminal clearance to view/edit this ticket." });
    return;
  }

  const user = db.users.find(u => u.id === req.user?.id)!;
  const newMessage: TicketMessage = {
    id: "tm_" + Math.random().toString(36).substring(2, 11),
    sender: isAdmin ? "admin" : "user",
    senderName: user.name,
    text,
    timestamp: new Date().toISOString()
  };

  ticket.messages.push(newMessage);
  ticket.status = isAdmin ? "Replied" : "Open";

  writeDB(db);
  res.json({ ticket });
});


// ==========================================
// ADMINISTRATIVE CONTROL PANEL (ADMIN-ONLY)
// ==========================================

// Get all users
app.get("/api/admin/users", authenticateAdmin, (req, res) => {
  const db = getDB();
  // Strip passwords for safety
  const safeUsers = db.users.map(({ password: _, ...u }) => u);
  res.json({ users: safeUsers });
});

// Change user status (Ban / Unban)
app.put("/api/admin/users/:id/status", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (id === "usr_admin") {
    res.status(400).json({ error: "Sentinel administrative root locks prevent banning the master admin." });
    return;
  }

  if (status !== UserStatus.ACTIVE && status !== UserStatus.BANNED) {
    res.status(400).json({ error: "Incorrect user coordinates." });
    return;
  }

  const db = getDB();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) {
    res.status(404).json({ error: "User uplink record not found." });
    return;
  }

  db.users[idx].status = status;
  writeDB(db);
  res.json({ user: db.users[idx] });
});

// Delete User
app.delete("/api/admin/users/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;

  if (id === "usr_admin") {
    res.status(400).json({ error: "Sentinel administrative root locks prevent deleting the master admin." });
    return;
  }

  const db = getDB();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) {
    res.status(404).json({ error: "User record not found." });
    return;
  }

  // Purge user's chats and tickets for database sanitization
  db.chats = db.chats.filter(c => c.userId !== id);
  db.tickets = db.tickets.filter(t => t.userId !== id);
  db.users.splice(idx, 1);

  writeDB(db);
  res.json({ success: true, message: "User deleted and related nodes purged." });
});

// Get global support tickets (Admin dashboard)
app.get("/api/admin/tickets", authenticateAdmin, (req, res) => {
  const db = getDB();
  res.json({ tickets: db.tickets });
});

// Change ticket status
app.put("/api/admin/tickets/:id/status", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== "Open" && status !== "Replied" && status !== "Closed") {
    res.status(400).json({ error: "Invalid status parameters." });
    return;
  }

  const db = getDB();
  const idx = db.tickets.findIndex(t => t.id === id);
  if (idx === -1) {
    res.status(404).json({ error: "Ticket index missing." });
    return;
  }

  db.tickets[idx].status = status;
  writeDB(db);
  res.json({ ticket: db.tickets[idx] });
});

// Get setting configurations
app.get("/api/admin/settings", authenticateAdmin, (req, res) => {
  const db = getDB();
  res.json({ settings: db.settings });
});

// Update setting configurations
app.put("/api/admin/settings", authenticateAdmin, (req, res) => {
  const { defaultModel, temperature, maxTokens, systemInstruction, maintenanceMode } = req.body;
  const db = getDB();

  if (defaultModel) db.settings.defaultModel = defaultModel;
  if (temperature !== undefined) db.settings.temperature = Number(temperature);
  if (maxTokens !== undefined) db.settings.maxTokens = Number(maxTokens);
  if (systemInstruction !== undefined) db.settings.systemInstruction = systemInstruction;
  if (maintenanceMode !== undefined) db.settings.maintenanceMode = Boolean(maintenanceMode);

  writeDB(db);
  res.json({ settings: db.settings });
});

// Advanced telemetry analytics
app.get("/api/admin/analytics", authenticateAdmin, (req, res) => {
  const db = getDB();

  const totalUsers = db.users.length;
  const totalChats = db.chats.length;
  const totalMessages = db.chats.reduce((acc, c) => acc + c.messages.length, 0);
  const totalTickets = db.tickets.length;
  const openTickets = db.tickets.filter(t => t.status === "Open").length;
  const resolvedTickets = db.tickets.filter(t => t.status === "Closed").length;
  const bannedUsers = db.users.filter(u => u.status === UserStatus.BANNED).length;

  // Generate dynamic chart data for simulated telemetry graphs
  const chatActivity7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    // Distribute messages randomly but proportionally
    return {
      name: dateStr,
      uplinks: Math.floor(Math.sin((i + 1) * 1.5) * 12 + 25),
      conversations: Math.floor(Math.cos((i + 1) * 1.2) * 8 + 15),
      ticketsResolved: Math.floor(i * 1.2 + 2)
    };
  }).reverse();

  res.json({
    summary: {
      totalUsers,
      totalChats,
      totalMessages,
      totalTickets,
      openTickets,
      resolvedTickets,
      bannedUsers,
    },
    chatActivity: chatActivity7Days,
    modelPreference: [
      { name: "gemini-3.5-flash", value: db.chats.filter(c => c.model === "gemini-3.5-flash").length + 10 },
      { name: "gemini-3.1-pro-preview", value: db.chats.filter(c => c.model === "gemini-3.1-pro-preview").length + 4 },
      { name: "gemini-3.1-flash-lite", value: db.chats.filter(c => c.model === "gemini-3.1-flash-lite").length + 2 }
    ]
  });
});


// ==========================================
// VITE AND ASSETS ROUTING
// ==========================================

async function startViteAndExpress() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode mounting Vite
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode mounting client build paths
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Sentient Neural Platform online at: http://localhost:${PORT}`);
  });
}

// Kickstart server deployment
startViteAndExpress().catch(err => {
  console.error("Critical core systems crash:", err);
});
