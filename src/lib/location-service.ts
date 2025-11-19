import { NOMINATIM_API_URL } from "@/constants/nominate-api-url"
import type { Coordinates } from "adhan"

export type NominatimResult = {
  lat: string
  lon: string
  display_name: string
  address?: {
    city?: string
    town?: string
    [key: string]: any
  }
}

const HEADERS = {
  "User-Agent": "Open-Muezzin-Extension/1.0"
}

/**
 * Reverse geocodes coordinates to get an address/city name.
 */
export async function reverseGeocode(
  coords: Coordinates,
  signal?: AbortSignal
): Promise<string> {
  const lang = chrome.i18n.getUILanguage() || "ar"
  const url = `${NOMINATIM_API_URL}/reverse?format=json&accept-language=${lang}&lat=${coords.latitude}&lon=${coords.longitude}`

  const res = await fetch(url, {
    headers: HEADERS,
    signal
  })

  if (!res.ok) {
    throw new Error(`Reverse geocoding failed: ${res.statusText}`)
  }

  const data: NominatimResult = await res.json()

  return (
    data.address?.city ||
    data.address?.town ||
    data.display_name ||
    "Unknown location"
  )
}

/**
 * Searches for a city by name.
 */
export async function searchCity(
  query: string,
  signal?: AbortSignal
): Promise<NominatimResult[]> {
  const lang = chrome.i18n.getUILanguage() || "ar"
  const url = `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(
    query
  )}&limit=5&accept-language=${lang}`

  const res = await fetch(url, {
    headers: HEADERS,
    signal
  })

  if (!res.ok) {
    throw new Error(`City search failed: ${res.statusText}`)
  }

  const data: NominatimResult[] = await res.json()
  return data
}
