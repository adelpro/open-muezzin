export type PrayerTimesData = {
  fajr: Date
  sunrise: Date
  dhuhr: Date
  asr: Date
  maghrib: Date
  isha: Date
  currentPrayer?: string
  nextPrayer?: string
  remaining?: string
}
