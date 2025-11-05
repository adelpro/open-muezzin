import React from "react"
import { Clock, Sun, Sunrise, Sunset, Moon } from "lucide-react"
import type { PrayerTimesData } from "@/types/prayer-times-data.js"

type PrayerTimesCardProps = {
  times: PrayerTimesData
  location: string
  date: string
}

export function PrayerTimesCard({
  times,
  location,
  date
}: PrayerTimesCardProps) {
  const icons: Record<string, JSX.Element> = {
    fajr: <Moon size={18} />,
    sunrise: <Sunrise size={18} />,
    dhuhr: <Sun size={18} />,
    asr: <Clock size={18} />,
    maghrib: <Sunset size={18} />,
    isha: <Moon size={18} />
  }

  return (
    <div className="w-full max-w-md p-5 mx-auto bg-white border border-gray-200 shadow-sm rounded-2xl">
      <header className="mb-3 text-center">
        <h2 className="text-lg font-semibold">Prayer Times</h2>
        <p className="text-sm text-gray-500">{`${location} • ${date}`}</p>
      </header>

      <ul className="grid grid-cols-2 gap-3">
        {Object.entries(times).map(([key, value]) => (
          <li
            key={key}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50">
            <div className="flex items-center gap-2 capitalize">
              {icons[key] || <Clock size={18} />}
              <span className="font-medium">{key}</span>
            </div>
            <span className="font-mono text-sm text-gray-700">
              {new Date(value).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
