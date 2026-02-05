import { useEffect, useState } from 'react';
import { API } from '../config/api';
import type { Coords, RouteGeometry } from '../types';

export default function useDirections(
  origin: Coords | null,
  destination: number[][] | null,
) {
  const [route, setRoute] = useState<RouteGeometry | null>(null);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!origin || !destination) return;

      const url = API.routing(
        origin.lng,
        origin.lat,
        destination[0][1],
        destination[0][0],
      );

      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error('Routing fetch failed', res.status);
          return;
        }
        const json = await res.json();
        setRoute(json.routes?.[0]?.geometry ?? null);
      } catch (err) {
        console.error('Error fetching route', err);
      }
    };

    fetchRoute();
  }, [destination]);

  return route;
}
