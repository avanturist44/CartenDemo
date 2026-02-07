export type Coords = { lng: number; lat: number };

export type ParkingSpot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type RouteGeometry = GeoJSON.LineString;

export type CameraInfo = {
  id: string;
  name: string;
  lotName: string;
  lat: number;
  lng: number;
};

export type DetectedSpot = {
  id: string;
  row: string;
  label: 'empty' | 'occupied';
  confidence: number;
  lat: number;
  lng: number;
  distanceFromCamera: number;
};

export type SpotRecommendation = {
  id: string;
  row: string;
  label: string;
  lat: number;
  lng: number;
  mlConfidence: number;
  distance: number;
  walkingTimeMinutes: number;
  queuePosition: number;
  distancePenalty: number;
  queuePenalty: number;
  overallConfidence: number;
  futureConfidence: {
    '1min': number;
    '3min': number;
    '5min': number;
    '10min': number;
  };
};

export type RerouteDecision = {
  shouldReroute: boolean;
  reason: string | null;
  currentConfidence: number;
  alternative: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    estimatedConfidence: number;
    estimatedDriveMinutes: number;
    totalSpots: number;
    typicalOpenSpots: number;
  } | null;
};

export type LotSummary = {
  totalSpots: number;
  openSpots: number;
  occupiedSpots: number;
  occupancyRate: number;
};

export type IntelligenceResponse = {
  camera: CameraInfo;
  cameraDistance: number;
  lotSummary: LotSummary;
  recommendations: SpotRecommendation[];
  allSpots: DetectedSpot[];
  rerouteDecision: RerouteDecision;
  simulatedUsers: number;
  timestamp: string;
};
