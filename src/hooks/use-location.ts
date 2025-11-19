import { reverseGeocode as reverseGeocodeAPI } from "@/lib/location-service"
import { useSettingsStore } from "@/stores/settings-store"
import type { Coordinates } from "adhan"
import { useCallback, useEffect, useRef, useState } from "react"

type Status = "idle" | "loading" | "error" | "ready"

export function useLocation(fallback: Coordinates) {
  const { autoLocation, manualLocation, setCachedCoordinates } = useSettingsStore()
  const [coordinates, setCoordinates] = useState<Coordinates>(fallback)
  const [address, setAddress] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [loadingCoordinates, setLoadingCoordinates] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reverseControllerRef = useRef<AbortController | null>(null)

  const setFromBrowser = useCallback(() => {
    setLoadingCoordinates(true)
    setStatus("loading")
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.")
      setStatus("error")
      setLoadingCoordinates(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }
        setCoordinates(coords)

        // Check if we have a cached address for these coordinates
        const { cachedCoordinates } = useSettingsStore.getState()
        if (
          cachedCoordinates &&
          Math.abs(cachedCoordinates.coordinates.latitude - coords.latitude) < 0.0001 &&
          Math.abs(cachedCoordinates.coordinates.longitude - coords.longitude) < 0.0001
        ) {
          setAddress(cachedCoordinates.address)
          setStatus("ready")
          setLoadingCoordinates(false)
          return
        }

        if (reverseControllerRef.current) reverseControllerRef.current.abort()
        reverseControllerRef.current = new AbortController()

        void (async () => {
          try {
            const cityName = await reverseGeocodeAPI(coords, reverseControllerRef.current?.signal)
            setAddress(cityName)
            setCachedCoordinates({
              coordinates: coords,
              address: cityName
            })
          } catch (e) {
            if ((e as Error).name !== 'AbortError') {
              setAddress("Unknown location")
            }
          }
        })()

        setStatus("ready")
        setLoadingCoordinates(false)
      },
      (err) => {
        setStatus("error")
        setLoadingCoordinates(false)
        if (err.code === err.PERMISSION_DENIED)
          setError("Location access blocked. Enable it in browser settings.")
        else setError("Unable to get location.")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }, [setCachedCoordinates])

  const setFromStore = useCallback(() => {
    if (!manualLocation) {
      setCoordinates(fallback)
      setAddress("")
      setStatus("ready")
      setError("Manual location not configured in settings.")

      if (reverseControllerRef.current) reverseControllerRef.current.abort()
      reverseControllerRef.current = new AbortController()
      void reverseGeocodeAPI(fallback, reverseControllerRef.current.signal)
        .then(setAddress)
        .catch(() => setAddress("Unknown location"))
      return
    }

    setCoordinates(manualLocation.coordinates)
    setAddress(manualLocation.address)
    setStatus("ready")
    setError(null)
  }, [manualLocation, fallback])

  useEffect(() => {
    if (autoLocation) {
      if (navigator.permissions) {
        void navigator.permissions
          .query({ name: "geolocation" as PermissionName })
          .then((perm) => {
            if (perm.state === "granted" || perm.state === "prompt") {
              setFromBrowser()
            } else {
              setCoordinates(fallback)
              setAddress("")
              setStatus("error")
              setError("Location access blocked. Enable it in browser settings.")
              setLoadingCoordinates(false)

              if (reverseControllerRef.current)
                reverseControllerRef.current.abort()
              reverseControllerRef.current = new AbortController()
              void reverseGeocodeAPI(fallback, reverseControllerRef.current.signal)
                .then(setAddress)
                .catch(() => setAddress("Unknown location"))
            }
          })
          .catch(() => setFromBrowser())
      } else {
        setFromBrowser()
      }
    } else {
      setFromStore()
    }

    return () => {
      if (reverseControllerRef.current) reverseControllerRef.current.abort()
    }
  }, [autoLocation, manualLocation, fallback, setFromBrowser, setFromStore])

  const requestLocation = useCallback(() => setFromBrowser(), [setFromBrowser])

  return {
    coordinates,
    address,
    status,
    loadingCoordinates,
    error,
    requestLocation
  }
}
