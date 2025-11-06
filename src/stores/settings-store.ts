import { CalculationMethod } from "adhan"
import { create } from "zustand"

type Coordinates = {
  latitude: number
  longitude: number
}

type SettingsState = {
  calculationMethod: keyof typeof CalculationMethod
  manualLocation: string
  manualCoordinates?: Coordinates
  useManualLocation: boolean
  setCalculationMethod: (method: keyof typeof CalculationMethod) => void
  setManualLocation: (city: string) => void
  setManualCoordinates: (coords: Coordinates) => void
  setUseManualLocation: (value: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  calculationMethod: "MuslimWorldLeague",
  manualLocation: "",
  manualCoordinates: undefined,
  useManualLocation: false,
  setCalculationMethod: (method) => set({ calculationMethod: method }),
  setManualLocation: (city) => set({ manualLocation: city }),
  setManualCoordinates: (coords) => set({ manualCoordinates: coords }),
  setUseManualLocation: (value) => set({ useManualLocation: value })
}))
