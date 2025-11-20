import { CalculationMethod } from "adhan"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { extensionStorage } from "./extention-storage";


type Coordinates = { latitude: number; longitude: number }
type Location = { address: string; coordinates: Coordinates }

export type SettingsState = {
  calculationMethod: keyof typeof CalculationMethod
  manualLocation?: Location
  autoLocation: boolean
  twentyFourHourFormat?: boolean
  notificationsEnabled?: boolean
  cachedCoordinates?: Location

  setCalculationMethod: (method: keyof typeof CalculationMethod) => void
  setManualLocation: (location: Location) => void
  setAutoLocation: (value: boolean) => void
  setTwentyFourHourFormat: (value: boolean) => void
  setNotificationsEnabled: (value: boolean) => void

  setCachedCoordinates: (location: Location) => void

}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      calculationMethod: "MuslimWorldLeague",
      manualLocation: undefined,
      autoLocation: true,
      twentyFourHourFormat: false,
      notificationsEnabled: true,
      cachedCoordinates: undefined,

      setCalculationMethod: (method) => set({ calculationMethod: method }),
      setManualLocation: (location) => set({ manualLocation: location }),
      setAutoLocation: (value) => set({ autoLocation: value }),
      setTwentyFourHourFormat: (value) => set({ twentyFourHourFormat: value }),
      setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
      setCachedCoordinates: (location) => set({ cachedCoordinates: location }),

    }),
    {
      name: "open-muezzin-settings",
      storage: createJSONStorage(() => extensionStorage),
    }
  )
)
