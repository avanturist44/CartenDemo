import { PhoneDataCollector } from './PhoneDataCollector.js';

const phoneDataCollector = new PhoneDataCollector();
export default phoneDataCollector;

export { PhoneDataCollector };

export {
  SIGNAL_STATES,
  TRIGGER_TYPES,
  DATA_SOURCES,
  USER_ACTIONS,
  THRESHOLDS,
  LOCATION_CONFIG,
  CONVERSIONS
} from './constants.js';

export {
  mpsToMph,
  calculateDistance,
  isGyroMoving,
  isAccelStationary,
  formatCoordinates
} from './utils.js';

export { SensorManager } from './SensorManager.js';
export { ParkingSession } from './ParkingSession.js';
