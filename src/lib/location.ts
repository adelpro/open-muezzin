export type UserLocation = {
  latitude: number
  longitude: number
}

/**
 * Request browser geolocation permission and return coordinates
 */
export async function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? 'Location permission denied'
            : error.code === error.POSITION_UNAVAILABLE
              ? 'Location unavailable'
              : error.code === error.TIMEOUT
                ? 'Location request timed out'
                : 'Unknown location error'

        reject(new Error(message))
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}
