import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import type { DetectedSpot } from '../types';

interface Props {
  spots: DetectedSpot[];
  selectedSpotId?: string | null;
  onSpotPress?: (spotId: string) => void;
}

export default function SpotMarkers({ spots, selectedSpotId, onSpotPress }: Props) {
  return (
    <>
      {spots.map((spot) => {
        const isSelected = spot.id === selectedSpotId;
        const isEmpty = spot.label === 'empty';

        return (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.lat, longitude: spot.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => onSpotPress?.(spot.id)}
          >
            <View
              style={[
                styles.marker,
                isEmpty ? styles.emptyMarker : styles.occupiedMarker,
                isSelected && styles.selectedMarker,
              ]}
            />
          </Marker>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  emptyMarker: {
    backgroundColor: '#34C759',
  },
  occupiedMarker: {
    backgroundColor: '#FF3B30',
  },
  selectedMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
});
