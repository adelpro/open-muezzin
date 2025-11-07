import React from "react"

import "@/styles.css"

import { PrayerTimesCard } from "@/components/prayer-times-card"
import { PrayerTimesSkeleton } from "@/components/prayer-times-skeleton"
import { COORDINATES_FALLBACK } from "@/constants/coodinates-fallback"
import { useLocation } from "@/hooks/use-location" // adjust path if needed
import { useSettingsStore } from "@/stores/settings-store"

export default function IndexPopup() {
  // select only autoLocation so the popup doesn't re-render for unrelated store changes
  const autoLocation = useSettingsStore((s) => s.autoLocation)

  const {
    coordinates,
    loadingCoordinates,
    address,
    status,
    error,
    requestLocation
  } = useLocation(COORDINATES_FALLBACK)

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long"
  })

  return (
    <div className="flex flex-col items-center justify-center w-[600px] h-[600px]">
      {(status === "loading" || loadingCoordinates) && <PrayerTimesSkeleton />}
      {status === "ready" && !loadingCoordinates && (
        <PrayerTimesCard coordinates={coordinates} />
      )}

      {status === "idle" && (
        <div className="text-center">
          <p className="text-gray-300">
            Location access is required to show accurate prayer times.
          </p>
          <button
            onClick={requestLocation}
            className="px-4 py-2 mt-4 text-white rounded transition bg-prim ry hover:bg-blue-700">
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
      {/* Footer */}
      <footer className="flex flex-col mt-3 space-y-2 text-xs text-center text-gray-500">
        <span>
          {autoLocation ? "Auto location" : "Manual location"} • {status} •{" "}
          {address ||
            `${coordinates?.latitude?.toFixed?.(3)}, ${coordinates?.longitude?.toFixed?.(3)}`}
        </span>
        <span>{today}</span>
      </footer>
    </div>
  )
}
