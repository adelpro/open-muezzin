import { BADGE_WINDOW_MINUTES } from "@/constants/badge-window-minutes"
import { CalculationMethod, Coordinates, PrayerTimes } from "adhan"

const BADGE_COLOR = "#34d3c3"
const CHECK_INTERVAL_MINUTES = 1
const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const

function showBadge(text: string) {
  const action = chrome.action || chrome.browserAction
  if (!action) return
  try {
    action.setBadgeBackgroundColor({ color: BADGE_COLOR })
    action.setBadgeText({ text })
  } catch (err) {
    console.warn("Badge not supported", err)
  }
}

function hideBadge() {
  const action = chrome.action || chrome.browserAction
  if (!action) return
  try {
    action.setBadgeText({ text: "" })
  } catch (err) {
    console.warn("Failed to hide badge", err)
  }
}

// Coordinates
const getCoordinates = async (): Promise<Coordinates | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get("open-muezzin-settings", (result) => {
      const coords = result["open-muezzin-settings"]?.cachedCoordinates
      resolve(coords ?? null)
    })
  })
}

// Prayer Check
async function updatePrayerBadge() {
  const now = new Date()
  const coordinates = await getCoordinates()

  if (!coordinates) {
    hideBadge()
    return
  }

  const method = CalculationMethod.MuslimWorldLeague()
  const prayerTimes = new PrayerTimes(coordinates, now, method)

  const prayers = PRAYER_ORDER.map((name) => ({
    name,
    time: prayerTimes[name as keyof typeof prayerTimes] as Date
  }))

  const closestPrayer = prayers.find((prayer) => {
    const diffMinutes = (prayer.time.getTime() - now.getTime()) / 60000
    return Math.abs(diffMinutes) <= BADGE_WINDOW_MINUTES
  })

  if (closestPrayer) {
    const diffMinutes = Math.round(
      (closestPrayer.time.getTime() - now.getTime()) / 60000
    )
    showBadge(`${diffMinutes >= 0 ? "-" : "+"}${Math.abs(diffMinutes)}`)

    // Fire notification exactly at prayer time
    if (diffMinutes === 0) {
      console.log("Prayer time is 12 minutes away")
      chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("assets/icon512.png"),
        title: "Prayer Time",
        message: `It's time for ${closestPrayer.name} prayer`,
        priority: 2
      })
    }


  } else {
    hideBadge()
  }
}

//Storage Change Listener
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.cachedCoordinates) {
    updatePrayerBadge()
  }
})

// Interval Update
chrome.alarms.create("checkPrayerBadge", {
  periodInMinutes: CHECK_INTERVAL_MINUTES
})

// Alarm Check
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkPrayerBadge") updatePrayerBadge()
})

