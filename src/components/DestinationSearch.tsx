import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { API } from '../config/api';
import type { Coords } from '../types';

interface Props {
  OnSelect: (coords: Coords) => void;
}

interface GeoResult {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

export default function DestinationSearch({ OnSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (text: string) => {
    if (text.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    try {
      const res = await fetch(API.geocode(text));
      const json = await res.json();
      const features: GeoResult[] = (json.features ?? []).map((f: any) => ({
        id: f.id,
        place_name: f.place_name,
        center: f.center,
      }));
      setResults(features);
      setShowResults(features.length > 0);
    } catch (err) {
      console.error('Geocoding error', err);
    }
  }, []);

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search(text), 300);
    },
    [search],
  );

  const handleSelect = useCallback(
    (item: GeoResult) => {
      const [lng, lat] = item.center;
      OnSelect({ lng, lat });
      setQuery(item.place_name);
      setShowResults(false);
      Keyboard.dismiss();
    },
    [OnSelect],
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search destination..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={handleChangeText}
          returnKeyType="search"
        />
      </View>
      {showResults && (
        <FlatList
          style={styles.list}
          data={results}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.resultText} numberOfLines={2}>
                {item.place_name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  list: {
    marginTop: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  resultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 15,
    color: '#333',
  },
});
