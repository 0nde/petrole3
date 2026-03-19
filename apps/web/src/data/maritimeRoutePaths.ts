/** Visual maritime route paths as [lng, lat] coordinate arrays.
 *  Each route corresponds to a route_id in routes.json.
 *  Waypoints follow realistic sea routes through chokepoints. */

export const maritimeRoutePaths: Record<string, [number, number][]> = {
  // Persian Gulf → East Asia via Hormuz + Malacca
  me_asia_hormuz_malacca: [
    [50, 27], [56.27, 26.56], [60, 24], [65, 21], [72, 15],
    [78, 10], [85, 6], [92, 4], [96, 3], [101.2, 2.5],
    [104, 1.3], [108, 3], [112, 7], [116, 12], [120, 20],
    [125, 28], [130, 33], [135, 35],
  ],
  // Persian Gulf → Europe via Hormuz + Bab el-Mandeb + Suez
  me_europe_suez: [
    [50, 27], [56.27, 26.56], [55, 23], [50, 17], [45, 14],
    [43.33, 12.58], [42, 15], [39, 22], [35, 28], [32.34, 30.46],
    [30, 32], [25, 35], [18, 36], [10, 37], [5, 38],
    [0, 43], [-3, 47], [0, 50], [3, 52],
  ],
  // Persian Gulf → Europe/India via Cape of Good Hope
  me_europe_cape: [
    [50, 27], [56.27, 26.56], [60, 23], [55, 15], [50, 8],
    [45, 0], [40, -8], [35, -18], [25, -30], [18.5, -34.36],
    [10, -30], [0, -15], [-8, 0], [-12, 15], [-10, 30],
    [-5, 40], [0, 48], [3, 52],
  ],
  // West Africa → Europe (Atlantic direct)
  africa_europe: [
    [3, 6], [0, 8], [-5, 12], [-10, 20], [-12, 30],
    [-8, 38], [-3, 43], [0, 48], [3, 52],
  ],
  // West Africa → East Asia via Cape
  africa_asia_cape: [
    [3, 6], [5, 0], [8, -10], [12, -22], [18.5, -34.36],
    [30, -28], [45, -15], [60, 0], [72, 10], [80, 8],
    [92, 4], [101.2, 2.5], [108, 5], [116, 15], [125, 28],
  ],
  // USA Gulf → Europe (Atlantic direct)
  usa_europe_atlantic: [
    [-90, 28], [-85, 27], [-80, 28], [-70, 33], [-55, 40],
    [-40, 45], [-25, 48], [-10, 50], [0, 50], [3, 52],
  ],
  // USA → Asia via Panama Canal
  usa_asia_panama: [
    [-90, 28], [-85, 24], [-82, 15], [-79.92, 9.08], [-80, 5],
    [-85, 0], [-90, -5], [-100, -5], [-120, 0], [-140, 10],
    [-160, 20], [-180, 28], [160, 30], [140, 33], [130, 35],
  ],
  // USA → India/Asia via Cape
  usa_asia_cape: [
    [-90, 28], [-80, 25], [-60, 15], [-40, 5], [-25, -10],
    [-10, -25], [5, -33], [18.5, -34.36], [35, -25],
    [50, -10], [60, 5], [72, 15], [78, 20],
  ],
  // Russia → Europe via Baltic + Danish Straits
  russia_europe_baltic: [
    [28, 60], [24, 58], [20, 56], [15, 55], [12.6, 55.7],
    [10, 56], [7, 55], [3, 53], [0, 51],
  ],
  // Russia/Caspian → Mediterranean via Bosphorus
  russia_europe_bosphorus: [
    [38, 44], [34, 43], [30, 42], [29.05, 41.12], [27, 40],
    [24, 38], [18, 37], [10, 38], [3, 40], [0, 43],
  ],
  // Russia → India via Cape
  russia_india_cape: [
    [38, 44], [32, 40], [25, 37], [15, 36], [5, 33],
    [0, 20], [-5, 5], [5, -15], [18.5, -34.36],
    [35, -22], [50, -5], [60, 8], [72, 18],
  ],
  // North Africa → Europe (Mediterranean short)
  north_africa_europe: [
    [3, 37], [1, 38], [-1, 40], [0, 43], [2, 46], [3, 50],
  ],
  // Intra-Europe (short hop)
  europe_intra: [
    [3, 52], [4, 51], [5, 52], [7, 53], [10, 54],
  ],
  // Southeast Asia intra-regional
  sea_intra: [
    [101.2, 2.5], [104, 1], [107, 3], [110, 5], [112, 7],
  ],
  // Russia → Asia via ESPO pipeline (overland, shown as dashed)
  russia_asia_pipeline: [
    [50, 55], [60, 54], [70, 53], [80, 52], [90, 50],
    [100, 48], [110, 46], [120, 43], [130, 42], [135, 43],
  ],
  // Kazakhstan → China pipeline (overland)
  caspian_asia_pipeline: [
    [52, 42], [58, 42], [65, 43], [72, 44], [80, 43],
    [87, 42], [95, 40], [105, 38], [116, 40],
  ],
};

/** Map ISO A3 country codes to approximate port coordinates [lng, lat] */
export const countryPorts: Record<string, [number, number]> = {
  SAU: [50, 27], IRQ: [48, 30], ARE: [54, 25], KWT: [48, 29],
  IRN: [52, 27], QAT: [51, 25], OMN: [57, 23],
  RUS: [38, 44], KAZ: [52, 42], AZE: [50, 40],
  USA: [-90, 28], CAN: [-63, 45], MEX: [-97, 20], VEN: [-67, 10],
  BRA: [-43, -23], COL: [-76, 4], ECU: [-80, -2], ARG: [-58, -35],
  GUY: [-58, 6], TTO: [-61, 10], CHL: [-71, -33], PER: [-77, -12],
  NGA: [3, 6], AGO: [13, -9], LBY: [13, 33], DZA: [3, 37],
  GAB: [9, 0], COG: [12, -4], EGY: [30, 31],
  GBR: [0, 51], DEU: [10, 54], FRA: [0, 46], ITA: [12, 42],
  ESP: [-4, 37], NLD: [4, 52], BEL: [3, 51], NOR: [5, 60],
  POL: [18, 54], GRC: [24, 38], TUR: [29, 41], SWE: [18, 59],
  PRT: [-9, 39], AUT: [16, 48], CZE: [14, 50], ROU: [26, 45],
  HUN: [19, 47], FIN: [25, 60],
  CHN: [121, 31], JPN: [140, 36], KOR: [127, 37], TWN: [121, 25],
  IND: [72, 19], SGP: [104, 1], THA: [100, 13], IDN: [107, -6],
  MYS: [101, 3], AUS: [151, -34], NZL: [175, -41],
  VNM: [106, 11], PHL: [121, 14], BGD: [90, 22], PAK: [67, 25],
  BHR: [50, 26], ZAF: [18, -34],
};

/** Find the best route path for a given route_id */
export function getRoutePath(routeId: string): [number, number][] | null {
  return maritimeRoutePaths[routeId] ?? null;
}
