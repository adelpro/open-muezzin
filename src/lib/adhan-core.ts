import { CalculationMethod, Coordinates, PrayerTimes, Qibla } from "adhan"

export type PrayerData = {
  times: Record<string, Date>
}

/**
 * Get prayer times and qibla for given location/date
 */
export function getPrayerData(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  method = CalculationMethod.MuslimWorldLeague
): PrayerData {
  const coordinates = new Coordinates(latitude, longitude)
  const params = method()
  const prayerTimes = new PrayerTimes(coordinates, date, params)
  const qibla = Qibla(coordinates)

  return {
    times: {
      fajr: prayerTimes.fajr,
      sunrise: prayerTimes.sunrise,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha
    }
  }
}
