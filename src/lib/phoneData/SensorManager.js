import * as Location from 'expo-location';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';

import { THRESHOLDS, LOCATION_CONFIG } from './constants.js';
import { mpsToMph, isGyroMoving, isAccelStationary } from './utils.js';

export class SensorManager {
  constructor() {
    this._subscriptions = [];
    this._callbacks = {
      location: null,
      gyroscope: null,
      accelerometer: null,
      network: null,
      appState: null
    };
  }

  async requestPermissions() {
    const foreground = await Location.requestForegroundPermissionsAsync();
    const background = await Location.requestBackgroundPermissionsAsync();

    if (foreground.status !== 'granted') {
      throw new Error('Foreground location permission not granted');
    }
    if (background.status !== 'granted') {
      throw new Error('Background location permission not granted');
    }
  }

  async startLocationTracking(callback) {
    this._callbacks.location = callback;

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: LOCATION_CONFIG.TIME_INTERVAL,
        distanceInterval: LOCATION_CONFIG.DISTANCE_INTERVAL
      },
      (location) => {
        const data = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          accuracy: location.coords.accuracy,
          speedMph: mpsToMph(location.coords.speed),
          timestamp: new Date()
        };
        this._callbacks.location?.(data);
      }
    );

    this._subscriptions.push(subscription);
  }

  startGyroscope(callback) {
    this._callbacks.gyroscope = callback;

    Gyroscope.setUpdateInterval(THRESHOLDS.SENSOR_UPDATE_INTERVAL);

    const subscription = Gyroscope.addListener((data) => {
      const result = {
        x: data.x,
        y: data.y,
        z: data.z,
        isMoving: isGyroMoving(data)
      };
      this._callbacks.gyroscope?.(result);
    });

    this._subscriptions.push(subscription);
  }

  startAccelerometer(callback) {
    this._callbacks.accelerometer = callback;

    Accelerometer.setUpdateInterval(THRESHOLDS.SENSOR_UPDATE_INTERVAL);

    const subscription = Accelerometer.addListener((data) => {
      const result = {
        x: data.x,
        y: data.y,
        z: data.z,
        isStationary: isAccelStationary(data)
      };
      this._callbacks.accelerometer?.(result);
    });

    this._subscriptions.push(subscription);
  }

  startNetworkMonitoring(callback) {
    this._callbacks.network = callback;

    const unsubscribe = NetInfo.addEventListener((state) => {
      const data = {
        type: state.type,
        isConnected: state.isConnected
      };
      this._callbacks.network?.(data);
    });

    this._subscriptions.push({ remove: unsubscribe });
  }

  startAppStateMonitoring(callback) {
    this._callbacks.appState = callback;

    const subscription = AppState.addEventListener('change', (nextState) => {
      this._callbacks.appState?.(nextState);
    });

    this._subscriptions.push(subscription);
  }

  destroy() {
    for (const subscription of this._subscriptions) {
      if (typeof subscription.remove === 'function') {
        subscription.remove();
      }
    }

    this._subscriptions = [];
    this._callbacks = {
      location: null,
      gyroscope: null,
      accelerometer: null,
      network: null,
      appState: null
    };

    Gyroscope.removeAllListeners();
    Accelerometer.removeAllListeners();
  }
}
