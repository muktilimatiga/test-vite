
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Ticket, TrafficData } from '../lib/types';
import { toast } from 'sonner';

export interface KomplainStats {
  totalTicket: number;
  open: number;
  proses: number;
  physical: number;
}

// Helper to format date as YYYY-MM-DD (standard SQL date format)
const formatDate = (date: Date): string => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

export const useSupabaseStats = () => {
  const [stats, setStats] = useState<KomplainStats>({
    totalTicket: 0,
    open: 0,
    proses: 0,
    physical: 0
  });
  
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [closedTickets, setClosedTickets] = useState<Ticket[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficData>([]);
  const [oltDistribution, setOltDistribution] = useState<{name: string, value: number}[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setIsFallback(false);

      // Check for placeholder URL to avoid unnecessary network requests that will fail
      if (!supabase || (supabase['supabaseUrl'] && supabase['supabaseUrl'].includes('placeholder'))) {
         console.warn("Supabase URL is missing or placeholder. Using Mock Data.");
         setIsFallback(true);
         setLoading(false);
         return;
      }

      try {
        const today = new Date();
        const todayStr = formatDate(today);
        
        // Generate last 7 days dates for traffic query
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i)); // 6 days ago to today
            return formatDate(d);
        });

        // 1. Fetch Data in parallel
        const [
          totalTodayRes,
          openRes,
          prosesRes,
          fwdTeknisRes,
          recentRes,
          closedRes,
          trafficRes,
          oltRes
        ] = await Promise.all([
          // KPIs
          supabase.from('log_komplain').select('*', { count: 'exact', head: true }).eq('tanggal', todayStr),
          supabase.from('log_komplain').select('*', { count: 'exact', head: true }).eq('status', 'open'),
          supabase.from('log_komplain').select('*', { count: 'exact', head: true }).eq('status', 'proses'),
          supabase.from('log_komplain').select('*', { count: 'exact', head: true }).eq('status', 'fwd teknis'),

          // Active Queue (Top 5 Recent)
          supabase.from('log_komplain').select('*').order('id', { ascending: false }).limit(5),

          // Recently Closed ('done' or 'done/fwd')
          supabase
            .from('log_komplain')
            .select('*')
            .or('status.eq.done,status.eq.done/fwd')
            .order('id', { ascending: false })
            .limit(5),

          // Traffic Data (Fetch just dates for the last 7 days to count in JS)
          supabase
            .from('log_komplain')
            .select('tanggal')
            .in('tanggal', last7Days),

          // OLT Distribution
          supabase.from('log_komplain').select('olt_name')
        ]);

        // Check for specific errors in critical responses
        if (recentRes.error) throw recentRes.error;
        if (totalTodayRes.error) throw totalTodayRes.error;

        // --- Set KPIs ---
        setStats({
          totalTicket: totalTodayRes.count || 0,
          open: openRes.count || 0,
          proses: prosesRes.count || 0,
          physical: fwdTeknisRes.count || 0
        });

        // --- Helper to adapt DB rows to UI Ticket type ---
        const adaptTicket = (row: any): Ticket => ({
          id: row.tiket || String(row.id),
          title: row.kendala || 'No description',
          status: (row.status || 'open') as any,
          priority: 'medium', 
          assigneeId: row.nama || null,
          createdAt: row.tanggal ? new Date(row.tanggal).toISOString() : new Date().toISOString()
        });

        setRecentTickets((recentRes.data || []).map(adaptTicket));
        setClosedTickets((closedRes.data || []).map(adaptTicket));

        // --- Process Traffic Data ---
        // Group fetched dates by day
        const rawTraffic = trafficRes.data || [];
        const trafficStats = last7Days.map(dateStr => {
            // Count how many records match this date string
            const count = rawTraffic.filter((r: any) => r.tanggal === dateStr).length;
            const d = new Date(dateStr);
            // Format name as "Mon", "Tue" etc.
            const name = d.toLocaleDateString('en-US', { weekday: 'short' }); 
            return { name, value: count };
        });
        setTrafficData(trafficStats);

        // --- Process OLT Distribution ---
        const rawOlt = oltRes.data || [];
        const oltCounts: Record<string, number> = {};
        rawOlt.forEach((row: any) => {
            const name = row.olt_name ? String(row.olt_name).trim() : 'Unknown';
            if (name) {
                oltCounts[name] = (oltCounts[name] || 0) + 1;
            }
        });
        
        // Convert to array and sort by value desc
        const oltStats = Object.entries(oltCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5 OLTs

        setOltDistribution(oltStats);

      } catch (err: any) {
        let errorMessage = "Unknown error occurred";
        
        if (err instanceof Error) {
            errorMessage = err.message;
        } else if (typeof err === 'object' && err !== null) {
            errorMessage = err.message || err.error_description || JSON.stringify(err);
        } else {
            errorMessage = String(err);
        }

        console.error("Supabase Connection Failed:", errorMessage);
        
        // --- FALLBACK TO MOCK DATA ---
        setIsFallback(true);
        setError(errorMessage);
        
        if (errorMessage !== 'Failed to fetch') {
             toast.error("Using Mock Data", {
                description: `Supabase Error: ${errorMessage}`,
            });
        }
      } finally {
        setLoading(false);
      }
    };


    fetchData();
  }, []);

  return { stats, recentTickets, closedTickets, trafficData, oltDistribution, loading, error, isFallback };
};