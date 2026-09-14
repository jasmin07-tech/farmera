import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Sparkles,
  MapPin,
  CreditCard,
  ShoppingBag,
  Gift,
  Coins,
  Tag,
  Check,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFarmStore } from '../services/store';
import { translations } from '../i18n/translations';
import { Order, RegularCustomerOffer } from '../types';

interface CartAndCheckoutModalProps {
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
  onOpenOffersModal?: () => void;
  preselectedOffer?: RegularCustomerOffer | null;
}

export const CartAndCheckoutModal: React.FC<CartAndCheckoutModalProps> = ({
  onClose,
  onOrderCreated,
  onOpenOffersModal,
  preselectedOffer,
}) => {
  const { cart, currentUser, currentLang, customerLoyalty, regularOffers, actions } = useFarmStore();
  const t = translations[currentLang];

  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [deliveryStreet, setDeliveryStreet] = useState('42, 4th Seaward Road, Valmiki Nagar');
  const [deliveryCity, setDeliveryCity] = useState('Chennai');
  const [deliveryPincode, setDeliveryPincode] = useState('600041');
  const [phone, setPhone] = useState(currentUser.phone || '+91 98402 11983');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Offers and Points states
  const [selectedOffer, setSelectedOffer] = useState<RegularCustomerOffer | null>(preselectedOffer || null);
  const [customPromoInput, setCustomPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [redeemPoints, setRedeemPoints] = useState(false);

  // Harvest subtotal calculations
  const harvestSubtotal = cart.reduce((acc, item) => acc + item.crop.pricePerUnit * item.quantity, 0);
  const totalMandiComparison = cart.reduce(
    (acc, item) => acc + item.crop.marketPriceComparison * item.quantity,
    0
  );
  const mandiSavings = totalMandiComparison - harvestSubtotal;

  // Auto-apply recommended offer for regular customer if none selected
  useEffect(() => {
    if (!selectedOffer && customerLoyalty.isRegularCustomer && harvestSubtotal > 0) {
      // Find highest eligible offer
      const eligible = regularOffers.filter((o) => {
        const tierOrder = { bronze: 0, silver: 1, gold: 2, platinum: 3 };
        const userTierLevel = tierOrder[customerLoyalty.tier] ?? 0;
        const offerTierLevel = tierOrder[o.tierRequired] ?? 0;
        return userTierLevel >= offerTierLevel && harvestSubtotal >= o.minOrderValue;
      });
      if (eligible.length > 0) {
        // Pick most generous discount
        const best = eligible.sort((a, b) => b.discountValue - a.discountValue)[0];
        setSelectedOffer(best);
      }
    }
  }, [customerLoyalty, harvestSubtotal, regularOffers, selectedOffer]);

  // Calculate regular patron discount
  let offerDiscount = 0;
  if (selectedOffer) {
    if (harvestSubtotal >= selectedOffer.minOrderValue) {
      if (selectedOffer.discountType === 'percentage') {
        offerDiscount = Math.round((harvestSubtotal * selectedOffer.discountValue) / 100);
      } else {
        offerDiscount = Math.min(harvestSubtotal, selectedOffer.discountValue);
      }
    }
  }

  // Calculate Kisan Loyalty Points discount
  const pointsAvailable = customerLoyalty.kisanPoints;
  const maxPointsDiscount = customerLoyalty.pointsWorthInr;
  const pointsDiscountAmount = redeemPoints
    ? Math.min(maxPointsDiscount, Math.round(harvestSubtotal * 0.5))
    : 0;
  const pointsRedeemedCount = redeemPoints
    ? Math.round(pointsDiscountAmount * 2)
    : 0;

  // Final Payable
  const finalPayable = Math.max(0, harvestSubtotal - offerDiscount - pointsDiscountAmount);
  const totalSavings = mandiSavings + offerDiscount + pointsDiscountAmount;

  // Points to be earned
  const multiplier = (customerLoyalty.tier === 'gold' || customerLoyalty.tier === 'platinum') ? 1.5 : 1.0;
  const pointsToEarn = Math.round((finalPayable / 10) * multiplier);

  const handleApplyPromoCode = () => {
    setPromoError(null);
    const code = customPromoInput.trim().toUpperCase();
    if (!code) return;

    const matched = regularOffers.find((o) => o.code.toUpperCase() === code);
    if (!matched) {
      setPromoError('Invalid offer code. Check your active Regular Patron codes.');
      return;
    }

    const tierOrder = { bronze: 0, silver: 1, gold: 2, platinum: 3 };
    const userTierLevel = tierOrder[customerLoyalty.tier] ?? 0;
    const requiredLevel = tierOrder[matched.tierRequired] ?? 0;

    if (userTierLevel < requiredLevel) {
      setPromoError(`Code ${code} requires ${matched.tierRequired.toUpperCase()} Regular Patron status.`);
      return;
    }

    if (harvestSubtotal < matched.minOrderValue) {
      setPromoError(`Requires minimum cart value of ₹${matched.minOrderValue} (current: ₹${harvestSubtotal}).`);
      return;
    }

    setSelectedOffer(matched);
    setCustomPromoInput('');
  };

  const handleCheckout = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const orderItems = cart.map((item) => ({
        cropId: item.crop.id,
        cropName: item.crop.name,
        farmerId: item.crop.farmerId,
        farmerName: item.crop.farmerName,
        farmName: item.crop.farmName,
        quantity: item.quantity,
        unit: item.crop.unit,
        pricePerUnit: item.crop.pricePerUnit,
        subtotal: item.crop.pricePerUnit * item.quantity,
        photo: item.crop.photos[0],
      }));

      const newOrder = actions.createOrder({
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: phone,
        deliveryAddress: {
          street: deliveryStreet,
          city: deliveryCity,
          pincode: deliveryPincode,
          coordinates: { lat: 12.9822, lng: 80.2612 },
        },
        items: orderItems,
        totalAmount: finalPayable,
        originalSubtotal: harvestSubtotal,
        discountAmount: offerDiscount,
        appliedOfferCode: selectedOffer?.code,
        appliedOfferTitle: selectedOffer?.title,
        kisanPointsRedeemed: pointsRedeemedCount,
        kisanPointsDiscount: pointsDiscountAmount,
        customerTierAtPurchase: customerLoyalty.tier,
        platformFee: 0,
        farmerEarnings: harvestSubtotal, // 100% fair payment protected for the farmers
      });

      // Confetti effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#047857', '#34d399'],
        });
      } catch {}

      setIsSubmitting(false);
      onOrderCreated(newOrder);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-50 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                {step === 'cart' ? 'Direct Farm Cart' : 'Fast Checkout & Dispatch Slot'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {cart.length} unique harvests from verified farmers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1">
          {cart.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-stone-800">Your farm cart is empty</h4>
              <p className="text-xs text-stone-500">
                Browse our fresh seasonal produce direct from verified farmers.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Browse Marketplace
              </button>
            </div>
          ) : step === 'cart' ? (
            <div className="space-y-4">
              {/* Savings Announcement Bar */}
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>
                    Direct Farm Savings: You save ₹{totalSavings} compared to traditional retail!
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-extrabold">
                  0% Middleman
                </span>
              </div>

              {/* Cart Items List */}
              <div className="space-y-3 divide-y divide-stone-200">
                {cart.map(({ crop, quantity }) => (
                  <div
                    key={crop.id}
                    className="pt-3 first:pt-0 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={crop.photos[0]}
                        alt={crop.name}
                        className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 line-clamp-1">{crop.name}</h4>
                        <div className="text-[11px] text-stone-500">
                          {crop.farmerName} • {crop.location}
                        </div>
                        <div className="text-xs font-bold text-emerald-700 mt-0.5">
                          ₹{crop.pricePerUnit} / {crop.unit}{' '}
                          <span className="text-stone-400 line-through text-[10px]">
                            ₹{crop.marketPriceComparison}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity buttons */}
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                        <button
                          onClick={() => actions.updateCartQuantity(crop.id, quantity - 1)}
                          className="text-stone-500 hover:text-stone-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                        <button
                          onClick={() => actions.updateCartQuantity(crop.id, quantity + 1)}
                          className="text-stone-500 hover:text-stone-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[60px]">
                        <div className="text-xs font-black text-stone-900">
                          ₹{crop.pricePerUnit * quantity}
                        </div>
                        <button
                          onClick={() => actions.removeFromCart(crop.id)}
                          className="text-stone-400 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5 ml-auto mt-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Regular Customer Offers & Loyalty Section */}
              <div className="bg-gradient-to-br from-amber-50/70 via-stone-50 to-emerald-50/50 p-3.5 rounded-xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-900">Regular Customer Offers</span>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-200/70 text-amber-900">
                          {customerLoyalty.tierName.split(' ')[0]} VIP
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        {customerLoyalty.isRegularCustomer
                          ? `Exclusive patron perks unlocked for ${currentUser.name}`
                          : 'Order repeat harvests to unlock higher discount tiers'}
                      </p>
                    </div>
                  </div>

                  {onOpenOffersModal && (
                    <button
                      onClick={onOpenOffersModal}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
                    >
                      <span>All Perks</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Available Offers Quick Pills */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-stone-600">Select Regular Patron Discount:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {regularOffers.map((offer) => {
                      const tierOrder = { bronze: 0, silver: 1, gold: 2, platinum: 3 };
                      const userLevel = tierOrder[customerLoyalty.tier] ?? 0;
                      const requiredLevel = tierOrder[offer.tierRequired] ?? 0;
                      const isEligibleTier = userLevel >= requiredLevel;
                      const meetsMin = harvestSubtotal >= offer.minOrderValue;
                      const isApplied = selectedOffer?.code === offer.code;

                      return (
                        <div
                          key={offer.id}
                          onClick={() => {
                            if (isEligibleTier && meetsMin) {
                              setSelectedOffer(isApplied ? null : offer);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isApplied
                              ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600/30'
                              : isEligibleTier && meetsMin
                              ? 'bg-white border-stone-200 hover:border-emerald-300'
                              : 'bg-stone-100/70 border-stone-200 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] font-black tracking-wider text-stone-800">
                              {offer.code}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                isApplied
                                  ? 'bg-emerald-600 text-white'
                                  : isEligibleTier && meetsMin
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {isApplied ? 'Applied' : offer.badgeText}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-stone-900 mt-1 leading-tight">
                            {offer.title}
                          </div>

                          <div className="text-[10px] text-stone-500 mt-1 flex items-center justify-between">
                            <span>Min order ₹{offer.minOrderValue}</span>
                            {!isEligibleTier && (
                              <span className="text-amber-700 font-semibold">
                                {offer.tierRequired.toUpperCase()}+ only
                              </span>
                            )}
                            {isEligibleTier && !meetsMin && (
                              <span className="text-amber-700 font-semibold">
                                Add ₹{offer.minOrderValue - harvestSubtotal} more
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Promo Code Input */}
                <div className="flex gap-2 pt-1">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Have another patron coupon?"
                      value={customPromoInput}
                      onChange={(e) => setCustomPromoInput(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs uppercase font-mono tracking-wider"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyPromoCode}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className="text-[11px] text-red-600 font-medium">{promoError}</p>
                )}

                {/* Kisan Loyalty Points Redemption */}
                {customerLoyalty.kisanPoints > 0 && (
                  <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={redeemPoints}
                        onChange={(e) => setRedeemPoints(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-stone-800 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-500 inline" />
                          Redeem {customerLoyalty.kisanPoints} Kisan Points
                        </span>
                        <span className="text-[11px] text-stone-500 block">
                          Deduct up to ₹{customerLoyalty.pointsWorthInr} on this harvest
                        </span>
                      </div>
                    </label>

                    {redeemPoints && (
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        -₹{pointsDiscountAmount}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bill Details */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Harvest Subtotal:</span>
                  <span className="font-semibold text-stone-900">₹{harvestSubtotal}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Traditional Middlemen Markups:</span>
                  <span className="text-red-500 line-through font-mono">₹{mandiSavings}</span>
                </div>

                {offerDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Regular Patron Offer ({selectedOffer?.code}):</span>
                    </span>
                    <span>-₹{offerDiscount}</span>
                  </div>
                )}

                {pointsDiscountAmount > 0 && (
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      <span>Kisan Points Redeemed ({pointsRedeemedCount} pts):</span>
                    </span>
                    <span>-₹{pointsDiscountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Eco-Crate Green Cluster Delivery:</span>
                  <span className="text-emerald-700 font-semibold">FREE (FarmEra Patron Route)</span>
                </div>

                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>FarmEra Platform Fee:</span>
                  <span>₹0 (Free Farmer Cooperative)</span>
                </div>

                <div className="border-t border-stone-100 pt-2 flex justify-between font-black text-sm text-stone-900">
                  <span>Total Payable:</span>
                  <div className="text-right">
                    <span className="text-emerald-800 text-base">₹{finalPayable}</span>
                    {(offerDiscount > 0 || pointsDiscountAmount > 0) && (
                      <div className="text-[10px] text-emerald-700 font-bold">
                        You save ₹{offerDiscount + pointsDiscountAmount} as regular patron!
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg font-medium space-y-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>100% of harvest value (₹{harvestSubtotal}) is credited directly to the farmer.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-800">
                    <Coins className="w-3.5 h-3.5 shrink-0" />
                    <span>You will earn <strong>+{pointsToEarn} Kisan Points</strong> on this order.</span>
                  </div>
                </div>
              </div>

              {/* Checkout Step Trigger */}
              <button
                onClick={() => setStep('checkout')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Delivery & Address</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Checkout Step */
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Delivery Destination</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-stone-600 font-medium mb-1">Street Address</label>
                    <input
                      type="text"
                      value={deliveryStreet}
                      onChange={(e) => setDeliveryStreet(e.target.value)}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-600 font-medium mb-1">City</label>
                      <input
                        type="text"
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 font-medium mb-1">Pincode</label>
                      <input
                        type="text"
                        value={deliveryPincode}
                        onChange={(e) => setDeliveryPincode(e.target.value)}
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-600 font-medium mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Select Payment Mode</span>
                </h4>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border text-center font-semibold transition-colors ${
                      paymentMethod === 'upi'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    Direct UPI / GPay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center font-semibold transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    Card / NetBanking
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2.5 rounded-xl border text-center font-semibold transition-colors ${
                      paymentMethod === 'cod'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    Cash on Delivery
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('cart')}
                  className="w-1/3 py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-xs"
                >
                  Back to Cart
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={handleCheckout}
                  className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Placing Direct Order...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Direct Order (₹{finalPayable})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
