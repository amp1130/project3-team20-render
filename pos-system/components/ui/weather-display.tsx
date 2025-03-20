"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Loader2 } from "lucide-react";

// Update the interface to match the actual API response structure
interface WeatherData {
  data_1h: {
    temperature: number[];
  };
  data_current: {
    pictocode: number;
    temperature: number;
  };
}

export function WeatherDisplay() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    // Format the current date
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(now.toLocaleDateString('en-US', options));

    async function fetchWeather() {
      try {
        setLoading(true);
        
        // Use environment variables for weather API
        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
        const lat = process.env.NEXT_PUBLIC_WEATHER_LAT;
        const lon = process.env.NEXT_PUBLIC_WEATHER_LON;
        const asl = process.env.NEXT_PUBLIC_WEATHER_ASL;
        
        const response = await fetch(
          `https://my.meteoblue.com/packages/current?apikey=${apiKey}&lat=${lat}&lon=${lon}&asl=${asl}&format=json`
        );
        
        if (!response.ok) {
          throw new Error("Weather data fetch failed");
        }
        
        const data = await response.json();
        console.log("Weather data:", data);
        setWeather(data);
        setError(false);
      } catch (err) {
        console.error("Error fetching weather:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
    //refresh this stuff 30 minutess yoo
    const intervalId = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Convert Celsius to Fahrenheit
  const celsiusToFahrenheit = (celsius: number): number => {
    return (celsius * 9/5) + 32;
  };

  if (loading) {
    return (
      <div className="flex items-center text-[#5c4f42]">
        <span className="text-sm mr-3">{currentDate}</span>
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        <span className="text-sm">Loading weather...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="flex items-center text-[#5c4f42]">
        <span className="text-sm mr-3">{currentDate}</span>
        <span className="text-sm">Weather unavailable</span>
      </div>
    );
  }

  // Get weather icon based on the pictocode
  const getWeatherIcon = () => {
    // Make sure data_current exists before accessing pictocode
    if (!weather.data_current) {
      return <Sun className="h-5 w-5 mr-1 text-yellow-500" />;
    }
    
    const pictocode = weather.data_current.pictocode;
    
    // Rain: codes 5-9
    if (pictocode >= 5 && pictocode <= 9) {
      return <CloudRain className="h-5 w-5 mr-1 text-blue-500" />;
    } 
    // Cloudy: codes 2-4
    else if (pictocode >= 2 && pictocode <= 4) {
      return <Cloud className="h-5 w-5 mr-1 text-gray-500" />;
    } 
    // Sunny: codes 1, 10+
    else {
      return <Sun className="h-5 w-5 mr-1 text-yellow-500" />;
    }
  };

  // Get temperature in Fahrenheit
  const getTemperatureInFahrenheit = (): number => {
    if (!weather.data_current) return 0;
    return celsiusToFahrenheit(weather.data_current.temperature);
  };

  return (
    <div className="flex items-center text-[#3c2f1f]">
      <span className="text-sm mr-3">{currentDate}</span>
      {getWeatherIcon()}
      <span className="text-sm font-medium">
        {weather.data_current ? Math.round(getTemperatureInFahrenheit()) : "--"}°F
      </span>
    </div>
  );
} 