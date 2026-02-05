export const SIGNAL_STATES = {
  IDLE: 'idle',
  DRIVING: 'driving',
  PARKING_INITIATED: 'parking_initiated',
  PARKED: 'parked',
  LEAVING: 'leaving'
};

export const TRIGGER_TYPES = {
  DRIVING_STARTED: 'driving_started',
  PARKING_DETECTION: 'parking_detection',
  PARKED: 'parked',
  LEAVING: 'leaving',
  MAPS_OPENED: 'maps_opened',
  MAPS_BACKGROUND: 'maps_background',
  PARKING_DURATION: 'parking_duration',
  USER_ACTION: 'user_action',
  SAFETY: 'safety',
  CROWDSOURCE_PROMPT: 'crowdsource_prompt'
};

export const DATA_SOURCES = {
  CAMERA_CHECK: 'camera_check',
  TRAFFIC_DATA: 'traffic_data',
  INRIX_DATA: 'inrix_data',
  CROWDSOURCE_DATA: 'crowdsource_data',
  PREDICTION_MODEL: 'prediction_model',
  NOTIFICATION_SYSTEM: 'notification_system',
  SPOT_BUFFER: 'spot_buffer',
  SPEED_VERIFICATION: 'speed_verification',
  LOCATION_TRACKING: 'location_tracking',
  USER_PROMPT: 'user_prompt',
  DELAYED_NOTIFICATION: 'delayed_notification',
  HIDE_PARKING_SPOT: 'hide_parking_spot'
};

export const USER_ACTIONS = {
  LEAVING_NOW: 'leaving_now',
  LEAVING_DELAYED: 'leaving_delayed',
  SET_PARKING_DURATION: 'set_parking_duration',
  CROWDSOURCE_RESPONSE: 'crowdsource_response'
};

export const THRESHOLDS = {
  SPEED_STATIONARY: 2,
  SPEED_WALKING: 5,
  SPEED_DRIVING: 10,
  SPEED_SPIKE_DELTA: 15,
  DISTANCE_WALKING_AWAY: 20,
  GYRO_MOVEMENT: 0.1,
  ACCEL_STATIONARY: 0.2,
  SENSOR_UPDATE_INTERVAL: 1000,
  SPEED_CHECK_INTERVAL: 3000,
  LEAVING_BUFFER: 30000,
  PROXIMITY_PROMPT_DISTANCE: 10
};

export const LOCATION_CONFIG = {
  TIME_INTERVAL: 1000,
  DISTANCE_INTERVAL: 1
};

export const CONVERSIONS = {
  MPS_TO_MPH: 2.23694,
  EARTH_RADIUS_METERS: 6371e3
};
