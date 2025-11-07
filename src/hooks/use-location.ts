import { NOMINATIM_API_URL } from "@/constants/nominate-api-url"
import { useSettingsStore } from "@/stores/settings-store"
import type { Coordinates } from "adhan"
import { useCallback, useEffect, useRef, useState } from "react"

type Status = "idle" | "loading" | "error" | "ready"

export function useLocation(fallback: Coordinates) {
  const { autoLocation, manualLocation } = useSettingsStore()
  const [coords, setCoords] = useState<Coordinates>(fallback)
  const [address, setAddress] = useState<string>("")
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  // prevent duplicate reverse geocoding for the same coords
  const lastGeocodedRef = useRef<string | null>(null)

  // allow aborting in-flight reverse geocode requests
  const reverseControllerRef = useRef<AbortController | null>(null)

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
        setAddress(
          data.address?.city ||
            data.address?.town ||
            data.display_name ||
            "Unknown location"
        )
      } catch {
        if (signal?.aborted) return
        setAddress("Unknown location")
      }
    },
    []
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

        // abort any previous reverse request and start a new one
        if (reverseControllerRef.current) reverseControllerRef.current.abort()
        reverseControllerRef.current = new AbortController()
        void reverseGeocode(coordinates, reverseControllerRef.current?.signal)

        setStatus("ready")
      },
      (err) => {
        setStatus("error")
        if (err.code === err.PERMISSION_DENIED)
          setError("Location access blocked. Enable it in browser settings.")
        else setError("Unable to get location.")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }, [reverseGeocode])

  const setFromStore = useCallback(() => {
    if (!manualLocation) {
      // fallback to provided coords but signal an error so UI can prompt user
      setCoords(fallback)
      setAddress("")
      setStatus("error")
      setError("Manual location not configured in settings.")

      // reverse geocode the fallback so UI shows a friendly name (if available)
      if (reverseControllerRef.current) reverseControllerRef.current.abort()
      reverseControllerRef.current = new AbortController()
      void reverseGeocode(fallback, reverseControllerRef.current.signal)

      return
    }
    setCoords(manualLocation.coordinates)
    setAddress(manualLocation.address)
    setStatus("ready")
    setError(null)
  }, [manualLocation, fallback, reverseGeocode])

  useEffect(() => {
    // pick source based on autoLocation
    if (autoLocation) {
      // try permissions API if available
      if (navigator.permissions) {
        void navigator.permissions
          .query({ name: "geolocation" as PermissionName })
          .then((perm) => {
            if (perm.state === "granted") setFromBrowser()
            else if (perm.state === "prompt") {
              // show fallback coords and attempt to populate address for UX
              setStatus("idle")
              setCoords(fallback)
              setAddress("")

              if (reverseControllerRef.current)
                reverseControllerRef.current.abort()
              reverseControllerRef.current = new AbortController()
              void reverseGeocode(fallback, reverseControllerRef.current.signal)
            } else {
              setStatus("error")
              setError(
                "Location access blocked. Enable it in browser settings."
              )
              setCoords(fallback)
              setAddress("")
              // optionally try to reverseGeocode the fallback here as well
              if (reverseControllerRef.current)
                reverseControllerRef.current.abort()
              reverseControllerRef.current = new AbortController()
              void reverseGeocode(fallback, reverseControllerRef.current.signal)
            }
          })
          .catch(() => {
            // permissions API unavailable -> request directly
            setFromBrowser()
          })
      } else {
        setFromBrowser()
      }
    } else {
      setFromStore()
    }

    return () => {
      // abort any in-flight reverse-geocode on unmount / effect re-run
      if (reverseControllerRef.current) reverseControllerRef.current.abort()
    }
  }, [
    autoLocation,
    manualLocation,
    fallback,
    setFromBrowser,
    setFromStore,
    reverseGeocode
  ])

  const requestLocation = useCallback(() => {
    return setFromBrowser()
  }, [setFromBrowser])

  return {
    coordinates: coords,
    address,
    status,
    error,
    requestLocation
  }
}
