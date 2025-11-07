import type { Coordinates } from "adhan"

export async function reverseGeocode(coords: Coordinates): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
  )
  if (!res.ok) throw new Error("Failed to reverse geocode")
  const data = await res.json()
  return (
    data.address?.city ||
    data.address?.town ||
    data.display_name ||
    "Unknown location"
  )
}
