import { useEffect, useState } from 'react';
import { getRecord } from '../api/airtable';

export function useAirtableRecord<T = any>(table: string, id: string) {
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    setLoading(true);
    getRecord<T>(table, id)
      .then(r => { if (!cancelled) { setRecord(r); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err); setLoading(false); } });
    return () => { cancelled = true; };
  }, [table, id]);

  return { record, loading, error };
}
