import "@/styles.css"

import { NOMINATIM_API_URL } from "@/constants/nominate-api-url"
import { debounce } from "@/lib/debounce"
import { useSettingsStore } from "@/stores/settings-store"
import { CalculationMethod } from "adhan"
import React, { useCallback, useEffect, useRef, useState } from "react"

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
    setAutoLocation,
    twentyFourHourFormat,
    setTwentyFourHourFormat
  } = useSettingsStore()

  // allow aborting in-flight reverse geocode requests
  const reverseControllerRef = useRef<AbortController | null>(null)

  const [cityInput, setCityInput] = useState(manualLocation?.address || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<NominatimResult[] | null>(
    null
  )

  const performSearch = useCallback(
    async (searchQuery: string, signal?: AbortSignal) => {
      if (!searchQuery) {
        setSearchResults(null)
        return
      }
      try {
        setIsLoading(true)
        setError(null)
        setSearchResults(null)

        const res = await fetch(
          `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=5`,
          { headers: { "User-Agent": "Open-Muezzin-Extension/1.0" }, signal }
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
    },
    []
  )

  const debouncedSearch = debounce(performSearch, 500)

  useEffect(() => {
    if (!autoLocation && cityInput && cityInput !== manualLocation?.address) {
      debouncedSearch(cityInput, reverseControllerRef.current?.signal)
    } else {
      setSearchResults(null)
    }
  }, [cityInput, manualLocation, autoLocation])

  const handleSelectLocation = (result: NominatimResult) => {
    setManualLocation({
      address: result.display_name,
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
    <div className="flex items-center justify-center w-full h-svh">
      <div className="relative w-full max-w-md p-6 mx-auto bg-white shadow-lg rounded-2xl">
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
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          {Object.entries(CalculationMethod).map(([key]) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>

        {/* 24 Hour Toggle */}
        <label className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={twentyFourHourFormat}
            onChange={() => setTwentyFourHourFormat(!twentyFourHourFormat)}
            className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
          />
          <span className="font-medium text-gray-700">Use 24 Hour Format</span>
        </label>

        {/* Auto Location Toggle */}
        <label className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={autoLocation}
            onChange={() => setAutoLocation(!autoLocation)}
            className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
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
                className="relative z-10 w-full p-2 pr-8 mb-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              {isLoading && (
                <span className="absolute w-3 h-3 -translate-y-1/2 border-2 border-blue-500 rounded-full right-2 top-1/2 animate-spin border-t-transparent"></span>
              )}
            </div>

            {!autoLocation && (searchResults || isLoading) && (
              <div className="absolute left-0 right-0 z-20 bg-white border border-gray-200 rounded-lg shadow-xl top-16">
                {isLoading ? (
                  <p className="flex items-center gap-2 p-3 text-sm text-gray-500">
                    <span className="w-3 h-3 border-2 border-blue-500 rounded-full animate-spin border-t-transparent" />
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

        <p className="w-full mt-5 text-sm text-center text-gray-500">
          Powered by OpenStreetMap
        </p>
      </div>
    </div>
  )
}
