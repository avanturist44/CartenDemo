import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { PhoneDataCollectorProvider } from './src/lib/PhoneDataCollectorProvider';
import MapOrchestrator from './src/components/MapOrchestrator';

export default function App() {
  return (
    <PhoneDataCollectorProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <MapOrchestrator />
      </SafeAreaView>
      <Toast />
    </PhoneDataCollectorProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
