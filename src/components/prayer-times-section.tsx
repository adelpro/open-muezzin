import { usePrayerTimes } from "@/hooks/use-prayer-times.js"
import type { Coordinates } from "adhan"
import { PrayerTimesCard } from "./prayer-times-card.jsx"

interface PrayerTimesSectionProps {
  location: Coordinates | null
  address?: string
}

export function PrayerTimesSection({
  location,
  address
}: PrayerTimesSectionProps) {
  const times = usePrayerTimes(location)

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

  return <PrayerTimesCard times={times} location={address} date={today} />
}
