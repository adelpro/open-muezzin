export async function showPrayerBadge() {
  const action = chrome.action || chrome.browserAction
  if (!action) return

  try {
    // single # (was ##)
    await action.setBadgeBackgroundColor({ color: "#e0e0e0" })
    await action.setBadgeText({ text: "🟢" })

    // reset after 15 minutes
    setTimeout(
      () => {
        action.setBadgeText({ text: "" })
      },
      15 * 60 * 1000
    )
  } catch (err) {
    console.warn("Badge not supported in this browser", err)
  }
}

export async function testPrayerBadge() {
  const action = chrome.action || chrome.browserAction
  if (!action) return

  try {
    await action.setBadgeBackgroundColor({ color: "#e0e0e0" })
    await action.setBadgeText({ text: "🟢" })

    setTimeout(() => {
      action.setBadgeText({ text: "" })
    }, 5000)
  } catch (err) {
    console.warn("Badge test failed", err)
  }
}
