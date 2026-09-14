import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Calendar,
  Sparkles,
  QrCode,
  CheckCircle,
  Plus,
  Minus,
  Truck,
  Heart,
  Phone,
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppFloat';
import { CropListing, FarmerProfile } from '../types';
import { useFarmStore } from '../services/store';
import { translations } from '../i18n/translations';

interface ProductDetailModalProps {
  crop: CropListing;
  onClose: () => void;
  onOpenPassport: (farmer: FarmerProfile) => void;
  onAddToCartSuccess?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  crop,
  onClose,
  onOpenPassport,
  onAddToCartSuccess,
}) => {
  const { farmers, currentLang, actions, currentUser } = useFarmStore();
  const t = translations[currentLang];
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const farmer = farmers.find((f) => f.id === crop.farmerId);
  const isBulkBuyer = currentUser.role === 'bulk_buyer';
  const hasBulkDiscount = isBulkBuyer && (crop.bulkDiscountPercent ?? 0) > 0;
  const effectivePrice = hasBulkDiscount
    ? Math.round(crop.pricePerUnit * (1 - (crop.bulkDiscountPercent || 0) / 100))
    : crop.pricePerUnit;

  const total = effectivePrice * quantity;
  const savingsVsRetail = (crop.marketPriceComparison - effectivePrice) * quantity;

  const handleAddToCart = () => {
    actions.addToCart(crop, quantity);
    if (onAddToCartSuccess) onAddToCartSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-50 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header bar */}
        <div className="p-4 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {crop.category}
            </span>
            {crop.farmingMethod === 'Organic' && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Certified Organic
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Photos */}
            <div className="md:col-span-6 space-y-3">
              <div className="h-64 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                <img
                  src={crop.photos[selectedPhoto] || crop.photos[0]}
                  alt={crop.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {crop.photos.length > 1 && (
                <div className="flex items-center gap-2">
                  {crop.photos.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhoto(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedPhoto === idx
                          ? 'border-emerald-600 scale-105'
                          : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p} alt="preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Freshness banner */}
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Harvest Date: {crop.harvestDate}
                  </span>
                  <span>Shelf Life: {crop.shelfLifeDays} days</span>
                </div>
                <p className="text-emerald-700 text-[11px]">
                  Delivered within 24 hours of harvest via AI route-optimized dispatch.
                </p>
              </div>
            </div>

            {/* Right: Info, Farmer, Price */}
            <div className="md:col-span-6 space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-stone-900 leading-tight">
                  {crop.name}
                </h2>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {crop.description}
                </p>
              </div>

              {/* Farmer Micro Card */}
              {farmer && (
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={farmer.profilePhoto}
                      alt={farmer.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-1">
                        <span>{farmer.name}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {farmer.farmName} • {farmer.district}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`https://wa.me/${farmer.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(farmer.name)},%20I%20am%20interested%20in%20your%20${encodeURIComponent(crop.name)}%20on%20FarmEra.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xs"
                      title={`WhatsApp chat with ${farmer.name} (${farmer.phone})`}
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`tel:+${farmer.phone.replace(/[^0-9]/g, '')}`}
                      className="p-1.5 rounded-lg bg-stone-900 hover:bg-black text-amber-300 shadow-xs"
                      title={`Call ${farmer.name} (${farmer.phone})`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenPassport(farmer);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-200 transition-colors"
                      title="View Digital Farm Passport"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Passport</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="bg-stone-100 p-3.5 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-emerald-900">
                      ₹{effectivePrice}
                    </span>
                    <span className="text-xs text-stone-500 ml-1">/ {crop.unit}</span>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-stone-400 line-through">
                      Mandi: ₹{crop.marketPriceComparison}/{crop.unit}
                    </div>
                    <div className="text-xs font-bold text-amber-700">
                      You Save ₹{crop.marketPriceComparison - effectivePrice} / {crop.unit}
                    </div>
                  </div>
                </div>

                {hasBulkDiscount && (
                  <div className="text-[11px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded font-bold">
                    ✓ Bulk Buyer Discount Applied: {crop.bulkDiscountPercent}% off farm-gate price
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-stone-700">Order Quantity:</span>
                <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-stone-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 text-stone-600 hover:text-stone-900"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-sm w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 text-stone-600 hover:text-stone-900"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Total & Action Button */}
              <div className="pt-3 border-t border-stone-200 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-stone-600">
                  <span>Subtotal ({quantity} {crop.unit}):</span>
                  <span className="text-sm font-bold text-stone-900">₹{total}</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
                  <span>Direct Farmer Remuneration:</span>
                  <span>₹{total} (100% to farmer)</span>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add {quantity} {crop.unit} to Cart (₹{total})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
