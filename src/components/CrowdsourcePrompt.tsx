import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

interface CrowdsourcePromptProps {
  spot: {
    id: string;
    name: string;
    lat: number;
    lng: number;
  };
  onResponse: (spotId: string, isOpen: boolean) => void;
  onDismiss: () => void;
}

export default function CrowdsourcePrompt({
  spot,
  onResponse,
  onDismiss,
}: CrowdsourcePromptProps) {
  const handleResponse = (isOpen: boolean) => {
    onResponse(spot.id, isOpen);
    Toast.show({
      type: 'success',
      text1: `Thanks! Spot marked as ${isOpen ? 'open' : 'closed'}`,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Is this spot open?</Text>
        <Text style={styles.subtitle}>{spot.name}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.yesButton]}
          onPress={() => handleResponse(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Yes, Open</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.noButton]}
          onPress={() => handleResponse(false)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>No, Taken</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onDismiss} activeOpacity={0.6}>
        <Text style={styles.dismissText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    maxWidth: '90%',
    width: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 1000,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
  yesButton: {
    backgroundColor: '#34C759',
  },
  noButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  dismissText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
  },
});
