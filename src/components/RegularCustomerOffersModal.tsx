import React, { useState } from 'react';
import {
  Gift,
  Sparkles,
  Award,
  CheckCircle2,
  Copy,
  ArrowRight,
  ShieldCheck,
  Tag,
  Percent,
  Truck,
  Check,
  Zap,
  Clock,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  Coins,
  X,
} from 'lucide-react';
import { useFarmStore } from '../services/store';
import { CustomerTier, RegularCustomerOffer } from '../types';

interface RegularCustomerOffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOffer?: (offer: RegularCustomerOffer) => void;
  onOpenCart?: () => void;
}

export const RegularCustomerOffersModal: React.FC<RegularCustomerOffersModalProps> = ({
  isOpen,
  onClose,
  onSelectOffer,
  onOpenCart,
}) => {
  const { customerLoyalty, regularOffers, customerTierOverride, actions } = useFarmStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'offers' | 'tiers' | 'points'>('offers');

  if (!isOpen) return null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApplyOffer = (offer: RegularCustomerOffer) => {
    if (onSelectOffer) {
      onSelectOffer(offer);
    }
    if (onOpenCart) {
      onOpenCart();
    }
    onClose();
  };

  const tiers: {
    id: CustomerTier;
    name: string;
    badge: string;
    minOrders: number;
    color: string;
    accentBg: string;
    perks: string[];
  }[] = [
    {
      id: 'bronze',
      name: 'Seedling Patron',
      badge: 'New Customer',
      minOrders: 0,
      color: 'text-amber-800 border-amber-300 bg-amber-50',
      accentBg: 'bg-amber-100 text-amber-900',
      perks: [
        'Direct farm-gate price transparency',
        'Digital Farm Passport crop tracking',
        'Complete 2 orders to unlock Regular Patron Status',
      ],
    },
    {
      id: 'silver',
      name: 'Silver Farm Friend',
      badge: 'Regular Patron',
      minOrders: 2,
      color: 'text-slate-800 border-slate-300 bg-slate-50',
      accentBg: 'bg-slate-200 text-slate-800',
      perks: [
        '10% Regular discount on all harvests (REGULAR10)',
        'Flat ₹120 off on Family Harvest Baskets (HARVESTLOYAL)',
        'Free Eco-Crate delivery above ₹249 (FRESHCRATE)',
        'SMS harvest & live driver transit tracking',
      ],
    },
    {
      id: 'gold',
      name: 'Gold Harvest VIP',
      badge: 'Frequent Regular',
      minOrders: 3,
      color: 'text-amber-900 border-amber-400 bg-amber-50/70',
      accentBg: 'bg-amber-400/30 text-amber-900',
      perks: [
        '15% VIP harvest savings on all crops (VIPGOLD15)',
        'Complimentary native organic herb & greens bunch (HERBGIFT)',
        '100% Free Eco-Crate delivery across morning cluster routes',
        '1.5x Kisan Loyalty Points on every rupee spent',
        'Priority morning cluster dispatch',
      ],
    },
    {
      id: 'platinum',
      name: 'Platinum Agro Patron',
      badge: 'Champion Regular',
      minOrders: 7,
      color: 'text-emerald-950 border-emerald-400 bg-emerald-50/70',
      accentBg: 'bg-emerald-200 text-emerald-900',
      perks: [
        '20% Max Agro Patron discount (PLATINUM20)',
        '100% Free VIP green priority delivery on all orders',
        'Complimentary seasonal heirloom gift crate every quarter',
        'Early-access reservation for rare heirloom crops & Alphonso/Malgova harvests',
        'VIP direct invitation to annual farmer harvest festivals in Pollachi',
      ],
    },
  ];

  const currentTierIndex = tiers.findIndex((t) => t.id === customerLoyalty.tier);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-stone-50 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-stone-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-300 flex items-center justify-center shadow-inner">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-300/30">
                  Exclusive Patron Privilege
                </span>
                <span className="text-[11px] text-emerald-200">
                  Fair Trade Certified
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-1">
                Regular Customer Offers & Loyalty Rewards
              </h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Rewarding conscious households who consistently purchase directly from local Tamil Nadu farm clusters.
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-emerald-700/50">
            <button
              onClick={() => setActiveTab('offers')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'offers'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Available Offers ({regularOffers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('tiers')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'tiers'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Patron Tiers & Perks</span>
            </button>
            <button
              onClick={() => setActiveTab('points')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'points'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Kisan Loyalty Points ({customerLoyalty.kisanPoints} pts)</span>
            </button>
          </div>
        </div>

        {/* Loyalty Status Hero Card */}
        <div className="bg-white border-b border-stone-200 p-4">
          <div className="bg-gradient-to-br from-stone-50 to-amber-50/40 p-4 rounded-xl border border-amber-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-400 text-amber-800 flex items-center justify-center font-black text-lg shadow-sm">
                  {customerLoyalty.tier === 'platinum' ? '💎' : customerLoyalty.tier === 'gold' ? '🥇' : customerLoyalty.tier === 'silver' ? '🥈' : '🌱'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-stone-900">
                      Ananya Krishnan
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-900 border border-amber-400/40">
                      {customerLoyalty.tierName}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {customerLoyalty.isRegularCustomer ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 inline" /> Verified Regular Patron ({customerLoyalty.orderCount} completed farm orders)
                      </span>
                    ) : (
                      <span>Complete {customerLoyalty.nextTierOrdersNeeded} more order to become a Silver Regular Patron</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Points & Savings Counter */}
              <div className="flex items-center gap-2 sm:gap-3 bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-sm">
                <div className="text-center pr-3 border-r border-stone-100">
                  <div className="text-[10px] uppercase font-bold text-stone-500">Kisan Points</div>
                  <div className="text-sm font-black text-amber-600 flex items-center justify-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>{customerLoyalty.kisanPoints}</span>
                  </div>
                  <div className="text-[10px] text-stone-400">Worth ₹{customerLoyalty.pointsWorthInr}</div>
                </div>
                <div className="text-center pl-1">
                  <div className="text-[10px] uppercase font-bold text-stone-500">Farm Orders</div>
                  <div className="text-sm font-black text-emerald-700">{customerLoyalty.orderCount}</div>
                  <div className="text-[10px] text-stone-400">₹{customerLoyalty.totalSpent} spent</div>
                </div>
              </div>
            </div>

            {/* Progress Bar to Next Tier */}
            {customerLoyalty.nextTierOrdersNeeded > 0 ? (
              <div className="mt-3 pt-3 border-t border-amber-200/60">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-stone-600 font-medium">
                    Progress to <strong className="text-stone-900">{customerLoyalty.nextTierName}</strong>:
                  </span>
                  <span className="text-amber-800 font-bold">
                    {customerLoyalty.nextTierOrdersNeeded} more order{customerLoyalty.nextTierOrdersNeeded > 1 ? 's' : ''} needed
                  </span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(20, (customerLoyalty.orderCount / (customerLoyalty.orderCount + customerLoyalty.nextTierOrdersNeeded)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-2 text-xs text-emerald-800 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>You have reached the highest Agro Patron tier with permanent 20% privileges!</span>
              </div>
            )}

            {/* Quick Demo Tier Switcher */}
            <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Demo Tier Simulation:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {(['bronze', 'silver', 'gold', 'platinum'] as CustomerTier[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => actions.setCustomerTierOverride(customerTierOverride === t ? null : t)}
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border transition-all ${
                      (customerTierOverride || customerLoyalty.tier) === t
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
                {customerTierOverride && (
                  <button
                    onClick={() => actions.setCustomerTierOverride(null)}
                    className="text-[10px] text-stone-400 hover:text-stone-700 underline ml-1"
                  >
                    Auto
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'offers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Exclusive Coupons for Regular Patrons
                  </h3>
                  <p className="text-xs text-stone-500">
                    Apply directly at checkout to save on seasonal direct-from-farmer baskets.
                  </p>
                </div>
                <div className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  0% Cut from Farmer Pay
                </div>
              </div>

              {/* Offers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {regularOffers.map((offer) => {
                  const requiredTierIndex = tiers.findIndex((t) => t.id === offer.tierRequired);
                  const isTierEligible = currentTierIndex >= requiredTierIndex;

                  return (
                    <div
                      key={offer.id}
                      className={`p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                        isTierEligible
                          ? 'bg-white border-emerald-200 shadow-sm hover:border-emerald-400'
                          : 'bg-stone-100/70 border-stone-200 opacity-80'
                      }`}
                    >
                      {/* Top Badges */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              isTierEligible
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-stone-200 text-stone-600 border-stone-300'
                            }`}
                          >
                            {offer.badgeText}
                          </span>

                          <span className="text-[10px] text-stone-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>Valid until {offer.validUntil}</span>
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h4 className="text-sm font-bold text-stone-900 leading-snug">
                          {offer.title}
                        </h4>
                        <p className="text-xs text-stone-600 mt-1">
                          {offer.description}
                        </p>

                        {/* Perk details */}
                        <div className="mt-2.5 text-[11px] bg-stone-50 p-2 rounded-lg text-stone-700 border border-stone-100 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{offer.perkSummary}</span>
                        </div>
                      </div>

                      {/* Bottom Action Section */}
                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        {/* Coupon Code Pill */}
                        <div className="flex items-center bg-stone-100 border border-dashed border-stone-300 rounded-lg px-2.5 py-1">
                          <span className="font-mono text-xs font-black text-stone-800 tracking-wider">
                            {offer.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(offer.code)}
                            className="ml-2 text-stone-500 hover:text-stone-800 transition-colors"
                            title="Copy coupon code"
                          >
                            {copiedCode === offer.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Apply / Unlock Button */}
                        {isTierEligible ? (
                          <button
                            onClick={() => handleApplyOffer(offer)}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm flex items-center gap-1"
                          >
                            <span>Apply to Cart</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-stone-500 bg-stone-200/80 px-2.5 py-1 rounded-md">
                            Requires {offer.tierRequired.toUpperCase()} Tier
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Farmer Protection Guarantee Notice */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <strong className="font-bold text-emerald-900 block mb-0.5">
                    100% Fair Farmer Remuneration Guarantee
                  </strong>
                  When you redeem regular customer discounts, the farmers always receive their full farm-gate price without deduction. FarmEra loyalty savings are subsidized through direct-cluster batch transit and zero middleman markups.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tiers' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  FarmEra Patronage Progression
                </h3>
                <p className="text-xs text-stone-500">
                  Every order placed with local farm collectives advances your customer tier and unlocks progressive savings.
                </p>
              </div>

              <div className="space-y-3">
                {tiers.map((t, idx) => {
                  const isCurrent = customerLoyalty.tier === t.id;
                  const isPast = currentTierIndex > idx;

                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white shadow-sm'
                          : isPast
                          ? 'border-stone-200 bg-stone-50/70'
                          : 'border-stone-200 bg-white opacity-85'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${t.accentBg}`}>
                            {t.name}
                          </span>
                          <span className="text-[11px] text-stone-500 font-medium">
                            {t.minOrders === 0 ? 'First-time buyers' : `${t.minOrders}+ completed orders`}
                          </span>
                        </div>

                        {isCurrent && (
                          <span className="text-[11px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Current Tier
                          </span>
                        )}
                        {isPast && (
                          <span className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Unlocked
                          </span>
                        )}
                      </div>

                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">
                        {t.perks.map((p, pIdx) => (
                          <li key={pIdx} className="text-xs text-stone-700 flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold mt-0.5">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'points' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                    Available Kisan Loyalty Balance
                  </div>
                  <div className="text-2xl font-black mt-0.5 flex items-center gap-2">
                    <Coins className="w-6 h-6 text-amber-200" />
                    <span>{customerLoyalty.kisanPoints} Points</span>
                  </div>
                  <div className="text-xs text-amber-100 mt-0.5">
                    Equal to ₹{customerLoyalty.pointsWorthInr} direct discount on any harvest
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onOpenCart) onOpenCart();
                    onClose();
                  }}
                  className="bg-white text-amber-900 font-black text-xs px-3.5 py-2 rounded-xl shadow hover:bg-amber-50 transition-colors flex items-center gap-1"
                >
                  <span>Redeem in Cart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* How points work */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  How Kisan Loyalty Points Work
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="font-bold text-emerald-800 mb-1">1. Earn on Every Rupee</div>
                    <p className="text-stone-600 text-[11px]">
                      Earn 1 Kisan Point for every ₹10 spent on farm produce. Gold & Platinum regular patrons earn 1.5x points!
                    </p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="font-bold text-amber-800 mb-1">2. Direct Cash Equivalent</div>
                    <p className="text-stone-600 text-[11px]">
                      2 Kisan Points = ₹1.00 direct deduction at checkout. No hidden blackout dates or minimum point blocks.
                    </p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="font-bold text-blue-800 mb-1">3. Direct Farmer Support</div>
                    <p className="text-stone-600 text-[11px]">
                      Farmers receive 100% of their listed price regardless of points redeemed by patrons.
                    </p>
                  </div>
                </div>
              </div>

              {/* Points History Simulation */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Recent Kisan Points Activity
                </h4>
                <div className="divide-y divide-stone-100 text-xs">
                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-stone-800">Completed Order #ORD-8819</div>
                      <div className="text-[10px] text-stone-500">Moringa & Cold-Pressed Gingelly Oil</div>
                    </div>
                    <span className="font-bold text-emerald-700">+69 Points</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-stone-800">Completed Order #ORD-8712</div>
                      <div className="text-[10px] text-stone-500">Karuppu Kavuni Rice & Tender Coconuts</div>
                    </div>
                    <span className="font-bold text-emerald-700">+105 Points</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-stone-800">Completed Order #ORD-8620</div>
                      <div className="text-[10px] text-stone-500">Organic Country Tomatoes & Groundnut Oil</div>
                    </div>
                    <span className="font-bold text-emerald-700">+66 Points</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs">
          <div className="text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Regular customer offers are auto-applied or selectable in your cart.</span>
          </div>

          <button
            onClick={() => {
              if (onOpenCart) onOpenCart();
              onClose();
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Open Farm Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
