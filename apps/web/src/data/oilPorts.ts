/**
 * Major oil ports worldwide with coordinates
 * Sources: MarineLink, VesselFinder, GitHub tayljordan/ports
 * Content rephrased for compliance with licensing restrictions
 */

export interface OilPort {
  id: string;
  name: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  type: 'export' | 'import' | 'both';
  capacity?: number; // mbpd (million barrels per day)
}

export const OIL_PORTS: OilPort[] = [
  // Middle East - Major Export Hubs
  { id: 'ras-tanura', name: 'Ras Tanura', countryCode: 'SAU', latitude: 26.6726, longitude: 50.1219, type: 'export', capacity: 6.5 },
  { id: 'fujairah', name: 'Fujairah', countryCode: 'ARE', latitude: 25.15, longitude: 56.33, type: 'both', capacity: 2.0 },
  { id: 'mina-al-ahmadi', name: 'Mina Al Ahmadi', countryCode: 'KWT', latitude: 29.08, longitude: 48.16, type: 'export', capacity: 2.5 },
  { id: 'kharg-island', name: 'Kharg Island', countryCode: 'IRN', latitude: 29.26, longitude: 50.32, type: 'export', capacity: 1.5 },
  { id: 'basra', name: 'Basra Oil Terminal', countryCode: 'IRQ', latitude: 29.93, longitude: 48.77, type: 'export', capacity: 1.8 },
  
  // Asia Pacific - Major Import Hubs
  { id: 'singapore', name: 'Singapore', countryCode: 'SGP', latitude: 1.29, longitude: 103.85, type: 'both', capacity: 3.0 },
  { id: 'ningbo', name: 'Ningbo-Zhoushan', countryCode: 'CHN', latitude: 29.87, longitude: 121.55, type: 'import', capacity: 2.5 },
  { id: 'shanghai', name: 'Shanghai', countryCode: 'CHN', latitude: 31.23, longitude: 121.47, type: 'import', capacity: 2.0 },
  { id: 'qingdao', name: 'Qingdao', countryCode: 'CHN', latitude: 36.07, longitude: 120.38, type: 'import', capacity: 1.5 },
  { id: 'dalian', name: 'Dalian', countryCode: 'CHN', latitude: 38.91, longitude: 121.62, type: 'import', capacity: 1.2 },
  { id: 'yokohama', name: 'Yokohama', countryCode: 'JPN', latitude: 35.44, longitude: 139.64, type: 'import', capacity: 1.0 },
  { id: 'ulsan', name: 'Ulsan', countryCode: 'KOR', latitude: 35.54, longitude: 129.31, type: 'import', capacity: 1.2 },
  { id: 'mumbai', name: 'Mumbai', countryCode: 'IND', latitude: 18.96, longitude: 72.82, type: 'import', capacity: 0.8 },
  { id: 'chennai', name: 'Chennai', countryCode: 'IND', latitude: 13.08, longitude: 80.27, type: 'import', capacity: 0.6 },
  
  // Europe - Major Import/Refining Hubs
  { id: 'rotterdam', name: 'Rotterdam', countryCode: 'NLD', latitude: 51.92, longitude: 4.48, type: 'both', capacity: 2.5 },
  { id: 'antwerp', name: 'Antwerp', countryCode: 'BEL', latitude: 51.22, longitude: 4.40, type: 'both', capacity: 1.0 },
  { id: 'amsterdam', name: 'Amsterdam', countryCode: 'NLD', latitude: 52.37, longitude: 4.89, type: 'both', capacity: 0.8 },
  { id: 'marseille', name: 'Marseille', countryCode: 'FRA', latitude: 43.30, longitude: 5.37, type: 'import', capacity: 0.7 },
  { id: 'trieste', name: 'Trieste', countryCode: 'ITA', latitude: 45.65, longitude: 13.77, type: 'import', capacity: 0.5 },
  
  // Americas - Major Hubs
  { id: 'houston', name: 'Houston', countryCode: 'USA', latitude: 29.75, longitude: -95.14, type: 'both', capacity: 3.5 },
  { id: 'corpus-christi', name: 'Corpus Christi', countryCode: 'USA', latitude: 27.80, longitude: -97.40, type: 'export', capacity: 2.0 },
  { id: 'new-orleans', name: 'New Orleans', countryCode: 'USA', latitude: 29.95, longitude: -90.03, type: 'both', capacity: 1.5 },
  { id: 'vancouver', name: 'Vancouver', countryCode: 'CAN', latitude: 49.28, longitude: -123.12, type: 'import', capacity: 0.5 },
  { id: 'veracruz', name: 'Veracruz', countryCode: 'MEX', latitude: 19.20, longitude: -96.13, type: 'both', capacity: 0.8 },
  
  // Africa
  { id: 'lagos', name: 'Lagos', countryCode: 'NGA', latitude: 6.45, longitude: 3.39, type: 'export', capacity: 1.2 },
  { id: 'port-harcourt', name: 'Port Harcourt', countryCode: 'NGA', latitude: 4.78, longitude: 7.01, type: 'export', capacity: 0.8 },
  { id: 'luanda', name: 'Luanda', countryCode: 'AGO', latitude: -8.84, longitude: 13.23, type: 'export', capacity: 1.0 },
  
  // South America
  { id: 'santos', name: 'Santos', countryCode: 'BRA', latitude: -23.96, longitude: -46.33, type: 'both', capacity: 1.0 },
  { id: 'puerto-la-cruz', name: 'Puerto La Cruz', countryCode: 'VEN', latitude: 10.21, longitude: -64.63, type: 'export', capacity: 0.8 },
];

/**
 * Get the primary port for a country (for flow visualization)
 */
export function getPrimaryPortForCountry(countryCode: string): OilPort | null {
  // Try to find a port matching the country code
  const ports = OIL_PORTS.filter(p => p.countryCode === countryCode);
  
  if (ports.length === 0) return null;
  
  // Prefer export ports for exporters, import for importers
  const exportPort = ports.find(p => p.type === 'export' || p.type === 'both');
  if (exportPort) return exportPort;
  
  return ports[0] ?? null;
}

/**
 * Get all ports for a country
 */
export function getPortsForCountry(countryCode: string): OilPort[] {
  return OIL_PORTS.filter(p => p.countryCode === countryCode);
}
