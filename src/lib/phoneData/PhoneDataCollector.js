import {
  SIGNAL_STATES,
  TRIGGER_TYPES,
  DATA_SOURCES,
  USER_ACTIONS,
  THRESHOLDS
} from './constants.js';

import { calculateDistance, shallowCopy, formatCoordinates } from './utils.js';
import { SensorManager } from './SensorManager.js';
import { ParkingSession } from './ParkingSession.js';
import { SF_PARKING_SPOTS } from './crowdsourceSpots.js';

export class PhoneDataCollector {
  constructor() {
    this._sensorManager = new SensorManager();
    this._parkingSession = new ParkingSession();
    this._state = this._createInitialState();
    this._signalState = SIGNAL_STATES.IDLE;
    this._triggerCallbacks = [];
    this._speedCheckInterval = null;
    this._promptedSpots = new Set();
  }

  async initialize() {
    await this._sensorManager.requestPermissions();

    await this._sensorManager.startLocationTracking(
      this._handleLocationUpdate.bind(this)
    );

    this._sensorManager.startGyroscope(
      this._handleGyroscopeUpdate.bind(this)
    );

    this._sensorManager.startAccelerometer(
      this._handleAccelerometerUpdate.bind(this)
    );

    this._sensorManager.startNetworkMonitoring(
      this._handleNetworkChange.bind(this)
    );

    this._sensorManager.startAppStateMonitoring(
      this._handleAppStateChange.bind(this)
    );

    this._startSpeedMonitoring();
  }

  getState() {
    return {
      phoneData: shallowCopy(this._state),
      signalState: this._signalState,
      parkingSession: this._parkingSession.getSnapshot(),
      promptedSpots: Array.from(this._promptedSpots)
    };
  }

  getSignalState() {
    return this._signalState;
  }

  onTrigger(callback) {
    this._triggerCallbacks.push(callback);

    return () => {
      const index = this._triggerCallbacks.indexOf(callback);
      if (index > -1) {
        this._triggerCallbacks.splice(index, 1);
      }
    };
  }

  userAction(action, duration = null) {
    switch (action) {
      case USER_ACTIONS.LEAVING_NOW:
        this._emit(
          TRIGGER_TYPES.USER_ACTION,
          DATA_SOURCES.NOTIFICATION_SYSTEM,
          'User confirmed leaving - immediate notification'
        );
        this._handleUserLeaving();
        break;

      case USER_ACTIONS.LEAVING_DELAYED:
        this._emit(
          TRIGGER_TYPES.USER_ACTION,
          DATA_SOURCES.DELAYED_NOTIFICATION,
          `Schedule notification for ${duration} minutes`
        );
        this._parkingSession.scheduleDelayedEnd(duration, () => {
          this._signalState = SIGNAL_STATES.IDLE;
        });
        break;

      case USER_ACTIONS.SET_PARKING_DURATION:
        this._parkingSession.setDuration(duration);
        break;

      case USER_ACTIONS.CROWDSOURCE_RESPONSE:
        this._handleCrowdsourceResponse(duration);
        break;
    }
  }

  _handleCrowdsourceResponse(data) {
    // data = { spotId, isOpen }
    this._emit(
      TRIGGER_TYPES.USER_ACTION,
      DATA_SOURCES.CROWDSOURCE_DATA,
      `User verified spot ${data.spotId} as ${data.isOpen ? 'OPEN' : 'CLOSED'}`
    );
  }

  setBluetoothConnected(connected, deviceName = 'Car Audio') {
    this._state.bluetooth = {
      connected,
      device: connected ? deviceName : null,
      lastDisconnect: !connected ? new Date() : (this._state.bluetooth?.lastDisconnect ?? null)
    };

    if (connected) {
      this._onDrivingStarted('User connected to car bluetooth');
    } else {
      this._onParkingInitiated('Bluetooth disconnected');
    }
  }

  setCarPlayActive(active) {
    this._state.carplay = {
      active,
      lastDisconnect: !active ? new Date() : (this._state.carplay?.lastDisconnect ?? null)
    };

    if (active) {
      this._onDrivingStarted('CarPlay active');
    } else {
      this._onParkingInitiated('CarPlay disconnected');
    }
  }

  destroy() {
    if (this._speedCheckInterval) {
      clearInterval(this._speedCheckInterval);
      this._speedCheckInterval = null;
    }

    this._sensorManager.destroy();
    this._parkingSession.destroy();
    this._triggerCallbacks = [];
  }

  resetPromptedSpots() {
    this._promptedSpots.clear();
  }

  setSpeed(speed) {
    this._updateSpeed(speed);
  }

  setLocation(lat, lng, accuracy) {
    this._state.location = { lat, lng, accuracy };
    this._state.timestamp = new Date();
    this._updateDistanceFromCar();
  }

  setGyroscope(x, y, z, isMoving) {
    this._state.gyroscope = { x, y, z, isMoving };
  }

  setAccelerometer(x, y, z, isStationary) {
    this._state.accelerometer = { x, y, z, isStationary };
  }

  setMapsState(open, inBackground) {
    this._state.mapsOpen = open;
    this._state.mapsInBackground = inBackground;
    this._handleAppStateChange(open ? 'active' : 'background');
  }

  _handleLocationUpdate(locationData) {
    this._state.location = {
      lat: locationData.lat,
      lng: locationData.lng,
      accuracy: locationData.accuracy
    };
    this._state.timestamp = locationData.timestamp;

    this._updateSpeed(locationData.speedMph);
    this._updateDistanceFromCar();
    this._checkCrowdsourceProximity();
  }

  _handleGyroscopeUpdate(gyroData) {
    this._state.gyroscope = gyroData;
  }

  _handleAccelerometerUpdate(accelData) {
    this._state.accelerometer = accelData;
  }

  _handleNetworkChange(networkData) {
    // Network type 'other' when connected may indicate car system
    // Note: True bluetooth detection requires native iOS module
    if (networkData.type === 'other' && networkData.isConnected) {
      this.setBluetoothConnected(true);
    } else if (this._state.bluetooth?.connected && !networkData.isConnected) {
      this.setBluetoothConnected(false);
    }
  }

  _handleAppStateChange(appState) {
    if (appState === 'background') {
      this._state.mapsInBackground = true;
      this._state.mapsOpen = false;

      if (!this._isConnectedToCar()) {
        this._emit(
          TRIGGER_TYPES.MAPS_BACKGROUND,
          DATA_SOURCES.LOCATION_TRACKING,
          'Maps in background - track location for parking detection'
        );
      }
    } else if (appState === 'active') {
      this._state.mapsInBackground = false;
      this._state.mapsOpen = true;

      if (!this._isConnectedToCar()) {
        this._signalState = SIGNAL_STATES.DRIVING;
        this._emit(
          TRIGGER_TYPES.MAPS_OPENED,
          DATA_SOURCES.CAMERA_CHECK,
          'Maps opened without car connection - user looking for parking'
        );
        this._emit(
          TRIGGER_TYPES.MAPS_OPENED,
          DATA_SOURCES.PREDICTION_MODEL,
          'Maps opened - generate parking predictions for destination'
        );
      }
    }
  }

  _updateSpeed(newSpeed) {
    const prevSpeed = this._state.speed;
    this._state.speed = newSpeed;

    if (this._signalState === SIGNAL_STATES.PARKED) {
      const speedDelta = Math.abs(newSpeed - (prevSpeed ?? 0));
      if (speedDelta > THRESHOLDS.SPEED_SPIKE_DELTA) {
        this._emit(
          TRIGGER_TYPES.SAFETY,
          DATA_SOURCES.HIDE_PARKING_SPOT,
          'Speed spike detected - hide spot to prevent erratic driving'
        );
      }
    }

    if (
      newSpeed > THRESHOLDS.SPEED_WALKING &&
      this._parkingSession.isActive &&
      !this._state.bluetooth?.connected &&
      (this._state.distanceFromParkedCar ?? 0) > THRESHOLDS.DISTANCE_WALKING_AWAY
    ) {
      this._emit(
        TRIGGER_TYPES.PARKING_DURATION,
        DATA_SOURCES.USER_PROMPT,
        'User walking away >20m - ask for parking duration'
      );
    }

    if (newSpeed > THRESHOLDS.SPEED_DRIVING && this._parkingSession.isActive) {
      this._handleUserLeaving();
    }
  }

  _startSpeedMonitoring() {
    this._speedCheckInterval = setInterval(() => {
      if (
        this._signalState === SIGNAL_STATES.PARKING_INITIATED &&
        (this._state.speed ?? Infinity) < THRESHOLDS.SPEED_STATIONARY
      ) {
        this._confirmParking();
      }
    }, THRESHOLDS.SPEED_CHECK_INTERVAL);
  }

  _updateDistanceFromCar() {
    if (!this._parkingSession.isActive || !this._parkingSession.location || !this._state.location) {
      this._state.distanceFromParkedCar = null;
      return;
    }

    this._state.distanceFromParkedCar = calculateDistance(
      this._parkingSession.location,
      this._state.location
    );
  }

  _checkCrowdsourceProximity() {
    if (!this._state.location) return;

    // Only prompt when driving or idle (not when parked)
    if (this._signalState === SIGNAL_STATES.PARKED) return;

    // Find nearby spots that haven't been prompted
    for (const spot of SF_PARKING_SPOTS) {
      // Skip if already prompted
      if (this._promptedSpots.has(spot.id)) continue;

      const distance = calculateDistance(this._state.location, spot);

      // Within 10 meters?
      if (distance <= THRESHOLDS.PROXIMITY_PROMPT_DISTANCE) {
        this._promptUserForSpotStatus(spot, distance);
      }
    }
  }

  _promptUserForSpotStatus(spot, distance) {
    this._promptedSpots.add(spot.id);

    // Pass spot data in event for frontend to display
    this._emit(
      TRIGGER_TYPES.CROWDSOURCE_PROMPT,
      DATA_SOURCES.CROWDSOURCE_DATA,
      `User within ${distance.toFixed(1)}m of spot ${spot.name}`,
      spot
    );
  }

  _onDrivingStarted(reason) {
    this._signalState = SIGNAL_STATES.DRIVING;

    this._emit(
      TRIGGER_TYPES.DRIVING_STARTED,
      DATA_SOURCES.CAMERA_CHECK,
      `${reason} - check for nearby cameras`
    );
    this._emit(
      TRIGGER_TYPES.DRIVING_STARTED,
      DATA_SOURCES.TRAFFIC_DATA,
      `${reason} - fetch current traffic conditions`
    );
  }

  _onParkingInitiated(reason) {
    this._signalState = SIGNAL_STATES.PARKING_INITIATED;

    this._emit(
      TRIGGER_TYPES.PARKING_DETECTION,
      DATA_SOURCES.SPEED_VERIFICATION,
      `${reason} - verify parking with speed data`
    );
  }

  _confirmParking() {
    if (!this._state.location) return;

    this._signalState = SIGNAL_STATES.PARKED;
    this._parkingSession.start(this._state.location);

    const coords = formatCoordinates(
      this._state.location.lat,
      this._state.location.lng
    );

    this._emit(
      TRIGGER_TYPES.PARKED,
      DATA_SOURCES.CAMERA_CHECK,
      `Parking confirmed at ${coords} - check cameras`
    );
    this._emit(
      TRIGGER_TYPES.PARKED,
      DATA_SOURCES.CROWDSOURCE_DATA,
      'User parked - fetch crowdsourced spots nearby'
    );
    this._emit(
      TRIGGER_TYPES.PARKED,
      DATA_SOURCES.INRIX_DATA,
      'User parked - query INRIX for area availability'
    );
  }

  _handleUserLeaving() {
    if (!this._parkingSession.isActive) return;

    this._signalState = SIGNAL_STATES.LEAVING;

    this._emit(
      TRIGGER_TYPES.LEAVING,
      DATA_SOURCES.NOTIFICATION_SYSTEM,
      'User leaving - notify nearby users of opening spot'
    );
    this._emit(
      TRIGGER_TYPES.LEAVING,
      DATA_SOURCES.SPOT_BUFFER,
      'Wait 30s buffer before showing spot to others'
    );

    this._parkingSession.scheduleEnd(() => {
      this._signalState = SIGNAL_STATES.IDLE;
    });
  }

  _isConnectedToCar() {
    return (this._state.bluetooth?.connected ?? false) || (this._state.carplay?.active ?? false);
  }

  _createInitialState() {
    return {
      bluetooth: null,
      carplay: null,
      speed: null,
      location: null,
      mapsOpen: null,
      mapsInBackground: null,
      gyroscope: null,
      accelerometer: null,
      distanceFromParkedCar: null,
      timestamp: null
    };
  }

  _emit(type, dataSource, reason, spotData = null) {
    const event = {
      type,
      dataSource,
      reason,
      timestamp: new Date(),
      phoneState: shallowCopy(this._state),
      signalState: this._signalState,
      parkingSession: this._parkingSession.getSnapshot()
    };

    // Add spot data if provided
    if (spotData) {
      event.spotData = spotData;
    }

    for (const callback of this._triggerCallbacks) {
      callback(event);
    }
  }
}
