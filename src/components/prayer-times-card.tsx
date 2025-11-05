import type { PrayerTimesData } from '@/types/prayer-times-data.js'
import { Clock, Compass } from 'lucide-react'

type Props = {
  data: PrayerTimesData
}

export function PrayerTimesCard({ data }: Props) {
  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="rounded-2xl bg-gradient-to-br from-green-800 to-emerald-500 p-4 shadow-lg text-white">
      <h2 className="mb-3 text-center text-xl font-semibold">Prayer Times</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between">
          <span>Fajr</span>
          <span>{formatTime(data.fajr)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Sunrise</span>
          <span>{formatTime(data.sunrise)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Dhuhr</span>
          <span>{formatTime(data.dhuhr)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Asr</span>
          <span>{formatTime(data.asr)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Maghrib</span>
          <span>{formatTime(data.maghrib)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Isha</span>
          <span>{formatTime(data.isha)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-sm">
        <Compass size={16} />
        <span>Qibla: {Math.round(data.qiblaDirection)}°</span>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2 text-xs opacity-80">
        <Clock size={14} />
        <span>{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  )
}
