import { reverseGeocode as reverseGeocodeAPI } from "@/lib/location-service"
import { useSettingsStore } from "@/stores/settings-store"
import type { Coordinates } from "adhan"
import { useCallback, useEffect, useRef, useState } from "react"

type Status = "idle" | "loading" | "error" | "ready"

export function useLocation(fallback: Coordinates) {
  const {
    autoLocation,
    manualLocation,
    cachedCoordinates,
    setCachedCoordinates
  } = useSettingsStore()

  const [coordinates, setCoordinates] = useState<Coordinates>(fallback)
  const [address, setAddress] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  const controllerRef = useRef<AbortController | null>(null)

  const newController = useCallback(() => {
    controllerRef.current?.abort()
    const c = new AbortController()
    controllerRef.current = c
    return c
  }, [])

  const fetchAddress = useCallback(
    async (coords: Coordinates) => {
      const controller = newController()

      try {
        const city = await reverseGeocodeAPI(coords, controller.signal)
        setAddress(city)
        setCachedCoordinates({ coordinates: coords, address: city })
      } catch (event) {
        if ((event as Error).name !== "AbortError") {
          setAddress("Unknown location")
        }
      }
    },
    [newController, setCachedCoordinates]
  )

  const setFromBrowser = useCallback(() => {
    setStatus("loading")
    setError(null)

    if (!navigator.geolocation) {
      setStatus("error")
      setError("Geolocation not supported.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: Coordinates = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }

        setCoordinates(coords)

        if (
          cachedCoordinates &&
          Math.abs(cachedCoordinates.coordinates.latitude - coords.latitude) < 0.0001 &&
          Math.abs(cachedCoordinates.coordinates.longitude - coords.longitude) < 0.0001
        ) {
          setAddress(cachedCoordinates.address)
          setStatus("ready")
          return
        }

        void fetchAddress(coords).then(() => setStatus("ready"))
      },
      (err) => {
        setStatus("error")
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access blocked."
            : "Unable to get location."
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }, [cachedCoordinates, fetchAddress])

  const setFromStore = useCallback(() => {
    if (!manualLocation) {
      setCoordinates(fallback)
      setAddress("")
      setStatus("error")
      setError("Manual location not configured.")
      void fetchAddress(fallback)
      return
    }

    setCoordinates(manualLocation.coordinates)
    setAddress(manualLocation.address)
    setError(null)
    setStatus("ready")
  }, [fallback, manualLocation, fetchAddress])

  useEffect(() => {
    if (autoLocation) {
      if (navigator.permissions) {
        void navigator.permissions
          .query({ name: "geolocation" as PermissionName })
          .then((perm) => {
            if (perm.state === "granted" || perm.state === "prompt") {
              setFromBrowser()
            } else {
              setFromStore()
            }
          })
          .catch(() => setFromBrowser())
      } else {
        setFromBrowser()
      }
    } else {
      setFromStore()
    }

    return () => controllerRef.current?.abort()
  }, [autoLocation, setFromBrowser, setFromStore])

  return {
    coordinates,
    address,
    status,
    error,
    requestLocation: setFromBrowser
  }
}
