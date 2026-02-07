import { useState, useEffect, useCallback, useRef } from 'react';
import { API } from '../config/api';
import type { Coords, IntelligenceResponse } from '../types';

const REFRESH_INTERVAL = 15000; // 15 seconds

export default function useSpotIntelligence(
  destination: Coords | null,
  enabled: boolean,
) {
  const [data, setData] = useState<IntelligenceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchIntelligence = useCallback(async () => {
    if (!destination) return;

    try {
      setLoading(true);
      setError(null);

      const url = API.spotIntelligence(destination.lat, destination.lng);
      const response = await fetch(url);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const result: IntelligenceResponse = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch spot intelligence');
    } finally {
      setLoading(false);
    }
  }, [destination]);

  // Fetch on mount/change + auto-refresh every 15s
  useEffect(() => {
    if (!enabled || !destination) {
      setData(null);
      return;
    }

    fetchIntelligence();

    intervalRef.current = setInterval(fetchIntelligence, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, destination, fetchIntelligence]);

  return { data, loading, error, refresh: fetchIntelligence };
}
