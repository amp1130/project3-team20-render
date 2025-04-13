"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Loader2 } from "lucide-react";
import { useTheme } from "@/context/theme-context"; // ← import theme hook

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
  const { theme } = useTheme(); // ← get current theme

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(now.toLocaleDateString("en-US", options));

    async function fetchWeather() {
      try {
        setLoading(true);

        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
        const lat = process.env.NEXT_PUBLIC_WEATHER_LAT;
        const lon = process.env.NEXT_PUBLIC_WEATHER_LON;
        const asl = process.env.NEXT_PUBLIC_WEATHER_ASL;

        const response = await fetch(
          `https://my.meteoblue.com/packages/current?apikey=${apiKey}&lat=${lat}&lon=${lon}&asl=${asl}&format=json`
        );

        if (!response.ok) throw new Error("Weather data fetch failed");

        const data = await response.json();
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
    const intervalId = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const celsiusToFahrenheit = (celsius: number): number => (celsius * 9) / 5 + 32;

  const textColor = theme === "dark" ? "text-white" : "text-[#3c2f1f]";

  if (loading) {
    return (
      <div className={`flex items-center ${textColor}`}>
        <span className="text-sm mr-3">{currentDate}</span>
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        <span className="text-sm">Loading weather...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={`flex items-center ${textColor}`}>
        <span className="text-sm mr-3">{currentDate}</span>
        <span className="text-sm">Weather unavailable</span>
      </div>
    );
  }

  const getWeatherIcon = () => {
    const pictocode = weather.data_current?.pictocode ?? 1;

    if (pictocode >= 5 && pictocode <= 9) {
      return <CloudRain className="h-5 w-5 mr-1 text-blue-500" />;
    } else if (pictocode >= 2 && pictocode <= 4) {
      return <Cloud className="h-5 w-5 mr-1 text-gray-400" />;
    } else {
      return <Sun className="h-5 w-5 mr-1 text-yellow-400" />;
    }
  };

  return (
    <div className={`flex items-center ${textColor}`}>
      <span className="text-sm mr-3">{currentDate}</span>
      {getWeatherIcon()}
      <span className="text-sm font-medium">
        {Math.round(celsiusToFahrenheit(weather.data_current.temperature))}°F
      </span>
    </div>
  );
}
