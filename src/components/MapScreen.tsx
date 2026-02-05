import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import type { Coords, RouteGeometry } from '../types';

interface Props {
  origin: Coords;
  destination?: number[][] | null;
  route: RouteGeometry | null;
}

export default function MapScreen({ origin, destination, route }: Props) {
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
});
