/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = "Admin",
  USER = "User"
}

export enum UserStatus {
  ACTIVE = "Active",
  BANNED = "Banned"
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  avatar: string;
}

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  image?: string; // base64 encoded image or placeholder
  voice?: string; // base64 audio data url
  model?: string; // AI model used
  timestamp: string;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: string;
  model: string;
}

export interface TicketMessage {
  id: string;
  sender: "user" | "admin";
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  description: string;
  status: "Open" | "Replied" | "Closed";
  messages: TicketMessage[];
  createdAt: string;
}

export interface AISettings {
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  systemInstruction: string;
  maintenanceMode: boolean;
}

export interface Analytics {
  totalUsers: number;
  totalChats: number;
  totalMessages: number;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  bannedUsers: number;
}
