import { Settings } from "lucide-react"

export default function SettingsButton() {
  const settingsUrl = chrome.runtime.getURL("options.html")
  const handleSettingsClick = () => {
    chrome.tabs.create({ url: settingsUrl })
    window.close()
  }
  return (
    <div className="flex justify-center items-center">
      <button type="button" className="p-2 m-2" onClick={handleSettingsClick}>
        <Settings size={20} />
      </button>
    </div>
  )
}
