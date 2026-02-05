import { THRESHOLDS } from './constants.js';
import { shallowCopy } from './utils.js';

export class ParkingSession {
  constructor() {
    this._session = this._createEmptySession();
    this._leavingTimeout = null;
  }

  get isActive() {
    return this._session.active;
  }

  get location() {
    return this._session.location;
  }

  get startTime() {
    return this._session.startTime;
  }

  get duration() {
    return this._session.duration;
  }

  getSnapshot() {
    return {
      active: this._session.active,
      location: shallowCopy(this._session.location),
      startTime: this._session.startTime,
      duration: this._session.duration
    };
  }

  start(location) {
    this._session = {
      active: true,
      location: shallowCopy(location),
      startTime: new Date(),
      duration: null
    };
  }

  setDuration(minutes) {
    this._session.duration = minutes;
  }

  end() {
    this._clearLeavingTimeout();
    this._session = this._createEmptySession();
  }

  scheduleEnd(onEnd, delayMs = THRESHOLDS.LEAVING_BUFFER) {
    this._clearLeavingTimeout();

    this._leavingTimeout = setTimeout(() => {
      this.end();
      onEnd?.();
    }, delayMs);
  }

  scheduleDelayedEnd(minutes, onEnd) {
    const delayMs = minutes * 60 * 1000;
    this.scheduleEnd(onEnd, delayMs);
  }

  _createEmptySession() {
    return {
      active: false,
      location: null,
      startTime: null,
      duration: null
    };
  }

  _clearLeavingTimeout() {
    if (this._leavingTimeout) {
      clearTimeout(this._leavingTimeout);
      this._leavingTimeout = null;
    }
  }

  destroy() {
    this._clearLeavingTimeout();
  }
}
