import { DIR } from "@/constants/direction"

type Props = {
  autoLocation: boolean
  status: string
  address?: string
  coordinates?: { latitude?: number; longitude?: number }
}

const today = () => {
  const locale = chrome.i18n.getUILanguage() || "ar"
  const todayLocalized = new Date().toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long"
  })
  return todayLocalized
}

export function Footer({ autoLocation, status, address, coordinates }: Props) {
  return (
    <footer
      className="flex flex-col mt-3 space-y-2 text-xs text-center text-gray-500"
      dir={DIR}>
      <span>
        {autoLocation
          ? chrome.i18n.getMessage("autoLocation")
          : chrome.i18n.getMessage("manualLocation")}
        {` • ${chrome.i18n.getMessage(status)} • `}
        {address ||
          `${coordinates?.latitude?.toFixed?.(3)}, ${coordinates?.longitude?.toFixed?.(3)}`}
      </span>
      <span>{today()}</span>
    </footer>
  )
}
