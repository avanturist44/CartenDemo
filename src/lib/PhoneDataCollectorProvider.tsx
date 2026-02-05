import React, { createContext, useContext, useEffect, useRef } from 'react';
import { PhoneDataCollector } from './phoneData/PhoneDataCollector';

const PhoneDataCollectorContext = createContext<PhoneDataCollector | null>(null);

export function PhoneDataCollectorProvider({ children }: { children: React.ReactNode }) {
  const collectorRef = useRef<PhoneDataCollector | null>(null);

  if (!collectorRef.current) {
    collectorRef.current = new PhoneDataCollector();
  }

  useEffect(() => {
    const collector = collectorRef.current;
    if (!collector) return;

    collector.initialize().catch((err: unknown) => {
      console.warn('PhoneDataCollector init failed:', err);
    });

    return () => {
      collector.destroy();
    };
  }, []);

  return (
    <PhoneDataCollectorContext.Provider value={collectorRef.current}>
      {children}
    </PhoneDataCollectorContext.Provider>
  );
}

export function usePhoneDataCollector(): PhoneDataCollector | null {
  return useContext(PhoneDataCollectorContext);
}
