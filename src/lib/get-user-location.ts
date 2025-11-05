export type Coordinates = {
  latitude: number
  longitude: number
}

export async function get_user_location(): Promise<Coordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported")
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        console.error("Error fetching location:", error)
        resolve(null)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}
