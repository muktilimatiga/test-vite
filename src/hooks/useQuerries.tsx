

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api';
import { Ticket, User, TicketLog, DashboardStats, TrafficData, Device, SystemLog } from '@/lib/types'


// --- Query Keys ---
export const queryKeys = {
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    traffic: ['dashboard', 'traffic'] as const,
    distribution: ['dashboard', 'distribution'] as const,
  },
  tickets: {
    all: ['tickets'] as const,
    list: () => [...queryKeys.tickets.all, 'list'] as const,
    recent: () => [...queryKeys.tickets.all, 'recent'] as const,
    detail: (id: string) => [...queryKeys.tickets.all, 'detail', id] as const,
    logs: (id?: string) => [...queryKeys.tickets.all, 'logs', id] as const,
  },
  customers: {
    all: ['customers'] as const,
    detail: (id: string) => [...queryKeys.customers.all, id] as const,
  },
  topology: {
    all: ['topologies'] as const,
  },
  database: {
    table: (name: string) => ['database', 'table', name] as const,
  },
  devices: {
    all: ['devices'] as const,
  },
  logs: {
    all: ['system-logs'] as const,
  }
};

// --- Dashboard Hooks ---
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: ApiService.getDashboardStats,
  });
};

export const useTrafficData = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.traffic,
    queryFn: ApiService.getTrafficData,
  });
};

export const useTicketDistribution = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.distribution,
    queryFn: ApiService.getTicketDistribution,
  });
};

// --- Ticket Hooks ---
export const useTickets = () => {
  return useQuery({
    queryKey: queryKeys.tickets.list(),
    queryFn: ApiService.getTickets,
  });
};

export const useRecentTickets = () => {
  return useQuery({
    queryKey: queryKeys.tickets.recent(),
    queryFn: ApiService.getRecentTickets,
  });
};

export const useTicketLogs = (ticketId?: string) => {
  return useQuery({
    queryKey: queryKeys.tickets.logs(ticketId),
    queryFn: () => ApiService.getTicketLogs(ticketId),
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      ApiService.updateTicketStatus(id, status),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.recent() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    },
  });
};

// --- Customer Hooks ---
export const useCustomers = () => {
  return useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: ApiService.getCustomers,
  });
};

// --- Topology Hooks ---
export const useTopologies = () => {
  return useQuery({
    queryKey: queryKeys.topology.all,
    queryFn: ApiService.getTopologies,
  });
};

// --- Database Hooks ---
export const useTableData = (tableName: string) => {
  return useQuery({
    queryKey: queryKeys.database.table(tableName),
    queryFn: () => ApiService.getTableData(tableName),
  });
};

// --- Monitor Hooks ---
export const useDevices = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.devices.all,
    queryFn: ApiService.getDevices,
    enabled,
  });
};

// --- System Log Hooks ---
export const useSystemLogs = () => {
  return useQuery({
    queryKey: queryKeys.logs.all,
    queryFn: ApiService.getSystemLogs,
    refetchInterval: 5000, // Poll every 5 seconds for new logs
  });
};

export const useLogActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (log: Omit<SystemLog, 'id' | 'timestamp'>) => ApiService.createSystemLog(log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.logs.all });
    },
  });
};