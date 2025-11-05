import { usePrayerTimes } from "@/hooks/use-prayer-times.js"
import type { Coordinates } from "adhan"
import React from "react"

import { PrayerTimesCard } from "./prayer-times-card.jsx"

interface PrayerTimesSectionProps {
  location: Coordinates | null
  address?: string
  error?: string | null
}

export function PrayerTimesSection({
  location,
  address,
  error
}: PrayerTimesSectionProps) {
  const times = usePrayerTimes(location)

  if (error)
    return (
      <div className="p-4 text-center text-red-500">Location access denied</div>
    )

  if (!location)
    return (
      <div className="p-4 text-center text-gray-400">
        Waiting for location data...
      </div>
    )

  if (!times)
    return (
      <div className="p-4 text-center text-gray-400">
        Calculating prayer times...
      </div>
    )

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long"
  })

  return (
    <div className="w-full max-w-sm mx-auto">
      <PrayerTimesCard
        times={times}
        location={address || "Unknown location"}
        date={today}
        coordinates={location}
      />
    </div>
  )
}
