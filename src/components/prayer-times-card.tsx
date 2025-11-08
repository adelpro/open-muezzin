import { DIR } from "@/constants/direction"
import { WINDOW_MINUTES } from "@/constants/window-minutes"
import { cn } from "@/lib/cn"
import { useSettingsStore } from "@/stores/settings-store"
import type { PrayerTimesData } from "@/types/prayer-times-data.js"
import { CalculationMethod, PrayerTimes } from "adhan"
import type { Coordinates } from "adhan"
import { Clock, Moon, Star, Sun, SunDim, Sunrise, Sunset } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"

type PrayerTimesCardProps = {
  coordinates: Coordinates
}

export function PrayerTimesCard({ coordinates }: PrayerTimesCardProps) {
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
      name: chrome.i18n.getMessage(prayer),
      time: times[prayer as keyof PrayerTimesData] as Date
    }))
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    list.push({
      name: chrome.i18n.getMessage("Fajr"),
      time: new PrayerTimes(coordinates, tomorrow, method).fajr
    })
    return list
  }, [times, coordinates, method])

  // Determine current and next prayer
  const currentPrayer =
    prayers.find((prayer) => {
      const windowStart = new Date(
        prayer.time.getTime() - WINDOW_MINUTES * 60 * 1000
      )
      const windowEnd = new Date(
        prayer.time.getTime() + WINDOW_MINUTES * 60 * 1000
      )
      return now >= windowStart && now <= windowEnd
    }) || null

  const nextPrayer = currentPrayer
    ? prayers[prayers.indexOf(currentPrayer) + 1] || prayers[0]
    : prayers.find((prayer) => prayer.time > now) || prayers[0]

  // Countdown function for both current and next prayer
  const getCountdown = (prayerTime: Date, forNextPrayer = false) => {
    let diffMs = prayerTime.getTime() - now.getTime() // time until prayer
    let prefix = ""
    if (!forNextPrayer) {
      // For current prayer, show + / − based on window
      prefix = diffMs < 0 ? "+" : "−"
      diffMs = Math.abs(diffMs)
    } else {
      // For next prayer, always show remaining time with −
      prefix = "−"
    }

    const hours = Math.floor(diffMs / 3600000)
    const minutes = Math.floor((diffMs % 3600000) / 60000)
    const seconds = Math.floor((diffMs % 60000) / 1000)

    return `${prefix}${hours ? hours + "h " : ""}${minutes}m ${seconds
      .toString()
      .padStart(2, "0")}s`
  }

  return (
    <div className="mx-auto w-full max-w-sm" dir={DIR}>
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
                  {getCountdown(nextPrayer!.time, true)}
                </span>
              )
            }

            return (
              <li
                key={prayer}
                className={cn(
                  "flex items-center justify-between py-3 px-3 rounded-xl transition-colors",
                  isCurrent &&
                    "font-semibold shadow-sm bg-primary/10 text-primary ring-1 ring-primary"
                )}>
                <div className="flex gap-2 items-center capitalize">
                  {icons[prayer] || <Clock size={18} />}
                  <span>{chrome.i18n.getMessage(prayer)}</span>
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
