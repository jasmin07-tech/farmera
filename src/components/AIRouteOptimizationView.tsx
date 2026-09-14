import React, { useState } from 'react';
import {
  Truck,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Fuel,
  Leaf,
  DollarSign,
  Send,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_DELIVERY_STOPS } from '../data/initialData';
import { DeliveryStop } from '../types';
import { useFarmStore } from '../services/store';
import { translations } from '../i18n/translations';

export const AIRouteOptimizationView: React.FC = () => {
  const { currentLang, actions, orders } = useFarmStore();
  const t = translations[currentLang];

  const [stops, setStops] = useState<DeliveryStop[]>(INITIAL_DELIVERY_STOPS);
  const [isOptimized, setIsOptimized] = useState(true);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(stops[0].id);
  const [isDispatching, setIsDispatching] = useState(false);
  const [batchDispatched, setBatchDispatched] = useState(false);

  // Hub location
  const farmHub = {
    name: 'FarmEra Regional Aggregation Hub (Koyambedu/Guindy Junction)',
    coordinates: { x: 20, y: 30 },
  };

  // Calculations
  const unoptimizedKm = 56.4;
  const optimizedKm = 36.8;
  const savedKm = Number((unoptimizedKm - optimizedKm).toFixed(1));
  const fuelSaved = 680;
  const co2Saved = 14.2;

  const currentDistance = isOptimized ? optimizedKm : unoptimizedKm;

  // Active stop
  const selectedStop = stops.find((s) => s.id === selectedStopId) || stops[0];

  const handleRunOptimization = () => {
    setIsOptimized(true);
  };

  const handleDispatchBatch = () => {
    setIsDispatching(true);

    setTimeout(() => {
      setBatchDispatched(true);
      setIsDispatching(false);

      // Advance any placed/confirmed orders to dispatched
      orders.forEach((o) => {
        if (o.status === 'placed' || o.status === 'confirmed') {
          actions.updateOrderStatus(o.id, 'dispatched');
        }
      });

      actions.addNotification({
        id: `notif-${Date.now()}`,
        title: 'Dispatch Initiated via AI Route 🚚',
        message: 'Delivery van #TN-38-AF-9012 dispatched with 5 customer orders. Route time reduced by 35%.',
        type: 'order',
        timestamp: 'Just now',
        read: false,
      });

      alert('Batch dispatched! Customers received live ETA notifications and farmers received vehicle tracking updates.');
    }, 600);
  };

  const handleSimulateDelivery = () => {
    // Deliver all orders and settle payments
    orders.forEach((o) => {
      if (o.status !== 'delivered') {
        actions.updateOrderStatus(o.id, 'delivered');
      }
    });

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#10b981', '#f59e0b', '#059669'],
      });
    } catch {}

    alert('All batch orders marked Delivered! 100% payments settled directly to farmer bank accounts via UPI with zero deductions.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Module 2 • Dynamic Route & Cluster Optimization</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t.routeOptimizationTitle}
          </h2>

          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            {t.routeOptimizationSub}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsOptimized(!isOptimized)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-black flex items-center gap-2 transition-all"
              id="toggle-route-optimization-btn"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isOptimized ? 'Switch to Naive Route' : 'Run AI Route Optimization'}</span>
            </button>

            {!batchDispatched ? (
              <button
                onClick={handleDispatchBatch}
                disabled={isDispatching}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold flex items-center gap-2 border border-stone-700"
                id="dispatch-batch-btn"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isDispatching ? 'Dispatching...' : t.batchDispatchBtn}</span>
              </button>
            ) : (
              <button
                onClick={handleSimulateDelivery}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black flex items-center gap-2 transition-all shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Delivered & Settle Farmer Payout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Savings Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="text-stone-400 font-semibold text-[11px] flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.distanceSaved}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-1">
            {savedKm} km
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">35% shorter route</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="text-stone-400 font-semibold text-[11px] flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.fuelSaved}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
            ₹{fuelSaved}
          </div>
          <div className="text-[10px] text-stone-500 font-medium">Direct logistics savings</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="text-stone-400 font-semibold text-[11px] flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.carbonSaved}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-1">
            {co2Saved} kg
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">Green distribution</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="text-stone-400 font-semibold text-[11px] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-600" />
            <span>Delivery Window</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
            2.4 hrs
          </div>
          <div className="text-[10px] text-stone-500 font-medium">Down from 4.2 hrs</div>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Stops Sequence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive SVG Route Map Visualizer */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Interactive Urban Delivery Route Visualizer
              </h3>
              <p className="text-xs text-stone-500">
                Hub at Guindy/Koyambedu connecting {stops.length} drop-off locations
              </p>
            </div>
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                isOptimized
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-red-100 text-red-900 border border-red-200'
              }`}
            >
              {isOptimized ? 'AI Optimized Route' : 'Unoptimized Zig-Zag'}
            </span>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full h-80 bg-stone-900 rounded-xl overflow-hidden border border-stone-800 flex items-center justify-center">
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]"></div>

            <svg viewBox="0 0 100 100" className="w-full h-full p-6">
              {/* Route Lines */}
              {isOptimized ? (
                // Optimized path
                <path
                  d="M 20 30 L 42 78 L 50 65 L 62 52 L 74 40 L 78 35"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.8"
                  strokeDasharray="3 1.5"
                  className="animate-pulse"
                />
              ) : (
                // Unoptimized naive criss-cross path
                <path
                  d="M 20 30 L 78 35 L 42 78 L 74 40 L 50 65 L 62 52"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />
              )}

              {/* Farm Hub Marker */}
              <g transform={`translate(${farmHub.coordinates.x}, ${farmHub.coordinates.y})`}>
                <circle r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                <circle r="7" fill="none" stroke="#f59e0b" strokeWidth="0.5" opacity="0.6" />
                <text x="5" y="-3" fill="#fbbf24" fontSize="3.5" fontWeight="bold">
                  Farm Hub
                </text>
              </g>

              {/* Delivery Stop Nodes */}
              {stops.map((stop, idx) => {
                const isSelected = stop.id === selectedStop.id;

                return (
                  <g
                    key={stop.id}
                    transform={`translate(${stop.coordinates.x}, ${stop.coordinates.y})`}
                    onClick={() => setSelectedStopId(stop.id)}
                    className="cursor-pointer group"
                  >
                    <circle
                      r={isSelected ? '4' : '3'}
                      fill={isSelected ? '#10b981' : '#34d399'}
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="1.2"
                      fill="#064e3b"
                      fontSize="2.5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {idx + 1}
                    </text>
                    <text
                      x="4"
                      y="3.5"
                      fill="#ffffff"
                      fontSize="2.5"
                      opacity={isSelected ? 1 : 0.7}
                    >
                      {stop.recipientName.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Micro legend */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-stone-400 bg-stone-950/80 px-2.5 py-1 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> Hub
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Delivery Drop
                </span>
              </div>
              <span className="font-mono text-emerald-300 font-bold">
                Route Distance: {currentDistance} km
              </span>
            </div>
          </div>
        </div>

        {/* Stop Sequence Breakdown */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1 font-semibold">
            <span>{t.stopsSequence} ({stops.length})</span>
            <span className="text-emerald-700">Sequence 1 → {stops.length}</span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {stops.map((stop, idx) => {
              const isSelected = stop.id === selectedStop.id;

              return (
                <div
                  key={stop.id}
                  onClick={() => setSelectedStopId(stop.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-500 shadow-sm ring-1 ring-emerald-300'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-stone-900">
                        {stop.recipientName}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {stop.timeSlot}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 line-clamp-1 ml-7">
                    {stop.address}
                  </p>

                  <div className="mt-1.5 ml-7 text-[10px] text-emerald-800 font-medium bg-emerald-100/60 px-2 py-0.5 rounded inline-block">
                    {stop.itemsSummary}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected stop quick details */}
          <div className="bg-stone-100 p-3.5 rounded-xl border border-stone-200 text-xs space-y-1.5">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Automated Farmer Notification Protocol</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              When driver confirms each stop via OTP or signature, the farmer receives an instant notification and 100% of harvest payment is transferred directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
