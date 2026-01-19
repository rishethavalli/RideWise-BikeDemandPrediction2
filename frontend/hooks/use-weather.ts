import { useState, useEffect } from "react"

export interface WeatherData {
  city: string
  country: string
  temperature: number
  humidity: number
  windSpeed: number
  weatherCondition: "clear" | "cloudy" | "rain" | "storm"
  weatherDescription: string
  feelsLike: number
  pressure: number
  cloudiness: number
}

export const INDIAN_CITIES = [
  { name: "Delhi", coords: { lat: 28.7041, lon: 77.1025 } },
  { name: "Mumbai", coords: { lat: 19.076, lon: 72.8777 } },
  { name: "Bangalore", coords: { lat: 12.9716, lon: 77.5946 } },
  { name: "Hyderabad", coords: { lat: 17.3850, lon: 78.4867 } },
  { name: "Chennai", coords: { lat: 13.0827, lon: 80.2707 } },
  { name: "Kolkata", coords: { lat: 22.5726, lon: 88.3639 } },
  { name: "Pune", coords: { lat: 18.5204, lon: 73.8567 } },
  { name: "Ahmedabad", coords: { lat: 23.0225, lon: 72.5714 } },
  { name: "Jaipur", coords: { lat: 26.9124, lon: 75.7873 } },
  { name: "Lucknow", coords: { lat: 26.8467, lon: 80.9462 } },
  { name: "Chandigarh", coords: { lat: 30.7333, lon: 76.8 } },
  { name: "Indore", coords: { lat: 22.7196, lon: 75.8577 } },
]

const mapWeatherCondition = (main: string, description: string): "clear" | "cloudy" | "rain" | "storm" => {
  const lowerMain = main.toLowerCase()
  const lowerDesc = description.toLowerCase()

  if (lowerMain === "thunderstorm" || lowerDesc.includes("thunderstorm")) {
    return "storm"
  }
  if (lowerMain === "rain" || lowerDesc.includes("rain")) {
    return "rain"
  }
  if (lowerMain === "drizzle" || lowerDesc.includes("drizzle")) {
    return "rain"
  }
  if (lowerMain === "clouds" || lowerDesc.includes("cloudy")) {
    return "cloudy"
  }
  if (lowerMain === "clear" || lowerMain === "sunny") {
    return "clear"
  }

  return "cloudy"
}

const mapWeatherCode = (code: number): { condition: WeatherData["weatherCondition"]; label: string } => {
  // Open-Meteo weather codes mapping to simple buckets
  if ([0].includes(code)) return { condition: "clear", label: "Clear" }
  if ([1, 2, 3].includes(code)) return { condition: "cloudy", label: "Cloudy" }
  if ([45, 48].includes(code)) return { condition: "cloudy", label: "Fog" }
  if ([51, 53, 55, 56, 57].includes(code)) return { condition: "rain", label: "Drizzle" }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { condition: "rain", label: "Rain" }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: "rain", label: "Snow" }
  if ([95, 96, 99].includes(code)) return { condition: "storm", label: "Thunderstorm" }
  return { condition: "cloudy", label: "Cloudy" }
}

const mapWeatherResponse = (cityName: string, country: string, data: any): WeatherData => {
  const code = data.current.weather_code as number
  const mapped = mapWeatherCode(code)

  return {
    city: cityName,
    country,
    temperature: Math.round(data.current.temperature_2m),
    humidity: Math.round(data.current.relative_humidity_2m),
    windSpeed: Math.round((data.current.wind_speed_10m + Number.EPSILON) * 10) / 10, // already m/s when wind_speed_unit=ms
    weatherCondition: mapped.condition,
    weatherDescription: mapped.label,
    feelsLike: Math.round(data.current.apparent_temperature),
    pressure: Math.round(data.current.pressure_msl),
    cloudiness: Math.round(data.current.cloud_cover),
  }
}

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = async (city: string) => {
    setLoading(true)
    setError(null)

    try {
      const cityEntry = INDIAN_CITIES.find((c) => c.name.toLowerCase() === city.toLowerCase())

      if (!cityEntry) {
        throw new Error(`City not found: ${city}`)
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${cityEntry.coords.lat}&longitude=${cityEntry.coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,cloud_cover,wind_speed_10m,weather_code&wind_speed_unit=ms`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Weather not available for ${city}`)
      }

      const data = await response.json()
      if (!data?.current) {
        throw new Error(`Weather data missing for ${city}`)
      }

      const weatherData = mapWeatherResponse(cityEntry.name, "IN", data)
      setWeather(weatherData)
      return weatherData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch weather"
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather("Delhi")
  }, [])

  return { weather, loading, error, fetchWeather }
}
