import { NOMINATIM_API_URL } from "@/constants/nominate-api-url"
import { useSettingsStore } from "@/stores/settings-store"
import type { Coordinates } from "adhan"
import { useCallback, useEffect, useRef, useState } from "react"

type Status = "idle" | "loading" | "error" | "ready"

export function useLocation(fallback: Coordinates) {
  const { autoLocation, manualLocation, cachedLocation, setCachedLocation } =
    useSettingsStore()

  const [coords, setCoords] = useState<Coordinates>(
    manualLocation?.coordinates || cachedLocation?.coordinates || fallback
  )
  const [address, setAddress] = useState<string>(
    manualLocation?.address || cachedLocation?.address || ""
  )
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  const reverseControllerRef = useRef<AbortController | null>(null)
  const lastGeocodedRef = useRef<string | null>(null)

  const reverseGeocode = useCallback(
    async (coordinates: Coordinates, signal?: AbortSignal) => {
      const key = `${coordinates.latitude.toFixed(6)},${coordinates.longitude.toFixed(6)}`
      if (lastGeocodedRef.current === key) return
      lastGeocodedRef.current = key

      try {
        const res = await fetch(
          `${NOMINATIM_API_URL}/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}`,
          { headers: { "User-Agent": "Open-Muezzin-Extension/1.0" }, signal }
        )
        const data = await res.json()
        const addr =
          data.address?.city ||
          data.address?.town ||
          data.display_name ||
          "Unknown location"

        setAddress(addr)
        setCachedLocation({ coordinates, address: addr })
      } catch {
        if (signal?.aborted) return
        setAddress("Unknown location")
      }
    },
    [setCachedLocation]
  )

  const setFromBrowser = useCallback(() => {
    setStatus("loading")
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.")
      setStatus("error")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coordinates = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }
        setCoords(coordinates)

        reverseControllerRef.current?.abort()
        reverseControllerRef.current = new AbortController()
        void reverseGeocode(coordinates, reverseControllerRef.current.signal)

        setStatus("ready")
      },
      (err) => {
        setStatus("error")
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access blocked. Enable it in browser settings."
            : "Unable to get location."
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }, [reverseGeocode])

  const setFromStore = useCallback(() => {
    if (manualLocation) {
      setCoords(manualLocation.coordinates)
      setAddress(manualLocation.address)
      setStatus("ready")
      setError(null)
    } else if (cachedLocation) {
      setCoords(cachedLocation.coordinates)
      setAddress(cachedLocation.address)
      setStatus("ready")
      setError(null)
    } else {
      setCoords(fallback)
      setAddress("")
      setStatus("error")
      setError("Location not configured.")
      reverseControllerRef.current?.abort()
      reverseControllerRef.current = new AbortController()
      void reverseGeocode(fallback, reverseControllerRef.current.signal)
    }
  }, [manualLocation, cachedLocation, fallback, reverseGeocode])

  useEffect(() => {
    if (autoLocation) {
      if (navigator.permissions) {
        void navigator.permissions
          .query({ name: "geolocation" as PermissionName })
          .then((perm) => {
            if (perm.state === "granted") setFromBrowser()
            else setFromStore()
          })
          .catch(() => setFromBrowser())
      } else setFromBrowser()
    } else setFromStore()

    return () => reverseControllerRef.current?.abort()
  }, [autoLocation, setFromBrowser, setFromStore])

  const requestLocation = useCallback(() => setFromBrowser(), [setFromBrowser])

  return { coordinates: coords, address, status, error, requestLocation }
}
