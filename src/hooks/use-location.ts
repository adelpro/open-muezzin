import { NOMINATIM_API_URL } from "@/constants/nominate-api-url"
import { useSettingsStore } from "@/stores/settings-store"
import type { Coordinates } from "adhan"
import { useCallback, useEffect, useRef, useState } from "react"

type Status = "idle" | "loading" | "error" | "ready"

export function useLocation(fallback: Coordinates) {
  const { autoLocation, manualLocation, setCachedCoordinates } = useSettingsStore()
  const [coordinates, setCoordinates] = useState<Coordinates>(fallback)
  const [address, setAddress] = useState<string>("")
  const [status, setStatus] = useState<Status>("idle")
  const [loadingCoordinates, setLoadingCoordinates] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lastGeocodedRef = useRef<string | null>(null)
  const reverseControllerRef = useRef<AbortController | null>(null)

  const reverseGeocode = useCallback(
    async (coords: Coordinates, signal?: AbortSignal) => {
      const key = `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`
      if (lastGeocodedRef.current === key) return
      lastGeocodedRef.current = key

      try {
        const lang = chrome.i18n.getUILanguage() || "ar"
        const res = await fetch(
          `${NOMINATIM_API_URL}/reverse?format=json&accept-language=${lang}&lat=${coords.latitude}&lon=${coords.longitude}`,
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

        if (reverseControllerRef.current) reverseControllerRef.current.abort()
        reverseControllerRef.current = new AbortController()
        void reverseGeocode(coords, reverseControllerRef.current.signal)

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
  }, [reverseGeocode])

  const setFromStore = useCallback(() => {
    if (!manualLocation) {
      // fallback
      setCoordinates(fallback)
      setAddress("")
      setStatus("ready")
      setError("Manual location not configured in settings.")

      if (reverseControllerRef.current) reverseControllerRef.current.abort()
      reverseControllerRef.current = new AbortController()
      void reverseGeocode(fallback, reverseControllerRef.current.signal)
      return
    }

    setCoordinates(manualLocation.coordinates)
    setAddress(manualLocation.address)
    setStatus("ready")
    setError(null)
  }, [manualLocation, fallback, reverseGeocode])

  // Used to sync coodinates with the background script
  useEffect(() => {
    if (coordinates) setCachedCoordinates(coordinates)
  }, [coordinates, setCachedCoordinates])

  useEffect(() => {
    if (autoLocation) {
      if (navigator.permissions) {
        void navigator.permissions
          .query({ name: "geolocation" as PermissionName })
          .then((perm) => {
            if (perm.state === "granted") setFromBrowser()
            else if (perm.state === "prompt") {
              // show fallback for UX while waiting
              setCoordinates(fallback)
              setAddress("")
              setStatus("idle")
              setLoadingCoordinates(true)

              if (reverseControllerRef.current)
                reverseControllerRef.current.abort()
              reverseControllerRef.current = new AbortController()
              void reverseGeocode(fallback, reverseControllerRef.current.signal)
            } else {
              setCoordinates(fallback)
              setAddress("")
              setStatus("error")
              setError(
                "Location access blocked. Enable it in browser settings."
              )
              setLoadingCoordinates(false)

              if (reverseControllerRef.current)
                reverseControllerRef.current.abort()
              reverseControllerRef.current = new AbortController()
              void reverseGeocode(fallback, reverseControllerRef.current.signal)
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
    coordinates,
    address,
    status,
    loadingCoordinates,
    error,
    requestLocation
  }
}
