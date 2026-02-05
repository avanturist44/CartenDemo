import { useEffect, useState } from 'react';
import polyline from '@mapbox/polyline';
import Toast from 'react-native-toast-message';
import { API } from '../config/api';
import type { Coords } from '../types';

export default function useParking(destination: Coords | null) {
  const [geosegment, setGeosegment] = useState<number[][] | null>(null);

  useEffect(() => {
    const fetchGeosegment = async () => {
      if (!destination) return;

      const radii = [50, 100, 150, 200];
      for (const radius of radii) {
        const url = API.parking(destination, radius);
        try {
          const res = await fetch(url);
          if (!res.ok) continue;

          const json = await res.json();
          const coordinates = polyline.decode(json.geoSegment, 6);
          setGeosegment(coordinates ?? null);
          return;
        } catch (err) {
          console.error('Error fetching parking', err);
        }
      }

      Toast.show({ type: 'error', text1: 'No parking data found within 200 meters.' });
    };

    fetchGeosegment();
  }, [destination]);

  return geosegment;
}
