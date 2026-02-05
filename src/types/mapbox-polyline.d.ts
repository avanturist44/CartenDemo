declare module '@mapbox/polyline' {
  function decode(string: string, precision?: number): number[][];
  function encode(coordinates: number[][], precision?: number): string;
}
