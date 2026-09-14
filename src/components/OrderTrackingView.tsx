import React, { useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Star,
  ShieldCheck,
  MapPin,
  Sparkles,
  ArrowRight,
  MessageSquare,
  DollarSign,
  QrCode,
  Smartphone,
  Gift,
  Tag,
  Coins,
} from 'lucide-react';
import { useFarmStore } from '../services/store';
import { translations } from '../i18n/translations';
import { Order, OrderStatus } from '../types';

interface OrderTrackingViewProps {
  onOpenPassportById?: (farmerId: string) => void;
  onOpenSMSSimulator?: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  onOpenPassportById,
  onOpenSMSSimulator,
}) => {
  const { orders, currentLang, currentUser, actions, farmers, smsMessages } = useFarmStore();
  const t = translations[currentLang];

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    orders[0]?.id || ''
  );
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Filter orders for active user or show all for demo
  const displayOrders = orders;
  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const orderSMSCount = smsMessages.filter(
    (m) => m.orderId === activeOrder?.id || m.message.includes(activeOrder?.id || '')
  ).length;

  const steps: { key: OrderStatus; label: string; desc: string; icon: any }[] = [
    {
      key: 'placed',
      label: t.placed,
      desc: 'Order received at farm gate, allocated to local FPO cluster',
      icon: Clock,
    },
    {
      key: 'confirmed',
      label: t.confirmed,
      desc: 'Farmer picked harvest at dawn, sorted & packed in aerated crates',
      icon: CheckCircle,
    },
    {
      key: 'dispatched',
      label: t.dispatched,
      desc: 'En route via AI optimized low-carbon cluster route',
      icon: Truck,
    },
    {
      key: 'delivered',
      label: t.delivered,
      desc: 'Delivered fresh to doorstep, payment settled directly to farmer',
      icon: Sparkles,
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return 0;
      case 'confirmed':
        return 1;
      case 'dispatched':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const handleAdvanceStatus = (order: Order) => {
    const nextStatusMap: Record<OrderStatus, OrderStatus> = {
      placed: 'confirmed',
      confirmed: 'dispatched',
      dispatched: 'delivered',
      delivered: 'delivered',
    };
    const nextStatus = nextStatusMap[order.status];
    actions.updateOrderStatus(order.id, nextStatus);
  };

  const handleSubmitReview = (order: Order) => {
    if (!reviewComment.trim()) return;
    setIsSubmittingReview(true);

    const firstItem = order.items[0];
    actions.addReview({
      orderId: order.id,
      farmerId: firstItem.farmerId,
      customerId: currentUser.id,
      customerName: currentUser.name,
      rating: reviewRating,
      comment: reviewComment,
      cropName: firstItem.cropName,
    });

    setReviewComment('');
    setIsSubmittingReview(false);
    alert('Thank you! Your verified review and rating have been posted to the farmer profile.');
  };

  if (!activeOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <Package className="w-12 h-12 text-stone-400 mx-auto" />
        <h3 className="text-base font-bold text-stone-700">No active orders yet</h3>
        <p className="text-xs text-stone-500">
          Place your first direct order from our marketplace to track the farm-to-kitchen journey!
        </p>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(activeOrder.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            {t.orderTrackerTitle}
          </h2>
          <p className="text-xs text-stone-500">
            Transparent seed-to-doorstep tracking with instant direct farmer remuneration.
          </p>
        </div>

        {/* Demo Fast-Forward Stepper Action */}
        <div className="flex items-center gap-2">
          {activeOrder.status !== 'delivered' && (
            <button
              onClick={() => handleAdvanceStatus(activeOrder)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
              id="advance-order-status-btn"
              title="Demo fast-forward tool for presentation"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Next Stage →</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Orders Picker List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 px-1">
            Active Orders ({displayOrders.length})
          </h3>

          <div className="space-y-2">
            {displayOrders.map((ord) => {
              const isSelected = ord.id === activeOrder.id;
              const statusColors: Record<OrderStatus, string> = {
                placed: 'bg-blue-100 text-blue-800',
                confirmed: 'bg-amber-100 text-amber-900',
                dispatched: 'bg-purple-100 text-purple-900',
                delivered: 'bg-emerald-100 text-emerald-900',
              };

              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-sm'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-stone-900 font-mono">
                      #{ord.id}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        statusColors[ord.status]
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <div className="text-xs text-stone-700 line-clamp-1 font-medium">
                    {ord.items.map((i) => `${i.quantity}${i.unit} ${i.cropName}`).join(', ')}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                    <span>Direct: ₹{ord.totalAmount}</span>
                    <div className="flex items-center gap-1.5">
                      {ord.appliedOfferCode && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Tag className="w-2.5 h-2.5 text-amber-600" />
                          {ord.appliedOfferCode}
                        </span>
                      )}
                      <span className="text-emerald-700 font-bold">
                        {ord.status === 'delivered' ? '✓ Settled to Farmer' : 'Direct Escrow'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Order Tracking Detail Card */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-6">
            {/* Top summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-stone-900 font-mono">
                    Order #{activeOrder.id}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">
                    • Placed {new Date(activeOrder.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-stone-600 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Delivery to: {activeOrder.deliveryAddress.street}, {activeOrder.deliveryAddress.city}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="text-left sm:text-right">
                  <div className="text-xs text-stone-400">Total Value</div>
                  <div className="text-xl font-black text-emerald-800">
                    ₹{activeOrder.totalAmount}
                  </div>
                </div>

                {onOpenSMSSimulator && (
                  <button
                    onClick={onOpenSMSSimulator}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-amber-300 hover:text-amber-200 text-xs font-bold shadow transition-all border border-stone-800"
                    title="Open live SMS simulator for this order"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View SMS Trail ({orderSMSCount})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Stepper visualization */}
            <div className="py-2">
              <div className="relative">
                {/* Progress bar background line */}
                <div className="absolute top-5 left-6 right-6 h-1 bg-stone-200 -z-0"></div>
                <div
                  className="absolute top-5 left-6 h-1 bg-emerald-600 transition-all duration-500 -z-0"
                  style={{
                    width: `${(currentStepIdx / (steps.length - 1)) * 100}%`,
                  }}
                ></div>

                <div className="grid grid-cols-4 gap-2 text-center relative z-10">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const IconComponent = step.icon;

                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md'
                              : 'bg-stone-200 text-stone-500'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span
                          className={`text-xs mt-2 font-bold leading-tight ${
                            isCurrent
                              ? 'text-emerald-800'
                              : isCompleted
                              ? 'text-stone-800'
                              : 'text-stone-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="hidden sm:block text-[10px] text-stone-500 mt-0.5 max-w-[120px] leading-tight">
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Direct Remuneration Banner */}
            <div className="bg-emerald-900 text-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-amber-300 flex items-center justify-center font-bold">
                  ₹
                </div>
                <div>
                  <div className="font-bold text-white text-sm">
                    100% Direct Payout to Farmers
                  </div>
                  <div className="text-emerald-200 text-[11px]">
                    {t.directToFarmerAlert}
                  </div>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-emerald-800/80 border border-emerald-700 font-mono text-emerald-200 font-bold shrink-0">
                {activeOrder.status === 'delivered' ? 'Status: Credited via UPI' : 'Escrow Secured'}
              </div>
            </div>

            {/* Items in this Order */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Harvest Items ({activeOrder.items.length})
              </h4>

              <div className="divide-y divide-stone-100">
                {activeOrder.items.map((item, idx) => {
                  const farmer = farmers.find((f) => f.id === item.farmerId);

                  return (
                    <div
                      key={idx}
                      className="py-3 first:pt-0 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.photo}
                          alt={item.cropName}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                        />
                        <div>
                          <div className="text-xs font-bold text-stone-900">{item.cropName}</div>
                          <div className="text-[11px] text-stone-500">
                            Farm: {item.farmName} ({item.farmerName})
                          </div>
                          <div className="text-[11px] text-emerald-700 font-semibold">
                            {item.quantity} {item.unit} × ₹{item.pricePerUnit} = ₹{item.subtotal}
                          </div>
                        </div>
                      </div>

                      {farmer && onOpenPassportById && (
                        <button
                          onClick={() => onOpenPassportById(farmer.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1 border border-stone-200"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="hidden sm:inline">Farm Passport</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Patron Perks & Price Breakdown */}
              <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between font-medium text-stone-600">
                  <span>Farm Gate Produce Value:</span>
                  <span className="font-mono">₹{activeOrder.originalSubtotal || activeOrder.totalAmount}</span>
                </div>

                {activeOrder.discountAmount && activeOrder.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Regular Patron Offer ({activeOrder.appliedOfferCode || 'VIP'}):</span>
                    </span>
                    <span className="font-mono">-₹{activeOrder.discountAmount}</span>
                  </div>
                )}

                {activeOrder.kisanPointsDiscount && activeOrder.kisanPointsDiscount > 0 && (
                  <div className="flex items-center justify-between text-amber-900 font-semibold bg-amber-50 px-2 py-1 rounded">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span>Kisan Points Redeemed ({activeOrder.kisanPointsRedeemed} pts):</span>
                    </span>
                    <span className="font-mono">-₹{activeOrder.kisanPointsDiscount}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-stone-200 flex items-center justify-between font-bold text-stone-900 text-sm">
                  <span>Final Amount Paid:</span>
                  <span className="text-emerald-800 font-black">₹{activeOrder.totalAmount}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-stone-500">
                  <div className="flex items-center gap-1 text-amber-800 font-bold">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    <span>+{activeOrder.kisanPointsEarned || Math.round(activeOrder.totalAmount / 10)} Kisan Points Credited</span>
                  </div>
                  <div className="text-emerald-700 font-medium">
                    100% direct remuneration to farmer guaranteed (₹{activeOrder.farmerEarnings || activeOrder.originalSubtotal || activeOrder.totalAmount})
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Review Section (If Delivered) */}
            {activeOrder.status === 'delivered' && (
              <div className="mt-4 pt-4 border-t border-stone-200 bg-stone-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      {t.leaveReview}
                    </h4>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                    Verified Customer Feedback
                  </span>
                </div>

                {activeOrder.reviewSubmitted ? (
                  <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center gap-2 font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Your harvest review has been verified and posted to the farmer's Digital Passport. Thank you for supporting direct agriculture!</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Star selection */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-600">Rate freshness & taste:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setReviewRating(s)}
                            className="p-0.5"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                s <= reviewRating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience (e.g., taste, aroma, freshness, packaging)..."
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    ></textarea>

                    <button
                      onClick={() => handleSubmitReview(activeOrder)}
                      disabled={isSubmittingReview || !reviewComment.trim()}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.submitReview}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
