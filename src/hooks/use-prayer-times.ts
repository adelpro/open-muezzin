import { useEffect, useState } from 'react'
import { Coordinates, CalculationMethod, PrayerTimes, Qibla } from 'adhan'
import type { PrayerTimesData } from '@/types/prayer-times-data.js'

/**
 * Hook to calculate daily prayer times and qibla direction
 */
export function usePrayerTimes(location: Coordinates | null) {
  const [data, setData] = useState<PrayerTimesData | null>(null)

  useEffect(() => {
    if (!location) return

    const coordinates = new Coordinates(location.latitude, location.longitude)
    const params = CalculationMethod.MuslimWorldLeague()

    const today = new Date()
    const times = new PrayerTimes(coordinates, today, params)
    const qibla = Qibla(coordinates)

    setData({
      fajr: times.fajr,
      sunrise: times.sunrise,
      dhuhr: times.dhuhr,
      asr: times.asr,
      maghrib: times.maghrib,
      isha: times.isha,
      qiblaDirection: qibla,
    })
  }, [location])

  return data
}
