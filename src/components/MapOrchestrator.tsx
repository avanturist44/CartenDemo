import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import useParking from '../hooks/useParking';
import useDirections from '../hooks/useDirections';
import useSpotIntelligence from '../hooks/useSpotIntelligence';
import DestinationSearch from './DestinationSearch';
import MapScreen from './MapScreen';
import CrowdsourcePrompt from './CrowdsourcePrompt';
import SpotRecommendationPanel from './SpotRecommendationPanel';
import RerouteCard from './RerouteCard';
import { usePhoneDataCollector } from '../lib/PhoneDataCollectorProvider';
import { API } from '../config/api';
import type { Coords } from '../types';

export default function MapOrchestrator() {
  const [data, setData] = useState<Coords | null>(null);
  const [promptSpot, setPromptSpot] = useState<any>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [showRerouteCard, setShowRerouteCard] = useState(true);
  const collector = usePhoneDataCollector();

  const origin: Coords = { lng: -122.443845, lat: 37.763284 };
  const inrixDestination = useParking(data);
  const route = useDirections(origin, inrixDestination);

  // Spot intelligence — triggers when destination is set
  const { data: intelligence } = useSpotIntelligence(data, !!data);

  // Reset reroute card visibility when destination changes
  useEffect(() => {
    setShowRerouteCard(true);
    setSelectedSpotId(null);
  }, [data]);

  // Auto-hide reroute card after 10 seconds
  useEffect(() => {
    if (!intelligence?.rerouteDecision?.shouldReroute || !showRerouteCard) return;

    const timer = setTimeout(() => setShowRerouteCard(false), 10000);
    return () => clearTimeout(timer);
  }, [intelligence?.rerouteDecision?.shouldReroute, showRerouteCard]);

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

  const handleReroute = () => {
    if (intelligence?.rerouteDecision?.alternative) {
      const alt = intelligence.rerouteDecision.alternative;
      setData({ lat: alt.lat, lng: alt.lng });
      setShowRerouteCard(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapScreen
        origin={origin}
        destination={inrixDestination}
        route={route}
        spotRecommendations={intelligence?.allSpots ?? null}
        selectedSpotId={selectedSpotId}
        onSpotPress={setSelectedSpotId}
        cameraLocation={intelligence?.camera ?? null}
      />
      <DestinationSearch OnSelect={setData} />

      {/* Spot recommendation panel */}
      {intelligence && (
        <SpotRecommendationPanel
          lotName={intelligence.camera.lotName}
          lotSummary={intelligence.lotSummary}
          recommendations={intelligence.recommendations}
          selectedSpotId={selectedSpotId}
          onSpotPress={setSelectedSpotId}
        />
      )}

      {/* Reroute card */}
      {intelligence &&
        showRerouteCard &&
        intelligence.rerouteDecision.shouldReroute && (
          <RerouteCard
            decision={intelligence.rerouteDecision}
            onReroute={handleReroute}
            onDismiss={() => setShowRerouteCard(false)}
          />
        )}

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
