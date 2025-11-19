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

// Coordinates & Settings
const getSettings = async (): Promise<{
  coordinates: Coordinates | null
  notificationsEnabled: boolean
  calculationMethod: keyof typeof CalculationMethod | null
}> => {
  return new Promise((resolve) => {
    chrome.storage.local.get("open-muezzin-settings", (result) => {
      const settingsRaw = result["open-muezzin-settings"]
      if (!settingsRaw)
        return resolve({ coordinates: null, notificationsEnabled: true, calculationMethod: null })

      try {
        const settings = JSON.parse(settingsRaw)
        const cachedCoordinates = settings.state?.cachedCoordinates ?? null
        const coordinates = cachedCoordinates.coordinates
        console.log({ cachedCoordinates })
        const notificationsEnabled =
          settings.state?.notificationsEnabled ?? true
        resolve({ coordinates, notificationsEnabled, calculationMethod: settings.state?.calculationMethod ?? null })
      } catch (err) {
        console.error("Failed to parse settings", err)
        resolve({ coordinates: null, notificationsEnabled: true, calculationMethod: null })
      }
    })
  })
}

let lastNotifiedPrayer: string | null = null

// Prayer Check
async function updatePrayerBadge() {
  const now = new Date()
  const { coordinates, notificationsEnabled, calculationMethod } = await getSettings()

  if (!coordinates) {
    hideBadge()
    return
  }
  const method = CalculationMethod[calculationMethod as keyof typeof CalculationMethod]();

  const prayerTimes = new PrayerTimes(coordinates, now, method)

  console.log({ prayerTimes })



  const prayers = PRAYER_ORDER.map((name) => ({
    name,
    time: prayerTimes[name as keyof typeof prayerTimes] as Date
  }))


  const closestPrayer = prayers.find((prayer) => {
    const diffMinutes = (prayer.time.getTime() - now.getTime()) / 60000
    return Math.abs(diffMinutes) <= BADGE_WINDOW_MINUTES
  })

  if (closestPrayer) {
    const diffMinutes = Math.floor(
      (closestPrayer.time.getTime() - now.getTime()) / 60000
    )
    showBadge(`${diffMinutes >= 0 ? "-" : "+"}${Math.abs(diffMinutes)}`)


  } else {
    hideBadge()
  }
}

// Storage Change Listener
// Storage listener: triggers on coordinates or settings change
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return
  const change = changes["open-muezzin-settings"]
  if (!change) return

  try {
    // We just update whenever settings change to be safe
    updatePrayerBadge()
  } catch {
    // ignore parse errors
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

// Initial check
updatePrayerBadge()
