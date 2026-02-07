import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import SpotMarkers from './SpotMarkers';
import type { Coords, RouteGeometry, DetectedSpot, CameraInfo } from '../types';

interface Props {
  origin: Coords;
  destination?: number[][] | null;
  route: RouteGeometry | null;
  spotRecommendations?: DetectedSpot[] | null;
  selectedSpotId?: string | null;
  onSpotPress?: (spotId: string) => void;
  cameraLocation?: CameraInfo | null;
}

export default function MapScreen({
  origin,
  destination,
  route,
  spotRecommendations,
  selectedSpotId,
  onSpotPress,
  cameraLocation,
}: Props) {
  const routeCoords =
    route?.coordinates?.map((coord) => ({
      latitude: coord[1],
      longitude: coord[0],
    })) ?? [];

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: origin.lat,
        longitude: origin.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
    >
      {/* Origin marker */}
      <Marker
        coordinate={{ latitude: origin.lat, longitude: origin.lng }}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <View style={styles.originMarker} />
      </Marker>

      {/* Destination marker */}
      {destination && (
        <Marker
          coordinate={{
            latitude: destination[0][0],
            longitude: destination[0][1],
          }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.destinationMarker} />
        </Marker>
      )}

      {/* Route polyline */}
      {routeCoords.length > 0 && (
        <Polyline
          coordinates={routeCoords}
          strokeColor="#3887be"
          strokeWidth={5}
        />
      )}

      {/* Camera marker */}
      {cameraLocation && (
        <Marker
          coordinate={{
            latitude: cameraLocation.lat,
            longitude: cameraLocation.lng,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.cameraMarker} />
        </Marker>
      )}

      {/* Parking spot markers */}
      {spotRecommendations && (
        <SpotMarkers
          spots={spotRecommendations}
          selectedSpotId={selectedSpotId}
          onSpotPress={onSpotPress}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  originMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0066ff',
    borderWidth: 2,
    borderColor: 'white',
  },
  destinationMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ff3b30',
    borderWidth: 2,
    borderColor: 'white',
  },
  cameraMarker: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#5856D6',
    borderWidth: 2,
    borderColor: 'white',
  },
});
