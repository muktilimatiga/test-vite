
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Ticket } from '@/lib/types';

export const useSupabaseTickets = () => {
  const [data, setData] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = () => setRefetchIndex((prev) => prev + 1);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      
      // Check for placeholder URL to avoid errors if not configured
      if (!supabase || (supabase['supabaseUrl'] && supabase['supabaseUrl'].includes('placeholder'))) {
         setLoading(false);
         return; 
      }

      try {
        const { data: rows, error } = await supabase
          .from('log_komplain')
          .select('*')
          .order('id', { ascending: false })
          .limit(100);

        if (error) throw error;

        const mapped: Ticket[] = (rows || []).map((row: any) => ({
          // Use 'tiket' column if available, fallback to 'id' or generate random
          id: row.tiket ? String(row.tiket) : (row.id ? String(row.id) : `tmp-${Math.random()}`),
          title: row.kendala || 'No Subject',
          status: mapDbStatusToUi(row.status),
          priority: 'medium', // Default since 'priority' column isn't in schema
          assigneeId: row.nama || null, // Map 'nama' to assignee
          createdAt: row.tanggal ? new Date(row.tanggal).toISOString() : new Date().toISOString(),
        }));

        setData(mapped);
      } catch (err) {
        console.error("Failed to fetch tickets page data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [refetchIndex]);

  return { data, loading, refetch };
};

// Helper to map DB statuses to UI expected values
const mapDbStatusToUi = (status: string): Ticket['status'] => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'open') return 'open';
    if (s === 'proses') return 'proses';
    if (s === 'fwd teknis') return 'proses'; // Map custom status
    if (s === 'done') return 'done';
    if (s === 'done/fwd') return 'done';
    return 'open'; // Default fallback
};