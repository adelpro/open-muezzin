import "@/styles.css"

import { debounce } from "@/lib/debounce"
import { useSettingsStore } from "@/stores/settings-store"
import { CalculationMethod } from "adhan"
import React, { useCallback, useEffect, useState } from "react"

type NominatimResult = {
  lat: string
  lon: string
  display_name: string
}

export default function Options() {
  const {
    calculationMethod,
    manualLocation,
    autoLocation,
    setCalculationMethod,
    setManualLocation,
    setAutoLocation
  } = useSettingsStore()

  const [cityInput, setCityInput] = useState(manualLocation?.city || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<NominatimResult[] | null>(
    null
  )

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery) {
      setSearchResults(null)
      return
    }
    try {
      setIsLoading(true)
      setError(null)
      setSearchResults(null)

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`,
        { headers: { "User-Agent": "Open-Muezzin-Extension/1.0" } }
      )

      if (!res.ok) throw new Error("Network response was not ok")
      const data: NominatimResult[] = await res.json()
      setSearchResults(data.length > 0 ? data : [])
    } catch (err) {
      console.error(err)
      setError("Failed to fetch location suggestions.")
      setSearchResults(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const debouncedSearch = debounce(performSearch, 500)

  useEffect(() => {
    if (!autoLocation && cityInput && cityInput !== manualLocation?.city) {
      debouncedSearch(cityInput)
    } else {
      setSearchResults(null)
    }
  }, [cityInput, manualLocation, autoLocation])

  const handleSelectLocation = (result: NominatimResult) => {
    setManualLocation({
      city: result.display_name,
      coordinates: {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      }
    })
    setCityInput(result.display_name)
    setSearchResults(null)
    setSuccess(
      `Location saved successfully: ${result.display_name.split(",")[0]}`
    )
    setError(null)
  }

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [success, error])

  return (
    <div className="flex justify-center items-center w-full h-svh">
      <div className="relative p-6 mx-auto w-full max-w-md bg-white rounded-2xl shadow-lg">
        <h1 className="mb-6 text-xl font-bold text-gray-800">
          Muezzin Settings
        </h1>

        {/* Calculation Method */}
        <label className="block mb-2 font-medium text-gray-700">
          Calculation Method
        </label>
        <select
          value={calculationMethod}
          onChange={(event) =>
            setCalculationMethod(
              event.target.value as keyof typeof CalculationMethod
            )
          }
          className="p-2 mb-4 w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          {Object.entries(CalculationMethod).map(([key]) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>

        {/* Auto Location Toggle */}
        <label className="flex gap-3 items-center mb-4">
          <input
            type="checkbox"
            checked={autoLocation}
            onChange={() => setAutoLocation(!autoLocation)}
            className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-400"
          />
          <span className="font-medium text-gray-700">Use Auto Location</span>
        </label>

        {/* Manual Location Input - only show when auto-location is off */}
        {!autoLocation && (
          <div className="relative">
            <label className="block mb-2 font-medium text-gray-700">
              Manual Location (City/Town)
            </label>
            <div className="relative">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => {
                  setCityInput(e.target.value)
                  setSuccess(null)
                  setError(null)
                }}
                placeholder="Enter city name"
                className="relative z-10 p-2 pr-8 mb-4 w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              {isLoading && (
                <span className="absolute right-2 top-1/2 w-3 h-3 rounded-full border-2 border-blue-500 animate-spin -translate-y-1/2 border-t-transparent"></span>
              )}
            </div>

            {!autoLocation && (searchResults || isLoading) && (
              <div className="absolute right-0 left-0 top-16 z-20 bg-white rounded-lg border border-gray-200 shadow-xl">
                {isLoading ? (
                  <p className="flex gap-2 items-center p-3 text-sm text-gray-500">
                    <span className="w-3 h-3 rounded-full border-2 border-blue-500 animate-spin border-t-transparent" />
                    Searching...
                  </p>
                ) : searchResults && searchResults.length > 0 ? (
                  <ul className="overflow-y-auto max-h-60">
                    {searchResults.map((result, index) => (
                      <li
                        key={result.lat + result.lon + index}
                        onClick={() => handleSelectLocation(result)}
                        className="p-3 text-gray-800 border-b border-gray-100 cursor-pointer hover:bg-gray-100 last:border-b-0">
                        {result.display_name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-3 text-sm text-gray-500">
                    No results found for "{cityInput}".
                  </p>
                )}
              </div>
            )}

            {/* Messages */}
            <div aria-live="polite" className="mt-1">
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-500">{success}</p>}
            </div>
          </div>
        )}

        <p className="mt-5 w-full text-sm text-center text-gray-500">
          Powered by OpenStreetMap
        </p>
      </div>
    </div>
  )
}
