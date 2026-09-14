import React from 'react';
import {
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  Coins,
  QrCode,
  Truck,
  Sparkles,
  MapPin,
  HeartHandshake,
} from 'lucide-react';
import { translations } from '../i18n/translations';
import { Language } from '../types';

interface LandingHeroProps {
  currentLang: Language;
  onExploreMarketplace: () => void;
  onOpenFarmerHub: () => void;
  onOpenQRScanner: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  currentLang,
  onExploreMarketplace,
  onOpenFarmerHub,
  onOpenQRScanner,
}) => {
  const t = translations[currentLang];

  return (
    <div className="relative bg-gradient-to-b from-emerald-950 via-emerald-900 to-stone-900 text-white overflow-hidden py-12 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/40">
      {/* Subtle organic pattern overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Mission statement and CTAs */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-700/60 text-emerald-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {t.heroTitle}
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              {t.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreMarketplace}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:gap-3"
                id="hero-cta-marketplace"
              >
                <span>{t.heroCtaMarketplace}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenQRScanner}
                className="px-4 py-3 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/80 font-bold text-sm flex items-center gap-2 transition-colors"
                id="hero-cta-scan-qr"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>{t.scanQR}</span>
              </button>

              <button
                onClick={onOpenFarmerHub}
                className="px-4 py-3 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium text-sm flex items-center gap-2 transition-colors"
                id="hero-cta-farmer-hub"
              >
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                <span>{t.heroCtaFarmer}</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-emerald-800/50 max-w-xl text-center sm:text-left">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-amber-400">4,200+</div>
                <div className="text-xs text-stone-400 font-medium">{t.statFarmers}</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-300">40% Savings</div>
                <div className="text-xs text-stone-400 font-medium">{t.statSaved}</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-white">&lt; 24h</div>
                <div className="text-xs text-stone-400 font-medium">{t.statFreshness}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Price Transparency & Elimination Widget */}
          <div className="lg:col-span-5">
            <div className="bg-stone-900/90 backdrop-blur border border-emerald-700/50 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-stone-100">
                      {t.priceComparisonTitle}
                    </h2>
                    <p className="text-[11px] text-stone-400">
                      Sample: 1kg Native Country Vine Tomatoes
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Real Impact
                </span>
              </div>

              {/* Comparison Bars */}
              <div className="space-y-3">
                {/* Traditional Mandi Model */}
                <div className="bg-stone-950/80 rounded-xl p-3 border border-red-900/30">
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                    <span className="flex items-center gap-1 text-red-400 font-semibold">
                      <TrendingDown className="w-3.5 h-3.5" />
                      Traditional Supply Chain (4-5 Middlemen)
                    </span>
                    <span className="font-mono text-red-300 font-bold">₹58 / kg Retail</span>
                  </div>
                  <div className="w-full bg-stone-800 rounded-full h-2.5 overflow-hidden flex">
                    <div
                      className="bg-red-500 h-full"
                      style={{ width: '32%' }}
                      title="Farmer gets ~₹18"
                    ></div>
                    <div
                      className="bg-stone-600 h-full opacity-60"
                      style={{ width: '68%' }}
                      title="Commission, transport, mandi margins ~₹40"
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-400 mt-1.5 font-medium">
                    <span>Farmer gets: <strong className="text-red-300">₹18</strong> (31%)</span>
                    <span>Intermediaries pocket: <strong className="text-stone-300">₹40</strong> (69%)</span>
                  </div>
                </div>

                {/* FarmEra Direct Model */}
                <div className="bg-emerald-950/60 rounded-xl p-3 border border-emerald-600/40">
                  <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      FarmEra Direct Platform
                    </span>
                    <span className="font-mono text-emerald-300 font-bold text-sm">₹34 / kg Direct</span>
                  </div>
                  <div className="w-full bg-stone-800 rounded-full h-2.5 overflow-hidden flex">
                    <div
                      className="bg-emerald-400 h-full"
                      style={{ width: '100%' }}
                      title="Farmer gets 100% of product price: ₹34"
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-emerald-200 mt-1.5 font-semibold">
                    <span>Farmer receives: <strong className="text-emerald-300 font-bold text-xs">₹34</strong> (+88% income!)</span>
                    <span>Customer saves: <strong className="text-amber-300 font-bold text-xs">₹24</strong> (41% off)</span>
                  </div>
                </div>
              </div>

              {/* Verified Digital Guarantee */}
              <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs text-stone-300">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Geo-Tagged Origin: Pollachi Red Loam</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Optimized AI Dispatch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
