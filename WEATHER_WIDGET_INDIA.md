# Weather Widget Feature - India Implementation

## Overview
The Real-time Weather Widget for RideWise now displays current weather conditions from Indian cities and automatically populates the prediction form with real-time weather data.

## Features

✅ **Real-time Weather Data**
- Fetches current weather from OpenWeatherMap API
- Displays temperature, humidity, wind speed, cloud coverage, and pressure
- Updates instantly when you search for a city

✅ **Indian Cities Support**
- Pre-built list of 12 major Indian cities:
  - Delhi, Mumbai, Bangalore, Hyderabad, Chennai
  - Kolkata, Pune, Ahmedabad, Jaipur, Lucknow
  - Chandigarh, Indore
- Searchable city dropdown

✅ **Auto-Fill Prediction Form**
- Weather data automatically updates the prediction form
- Temperature, humidity, and wind speed sync with real weather
- Weather condition (clear/cloudy/rain/storm) auto-sets
- Users can override values if needed

✅ **Beautiful UI**
- Weather icons (☀️ ☁️ 🌧️ ⛈️) for visual clarity
- Responsive grid layout showing all weather metrics
- "Feels like" temperature for context
- Matches RideWise dark theme

## Files Added

1. **`frontend/hooks/use-weather.ts`**
   - Custom React hook for weather data fetching
   - Handles OpenWeatherMap API calls
   - Maps weather conditions to app formats
   - Provides INDIAN_CITIES list

2. **`frontend/components/weather-widget.tsx`**
   - Displays weather widget component
   - City search dropdown
   - Weather details grid
   - Auto-fill callback integration

3. **`frontend/app/predict/page.tsx`** (Updated)
   - Imports WeatherWidget component
   - Adds `handleWeatherChange` function
   - Integrates widget above prediction form

## How to Use

1. **Open the Predict Page**
   - Navigate to `/predict` in the app

2. **View Default Weather**
   - Widget loads Delhi weather by default
   - Shows current conditions automatically

3. **Search for Your City**
   - Type city name in search box (e.g., "Mumbai", "Bangalore")
   - Select from dropdown
   - Weather updates instantly

4. **Auto-filled Prediction Form**
   - Temperature, humidity, wind values auto-populate
   - Weather condition automatically sets
   - Adjust manually if needed
   - Click "Predict" to get demand forecast

## Weather Data Displayed

| Metric | Display |
|--------|---------|
| Temperature | Current temp in °C |
| Feels Like | Perceived temperature |
| Humidity | Percentage (%) |
| Wind Speed | Meters per second (m/s) |
| Cloud Coverage | Percentage (%) |
| Pressure | Hectopascals (hPa) |
| Condition | Clear/Cloudy/Rain/Storm |

## Technical Details

**API Used:** OpenWeatherMap Free API
- **Endpoint:** `/data/2.5/weather`
- **Units:** Metric (Celsius, m/s)
- **Rate Limit:** 60 calls/minute (free tier)
- **Coverage:** Global cities including all India

**Weather Condition Mapping:**
```
- "Clear" / "Sunny" → clear
- "Clouds" / "Cloudy" → cloudy
- "Rain" / "Drizzle" → rain
- "Thunderstorm" → storm
```

**Temperature Conversion:**
- API returns Celsius (standard for India)
- Wind speed: API returns m/s, converted to km/h for display

## Future Enhancements

- [ ] Save favorite cities
- [ ] Multiple city comparison
- [ ] Weather forecast (next 5 days)
- [ ] Historical weather data
- [ ] Weather alerts integration
- [ ] Custom location coordinates input

## Notes

- Default city set to **Delhi** on component load
- Weather widget loads instantly on page load
- Search is case-insensitive
- Indian cities are prioritized in the list
- All weather data is real-time, updated from OpenWeatherMap
