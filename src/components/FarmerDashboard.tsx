import React, { useState } from 'react';
import {
  Plus,
  ShieldCheck,
  Package,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle,
  Truck,
  DollarSign,
  QrCode,
  Sparkles,
  Camera,
  MapPin,
  Upload,
  Layers,
  Clock,
  Phone,
  CheckCircle2,
  Smartphone,
  AlertTriangle,
  RotateCcw,
  CloudSun,
  Droplets,
  Wind,
  Umbrella,
  ArrowRight,
} from 'lucide-react';
import { useFarmStore } from '../services/store';
import { translations } from '../i18n/translations';
import { CropListing, FarmerProfile, CropJourneyUpdate, LivePhotoMetadata, CropCategory } from '../types';
import { LiveCameraCaptureModal } from './LiveCameraCaptureModal';
import { getDefaultTTL, calculateFreshness } from '../utils/freshness';

interface FarmerDashboardProps {
  onOpenPassport: (farmer: FarmerProfile) => void;
  onOpenSMSSimulator?: () => void;
  onNavigateToWeather?: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  onOpenPassport,
  onOpenSMSSimulator,
  onNavigateToWeather,
}) => {
  const { farmers, crops, orders, currentLang, actions, currentUser, smsMessages } = useFarmStore();
  const t = translations[currentLang];

  // Active farmer profile
  const activeFarmer =
    farmers.find((f) => f.id === currentUser.farmerProfileId) || farmers[0];

  const farmerSMSCount = smsMessages.filter(
    (m) => m.recipientRole === 'farmer' || m.to === activeFarmer.phone
  ).length;

  const [activeTab, setActiveTab] = useState<'listings' | 'orders' | 'profile' | 'add_crop'>(
    'listings'
  );

  // New crop form state
  const [newCropName, setNewCropName] = useState('');
  const [newCategory, setNewCategory] = useState<CropCategory>('Vegetables');
  const [newQuantity, setNewQuantity] = useState(100);
  const [newUnit, setNewUnit] = useState('kg');
  const [newPrice, setNewPrice] = useState(40);
  const [newMarketPrice, setNewMarketPrice] = useState(65);
  const [newHarvestDate, setNewHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [newFarmingMethod, setNewFarmingMethod] = useState<'Organic' | 'Conventional'>('Organic');
  const [newDescription, setNewDescription] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newTtlDays, setNewTtlDays] = useState<number>(7);

  // Live Camera state
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'crop' | 'journey'>('crop');
  const [capturedCropPhotos, setCapturedCropPhotos] = useState<string[]>([]);
  const [capturedCropMetadata, setCapturedCropMetadata] = useState<LivePhotoMetadata[]>([]);

  // Journey state
  const [journeyStage, setJourneyStage] = useState<'Sowing' | 'Growth' | 'Flowering' | 'Pre-Harvest' | 'Harvested'>('Growth');
  const [journeyTitle, setJourneyTitle] = useState('');
  const [journeyDesc, setJourneyDesc] = useState('');
  const [journeyInputs, setJourneyInputs] = useState('');
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const [capturedJourneyPhoto, setCapturedJourneyPhoto] = useState<string | null>(null);
  const [capturedJourneyMetadata, setCapturedJourneyMetadata] = useState<LivePhotoMetadata | null>(null);

  // Update TTL when category changes
  const handleCategoryChange = (category: CropCategory) => {
    setNewCategory(category);
    setNewTtlDays(getDefaultTTL(newCropName, category));
  };

  const handleNameChange = (name: string) => {
    setNewCropName(name);
    setNewTtlDays(getDefaultTTL(name, newCategory));
  };

  const farmerCrops = crops.filter((c) => c.farmerId === activeFarmer.id);
  const farmerOrders = orders.filter((o) =>
    o.items.some((item) => item.farmerId === activeFarmer.id)
  );

  const totalDirectEarnings = farmerOrders.reduce((sum, order) => {
    const farmerItemsTotal = order.items
      .filter((i) => i.farmerId === activeFarmer.id)
      .reduce((sub, i) => sub + i.subtotal, 0);
    return sum + farmerItemsTotal;
  }, 0);

  const pendingOrders = farmerOrders.filter((o) => o.status !== 'delivered');

  // Sample photo library for instant real photo selection
  const samplePhotoOptions = [
    { label: 'Fresh Vine Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80' },
    { label: 'Highland Carrots', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80' },
    { label: 'Heritage Rice Grain', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Fresh Moringa Drumstick', url:'https://m.media-amazon.com/images/I/81LI+zd3rzL._AC_.jpg' },
    { label: 'Tender Coconut', url: 'https://tse1.mm.bing.net/th/id/OIP.CEihNFi226iljIcSUlOlyQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'},
    { label: 'Organic Greens', url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80' },
    { label:'orange',url: 'https://wallpapers.com/images/hd/bunch-of-orange-fruits-emqolx6janwpicfm.jpg'},
    { label:'pomegranate',url:'https://tse2.mm.bing.net/th/id/OIP.UrYEkxYkY4CnieK0r4B9WQHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'},
    {label:'honey',url:'https://tse1.mm.bing.net/th/id/OIP.v7JfP2lB1lrZNzfL1N1S_QHaEK?r=0&w=1920&h=1080&rs=1&pid=ImgDetMain&o=7&rm=3'},
  ];

  const handlePhotoCaptured = (photoUrl: string, metadata: LivePhotoMetadata) => {
    if (cameraTarget === 'crop') {
      setCapturedCropPhotos((prev) => [photoUrl, ...prev]);
      setCapturedCropMetadata((prev) => [metadata, ...prev]);
    } else {
      setCapturedJourneyPhoto(photoUrl);
      setCapturedJourneyMetadata(metadata);
    }
  };

  const handleCreateCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName.trim()) return;

    const finalPhotos = capturedCropPhotos.length > 0 
      ? capturedCropPhotos 
      : [newPhotoUrl.trim() || samplePhotoOptions[0].url];

    const effectiveTTL = Number(newTtlDays) || getDefaultTTL(newCropName, newCategory);

    const createdCrop: CropListing = {
      id: `crop-${Date.now()}`,
      farmerId: activeFarmer.id,
      farmerName: activeFarmer.name,
      farmName: activeFarmer.farmName,
      location: activeFarmer.location,
      district: activeFarmer.district,
      name: newCropName,
      category: newCategory,
      quantityAvailable: Number(newQuantity),
      unit: newUnit,
      pricePerUnit: Number(newPrice),
      marketPriceComparison: Number(newMarketPrice),
      harvestDate: newHarvestDate,
      ttlDays: effectiveTTL,
      farmingMethod: newFarmingMethod,
      description: newDescription || `Freshly harvested ${newCropName} cultivated naturally in ${activeFarmer.location}.`,
      photos: finalPhotos,
      photoMetadata: capturedCropMetadata.length > 0 ? capturedCropMetadata : undefined,
      isVerified: activeFarmer.isVerified,
      shelfLifeDays: effectiveTTL,
      minOrderQuantity: 1,
      bulkDiscountPercent: 10,
    };

    actions.addCropListing(createdCrop);

    // Reset form
    setNewCropName('');
    setNewDescription('');
    setNewPhotoUrl('');
    setCapturedCropPhotos([]);
    setCapturedCropMetadata([]);
    setActiveTab('listings');
    alert('Harvest listing published directly to marketplace with verified TTL and metadata!');
  };

  const handleAddJourneyMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journeyTitle.trim()) return;

    const update: CropJourneyUpdate = {
      id: `ju-${Date.now()}`,
      stage: journeyStage,
      title: journeyTitle,
      description: journeyDesc || 'Field progress logged directly from farm.',
      date: new Date().toISOString().split('T')[0],
      photoUrl: capturedJourneyPhoto || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      photoMetadata: capturedJourneyMetadata || undefined,
      inputsUsed: journeyInputs || 'Jeevamrutham bio-fertilizer and solar drip',
    };

    actions.addCropJourneyUpdate(activeFarmer.id, update);
    setJourneyTitle('');
    setJourneyDesc('');
    setJourneyInputs('');
    setCapturedJourneyPhoto(null);
    setCapturedJourneyMetadata(null);
    setShowJourneyModal(false);
    alert('Crop journey milestone added! Customers scanning your QR will see this update.');
  };

  const handleVerifyFarmer = () => {
    actions.updateFarmerVerification(activeFarmer.id, true);
    alert('Verified Farmer & FPO Badge awarded! Digital Farm Passport credentials generated.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner: Farmer Profile & Verification Badge */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={activeFarmer.profilePhoto}
              alt={activeFarmer.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-emerald-600"
            />
            {activeFarmer.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-stone-900 p-1 rounded-full shadow">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                {activeFarmer.farmName}
              </h2>
              {activeFarmer.isVerified ? (
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Farmer / FPO
                </span>
              ) : (
                <button
                  onClick={handleVerifyFarmer}
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 hover:bg-amber-200 flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Click to Verify Profile
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              <span>{activeFarmer.name}</span> • <span>{activeFarmer.fpoName}</span> (
              <span className="font-mono text-emerald-700 font-bold">{activeFarmer.fpoId}</span>)
            </p>

            <div className="flex items-center gap-3 text-xs text-stone-500 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {activeFarmer.location}, {activeFarmer.district}
              </span>
              <span>•</span>
              <span>{activeFarmer.farmSizeAcres} Acres</span>
              <span>•</span>
              <span className="font-semibold text-emerald-700">
                {activeFarmer.totalOrdersDelivered} Orders Fulfilled
              </span>
            </div>
          </div>
        </div>

        {/* Passport & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {onOpenSMSSimulator && (
            <button
              onClick={onOpenSMSSimulator}
              className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-stone-700 transition-colors shadow-sm"
              id="farmer-sms-alerts-btn"
              title="Open Kisan SMS Alerts & Direct UPI Ledger"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Kisan SMS Alerts ({farmerSMSCount})</span>
            </button>
          )}

          <button
            onClick={() => onOpenPassport(activeFarmer)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
            id="view-my-farm-passport-btn"
          >
            <QrCode className="w-4 h-4 text-amber-300" />
            <span>Digital Farm Passport</span>
          </button>

          <button
            onClick={() => setShowJourneyModal(true)}
            className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-stone-200 transition-colors"
          >
            <Camera className="w-4 h-4 text-emerald-700" />
            <span>+ Add Field Update</span>
          </button>
        </div>
      </div>

      {/* Live Farm Micro-Climate & Spraying Suitability Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 text-white p-4 rounded-xl border border-emerald-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-700 flex items-center justify-center text-amber-300 shrink-0">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                Farm Micro-Climate
              </span>
              <span className="text-xs text-stone-300">
                {activeFarmer.location} ({activeFarmer.district})
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white mt-0.5 flex flex-wrap items-center gap-2">
              <span>Today: 29°C, Mainly Clear</span>
              <span className="text-emerald-400">•</span>
              <span className="text-blue-300">Rain Prob: 15%</span>
              <span className="text-emerald-400">•</span>
              <span className="text-emerald-300 font-bold">Optimal Foliar Spray Window: 6:30 AM - 9:30 AM</span>
            </p>
          </div>
        </div>

        {onNavigateToWeather && (
          <button
            onClick={onNavigateToWeather}
            className="w-full md:w-auto px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
            id="farmer-dashboard-weather-btn"
          >
            <span>Live Weather & 7-Day Forecast</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-400 font-semibold">
            <span>Direct Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800">
            ₹{totalDirectEarnings.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            100% credited to UPI • 0% Mandi fees
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-400 font-semibold">
            <span>Pending Dispatches</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">
            {pendingOrders.length}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            Ready for AI route pickup
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-400 font-semibold">
            <span>Active Listings</span>
            <Package className="w-4 h-4 text-stone-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">
            {farmerCrops.length}
          </div>
          <div className="text-[11px] text-stone-500 font-medium">
            Across {farmerCrops.reduce((acc, c) => acc + c.quantityAvailable, 0)} kg volume
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-400 font-semibold">
            <span>Customer Rating</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-stone-900">
            {activeFarmer.rating} ★
          </div>
          <div className="text-[11px] text-stone-500 font-medium">
            Based on {activeFarmer.reviewCount} verified consumer reviews
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'listings'
              ? 'border-emerald-600 text-emerald-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>My Active Crops ({farmerCrops.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Customer Orders ({farmerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('add_crop')}
          className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'add_crop'
              ? 'border-emerald-600 text-emerald-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Plus className="w-3.5 h-3.5 text-emerald-600" />
          <span>List New Harvest</span>
        </button>
      </div>

      {/* Tab: Crop Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">
              Fresh Produce Listed from {activeFarmer.farmName}
            </h3>
            <button
              onClick={() => setActiveTab('add_crop')}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Crop</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmerCrops.map((crop) => (
              <div
                key={crop.id}
                className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="flex gap-3">
                  <img
                    src={crop.photos[0]}
                    alt={crop.name}
                    className="w-20 h-20 rounded-xl object-cover border border-stone-200"
                  />
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {crop.farmingMethod}
                    </span>
                    <h4 className="text-xs font-bold text-stone-900 mt-1 line-clamp-1">
                      {crop.name}
                    </h4>
                    <div className="text-xs font-extrabold text-emerald-800 mt-0.5">
                      ₹{crop.pricePerUnit} / {crop.unit}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      Market price: ₹{crop.marketPriceComparison}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                  <span>Available: <strong>{crop.quantityAvailable} {crop.unit}</strong></span>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Harvested: {crop.harvestDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Orders Received */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Direct Consumer Orders Received
              </h3>
              <p className="text-xs text-stone-500">
                Harvest, pack and dispatch orders directly to cluster logistics
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-stone-100">
              {farmerOrders.map((order) => {
                const relevantItems = order.items.filter(
                  (i) => i.farmerId === activeFarmer.id
                );
                const orderSubtotal = relevantItems.reduce(
                  (acc, i) => acc + i.subtotal,
                  0
                );

                return (
                  <div key={order.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-stone-900">
                          #{order.id}
                        </span>
                        <span className="text-xs text-stone-600">• {order.customerName}</span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            order.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'dispatched'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="text-xs text-stone-700">
                        {relevantItems
                          .map((i) => `${i.quantity} ${i.unit} × ${i.cropName}`)
                          .join(', ')}
                      </div>

                      <div className="text-[11px] text-stone-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>Deliver to: {order.deliveryAddress.city} ({order.deliveryAddress.street})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-stone-400">Direct Farm Payout</div>
                        <div className="text-sm font-black text-emerald-800">
                          ₹{orderSubtotal}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold">
                          {order.paymentStatus === 'settled_to_farmer'
                            ? '✓ Credited to Bank'
                            : 'Escrow Secured'}
                        </div>
                      </div>

                      {order.status !== 'delivered' && (
                        <button
                          onClick={() => {
                            actions.updateOrderStatus(
                              order.id,
                              order.status === 'placed' ? 'confirmed' : 'dispatched'
                            );
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                        >
                          {order.status === 'placed' ? 'Confirm Pick' : 'Mark Dispatched'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Add Crop Listing */}
      {activeTab === 'add_crop' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm max-w-2xl mx-auto">
          <div className="pb-4 border-b border-stone-100 mb-5">
            <h3 className="text-base font-bold text-stone-900">
              List New Crop Harvest on FarmEra
            </h3>
            <p className="text-xs text-stone-500">
              Direct listing reaches consumers and bulk buyers with zero intermediary deductions.
            </p>
          </div>

          <form onSubmit={handleCreateCrop} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Crop / Produce Name (English & Local Name)
              </label>
              <input
                type="text"
                required
                value={newCropName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Country Vine Tomatoes (நாட்டு தக்காளி)"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => handleCategoryChange(e.target.value as any)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains & Millets</option>
                  <option value="Pulses">Pulses & Legumes</option>
                  <option value="Masala/Spices">Masala & Spices</option>
                  <option value="Greens">Greens</option>
                  <option value="Spices">Spices & Herbs</option>
                  <option value="Dairy">Dairy & Honey</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Cultivation Method</label>
                <select
                  value={newFarmingMethod}
                  onChange={(e) => setNewFarmingMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                >
                  <option value="Organic">100% Organic (Natural Farming)</option>
                  <option value="Conventional">Conventional</option>
                </select>
              </div>
            </div>

            {/* Quantity, Unit, Harvest Date & Freshness TTL */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Available Qty</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Unit</label>
                <select
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                >
                  <option value="kg">kg</option>
                  <option value="bunch">bunch</option>
                  <option value="piece">piece</option>
                  <option value="liter">liter</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Harvest Date</label>
                <input
                  type="date"
                  required
                  value={newHarvestDate}
                  onChange={(e) => setNewHarvestDate(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1 flex items-center justify-between">
                  <span>TTL Shelf-Life</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Days</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={730}
                  value={newTtlDays}
                  onChange={(e) => setNewTtlDays(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                />
              </div>
            </div>

            {/* Freshness TTL Calculation Preview */}
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-950">Dynamic Freshness Rating: </span>
                  <span className="text-emerald-800">
                    Standard for {newCategory} is {getDefaultTTL(newCropName, newCategory)} days. Score updates live with harvest timestamp.
                  </span>
                </div>
              </div>
              {(() => {
                const previewFreshness = calculateFreshness(newHarvestDate, newTtlDays);
                return (
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] whitespace-nowrap shadow-sm ${
                    previewFreshness.level === 'fresh'
                      ? 'bg-emerald-600 text-white'
                      : previewFreshness.level === 'moderate'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-600 text-white'
                  }`}>
                    {previewFreshness.badgeLabel} ({previewFreshness.score}%)
                  </span>
                );
              })()}
            </div>

            {/* Pricing Section */}
            <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-emerald-900 mb-1">
                  Your Farm-Gate Direct Price (₹ / {newUnit})
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs font-bold text-emerald-900"
                />
                <span className="text-[10px] text-emerald-700 font-semibold">
                  100% credited to your bank
                </span>
              </div>

              <div>
                <label className="block font-bold text-stone-600 mb-1">
                  Typical Mandi/Retail Price (₹ / {newUnit})
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newMarketPrice}
                  onChange={(e) => setNewMarketPrice(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs font-mono text-stone-600"
                />
                <span className="text-[10px] text-stone-500">
                  Shows consumer their savings
                </span>
              </div>
            </div>

            {/* Live Camera Verification Photo Section */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-dashed border-emerald-300 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>Live Farm Photo (Required for Verified Badge)</span>
                  </h4>
                  <p className="text-[11px] text-stone-600">
                    Direct device camera capture • Auto-embeds timestamp & GPS • Checks ≤500m proximity to registered farm
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCameraTarget('crop');
                    setShowCameraModal(true);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Open Device Camera</span>
                </button>
              </div>

              {/* Captured Live Photos List */}
              {capturedCropPhotos.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-emerald-200/60">
                  <div className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{capturedCropPhotos.length} Live Geotagged Photo(s) Attached:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {capturedCropPhotos.map((url, idx) => {
                      const meta = capturedCropMetadata[idx];
                      return (
                        <div key={idx} className="relative rounded-lg overflow-hidden border border-emerald-300 bg-white p-1 text-[10px]">
                          <img src={url} alt={`Live Crop ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                          {meta && (
                            <div className="mt-1 space-y-0.5 leading-tight">
                              <span className="font-bold text-emerald-700 flex items-center gap-0.5">
                                <ShieldCheck className="w-3 h-3" />
                                {meta.isLiveVerified ? 'Verified Proximity' : 'Unverified GPS'}
                              </span>
                              <p className="text-stone-500 truncate">
                                {meta.distanceFromFarmMeters != null ? `${meta.distanceFromFarmMeters}m from farm` : 'GPS Tagged'}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fallback Photo Library */}
              <div className="pt-2 border-t border-emerald-200/60">
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Or choose sample photo / paste image URL:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mb-2">
                  {samplePhotoOptions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewPhotoUrl(item.url)}
                      className={`h-12 rounded-lg overflow-hidden border-2 relative transition-all ${
                        newPhotoUrl === item.url
                          ? 'border-emerald-600 scale-105 ring-2 ring-emerald-200'
                          : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="Or paste direct image URL (https://...)"
                  className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe variety, soil condition, flavor, seed origin..."
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
              ></textarea>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('listings')}
                className="w-1/3 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Crop to Marketplace</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add Crop Journey Milestone */}
      {showJourneyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-stone-200 space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h4 className="text-sm font-bold text-stone-900">
                Add Field Milestone to Digital Passport
              </h4>
              <button
                onClick={() => setShowJourneyModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddJourneyMilestone} className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Crop Stage</label>
                <select
                  value={journeyStage}
                  onChange={(e) => setJourneyStage(e.target.value as any)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                >
                  <option value="Sowing">Sowing & Seed Treatment</option>
                  <option value="Growth">Vegetative Growth & Weeding</option>
                  <option value="Flowering">Flowering & Pollination</option>
                  <option value="Pre-Harvest">Pre-Harvest Ripening</option>
                  <option value="Harvested">Harvest & Packaging</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  value={journeyTitle}
                  onChange={(e) => setJourneyTitle(e.target.value)}
                  placeholder="e.g. Applied Jeevamrutham bio-spray"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Organic Inputs Used</label>
                <input
                  type="text"
                  value={journeyInputs}
                  onChange={(e) => setJourneyInputs(e.target.value)}
                  placeholder="e.g. Panchagavya, neem kernel extract, drip fertigation"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Observation Details</label>
                <textarea
                  rows={2}
                  value={journeyDesc}
                  onChange={(e) => setJourneyDesc(e.target.value)}
                  placeholder="Notes on pest resilience, weather conditions, seedling vigor..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                ></textarea>
              </div>

              {/* Live camera milestone capture */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Live Field Verification Photo</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCameraTarget('journey');
                      setShowCameraModal(true);
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] flex items-center gap-1 shadow-sm"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Live Snap</span>
                  </button>
                </div>
                {capturedJourneyPhoto && (
                  <div className="flex items-center gap-2 p-1.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[10px]">
                    <img src={capturedJourneyPhoto} alt="Milestone" className="w-10 h-10 object-cover rounded" />
                    <div className="leading-tight">
                      <span className="font-bold text-emerald-800">Live Photo Geotagged</span>
                      <p className="text-stone-500">
                        {capturedJourneyMetadata?.distanceFromFarmMeters != null
                          ? `${capturedJourneyMetadata.distanceFromFarmMeters}m from farm`
                          : 'Proximity verified'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJourneyModal(false)}
                  className="w-1/2 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Camera Capture Modal */}
      {showCameraModal && (
        <LiveCameraCaptureModal
          onClose={() => setShowCameraModal(false)}
          onCapture={handlePhotoCaptured}
          farmCoordinates={activeFarmer.coordinates}
          farmName={activeFarmer.farmName}
          cropName={newCropName}
        />
      )}
    </div>
  );
};
