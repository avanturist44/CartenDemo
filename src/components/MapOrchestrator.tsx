import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import useParking from '../hooks/useParking';
import useDirections from '../hooks/useDirections';
import DestinationSearch from './DestinationSearch';
import MapScreen from './MapScreen';
import CrowdsourcePrompt from './CrowdsourcePrompt';
import { usePhoneDataCollector } from '../lib/PhoneDataCollectorProvider';
import { API } from '../config/api';
import type { Coords } from '../types';

export default function MapOrchestrator() {
  const [data, setData] = useState<Coords | null>(null);
  const [promptSpot, setPromptSpot] = useState<any>(null);
  const collector = usePhoneDataCollector();

  const origin: Coords = { lng: -122.443845, lat: 37.763284 };
  const inrixDestination = useParking(data);
  const route = useDirections(origin, inrixDestination);

  // Subscribe to crowdsource prompts from phoneDataCollector
  useEffect(() => {
    if (!collector) return;

    const unsubscribe = collector.onTrigger((event: any) => {
      if (event.type === 'crowdsource_prompt') {
        setPromptSpot(event.spotData);
      }
    });

    return () => unsubscribe();
  }, [collector]);

  const handleCrowdsourceResponse = async (spotId: string, isOpen: boolean) => {
    try {
      const response = await fetch(API.crowdsourceResponse, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotId,
          isOpen,
          timestamp: new Date().toISOString(),
          userLocation: origin,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit response');
      }

      // Notify phoneDataCollector
      (collector as any)?.userAction('crowdsource_response', { spotId, isOpen });
    } catch (error) {
      console.error('Error submitting crowdsource response:', error);
    }

    setPromptSpot(null);
  };

  return (
    <View style={styles.container}>
      <MapScreen origin={origin} destination={inrixDestination} route={route} />
      <DestinationSearch OnSelect={setData} />
      {promptSpot && (
        <CrowdsourcePrompt
          spot={promptSpot}
          onResponse={handleCrowdsourceResponse}
          onDismiss={() => setPromptSpot(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
