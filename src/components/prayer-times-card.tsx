import type { PrayerTimesData } from "@/types/prayer-times-data.js"
import { CalculationMethod, Coordinates, PrayerTimes } from "adhan"
import { Clock, Moon, Sun, Sunrise, Sunset } from "lucide-react"
import React, { useEffect, useState } from "react"

type PrayerTimesCardProps = {
  times: PrayerTimesData
  location: string
  date: string
  coordinates: Coordinates
  currentWindowMinutes?: number
}

export function PrayerTimesCard({
  times,
  location,
  date,
  coordinates,
  currentWindowMinutes = 15
}: PrayerTimesCardProps) {
  const icons: Record<string, JSX.Element> = {
    fajr: <Moon size={18} />,
    sunrise: <Sunrise size={18} />,
    dhuhr: <Sun size={18} />,
    asr: <Clock size={18} />,
    maghrib: <Sunset size={18} />,
    isha: <Moon size={18} />
  }

  const prayerOrder = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Build prayers array including next-day Fajr
  const buildPrayerList = () => {
    const todayPrayers = prayerOrder.map((prayer) => ({
      name: prayer,
      time: times[prayer as keyof PrayerTimesData] as Date
    }))
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextDayFajr = new PrayerTimes(
      coordinates,
      tomorrow,
      CalculationMethod.MuslimWorldLeague()
    ).fajr
    todayPrayers.push({ name: "fajr", time: nextDayFajr })
    return todayPrayers
  }

  const prayers = buildPrayerList()

  // Determine current and next prayer
  let currentPrayer: { name: string; time: Date } | null = null
  let nextPrayer: { name: string; time: Date } | null = null

  for (let i = 0; i < prayers.length; i++) {
    const prayer = prayers[i]
    const windowEnd = new Date(
      prayer.time.getTime() + currentWindowMinutes * 60 * 1000
    )
    if (now >= prayer.time && now <= windowEnd) {
      currentPrayer = prayer
      nextPrayer = prayers[i + 1] || prayers[0]
      break
    }
    if (prayer.time > now && !nextPrayer) {
      nextPrayer = prayer
      break
    }
  }

  if (!currentPrayer && !nextPrayer) {
    // after Isha, next prayer is tomorrow Fajr
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextDayFajr = new PrayerTimes(
      coordinates,
      tomorrow,
      CalculationMethod.MuslimWorldLeague()
    ).fajr
    nextPrayer = { name: "fajr", time: nextDayFajr }
  }

  const getCountdown = (target: Date) => {
    const diffMs = target.getTime() - now.getTime()
    if (diffMs <= 0) return "0m 00s" // keep seconds always visible
    const hours = Math.floor(diffMs / 3600000)
    const minutes = Math.floor((diffMs % 3600000) / 60000)
    const seconds = Math.floor((diffMs % 60000) / 1000)
    return [
      hours > 0 ? `${hours}h` : "",
      `${minutes}m`,
      `${seconds.toString().padStart(2, "0")}s` // always 2 digits
    ]
      .filter(Boolean)
      .join(" ")
  }

  return (
    <>
      <div className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-4 text-gray-900 dark:text-gray-100">
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {prayerOrder.map((prayer) => {
            const time = times[prayer as keyof PrayerTimesData] as Date
            const isCurrent = currentPrayer?.name === prayer
            const isNext = nextPrayer?.name === prayer

            let middleTimer = ""
            if (isCurrent) {
              const windowEnd = new Date(
                time.getTime() + currentWindowMinutes * 60 * 1000
              )
              middleTimer = getCountdown(windowEnd)
            } else if (isNext) {
              middleTimer = getCountdown(nextPrayer!.time)
            }

            return (
              <li
                key={prayer}
                className={`flex items-center justify-between py-3 px-3 rounded-xl transition-colors ${
                  isCurrent
                    ? "bg-primary/10 text-primary font-semibold shadow-sm ring-1 ring-primary/20"
                    : ""
                }`}>
                <div className="flex items-center gap-2 capitalize w-20">
                  {icons[prayer] || <Clock size={18} />}
                  <span>{prayer}</span>
                </div>

                <div className="flex-1 flex justify-center">
                  {middleTimer && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono ${
                        isCurrent
                          ? "bg-primary text-white shadow"
                          : "bg-accent/20 text-accent"
                      }`}>
                      {middleTimer}
                    </span>
                  )}
                </div>

                <span className="font-mono w-16 text-right text-gray-700 dark:text-gray-300">
                  {time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <footer className="mt-3 text-center text-xs text-gray-500 dark:text-gray-500">
        {location} • {date}
      </footer>
    </>
  )
}
