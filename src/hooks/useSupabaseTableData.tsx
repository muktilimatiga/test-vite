
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useSupabaseTableData = (tableName: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = () => setRefetchIndex(prev => prev + 1);

  useEffect(() => {
    const fetchData = async () => {
      if (!tableName) return;
      
      setLoading(true);
      try {
        // We do not order by 'id' by default because not all tables (e.g. snmp, data_fiber) have an 'id' column.
        const { data: rows, error: err } = await supabase
          .from(tableName)
          .select('*')
          .limit(100); // Limit to 100 for performance

        if (err) throw err;

        // Ensure every row has a unique 'id' property for the UI table to function correctly.
        // We prioritize existing 'id' columns, then known primary keys from your schema, then fallback to index.
        const safeRows = (rows || []).map((row, index) => {
            const uniqueId = 
                row.id || 
                row.tiket || 
                row.user_pppoe || 
                (row.olt_name && row.interface ? `${row.olt_name}-${row.interface}` : null) ||
                row.name || 
                `row-${index}`;
            
            return { ...row, id: uniqueId };
        });

        setData(safeRows);
      } catch (err: any) {
        console.error(`Error fetching data for ${tableName}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName, refetchIndex]);

  return { data, loading, error, refetch };
};