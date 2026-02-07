import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ConfidenceGauge from './ConfidenceGauge';
import type { RerouteDecision } from '../types';

interface Props {
  decision: RerouteDecision;
  onReroute: () => void;
  onDismiss: () => void;
}

export default function RerouteCard({ decision, onReroute, onDismiss }: Props) {
  if (!decision.shouldReroute || !decision.alternative) return null;

  const alt = decision.alternative;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consider Rerouting</Text>
      <Text style={styles.reason}>{decision.reason}</Text>

      <View style={styles.comparison}>
        <View style={styles.compareCol}>
          <Text style={styles.compareLabel}>Current Lot</Text>
          <ConfidenceGauge confidence={decision.currentConfidence} compact />
        </View>
        <View style={styles.compareCol}>
          <Text style={styles.compareLabel}>{alt.name}</Text>
          <ConfidenceGauge confidence={alt.estimatedConfidence} compact />
        </View>
      </View>

      <Text style={styles.driveTime}>
        {alt.estimatedDriveMinutes} min drive &middot; ~{alt.typicalOpenSpots} spots usually open
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.rerouteButton]}
          onPress={onReroute}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Reroute</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.stayButton]}
          onPress={onDismiss}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, styles.stayText]}>Stay Here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 420,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    maxWidth: '94%',
    width: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
    zIndex: 1100,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
  },
  reason: {
    fontSize: 13,
    color: '#444',
    marginBottom: 12,
    lineHeight: 18,
  },
  comparison: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  compareCol: {
    flex: 1,
    gap: 4,
  },
  compareLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  driveTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  rerouteButton: {
    backgroundColor: '#34C759',
  },
  stayButton: {
    backgroundColor: '#E5E5EA',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  stayText: {
    color: '#333',
  },
});
