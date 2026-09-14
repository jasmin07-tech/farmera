import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  BarChart2,
  PieChart,
  Lightbulb,
} from 'lucide-react';
import { DEMAND_FORECAST_DATA } from '../data/initialData';
import { DemandForecastItem } from '../types';
import { useFarmStore } from '../services/store';
import { translations } from '../i18n/translations';

export const AIDemandForecastView: React.FC = () => {
  const { currentLang } = useFarmStore();
  const t = translations[currentLang];

  const [forecasts, setForecasts] = useState<DemandForecastItem[]>(DEMAND_FORECAST_DATA);
  const [selectedCrop, setSelectedCrop] = useState<DemandForecastItem>(DEMAND_FORECAST_DATA[0]);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateUpdate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      // Simulate real-time re-calibration with fresh mandi arrivals and weather models
      const updated = forecasts.map((f) => {
        const delta = Math.floor(Math.random() * 8) - 4;
        return {
          ...f,
          currentDemandIndex: Math.min(98, Math.max(30, f.currentDemandIndex + delta)),
        };
      });
      setForecasts(updated);
      setSelectedCrop(updated.find((c) => c.cropName === selectedCrop.cropName) || updated[0]);
      setIsSimulating(false);
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-amber-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Module 1 • Predictive Market Intelligence</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t.demandForecastingTitle}
          </h2>

          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            {t.demandForecastingSub}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleSimulateUpdate}
              disabled={isSimulating}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Recalculating Models...' : 'Run Real-Time AI Analysis'}</span>
            </button>
            <span className="text-xs text-amber-200/80 font-mono">
              Model: FarmEra Prophet-Seasonal v3.2
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Crop Selector on left, Deep Forecast on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Crop Forecast Cards List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1 font-semibold">
            <span>Tracked Regional Harvests</span>
            <span>Forecast Demand Trend</span>
          </div>

          <div className="space-y-2.5">
            {forecasts.map((item) => {
              const isSelected = item.cropName === selectedCrop.cropName;
              const isRising = item.trend === 'rising';

              return (
                <div
                  key={item.cropName}
                  onClick={() => setSelectedCrop(item)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-500 shadow-md ring-1 ring-amber-400'
                      : 'bg-white border-stone-200 hover:border-stone-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                        {item.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 mt-1">
                        {item.cropName}
                      </h4>
                    </div>

                    <div className="text-right">
                      <div
                        className={`inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full ${
                          isRising
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isRising ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        <span>{item.predictedDemandChange > 0 ? `+${item.predictedDemandChange}%` : `${item.predictedDemandChange}%`}</span>
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        Est: ₹{item.predictedPrice}/kg
                      </div>
                    </div>
                  </div>

                  {/* Demand score mini-bar */}
                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span>Demand Index: <strong className="text-stone-800">{item.currentDemandIndex}/100</strong></span>
                    <span className="text-stone-400">{item.optimalHarvestWindow}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deep Dive Analytics for Selected Crop */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-stone-900">
                    {selectedCrop.cropName}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                    {selectedCrop.category}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Optimal Harvest Target: <strong className="text-emerald-800">{selectedCrop.optimalHarvestWindow}</strong>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs text-stone-400">Projected Farm-Gate Realization</div>
                <div className="text-xl font-black text-emerald-800">
                  ₹{selectedCrop.predictedPrice} / kg
                </div>
              </div>
            </div>

            {/* Historical vs Forecast Volume SVG Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span className="font-bold flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-emerald-600" />
                  <span>Consumer Demand Volume (Historical vs Projected kg)</span>
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-stone-500">
                    <span className="w-3 h-3 bg-stone-300 rounded-sm"></span> Past 5 Weeks
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="w-3 h-3 bg-emerald-600 rounded-sm"></span> AI Forecast
                  </span>
                </div>
              </div>

              {/* Responsive SVG Bar Chart */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 h-52 flex items-end justify-between gap-2 sm:gap-4">
                {/* Historical Bars */}
                {selectedCrop.historicalVolumeKg.map((vol, idx) => {
                  const maxVol = Math.max(
                    ...selectedCrop.historicalVolumeKg,
                    ...selectedCrop.forecastVolumeKg
                  );
                  const heightPercent = Math.round((vol / maxVol) * 80);

                  return (
                    <div key={`hist-${idx}`} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                      <div className="text-[10px] font-mono text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {vol}
                      </div>
                      <div
                        className="w-full bg-stone-300 group-hover:bg-stone-400 rounded-t-md transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                      <span className="text-[10px] text-stone-500 font-mono">W{idx + 1}</span>
                    </div>
                  );
                })}

                {/* Divider */}
                <div className="w-px h-full bg-stone-200 mx-1"></div>

                {/* Forecast Bars */}
                {selectedCrop.forecastVolumeKg.map((vol, idx) => {
                  const maxVol = Math.max(
                    ...selectedCrop.historicalVolumeKg,
                    ...selectedCrop.forecastVolumeKg
                  );
                  const heightPercent = Math.round((vol / maxVol) * 80);

                  return (
                    <div key={`fore-${idx}`} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                      <div className="text-[10px] font-mono text-emerald-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {vol}
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md shadow-sm group-hover:brightness-110 transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                      <span className="text-[10px] text-emerald-700 font-bold font-mono">
                        +W{idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Supply Advisory Callout */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>{t.recommendedAction}</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">
                {selectedCrop.rationale}
              </p>
            </div>

            {/* High Demand Destination Clusters */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-[10px] uppercase font-bold text-stone-400 mb-1">
                  High Demand Delivery Pincodes
                </div>
                <div className="space-y-1">
                  {selectedCrop.highDemandRegions.map((region, i) => (
                    <div key={i} className="flex items-center gap-1.5 font-semibold text-stone-800 text-xs">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{region}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-[10px] uppercase font-bold text-stone-400 mb-1">
                  Cooperative Strategy
                </div>
                <div className="text-xs text-stone-700 leading-relaxed font-medium">
                  Direct FPO contracts open for upcoming delivery cycles. Lock in advance purchase orders directly with urban residential societies.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
