/** Free geocoding via OpenStreetMap's Nominatim service — no API key
 * required. Per Nominatim's usage policy, this is fine for low-volume,
 * non-bulk use (an organizer saving a market's address occasionally, or
 * a customer searching once). Results are attributed to OpenStreetMap
 * wherever distance/location data is shown. */
export async function geocodeAddress(
  query: string,
): Promise<{ latitude: number; longitude: number } | null> {
  if (!query.trim()) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const results = (await res.json()) as { lat: string; lon: string }[];
    if (!results.length) return null;
    return { latitude: parseFloat(results[0].lat), longitude: parseFloat(results[0].lon) };
  } catch {
    return null;
  }
}

/** Great-circle distance between two coordinates, in miles. */
export function distanceInMiles(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthRadiusMiles * 2 * Math.asin(Math.sqrt(h));
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) return "Nearby";
  return `${miles.toFixed(1)} mi away`;
}

/** Wraps the browser's built-in geolocation API (free, no key needed) in
 * a promise. */
export function getBrowserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location isn't supported on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => reject(new Error("Couldn't get your location. You can also type an address below.")),
      { timeout: 8000 },
    );
  });
}
