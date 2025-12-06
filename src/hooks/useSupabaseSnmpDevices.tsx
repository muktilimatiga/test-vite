
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface SnmpDevice {
  id: string;
  name: string;
  host: string;
  community_string: string;
}

export const useSupabaseSnmpDevices = () => {
  const [data, setData] = useState<SnmpDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = () => setRefetchIndex(prev => prev + 1);

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      
      if (!supabase || (supabase['supabaseUrl'] && supabase['supabaseUrl'].includes('placeholder'))) {
         setLoading(false);
         return;
      }

      try {
        const { data: rows, error } = await supabase
          .from('snmp_devices')
          .select('*');

        if (error) throw error;

        // Ensure unique ID exists since schema uses name as PK often
        const mapped = (rows || []).map((row: any, i: number) => ({
            id: row.name || `dev-${i}`,
            name: row.name,
            host: row.host,
            community_string: row.community_string
        }));

        setData(mapped);
      } catch (err) {
        console.error("Failed to fetch snmp_devices", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [refetchIndex]);

  return { data, loading, refetch };
};