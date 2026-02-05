export type Coords = { lng: number; lat: number };

export type ParkingSpot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type RouteGeometry = GeoJSON.LineString;
