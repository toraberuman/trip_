import React, { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';

interface WeatherProps {
  lat?: number;
  lng?: number;
  locationName: string;
}

interface HourlyData {
  time: string[];
  temperature_2m: number[];
  weathercode: number[];
}

export const WeatherWidget: React.FC<WeatherProps> = ({ lat, lng, locationName }) => {
  const [weatherData, setWeatherData] = useState<HourlyData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lat || !lng) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,weathercode&timezone=auto&forecast_days=1`
        );
        const data = await response.json();
        setWeatherData(data.hourly);
      } catch (error) {
        console.error("Failed to fetch weather", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lng]);

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun className="w-6 h-6 text-orange-500" />;
    if (code <= 3) return <Cloud className="w-6 h-6 text-gray-400" />;
    if (code <= 67) return <CloudRain className="w-6 h-6 text-blue-400" />;
    if (code <= 77) return <CloudSnow className="w-6 h-6 text-cyan-200" />;
    return <CloudLightning className="w-6 h-6 text-purple-500" />;
  };

  if (!lat || !lng) return null;

  return (
    <div className="py-6 px-4 border-b border-yellow-200/50 bg-[#FEFBEA]">
      <div className="flex justify-between items-end mb-4 px-1">
        <div>
           <h3 className="serif text-3xl text-slate-800">{locationName}</h3>
           <p className="text-xs text-slate-400 mt-1 font-serif tracking-wider">未來 24 小時預報</p>
        </div>
        <div className="text-right">
             <a 
               href={`https://tenki.jp/search/?keyword=${encodeURIComponent(locationName)}`}
               target="_blank" 
               rel="noreferrer"
               className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors border border-blue-100"
             >
               tenki.jp 預報 &rarr;
             </a>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2 px-2 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[3rem]">
               <div className="w-6 h-6 bg-yellow-100 rounded-full"></div>
               <div className="w-8 h-4 bg-yellow-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2 px-1 snap-x mask-linear-fade">
          {weatherData && weatherData.time.map((t, idx) => {
            const date = new Date(t);
            const hour = date.getHours();
            
            // Filter: Only show 06:00 to 21:00
            if (hour < 6 || hour > 21) return null;

            const hourStr = hour.toString().padStart(2, '0') + ":00";
            const isNow = idx === 0;
            
            return (
              <div key={idx} className="flex flex-col items-center min-w-[3.5rem] snap-start">
                <span className={`text-[10px] mb-2 font-mono ${isNow ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                  {isNow ? 'NOW' : hourStr}
                </span>
                <div className="mb-2">
                  {getWeatherIcon(weatherData.weathercode[idx])}
                </div>
                <span className="serif text-lg text-slate-700">
                  {Math.round(weatherData.temperature_2m[idx])}°
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};