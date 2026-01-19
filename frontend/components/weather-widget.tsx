import { useState } from "react"
import { Cloud, CloudRain, Eye, Wind, Droplets, Gauge } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWeather, INDIAN_CITIES, type WeatherData } from "@/hooks/use-weather"

interface WeatherWidgetProps {
  onWeatherChange?: (weather: WeatherData) => void
}

const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case "clear":
      return "☀️"
    case "cloudy":
      return "☁️"
    case "rain":
      return "🌧️"
    case "storm":
      return "⛈️"
    default:
      return "🌤️"
  }
}

export function WeatherWidget({ onWeatherChange }: WeatherWidgetProps) {
  const { weather, loading, error, fetchWeather } = useWeather()
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchInput, setSearchInput] = useState("")

  const handleCitySelect = (cityName: string) => {
    fetchWeather(cityName).then((data) => {
      if (data && onWeatherChange) {
        onWeatherChange(data)
      }
    })
    setShowDropdown(false)
    setSearchInput("")
  }

  const filteredCities = INDIAN_CITIES.filter((city) => city.name.toLowerCase().includes(searchInput.toLowerCase()))

  return (
    <div className="space-y-4">
      {/* City Search */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Indian cities..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full rounded-lg border border-gray-300 bg-white/90 px-4 py-2 text-gray-800 transition-all placeholder:text-gray-400 focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[#00a651]/50"
            />

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => handleCitySelect(city.name)}
                      className="w-full px-4 py-2 text-left text-gray-800 transition-colors hover:bg-[#00a651]/10"
                    >
                      {city.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No cities found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weather Card */}
      {loading && (
        <div className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="text-center">
            <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#00a651]/20 border-t-[#00a651]" />
            <p className="text-sm text-gray-300">Fetching weather...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-300 backdrop-blur-sm">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {weather && !loading && (
        <Card className="border-white/10 bg-white/5 shadow-xl backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg">
                {getWeatherIcon(weather.weatherCondition)} {weather.city}
              </span>
              <span className="text-3xl font-bold text-[#00a651]">{weather.temperature}°C</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Main Description */}
            <div className="rounded-lg bg-white/5 p-3 text-center">
              <p className="text-sm font-medium text-gray-100">{weather.weatherDescription}</p>
              <p className="text-xs text-gray-400">Feels like {weather.feelsLike}°C</p>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {/* Humidity */}
              <div className="rounded-lg bg-white/5 p-3 text-center">
                <div className="mb-2 flex justify-center text-blue-400">
                  <Droplets size={18} />
                </div>
                <p className="text-sm font-medium text-gray-200">{weather.humidity}%</p>
                <p className="text-xs text-gray-400">Humidity</p>
              </div>

              {/* Wind Speed */}
              <div className="rounded-lg bg-white/5 p-3 text-center">
                <div className="mb-2 flex justify-center text-cyan-400">
                  <Wind size={18} />
                </div>
                <p className="text-sm font-medium text-gray-200">{weather.windSpeed} m/s</p>
                <p className="text-xs text-gray-400">Wind</p>
              </div>

              {/* Cloud Coverage */}
              <div className="rounded-lg bg-white/5 p-3 text-center">
                <div className="mb-2 flex justify-center text-gray-300">
                  <Cloud size={18} />
                </div>
                <p className="text-sm font-medium text-gray-200">{weather.cloudiness}%</p>
                <p className="text-xs text-gray-400">Clouds</p>
              </div>

              {/* Pressure */}
              <div className="rounded-lg bg-white/5 p-3 text-center">
                <div className="mb-2 flex justify-center text-amber-400">
                  <Gauge size={18} />
                </div>
                <p className="text-sm font-medium text-gray-200">{weather.pressure} hPa</p>
                <p className="text-xs text-gray-400">Pressure</p>
              </div>
            </div>

            {/* Info Message */}
            <div className="rounded-lg border border-[#00a651]/30 bg-[#00a651]/5 p-3 text-xs text-gray-300">
              ℹ️ These weather values are automatically used in your prediction. Adjust if needed.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
