import { NOMINATIM_API_URL } from "@/constants/nominate-api-url"
import type { Coordinates } from "adhan"

export type NominatimResult = {
  lat: string
  lon: string
  display_name: string
  address?: {
    city?: string
    town?: string
    [key: string]: unknown
  }
}

const HEADERS = {
  "User-Agent": "Open-Muezzin-Extension/1.0"
}

const getLang = () => chrome.i18n.getUILanguage() || "ar"

export async function reverseGeocode(
  coords: Coordinates,
  signal?: AbortSignal
): Promise<string> {
  const url = `${NOMINATIM_API_URL}/reverse?format=json&accept-language=${getLang()}&lat=${coords.latitude}&lon=${coords.longitude}`

  const response = await fetch(url, { headers: HEADERS, signal })

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed: ${response.statusText}`)
  }

  const data = (await response.json()) as NominatimResult

  return (
    data.address?.city ||
    data.address?.town ||
    data.display_name ||
    "Unknown location"
  )
}

export async function searchCity(
  query: string,
  signal?: AbortSignal
): Promise<NominatimResult[]> {
  const url = `${NOMINATIM_API_URL}/search?format=json&limit=5&accept-language=${getLang()}&q=${encodeURIComponent(
    query
  )}`

  const response = await fetch(url, { headers: HEADERS, signal })

  if (!response.ok) {
    throw new Error(`City search failed: ${response.statusText}`)
  }

  return (await response.json()) as NominatimResult[]
}
