
import { z } from 'zod';
import * as React from 'react';


export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  role: z.enum(['atmin', 'noc']),
});

export const TicketStatusSchema = z.enum(['open', 'proses', 'done', 'fwd-teknis']);
export const TicketPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const TicketSchema = z.object({
  id: z.string(),
  title: z.string().min(5, "Title must be at least 5 characters"),
  status: TicketStatusSchema,
  priority: TicketPrioritySchema,
  assigneeId: z.string().nullable(),
  createdAt: z.string().datetime(), // ISO string for frontend
});

export const TicketLogSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  userId: z.string(),
  userName: z.string(),
  message: z.string(),
  createdAt: z.string().datetime(),
});

export const DashboardStatsSchema = z.object({
  totalTickets: z.number(),
  openTickets: z.number(),
  prosesTickets: z.number(),
  physicalTickets: z.string(), // e.g. "2h 15m"
});

export const TrafficDataSchema = z.array(z.object({
  name: z.string(),
  value: z.number(),
}));

// --- TypeScript Interfaces inferred from Zod ---
export type User = z.infer<typeof UserSchema>;
export type Ticket = z.infer<typeof TicketSchema>;
export type TicketLog = z.infer<typeof TicketLogSchema>;
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type TrafficData = z.infer<typeof TrafficDataSchema>;

export interface Device {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'warning';
  folder: string;
  type: string;
  ping: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  source: string; // e.g., 'Invoice', 'Database', 'Ticket'
  message: string;
  user?: string;
  metadata?: any;
}

// --- App Types ---
export type NavItem = {
  label: string;
  icon: React.ElementType;
  to: string;
};

// --- Realtime Types ---
export type RealtimeEvent = 
  | { type: 'NEW_TICKET'; payload: Ticket }
  | { type: 'NEW_LOG'; payload: TicketLog };

// --- Service Interface ---
// This ensures both your MockService and your Real Backend Service implement the same methods.
export interface BackendService {
  getDashboardStats: () => Promise<DashboardStats>;
  getTrafficData: () => Promise<TrafficData>;
  getTicketDistribution: () => Promise<{ name: string; value: number }[]>;
  getRecentTickets: () => Promise<Ticket[]>;
  getTickets: () => Promise<Ticket[]>;
  getCustomers: () => Promise<User[]>;
  getTopologies: () => Promise<any[]>;
  getTableData: (tableName: string) => Promise<any[]>;
  getTicketLogs: (ticketId?: string) => Promise<TicketLog[]>;
  updateTicketStatus: (ticketId: string, status: string) => Promise<boolean>;
  searchUsers: (query: string) => Promise<User[]>;
  searchGlobal: (query: string) => Promise<{ users: User[]; tickets: any[]; pages: any[] }>;
  getDevices: () => Promise<Device[]>;
  getSystemLogs: () => Promise<SystemLog[]>;
  createSystemLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => Promise<void>;
}