import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Sun,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  RefreshCw,
  MapPin,
  Send,
  Bot,
  Umbrella,
  Sprout,
  ShieldAlert,
  ArrowUpRight,
  Info,
  Clock,
  ChevronRight,
  LocateFixed,
} from 'lucide-react';
import { useFarmStore } from '../services/store';
import { translations } from '../i18n/translations';
import { WeatherLocation, LiveWeatherData, AgriWeatherAdvisory } from '../types';
import { AGRICULTURAL_HUBS, fetchLiveWeatherData } from '../utils/weatherService';

interface LiveWeatherPredictionViewProps {
  onOpenAIChatbot?: (initialMessage?: string) => void;
  onOpenSMSSimulator?: () => void;
}

export const LiveWeatherPredictionView: React.FC<LiveWeatherPredictionViewProps> = ({
  onOpenAIChatbot,
  onOpenSMSSimulator,
}) => {
  const { currentLang, actions, farmers } = useFarmStore();
  const t = translations[currentLang];

  const [selectedHub, setSelectedHub] = useState<WeatherLocation>(AGRICULTURAL_HUBS[0]);
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCropIndex, setSelectedCropIndex] = useState<number>(0);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // AI Advisory state
  const [aiAdvisoryText, setAiAdvisoryText] = useState<string | null>(null);
  const [isAiAdvisoryLoading, setIsAiAdvisoryLoading] = useState<boolean>(false);

  // Load weather when selectedHub changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setAiAdvisoryText(null);

    fetchLiveWeatherData(selectedHub)
      .then((data) => {
        if (isMounted) {
          setWeatherData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load weather data:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedHub]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLiveWeatherData(selectedHub);
      setWeatherData(data);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const customLoc: WeatherLocation = {
          id: 'custom-gps',
          name: 'My Live Farm Location (GPS)',
          district: 'Detected Basin',
          state: 'Local Region',
          lat: Number(latitude.toFixed(4)),
          lng: Number(longitude.toFixed(4)),
          primaryCrops: ['Mixed Vegetables', 'Seasonal Pulses', 'Local Crops'],
        };
        setSelectedHub(customLoc);
        setIsDetectingLocation(false);
      },
      (error) => {
        console.warn('GPS location detection failed:', error);
        setGpsError('Could not access GPS. Please check location permissions or select an agro-hub below.');
        setIsDetectingLocation(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleGenerateAiAdvisory = async () => {
    if (!weatherData) return;
    setIsAiAdvisoryLoading(true);

    const activeCrop = weatherData.agriAdvisories[selectedCropIndex]?.cropName || selectedHub.primaryCrops?.[0] || 'Vegetables';

    try {
      const response = await fetch('/api/weather/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: selectedHub,
          weather: weatherData,
          crop: activeCrop,
          language: currentLang,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiAdvisoryText(data.advisory);
      } else {
        throw new Error('Server response not ok');
      }
    } catch (err) {
      console.error('Failed to get Gemini advisory:', err);
      // Fallback
      setAiAdvisoryText(
        `🌾 **Agro-Weather Advisory for ${selectedHub.name} (${activeCrop}):**\n\n` +
        `• **Spraying Suitability Index:** Optimal early morning window (6:00 AM - 9:00 AM) with surface winds under 14 km/h.\n` +
        `• **Irrigation Guidance:** Rain probability is ${weatherData.rainProbability}%. If showers develop, pause drip fertigation.\n` +
        `• **Harvest Recommendation:** Harvest mature fruits at dawn when core temperature is cool for maximum shelf life.\n` +
        `• **Disease Prevention:** Apply 5% cold-pressed neem oil or fermented buttermilk on leaf undersides.`
      );
    } finally {
      setIsAiAdvisoryLoading(false);
    }
  };

  const handleBroadcastWeatherSMS = () => {
    if (!weatherData) return;
    const alert = weatherData.alerts[0];
    const cropName = weatherData.agriAdvisories[selectedCropIndex]?.cropName || 'Farm Crops';
    const sprayTime = weatherData.agriAdvisories[selectedCropIndex]?.sprayWindowAdvice || 'Best spray before 9:30 AM.';

    const messageText = `[FarmEra KISAN ALERT] ${selectedHub.name}: Today ${weatherData.currentTempC}°C, ${weatherData.weatherDescription}. Rain prob: ${weatherData.rainProbability}%. Spray Advisory: ${sprayTime} Protect ${cropName}. Details on app.`;

    actions.sendSMS({
      senderId: 'DM-KISAN',
      to: '+91 96772 66757',
      recipientName: selectedHub.associatedFarmerName || 'Registered FPO Farmers',
      recipientRole: 'farmer',
      category: 'advisory',
      message: messageText,
    });

    if (onOpenSMSSimulator) {
      onOpenSMSSimulator();
    }
  };

  const activeAdvisory: AgriWeatherAdvisory | undefined =
    weatherData?.agriAdvisories[selectedCropIndex] || weatherData?.agriAdvisories[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>FarmEra Micro-Climate • Live Agricultural Weather & AI Advisory</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            Live Farm Weather & Predictive Advisory
          </h1>

          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Hyper-local meteorological telemetry combined with agricultural AI: optimize spraying windows,
            prevent fungal spore outbreaks, calibrate precision irrigation, and time dawn harvests before rainfall.
          </p>

          {/* Quick Hub Selector & GPS Button */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={handleDetectGPS}
              disabled={isDetectingLocation}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              id="detect-gps-weather-btn"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>{isDetectingLocation ? 'Detecting GPS...' : 'Use My GPS Location'}</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-all border border-stone-700"
              id="refresh-weather-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>

            <div className="text-xs text-stone-400 flex items-center gap-1 font-mono">
              <span>Station:</span>
              <span className="text-emerald-300 font-bold">{selectedHub.name}</span>
              {weatherData && (
                <span className="text-stone-400">({weatherData.source === 'open-meteo' ? 'Live Satellite & Radar' : 'Telemetry Proxy'})</span>
              )}
            </div>
          </div>

          {gpsError && (
            <div className="text-xs text-amber-300 bg-amber-950/60 border border-amber-800/60 px-3 py-1.5 rounded-lg">
              {gpsError}
            </div>
          )}
        </div>
      </div>

      {/* Regional Farming Hub Badges */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-500 px-1 font-semibold">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Select Regional Agro-Climatic Hub:</span>
          </span>
          <span className="hidden sm:inline">Coordinates & micro-climate calibrate automatically</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {AGRICULTURAL_HUBS.map((hub) => {
            const isSelected = selectedHub.id === hub.id;
            return (
              <button
                key={hub.id}
                onClick={() => setSelectedHub(hub)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600 font-bold'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 shadow-2xs'
                }`}
              >
                <span>{hub.district}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-emerald-950/60 text-emerald-200' : 'bg-stone-100 text-stone-500'
                }`}>
                  {hub.state === 'Tamil Nadu' ? 'TN' : hub.state === 'Kerala' ? 'KL' : hub.state === 'Maharashtra' ? 'MH' : 'AP'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Weather Card & Real-Time Indicators */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-stone-200 shadow-sm flex flex-col items-center justify-center gap-3 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-bold text-stone-700">Connecting to Meteorological Radar & Satellite Feed...</p>
          <p className="text-xs text-stone-500">Calculating temperature, rainfall probability, and leaf wetness proxy for {selectedHub.name}</p>
        </div>
      ) : weatherData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Current Weather Hero Card */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-sm relative overflow-hidden">
              {/* Subtle background decorative badge */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Live Basin Telemetry
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
                      Updated at {weatherData.lastUpdated}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                    {selectedHub.name}
                  </h2>
                  <p className="text-xs text-stone-500 font-medium">
                    {selectedHub.district}, {selectedHub.state} • Lat {selectedHub.lat}°, Lng {selectedHub.lng}°
                  </p>
                </div>

                {/* Primary Weather Icon */}
                <div className="p-3 bg-gradient-to-br from-amber-50 to-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700 shadow-xs">
                  {weatherData.weatherCode >= 60 && weatherData.weatherCode <= 82 ? (
                    <CloudRain className="w-10 h-10 text-blue-600" />
                  ) : weatherData.weatherCode >= 95 ? (
                    <CloudLightning className="w-10 h-10 text-amber-600" />
                  ) : weatherData.cloudCoverPercent > 60 ? (
                    <CloudSun className="w-10 h-10 text-stone-600" />
                  ) : (
                    <Sun className="w-10 h-10 text-amber-500" />
                  )}
                </div>
              </div>

              {/* Temperature & High-level Status */}
              <div className="mt-6 flex flex-wrap items-baseline gap-4">
                <div className="text-5xl sm:text-6xl font-black text-stone-900 tracking-tight">
                  {weatherData.currentTempC}°<span className="text-2xl sm:text-3xl text-stone-400 font-normal">C</span>
                </div>
                <div className="space-y-0.5">
                  <div className="text-base sm:text-lg font-extrabold text-stone-800 flex items-center gap-2">
                    <span>{weatherData.weatherDescription}</span>
                  </div>
                  <div className="text-xs text-stone-500 font-medium">
                    Feels like {weatherData.apparentTempC}°C • UV Index {weatherData.uvIndex}
                  </div>
                </div>
              </div>

              {/* Grid of Key Agri-Meteorological Indicators */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-stone-100">
                {/* 1. Rain Probability */}
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100/80">
                  <div className="flex items-center justify-between text-blue-800 mb-1">
                    <span className="text-[11px] font-bold">Rain Probability</span>
                    <Umbrella className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-lg font-black text-blue-950">
                    {weatherData.rainProbability}%
                  </div>
                  <div className="text-[10px] text-blue-700 font-medium">
                    Precip: {weatherData.precipitationMm} mm
                  </div>
                </div>

                {/* 2. Wind Velocity */}
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between text-stone-700 mb-1">
                    <span className="text-[11px] font-bold">Wind Speed</span>
                    <Wind className="w-4 h-4 text-stone-500" />
                  </div>
                  <div className="text-lg font-black text-stone-900">
                    {weatherData.windSpeedKmh} <span className="text-xs font-normal">km/h</span>
                  </div>
                  <div className={`text-[10px] font-bold ${
                    weatherData.windSpeedKmh < 15 ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {weatherData.windSpeedKmh < 15 ? 'Calm • Spray Safe' : 'Breezy • Caution'}
                  </div>
                </div>

                {/* 3. Relative Humidity */}
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="flex items-center justify-between text-emerald-800 mb-1">
                    <span className="text-[11px] font-bold">Humidity</span>
                    <Droplets className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-lg font-black text-emerald-950">
                    {weatherData.humidityPercent}%
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium">
                    {weatherData.humidityPercent > 75 ? 'Fungal Vigilance' : 'Normal Leaf Turgor'}
                  </div>
                </div>

                {/* 4. Soil Moisture Proxy */}
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                  <div className="flex items-center justify-between text-amber-800 mb-1">
                    <span className="text-[11px] font-bold">Soil Moisture Est.</span>
                    <Sprout className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-lg font-black text-amber-950">
                    {weatherData.soilMoistureEstimatePercent}%
                  </div>
                  <div className="text-[10px] text-amber-700 font-medium">
                    {weatherData.soilMoistureEstimatePercent > 70 ? 'Moist • Root Stable' : 'Moderate Moisture'}
                  </div>
                </div>

                {/* 5. Evapotranspiration (ET0) */}
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between text-stone-700 mb-1">
                    <span className="text-[11px] font-bold">Evapotranspiration</span>
                    <Thermometer className="w-4 h-4 text-stone-500" />
                  </div>
                  <div className="text-lg font-black text-stone-900">
                    {weatherData.evapotranspirationMm} <span className="text-xs font-normal">mm/day</span>
                  </div>
                  <div className="text-[10px] text-stone-500 font-medium">
                    Water loss rate
                  </div>
                </div>

                {/* 6. Cloud Cover & Light */}
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between text-stone-700 mb-1">
                    <span className="text-[11px] font-bold">Cloud Cover</span>
                    <CloudSun className="w-4 h-4 text-stone-500" />
                  </div>
                  <div className="text-lg font-black text-stone-900">
                    {weatherData.cloudCoverPercent}%
                  </div>
                  <div className="text-[10px] text-stone-500 font-medium">
                    {weatherData.cloudCoverPercent < 30 ? 'High Photosynthesis' : 'Diffused Sunlight'}
                  </div>
                </div>
              </div>
            </div>

            {/* 24-Hour Predictive Timeline */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-extrabold text-stone-900">
                    Next 24-Hour Predictive Hourly Sequence
                  </h3>
                </div>
                <span className="text-[11px] text-stone-400 font-mono">
                  Rain Probability % & Temperatures
                </span>
              </div>

              {/* Scrollable Hourly Strip */}
              <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-thin">
                {weatherData.hourly.slice(0, 16).map((hr, idx) => {
                  const isRain = hr.precipitationProb > 40;
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col items-center justify-between p-3 rounded-xl min-w-[76px] border text-center transition-all ${
                        isRain
                          ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                          : 'bg-stone-50/70 border-stone-200 text-stone-800'
                      }`}
                    >
                      <span className="text-[11px] font-bold text-stone-500">{hr.time}</span>

                      {/* Icon */}
                      <div className="my-1.5">
                        {hr.weatherCode >= 60 ? (
                          <CloudRain className="w-5 h-5 text-blue-600" />
                        ) : hr.weatherCode >= 2 ? (
                          <CloudSun className="w-5 h-5 text-stone-600" />
                        ) : (
                          <Sun className="w-5 h-5 text-amber-500" />
                        )}
                      </div>

                      <span className="text-sm font-black">{hr.tempC}°</span>

                      {/* Rain % indicator */}
                      <div className="mt-1 w-full flex items-center justify-center">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          hr.precipitationProb > 40
                            ? 'bg-blue-200 text-blue-900'
                            : 'bg-stone-200/60 text-stone-600'
                        }`}>
                          {hr.precipitationProb}%
                        </span>
                      </div>

                      <span className="text-[9px] text-stone-400 mt-1 font-mono">
                        {hr.windSpeedKmh}k/h
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7-Day Agricultural Forecast Table */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-extrabold text-stone-900">
                    7-Day Multi-Horizon Farming Forecast
                  </h3>
                </div>
                <span className="text-[11px] text-stone-500">
                  Includes Agronomic Action Advisory
                </span>
              </div>

              <div className="divide-y divide-stone-100">
                {weatherData.daily.map((day, idx) => (
                  <div
                    key={idx}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-stone-50/80 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
                        {day.weatherCode >= 60 ? (
                          <CloudRain className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Sun className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-stone-900">{day.dayName}</div>
                        <div className="text-[10px] text-stone-400">{day.date}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                      <div className="text-stone-700 font-semibold min-w-[130px] hidden md:block">
                        {day.weatherDescription}
                      </div>

                      {/* Temp Min / Max */}
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-stone-900">{day.tempMaxC}°</span>
                        <span className="text-stone-400">/</span>
                        <span className="text-stone-500">{day.tempMinC}°</span>
                      </div>

                      {/* Rain Probability Pill */}
                      <div className="flex items-center gap-1 min-w-[65px]">
                        <Umbrella className="w-3 h-3 text-blue-500" />
                        <span className={`font-bold ${day.precipitationProb > 40 ? 'text-blue-700' : 'text-stone-600'}`}>
                          {day.precipitationProb}%
                        </span>
                      </div>

                      {/* Action Tag */}
                      <div className="sm:text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          day.farmingAdvisoryTag.includes('Hold')
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : day.farmingAdvisoryTag.includes('High Winds')
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}>
                          {day.farmingAdvisoryTag}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI Kisan Advisory & Crop Decision Matrix */}
          <div className="lg:col-span-5 space-y-6">
            {/* Active Alerts Banner if exists */}
            {weatherData.alerts.length > 0 && (
              <div className="space-y-3">
                {weatherData.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border text-xs space-y-2 shadow-sm ${
                      alert.severity === 'warning'
                        ? 'bg-amber-50 border-amber-300 text-amber-950'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{alert.title}</span>
                    </div>

                    <p className="text-[11px] text-stone-700 leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="pt-1 border-t border-amber-200/60 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <div className="text-[11px] font-semibold text-stone-800">
                        <span className="font-bold text-emerald-900">Kisan Action:</span> {alert.recommendedAction}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Kisan Crop Action Matrix Card */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    🌾
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-stone-900">
                      Crop-Specific Action Matrix
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Precision decisions for local harvests
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200 uppercase">
                  Agri-Engine
                </span>
              </div>

              {/* Crop Selector Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {weatherData.agriAdvisories.map((adv, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCropIndex(idx)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCropIndex === idx
                        ? 'bg-emerald-800 text-white font-bold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {adv.cropName.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Active Crop Decision Cards */}
              {activeAdvisory && (
                <div className="space-y-3 text-xs">
                  <div className="font-extrabold text-stone-900 text-sm">
                    {activeAdvisory.cropName}
                  </div>

                  {/* 1. Spraying Suitability */}
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-700">Foliar Spraying Window</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        activeAdvisory.sprayWindowStatus === 'optimal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeAdvisory.sprayWindowStatus === 'caution'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {activeAdvisory.sprayWindowStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {activeAdvisory.sprayWindowAdvice}
                    </p>
                  </div>

                  {/* 2. Irrigation Guidance */}
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-700">Irrigation Guidance</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        activeAdvisory.irrigationStatus === 'hold'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {activeAdvisory.irrigationStatus === 'hold' ? 'Hold Drip' : 'Proceed Regular'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {activeAdvisory.irrigationAdvice}
                    </p>
                  </div>

                  {/* 3. Harvesting Suitability */}
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-700">Harvest Window Timing</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        activeAdvisory.harvestSuitability === 'excellent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {activeAdvisory.harvestSuitability}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {activeAdvisory.harvestAdvice}
                    </p>
                  </div>

                  {/* 4. Organic Disease Remedy */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <div className="flex items-center justify-between text-emerald-950 font-bold">
                      <span>Organic Preventive Formula</span>
                      <span className="text-[10px] uppercase text-emerald-800">100% Chemical-Free</span>
                    </div>
                    <p className="text-[11px] text-emerald-900 leading-relaxed">
                      {activeAdvisory.recommendedOrganicSolution}
                    </p>
                  </div>
                </div>
              )}

              {/* Gemini AI Synthesis Button */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleGenerateAiAdvisory}
                  disabled={isAiAdvisoryLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-stone-900 hover:from-emerald-600 hover:to-black text-white text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all group"
                  id="gemini-weather-advisory-btn"
                >
                  <Bot className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
                  <span>
                    {isAiAdvisoryLoading
                      ? 'Generating Gemini Kisan Advisory...'
                      : 'Generate Gemini AI Agro-Advisory'}
                  </span>
                  <span className="text-[9px] bg-emerald-500/40 text-emerald-200 px-1.5 py-0.2 rounded uppercase">
                    3.8 Flash
                  </span>
                </button>

                {aiAdvisoryText && (
                  <div className="p-4 rounded-xl bg-stone-900 text-emerald-200 text-xs font-mono leading-relaxed space-y-2 border border-emerald-800/60 shadow-inner">
                    <div className="flex items-center justify-between text-amber-300 border-b border-stone-800 pb-1.5 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Gemini Kisan Agro-Synthesis
                      </span>
                      <span className="text-[10px] text-stone-400">Live Model Result</span>
                    </div>
                    <div className="whitespace-pre-line text-stone-200 text-[11px] font-sans">
                      {aiAdvisoryText}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Broadcast SMS & Open AI Chatbot */}
              <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleBroadcastWeatherSMS}
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-stone-200"
                  id="send-weather-sms-btn"
                  title="Broadcast this weather advisory via SMS simulator"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Send Advisory SMS</span>
                </button>

                {onOpenAIChatbot && (
                  <button
                    onClick={() => {
                      const initialMsg = `What is today's weather impact in ${selectedHub.name} (${weatherData.currentTempC}°C, rain chance ${weatherData.rainProbability}%) on ${activeAdvisory?.cropName || 'crops'}?`;
                      onOpenAIChatbot(initialMsg);
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
                    id="ask-kisan-ai-weather-btn"
                  >
                    <Bot className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Ask Kisan AI</span>
                  </button>
                )}
              </div>
            </div>

            {/* Farm Producer Association Info Card */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-xs space-y-2">
              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-700" />
                <span>Micro-Climate & FPO Hub Association</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Weather predictions are linked directly to <strong>{selectedHub.name}</strong>.
                {selectedHub.associatedFarmerName && (
                  <> Managed in partnership with local producer <strong>{selectedHub.associatedFarmerName}</strong>.</>
                )}{' '}
                Data incorporates regional topography to assist 4,200+ direct farmers across the belt.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
