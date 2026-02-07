import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import ConfidenceGauge from './ConfidenceGauge';
import type { SpotRecommendation, LotSummary } from '../types';

interface Props {
  lotName: string;
  lotSummary: LotSummary;
  recommendations: SpotRecommendation[];
  selectedSpotId?: string | null;
  onSpotPress?: (spotId: string) => void;
}

export default function SpotRecommendationPanel({
  lotName,
  lotSummary,
  recommendations,
  selectedSpotId,
  onSpotPress,
}: Props) {
  const top5 = recommendations.slice(0, 5);
  const openPct = Math.round(
    (lotSummary.openSpots / lotSummary.totalSpots) * 100
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.lotName}>{lotName}</Text>
        <Text style={styles.summary}>
          {lotSummary.openSpots}/{lotSummary.totalSpots} spots open
        </Text>
      </View>

      {/* Occupancy bar */}
      <View style={styles.occupancyBar}>
        <View
          style={[styles.occupancyOpen, { flex: lotSummary.openSpots }]}
        />
        <View
          style={[styles.occupancyTaken, { flex: lotSummary.occupiedSpots }]}
        />
      </View>
      <Text style={styles.occupancyLabel}>{openPct}% available</Text>

      {/* Spots list */}
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {top5.map((spot) => (
          <TouchableOpacity
            key={spot.id}
            style={[
              styles.spotCard,
              spot.id === selectedSpotId && styles.spotCardSelected,
            ]}
            onPress={() => onSpotPress?.(spot.id)}
            activeOpacity={0.7}
          >
            <View style={styles.spotHeader}>
              <Text style={styles.spotId}>{spot.id}</Text>
              <Text style={styles.spotRow}>Row {spot.row}</Text>
              <Text style={styles.spotDistance}>{spot.distance}m</Text>
              <Text style={styles.spotWalk}>{spot.walkingTimeMinutes} min walk</Text>
            </View>

            <ConfidenceGauge
              confidence={spot.overallConfidence}
              label="Confidence"
              compact
            />

            <View style={styles.spotFooter}>
              <Text style={styles.futureText}>
                In 5 min: {Math.round(spot.futureConfidence['5min'] * 100)}%
              </Text>
              <Text style={styles.queueText}>
                {spot.queuePosition === 0
                  ? 'No cars ahead'
                  : `${spot.queuePosition} car${spot.queuePosition > 1 ? 's' : ''} closer`}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    maxWidth: '94%',
    width: 340,
    maxHeight: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 900,
  },
  header: {
    marginBottom: 8,
  },
  lotName: {
    fontWeight: '700',
    fontSize: 15,
  },
  summary: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  occupancyBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  occupancyOpen: {
    backgroundColor: '#34C759',
  },
  occupancyTaken: {
    backgroundColor: '#FF3B30',
  },
  occupancyLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 8,
  },
  list: {
    maxHeight: 260,
  },
  spotCard: {
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    gap: 6,
  },
  spotCardSelected: {
    backgroundColor: '#E8F0FE',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  spotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spotId: {
    fontWeight: '700',
    fontSize: 14,
  },
  spotRow: {
    fontSize: 12,
    color: '#666',
  },
  spotDistance: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
  },
  spotWalk: {
    fontSize: 11,
    color: '#888',
  },
  spotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  futureText: {
    fontSize: 11,
    color: '#FF9500',
  },
  queueText: {
    fontSize: 11,
    color: '#888',
  },
});
