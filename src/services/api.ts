
import { BackendService, Ticket, TicketLog, DashboardStats, TrafficData, User, Device, SystemLog } from '../types';
import { MockService } from '../mock';

// Toggle this to switch between Mock Data and Real Backend
const USE_MOCK_DATA = true; 

// Replace this with your actual backend URL when deploying
const API_BASE_URL = 'http://localhost:4000/api';

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: { 
            'Content-Type': 'application/json',
            ...options.headers 
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
  } catch (error) {
      console.error("API Call Failed:", error);
      throw error;
  }
}

const RealApiService: BackendService = {
  getDashboardStats: () => fetchJson<DashboardStats>('/dashboard/stats'),
  
  getTrafficData: () => fetchJson<TrafficData>('/dashboard/traffic'),
  
  getTicketDistribution: () => fetchJson<{ name: string; value: number }[]>('/dashboard/distribution'),
  
  getRecentTickets: () => fetchJson<Ticket[]>('/tickets/recent'),
  
  getTickets: () => fetchJson<Ticket[]>('/tickets'),
  
  getCustomers: () => fetchJson<User[]>('/users'),
  
  getTopologies: () => fetchJson<any[]>('/topologies'),
  
  getTableData: (tableName: string) => fetchJson<any[]>(`/database/tables/${tableName}`),
  
  getTicketLogs: (ticketId?: string) => {
    const query = ticketId ? `?ticketId=${ticketId}` : '';
    return fetchJson<TicketLog[]>(`/logs${query}`);
  },
  
  updateTicketStatus: (ticketId: string, status: string) => 
    fetchJson<boolean>(`/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  
  searchUsers: (query: string) => fetchJson<User[]>(`/search/users?q=${encodeURIComponent(query)}`),
  
  searchGlobal: (query: string) => fetchJson<{ users: User[]; tickets: any[]; pages: any[] }>(`/search?q=${encodeURIComponent(query)}`),

  getDevices: () => fetchJson<Device[]>('/devices'),

  getSystemLogs: () => fetchJson<SystemLog[]>('/system-logs'), // Assuming endpoint exists in real backend

  createSystemLog: (log) => fetchJson<void>('/system-logs', { method: 'POST', body: JSON.stringify(log) }),
};

// Export the service based on configuration
export const ApiService = USE_MOCK_DATA ? MockService : RealApiService;