export type Coordinates = { latitude: number; longitude: number };

/** Distance à vol d'oiseau entre deux points, en mètres (formule de haversine). */
export function distanceMeters(from: Coordinates, to: Coordinates) {
  const EARTH_RADIUS = 6_371_000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) ** 2;

  return EARTH_RADIUS * 2 * Math.asin(Math.sqrt(a));
}

export function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0)} km`;
}

/** Trie une liste de lieux du plus proche au plus lointain de `from`. */
export function byDistance<T extends { latitude: number | null; longitude: number | null }>(
  items: T[],
  from: Coordinates | null,
): (T & { distance: number | null })[] {
  const measured = items.map((item) => ({
    ...item,
    distance:
      from && item.latitude !== null && item.longitude !== null
        ? distanceMeters(from, { latitude: item.latitude, longitude: item.longitude })
        : null,
  }));

  if (!from) return measured;

  return measured.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
}
