/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { User, Chat, Ticket, AISettings, UserRole, UserStatus } from "./types.js";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db-store.json");

interface DBStructure {
  users: User[];
  chats: Chat[];
  tickets: Ticket[];
  settings: AISettings;
}

// In-memory cache helper
let dbCache: DBStructure | null = null;

function ensureDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    // Generate default seed credentials
    const adminPasswordHash = bcrypt.hashSync("admin", 10);
    const userPasswordHash = bcrypt.hashSync("password", 10);

    const defaultDB: DBStructure = {
      users: [
        {
          id: "usr_admin",
          name: "Neo Administrator",
          email: "admin@gemini.ai",
          password: adminPasswordHash,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
        },
        {
          id: "usr_generic",
          name: "Seraph Explorer",
          email: "user@gemini.ai",
          password: userPasswordHash,
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop"
        }
      ],
      chats: [
        {
          id: "chat_demo",
          userId: "usr_generic",
          title: "Introduction to Quantum Horizons",
          model: "gemini-3.5-flash",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          messages: [
            {
              id: "msg_1",
              sender: "user",
              text: "Hello! What can you tell me about futuristic interfaces?",
              timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: "msg_2",
              sender: "ai",
              text: "Hello, Voyager! Futuristic interfaces blend glassmorphic visuals, deep neon accents, cyber-luminescent color spectrums (especially royal purples and cybernetic blues), and dynamic physics-based layout animations to elevate human-computer synergy.",
              timestamp: new Date(Date.now() - 3590000).toISOString()
            }
          ]
        }
      ],
      tickets: [
        {
          id: "tkt_1",
          userId: "usr_generic",
          userEmail: "user@gemini.ai",
          subject: "Requesting API Access to the Hyperdrive",
          description: "Hello, I would like to increase my API rate limits to test high-intensity synthetic neural intelligence operations.",
          status: "Open",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          messages: [
            {
              id: "tm_1",
              sender: "user",
              senderName: "Seraph Explorer",
              text: "Hello, I would like to increase my API rate limits to test high-intensity synthetic neural intelligence operations.",
              timestamp: new Date(Date.now() - 7200000).toISOString()
            }
          ]
        }
      ],
      settings: {
        defaultModel: "gemini-3.5-flash",
        temperature: 0.7,
        maxTokens: 2048,
        systemInstruction: "You are a cybernetic sentient AI core assistant. Adopt a sleek, professional, slightly futuristic yet highly practical tone.",
        maintenanceMode: false
      }
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), "utf-8");
    dbCache = defaultDB;
  } else {
    try {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      dbCache = JSON.parse(data);
    } catch (e) {
      console.error("Failed to read database store, resetting cache", e);
      dbCache = null;
    }
  }
}

export function getDB(): DBStructure {
  if (!dbCache) {
    ensureDB();
  }
  return dbCache!;
}

export function writeDB(db: DBStructure): void {
  dbCache = db;
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}
