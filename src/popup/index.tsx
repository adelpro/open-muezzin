import { PrayerTimesSection } from "@/components/prayer-times-section.jsx"
import type { Coordinates } from "adhan"
import React, { useEffect, useState } from "react"

import "@/styles.css"

import { PrayerTimesSkeleton } from "@/components/prayer-times-skeleton"

export default function IndexPopup() {
  const [location, setLocation] = useState<Coordinates | null>(null)
  const [address, setAddress] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">(
    "idle"
  )
  const reverseGeocode = async (coords: Coordinates) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
      )
      const data = await response.json()
      setAddress(data.address?.city || data.address?.town || "Unknown location")
    } catch {
      setAddress("Unknown location")
    }
  }

  const requestLocation = () => {
    setStatus("loading")
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.")
      setStatus("error")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }
        setLocation(coords)
        void reverseGeocode(coords)
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
  }

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((perm) => {
          if (perm.state === "granted") requestLocation()
          else if (perm.state === "denied")
            setError("Location access blocked. Enable it in browser settings.")
        })
        .catch(() => {})
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center w-[600px] h-[600px]">
      {status === "loading" && <PrayerTimesSkeleton />}

      {status === "idle" && (
        <div className="text-center">
          <p className="text-gray-300">
            Location access is required to show accurate prayer times.
          </p>
          <button
            onClick={requestLocation}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded transition hover:bg-blue-700">
            Allow Location Access
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() =>
              chrome.tabs.create({ url: "chrome://settings/content/location" })
            }
            className="mt-2 text-sm text-blue-400 underline">
            Open Location Settings
          </button>
        </div>
      )}

      {status === "ready" && location && (
        <PrayerTimesSection location={location} address={address} />
      )}
    </div>
  )
}
