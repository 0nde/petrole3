/**
 * Utilities for calculating maritime flow geometries using great circles
 */

import greatCircle from '@turf/great-circle';
import { point, lineString } from '@turf/helpers';
import type { Feature, LineString, MultiLineString, Position } from 'geojson';

export interface FlowGeometryOptions {
  /**
   * Number of points to generate along the arc (higher = smoother)
   */
  npoints?: number;
  
  /**
   * Optional waypoints to route through (e.g., chokepoints)
   */
  waypoints?: Position[];
}

/**
 * Calculate a great circle route between two points
 * Returns a GeoJSON LineString feature
 */
export function calculateFlowGeometry(
  origin: Position,
  destination: Position,
  options: FlowGeometryOptions = {}
): Feature<LineString> {
  const { npoints = 100, waypoints = [] } = options;
  
  // If no waypoints, simple great circle
  if (waypoints.length === 0) {
    const start = point(origin);
    const end = point(destination);
    const result = greatCircle(start, end, { npoints }) as Feature<LineString | MultiLineString>;
    if (result.geometry.type === 'MultiLineString') {
      return lineString(result.geometry.coordinates.flat()) as Feature<LineString>;
    }
    return result as Feature<LineString>;
  }
  
  // With waypoints, create segments
  const segments: Position[][] = [];
  const allPoints = [origin, ...waypoints, destination];
  
  for (let i = 0; i < allPoints.length - 1; i++) {
    const p = allPoints[i];
    const q = allPoints[i + 1];
    if (!p || !q) continue;
    const start = point(p);
    const end = point(q);
    const segment = greatCircle(start, end, { npoints: Math.floor(npoints / allPoints.length) });
    const coords = segment.geometry.type === 'MultiLineString'
      ? (segment.geometry.coordinates as Position[][]).flat()
      : (segment.geometry.coordinates as Position[]);
    segments.push(coords);
  }
  
  // Merge all segments into one continuous line
  const mergedCoords = segments.reduce((acc, seg, idx) => {
    // Skip first point of subsequent segments to avoid duplicates
    return idx === 0 ? seg : [...acc, ...seg.slice(1)];
  }, [] as Position[]);
  
  return lineString(mergedCoords);
}

/**
 * Determine if a flow should route through specific chokepoints
 * Based on origin/destination regions
 */
export function determineRouteWaypoints(
  originLon: number,
  originLat: number,
  destLon: number,
  destLat: number
): Position[] {
  const waypoints: Position[] = [];
  
  // Middle East to Asia via Hormuz + Malacca
  if (originLon > 45 && originLon < 60 && originLat > 20 && originLat < 30) {
    if (destLon > 100 && destLat > 0) {
      waypoints.push([56.25, 26.57]); // Hormuz
      waypoints.push([102.89, 1.43]); // Malacca
    }
  }
  
  // Middle East to Europe via Hormuz + Suez
  if (originLon > 45 && originLon < 60 && originLat > 20 && originLat < 30) {
    if (destLon > -10 && destLon < 30 && destLat > 35 && destLat < 60) {
      waypoints.push([56.25, 26.57]); // Hormuz
      waypoints.push([43.33, 12.58]); // Bab el-Mandeb
      waypoints.push([32.34, 30.70]); // Suez
    }
  }
  
  // Asia to Europe via Malacca + Suez
  if (originLon > 100 && destLon > -10 && destLon < 30 && destLat > 35) {
    waypoints.push([102.89, 1.43]); // Malacca
    waypoints.push([43.33, 12.58]); // Bab el-Mandeb
    waypoints.push([32.34, 30.70]); // Suez
  }
  
  // Africa to Americas via Cape of Good Hope (if going west)
  if (originLon > 10 && originLon < 40 && originLat < 0 && destLon < -30) {
    waypoints.push([18.47, -34.35]); // Cape of Good Hope
  }
  
  return waypoints;
}

/**
 * Calculate flow width based on volume (for visual representation)
 */
export function calculateFlowWidth(volumeMbpd: number): number {
  // Logarithmic scale: 0.1 mbpd = 1px, 10 mbpd = 4px, 100 mbpd = 8px
  return Math.max(1, Math.min(12, 1 + Math.log10(volumeMbpd + 0.1) * 3));
}

/**
 * Calculate flow opacity based on volume
 */
export function calculateFlowOpacity(volumeMbpd: number): number {
  // Higher volume = more opaque (0.3 to 0.8)
  return Math.max(0.3, Math.min(0.8, 0.3 + (volumeMbpd / 10) * 0.5));
}
