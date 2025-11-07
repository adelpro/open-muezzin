import { CURRENT_WINDOW_MINUTES } from "@/constants/current-window-minutes"
import { cn } from "@/lib/cn"
import { useSettingsStore } from "@/stores/settings-store"
import type { PrayerTimesData } from "@/types/prayer-times-data.js"
import { CalculationMethod, PrayerTimes } from "adhan"
import type { Coordinates } from "adhan"
import { Clock, Moon, Star, Sun, SunDim, Sunrise, Sunset } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"

type PrayerTimesCardProps = {
  coordinates: Coordinates
  currentWindowMinutes?: number
}

export function PrayerTimesCard({
  coordinates,
  currentWindowMinutes = CURRENT_WINDOW_MINUTES
}: PrayerTimesCardProps) {
  const { calculationMethod, twentyFourHourFormat } = useSettingsStore()
  const method = CalculationMethod[calculationMethod]()

  const [now, setNow] = useState(new Date())

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const prayerOrder = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]

  const icons: Record<string, JSX.Element> = {
    fajr: <Star size={18} />,
    sunrise: <Sunrise size={18} />,
    dhuhr: <Sun size={18} />,
    asr: <SunDim size={18} />,
    maghrib: <Sunset size={18} />,
    isha: <Moon size={18} />
  }

  // Only calculate times when coordinates are ready
  const times: PrayerTimesData = useMemo(() => {
    const today = new Date()
    const prayerTimes = new PrayerTimes(coordinates, today, method)
    return {
      fajr: prayerTimes.fajr,
      sunrise: prayerTimes.sunrise,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha
    }
  }, [coordinates, method])

  // Prepare prayer list including tomorrow's fajr
  const prayers = useMemo(() => {
    const list = prayerOrder.map((prayer) => ({
      name: prayer,
      time: times[prayer as keyof PrayerTimesData] as Date
    }))
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    list.push({
      name: "fajr",
      time: new PrayerTimes(coordinates, tomorrow, method).fajr
    })
    return list
  }, [times, coordinates, method])

  // Determine current and next prayer
  const currentPrayer =
    prayers.find((prayer) => {
      const windowStart = new Date(
        prayer.time.getTime() - currentWindowMinutes * 60 * 1000
      )
      const windowEnd = new Date(
        prayer.time.getTime() + currentWindowMinutes * 60 * 1000
      )
      return now >= windowStart && now <= windowEnd
    }) || null

  const nextPrayer = currentPrayer
    ? prayers[prayers.indexOf(currentPrayer) + 1] || prayers[0]
    : prayers.find((prayer) => prayer.time > now) || prayers[0]

  // Countdown function relative to prayer time
  const getCountdown = (prayerTime: Date) => {
    const diffMs = now.getTime() - prayerTime.getTime()
    const prefix = diffMs < 0 ? "−" : "+"
    const absMs = Math.abs(diffMs)

    const hours = Math.floor(absMs / 3600000)
    const minutes = Math.floor((absMs % 3600000) / 60000)
    const seconds = Math.floor((absMs % 60000) / 1000)

    return `${prefix}${hours ? hours + "h " : ""}${minutes}m ${seconds
      .toString()
      .padStart(2, "0")}s`
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="p-4 w-full text-gray-900 bg-white rounded-2xl border border-gray-200 shadow-lg dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
        <ul className="space-y-2 divide-y divide-gray-100 dark:divide-gray-800">
          {prayerOrder.map((prayer) => {
            const time = times[prayer as keyof PrayerTimesData] as Date
            const isCurrent = currentPrayer?.name === prayer
            const isNext = nextPrayer?.name === prayer

            let timerDisplay = null
            if (isCurrent) {
              timerDisplay = (
                <span className="px-3 py-1 font-mono text-xs text-white rounded-full shadow bg-primary">
                  {getCountdown(time)}
                </span>
              )
            } else if (isNext) {
              timerDisplay = (
                <span className="px-3 py-1 font-mono text-xs rounded-full bg-accent/20 text-accent">
                  −{getCountdown(nextPrayer!.time)}
                </span>
              )
            }

            return (
              <li
                key={prayer}
                className={cn(
                  "flex items-center justify-between py-3 px-3 rounded-xl transition-colors",
                  isCurrent &&
                    "font-semibold ring-1 shadow-sm bg-primary/10 text-primary ring-primary/20"
                )}>
                <div className="flex gap-2 items-center capitalize">
                  {icons[prayer] || <Clock size={18} />}
                  <span>{prayer}</span>
                </div>

                <span className="flex flex-1 justify-center">
                  {timerDisplay}
                </span>

                <span className="font-mono text-right text-gray-700">
                  {time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: !twentyFourHourFormat
                  })}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
