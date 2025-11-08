type Props = {
  autoLocation: boolean
  status: string
  address?: string
  coordinates?: { latitude?: number; longitude?: number }
}
const today = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long"
})

export function Footer({ autoLocation, status, address, coordinates }: Props) {
  return (
    <footer className="flex flex-col mt-3 space-y-2 text-xs text-center text-gray-500">
      <span>
        {autoLocation ? "Auto location" : "Manual location"} • {status} •{" "}
        {address ||
          `${coordinates?.latitude?.toFixed?.(3)}, ${coordinates?.longitude?.toFixed?.(3)}`}
      </span>
      <span>{today}</span>
    </footer>
  )
}
