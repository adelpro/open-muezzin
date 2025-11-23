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

        // FIXED: Added null check for cachedCoordinates before accessing .coordinates
        const coordinates = cachedCoordinates?.coordinates ?? null

        const notificationsEnabled =
          settings.state?.notificationsEnabled ?? true

        // FIXED: Extracted to separate variable for clarity
        const calculationMethod = settings.state?.calculationMethod ?? null

        resolve({ coordinates, notificationsEnabled, calculationMethod })
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

  // Use default method if none specified
  const method = calculationMethod
    ? CalculationMethod[calculationMethod]()
    : CalculationMethod.MuslimWorldLeague()

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
    const diffMinutes = Math.floor(
      (closestPrayer.time.getTime() - now.getTime()) / 60000
    )
    // Show countdown before prayer (positive numbers) and time passed after (with +)
    const badgeText = diffMinutes >= 0
      ? `-${Math.abs(diffMinutes)}`
      : `+${Math.abs(diffMinutes)}`
    showBadge(badgeText)

    // Show Notification at prayer time
    if (notificationsEnabled && diffMinutes === 0) {
      // Prevent duplicate notifications
      if (lastNotifiedPrayer !== closestPrayer.name) {
        showNotification(closestPrayer.name)
        lastNotifiedPrayer = closestPrayer.name
      }
    }
  } else {
    hideBadge()
  }
}

// Storage Change Listener
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return
  const change = changes["open-muezzin-settings"]
  if (!change) return

  try {
    updatePrayerBadge()
  } catch (err) {
    console.error("Failed to update badge after settings change:", err)
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

// Notifications
function showNotification(prayerName: string): void {
  const iconUrl = chrome.runtime.getURL("assets/icon32.png")
  // Get localized prayer name 
  const localizedPrayerName = chrome.i18n.getMessage(prayerName) || prayerName
  // Get localized message "Time for {prayer}" 
  const title = chrome.i18n.getMessage("extensionName") || "Prayer Time"
  const message = chrome.i18n.getMessage("timeForPrayer", [localizedPrayerName]) || `Time for ${localizedPrayerName}`
  const isFirefox = navigator.userAgent.includes("Firefox")
  const notificationId = `prayer-${prayerName}-${Date.now()}`
  const options: any = { type: "basic", iconUrl, title, message }

  // Chrome-specific: don't require interaction so notification auto-dismisses 
  // Firefox doesn't support requireInteraction anyway 
  if (!isFirefox) {
    options.requireInteraction = true,
      options.priority = 2
  }

  chrome.notifications.create(notificationId, options, (notificationId) => {
    if (chrome.runtime.lastError) { console.error("Notification error:", chrome.runtime.lastError) } else {
      console.log("Notification shown with ID:", notificationId)

      // Auto-clear notification after 10 seconds
      setTimeout(() => { chrome.notifications.clear(notificationId, (wasCleared) => { if (wasCleared) { console.log("Notification auto-cleared:", notificationId) } }) }, 10000)
    }
  })
}


