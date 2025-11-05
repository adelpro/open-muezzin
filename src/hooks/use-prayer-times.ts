import type { PrayerTimesData } from "@/types/prayer-times-data.js"
import { CalculationMethod, Coordinates, PrayerTimes } from "adhan"
import { useEffect, useState } from "react"

export function usePrayerTimes(location: Coordinates | null) {
  const [data, setData] = useState<PrayerTimesData | null>(null)

  useEffect(() => {
    if (!location) return

    const coordinates = new Coordinates(location.latitude, location.longitude)
    const params = CalculationMethod.MuslimWorldLeague()
    const today = new Date()
    const times = new PrayerTimes(coordinates, today, params)

    setData({
      fajr: times.fajr,
      sunrise: times.sunrise,
      dhuhr: times.dhuhr,
      asr: times.asr,
      maghrib: times.maghrib,
      isha: times.isha
    })
  }, [location])

  return data
}
