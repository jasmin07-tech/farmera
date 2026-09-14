import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  MapPin,
  Calendar,
  Sparkles,
  QrCode,
  Tag,
  CheckCircle,
  Plus,
  Info,
  Gift,
  Coins,
  Award,
  ArrowRight,
} from 'lucide-react';
import { CropListing, FarmerProfile } from '../types';
import { useFarmStore } from '../services/store';
import { translations } from '../i18n/translations';

interface MarketplaceViewProps {
  onOpenPassport: (farmer: FarmerProfile) => void;
  onOpenProductDetail: (crop: CropListing) => void;
  onOpenOffersModal?: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  onOpenPassport,
  onOpenProductDetail,
  onOpenOffersModal,
}) => {
  const { crops, farmers, currentLang, currentUser, customerLoyalty, regularOffers, actions } = useFarmStore();
  const t = translations[currentLang];

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [organicOnly, setOrganicOnly] = useState<boolean>(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'freshness'>('recommended');

  const categories = [
    { key: 'All', label: t.allCategories },
    { key: 'Vegetables', label: t.vegetables },
    { key: 'Fruits', label: t.fruits },
    { key: 'Grains', label: t.grains },
    { key: 'Greens', label: t.greens },
    { key: 'Dairy', label: t.dairy },
  ];

  const districts = ['All', 'Coimbatore', 'Thanjavur', 'kanyakumari', 'Madurai'];

  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      // Category filter
      if (selectedCategory !== 'All' && crop.category !== selectedCategory) {
        return false;
      }
      // Organic filter
      if (organicOnly && crop.farmingMethod !== 'Organic') {
        return false;
      }
      // District filter
      if (
        selectedDistrict !== 'All' &&
        crop.district.toLowerCase() !== selectedDistrict.toLowerCase()
      ) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = crop.name.toLowerCase().includes(query) || (crop.tamilName && crop.tamilName.toLowerCase().includes(query));
        const matchesFarmer = crop.farmerName.toLowerCase().includes(query) || crop.farmName.toLowerCase().includes(query);
        const matchesLocation = crop.location.toLowerCase().includes(query) || crop.district.toLowerCase().includes(query);
        return matchesName || matchesFarmer || matchesLocation;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePerUnit - b.pricePerUnit;
      if (sortBy === 'price_desc') return b.pricePerUnit - a.pricePerUnit;
      if (sortBy === 'freshness') {
        return new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime();
      }
      return 0; // recommended
    });
  }, [crops, selectedCategory, organicOnly, selectedDistrict, searchQuery, sortBy]);

  const isBulkBuyer = currentUser.role === 'bulk_buyer';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner for Bulk Buyer Role if active */}
      {isBulkBuyer && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏢</span>
            <div className="text-xs">
              <span className="font-bold">Bulk Buyer Wholesale Mode Active:</span>{' '}
              Orders above minimum crate quantity automatically receive up to 15% cooperative discount directly from the FPO.
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
            FPO B2B Rates
          </span>
        </div>
      )}

      {/* Regular Customer Offers Banner */}
      {currentUser.role === 'customer' && (
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-stone-100 border border-amber-300/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300 shadow-inner">
              <Gift className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                  {customerLoyalty.tierName}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {customerLoyalty.orderCount} Direct Farm Orders Placed
                </span>
              </div>
              <p className="text-xs text-stone-700 mt-0.5">
                {customerLoyalty.isRegularCustomer ? (
                  <span>
                    You have unlocked up to <strong>15% VIP Patron savings</strong> & <strong>{customerLoyalty.kisanPoints} Kisan Points (₹{customerLoyalty.pointsWorthInr} value)</strong>!
                  </span>
                ) : (
                  <span>
                    Place 2 repeat orders to unlock <strong>Silver Farm Friend status (10% OFF all harvests)</strong>.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] bg-white/90 border border-amber-200 px-2.5 py-1 rounded-lg text-amber-900">
              <Tag className="w-3 h-3 text-amber-600" />
              <span>Codes: <strong>VIPGOLD15</strong>, <strong>HARVESTLOYAL</strong></span>
            </div>
            {onOpenOffersModal && (
              <button
                onClick={onOpenOffersModal}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>View Regular Offers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters Section */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchCrops}
            className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            id="marketplace-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.key
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Secondary Filter Controls: Organic Toggle, District Select, Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Organic Switch */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={organicOnly}
                onChange={(e) => setOrganicOnly(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
              />
              <span className="font-semibold text-stone-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {t.organicOnly}
              </span>
            </label>

            {/* District Filter */}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-stone-100 text-stone-700 px-2 py-1 rounded-lg border border-stone-200 text-xs font-medium focus:outline-none"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d === 'All' ? 'All Farming Districts' : `${d} District`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-stone-500">{t.sortBy}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 text-xs font-semibold focus:outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="freshness">{t.freshness}</option>
              <option value="price_asc">{t.priceLowHigh}</option>
              <option value="price_desc">{t.priceHighLow}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>Showing {filteredCrops.length} freshly harvested crops direct from farms</span>
        <span className="hidden sm:inline text-emerald-700 font-semibold">
          ✓ All prices include direct farmer remuneration
        </span>
      </div>

      {/* Crop Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCrops.map((crop) => {
          const farmer = farmers.find((f) => f.id === crop.farmerId);
          const savingsAmount = crop.marketPriceComparison - crop.pricePerUnit;
          const savingsPercent = Math.round((savingsAmount / crop.marketPriceComparison) * 100);

          return (
            <div
              key={crop.id}
              className="bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-500/80 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
              id={`crop-card-${crop.id}`}
            >
              {/* Image & Badges */}
              <div className="relative h-48 overflow-hidden bg-stone-100">
                <img
                  src={crop.photos[0]}
                  alt={crop.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => onOpenProductDetail(crop)}
                />

                {/* Organic Badge */}
                {crop.farmingMethod === 'Organic' && (
                  <span className="absolute top-2.5 left-2.5 bg-emerald-800/90 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-600/50 backdrop-blur-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    100% Organic
                  </span>
                )}

                {/* Savings Pill */}
                {savingsPercent > 0 && (
                  <span className="absolute top-2.5 right-2.5 bg-amber-400 text-stone-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                    Save {savingsPercent}%
                  </span>
                )}

                {/* Harvest Freshness Tag */}
                <div className="absolute bottom-2 left-2.5 right-2.5 bg-stone-950/80 backdrop-blur-sm text-stone-200 text-[10px] px-2 py-1 rounded-lg flex items-center justify-between">
                  <span className="flex items-center gap-1 truncate">
                    <Calendar className="w-3 h-3 text-emerald-400" />
                    Harvested: {crop.harvestDate}
                  </span>
                  <span className="text-emerald-400 font-bold shrink-0">Fresh</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  {/* Farmer Info Link */}
                  {farmer && (
                    <button
                      onClick={() => onOpenPassport(farmer)}
                      className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-emerald-700 transition-colors w-full text-left mb-1 group/farmer"
                    >
                      <img
                        src={farmer.profilePhoto}
                        alt={farmer.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span className="font-semibold text-stone-700 group-hover/farmer:text-emerald-700 truncate">
                        {crop.farmerName}
                      </span>
                      {farmer.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      <span className="text-[10px] text-stone-400 truncate">• {crop.location}</span>
                    </button>
                  )}

                  {/* Crop Name */}
                  <h3
                    onClick={() => onOpenProductDetail(crop)}
                    className="text-sm font-bold text-stone-900 line-clamp-1 hover:text-emerald-700 cursor-pointer transition-colors"
                  >
                    {crop.name}
                  </h3>

                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {crop.description}
                  </p>
                </div>

                {/* Price and Action Section */}
                <div className="pt-2 border-t border-stone-100 space-y-3">
                  {/* Price Comparison */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-lg font-black text-emerald-800">
                        ₹{crop.pricePerUnit}{' '}
                        <span className="text-xs font-semibold text-stone-500">
                          / {crop.unit}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1">
                        <span>Mandi:</span>
                        <span className="line-through">₹{crop.marketPriceComparison}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Zero Middlemen
                      </span>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        Stock: {crop.quantityAvailable} {crop.unit}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* View Digital Farm Passport */}
                    {farmer && (
                      <button
                        onClick={() => onOpenPassport(farmer)}
                        className="py-2 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        title="Scan or View Digital Farm Passport"
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Passport</span>
                      </button>
                    )}

                    {/* Add to Cart */}
                    <button
                      onClick={() => {
                        actions.addToCart(crop, 1);
                      }}
                      className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm shadow-emerald-700/20 transition-all hover:gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.addToCart}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCrops.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800">No matching harvest listings</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try resetting your search query or removing the organic/district filter to view all fresh crops.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setOrganicOnly(false);
              setSelectedDistrict('All');
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
