import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Calendar,
  CheckCircle,
  Download,
  Share2,
  Phone,
  Layers,
  Sprout,
  Star,
  Award,
  Sparkles,
} from 'lucide-react';
import { FarmerProfile, CropListing } from '../types';
import { generateFarmPassportQR } from '../utils/qrGenerator';
import { translations } from '../i18n/translations';
import { useFarmStore } from '../services/store';
import { WhatsAppIcon } from './WhatsAppFloat';

interface FarmPassportModalProps {
  farmer: FarmerProfile;
  onClose: () => void;
  onSelectCrop?: (crop: CropListing) => void;
}

export const FarmPassportModal: React.FC<FarmPassportModalProps> = ({
  farmer,
  onClose,
  onSelectCrop,
}) => {
  const { currentLang, crops, actions } = useFarmStore();
  const t = translations[currentLang];
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeMediaTab, setActiveMediaTab] = useState<'journey' | 'story' | 'soil'>('journey');

  useEffect(() => {
    generateFarmPassportQR(farmer.id, farmer.farmName).then(setQrDataUrl);
  }, [farmer]);

  const farmerCrops = crops.filter((c) => c.farmerId === farmer.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-stone-50 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-emerald-800/30 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 text-white p-5 sm:p-6 relative flex items-start justify-between">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="relative">
              <img
                src={farmer.profilePhoto}
                alt={farmer.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-emerald-500/50 shadow-md"
              />
              {farmer.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 bg-amber-400 text-stone-900 p-1 rounded-full shadow"
                  title="FPO Verified Farmer"
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-700/80 text-emerald-200 border border-emerald-600/60">
                  Digital Farm Passport
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {farmer.fpoId}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {farmer.farmName}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200 flex items-center gap-1 mt-0.5">
                <span>{farmer.name}</span> • <span>{farmer.district}, {farmer.state}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Passport Quick Metadata Banner */}
        <div className="bg-emerald-950 text-emerald-100 px-5 py-2.5 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-emerald-800">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              GPS: {farmer.coordinates.lat.toFixed(4)}°N, {farmer.coordinates.lng.toFixed(4)}°E
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{farmer.experienceYears} Yrs Farming Heritage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{farmer.farmSizeAcres} Acres • {farmer.soilType}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            <span>{farmer.rating} Rating ({farmer.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* QR Code and Farm Story Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            {/* QR Card */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-xl border border-emerald-200/80 text-center">
              <div className="p-2 bg-white rounded-lg shadow-inner border border-emerald-100">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Digital Farm Passport QR Code"
                    className="w-40 h-40 object-contain"
                  />
                ) : (
                  <div className="w-40 h-40 bg-emerald-100/50 animate-pulse rounded flex items-center justify-center text-xs text-emerald-800">
                    Generating Passport QR...
                  </div>
                )}
              </div>
              <p className="text-[11px] font-bold text-emerald-900 mt-2">
                Official Consumer Traceability QR
              </p>
              <p className="text-[10px] text-stone-500">
                Printed on packaging crates for instant farm origin audit
              </p>

              <div className="flex items-center gap-2 mt-3 w-full">
                {qrDataUrl && (
                  <a
                    href={qrDataUrl}
                    download={`FarmPassport_${farmer.id}.png`}
                    className="flex-1 text-center py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Save QR
                  </a>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Farm Passport link copied to clipboard!');
                  }}
                  className="py-1.5 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 border border-stone-200"
                >
                  <Share2 className="w-3 h-3" />
                  Share
                </button>
              </div>
            </div>

            {/* Farm Bio & Philosophy */}
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="text-base font-bold text-stone-900">
                  {farmer.fpoName}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {farmer.farmingPhilosophy}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs">
                  <div className="text-[10px] uppercase font-bold text-stone-400">FPO Hub</div>
                  <div className="font-semibold text-stone-800 text-xs mt-0.5">{farmer.district} Hub</div>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Fulfillment</div>
                  <div className="font-semibold text-emerald-700 text-xs mt-0.5">{farmer.totalOrdersDelivered} Direct Orders</div>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs col-span-2 sm:col-span-1 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Direct Contact</div>
                  <div className="font-bold text-stone-800 text-xs flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{farmer.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <a
                      href={`https://wa.me/${farmer.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(farmer.name)},%20I%20saw%20your%20Digital%20Farm%20Passport%20on%20FarmEra.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-[#25D366] hover:bg-[#20ba5a] text-white text-[10px] font-bold flex items-center gap-1 transition-transform hover:scale-105"
                      title="Chat with farmer on WhatsApp"
                    >
                      <WhatsAppIcon className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`tel:+${farmer.phone.replace(/[^0-9]/g, '')}`}
                      className="px-2 py-0.5 rounded bg-stone-900 hover:bg-black text-amber-300 text-[10px] font-bold flex items-center gap-1 transition-transform hover:scale-105"
                      title="Normal phone call to farmer"
                    >
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>Call</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-stone-200 text-xs font-semibold">
            <button
              onClick={() => setActiveMediaTab('journey')}
              className={`pb-2.5 px-3 flex items-center gap-1.5 transition-colors border-b-2 ${
                activeMediaTab === 'journey'
                  ? 'border-emerald-600 text-emerald-800 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Crop Journey Timeline & Photos</span>
            </button>
            <button
              onClick={() => setActiveMediaTab('soil')}
              className={`pb-2.5 px-3 flex items-center gap-1.5 transition-colors border-b-2 ${
                activeMediaTab === 'soil'
                  ? 'border-emerald-600 text-emerald-800 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Soil & Water Health Certificate</span>
            </button>
          </div>

          {/* Tab Content: Crop Journey */}
          {activeMediaTab === 'journey' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">
                    Seed-to-Harvest Traceability Timeline
                  </h4>
                  <p className="text-xs text-stone-500">
                    Live chronological updates uploaded directly from the field
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {farmer.journeyUpdates.length} Milestones Logged
                </span>
              </div>

              <div className="relative border-l-2 border-emerald-300 ml-4 pl-5 space-y-6">
                {farmer.journeyUpdates.map((update, idx) => (
                  <div key={update.id} className="relative group">
                    {/* Step Icon */}
                    <div className="absolute -left-[27px] top-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold ring-4 ring-stone-50">
                      {idx + 1}
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                            {update.stage}
                          </span>
                          <h5 className="text-xs sm:text-sm font-bold text-stone-900">
                            {update.title}
                          </h5>
                        </div>
                        <span className="text-[11px] text-stone-400 font-medium">
                          {update.date}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {update.description}
                      </p>

                      {/* Photo preview from field */}
                      {update.photoUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-stone-100 max-h-48">
                          <img
                            src={update.photoUrl}
                            alt={update.title}
                            className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="text-[11px] text-emerald-800 bg-emerald-50/70 px-2.5 py-1 rounded border border-emerald-100 flex items-center gap-1.5 font-medium">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Natural Inputs: {update.inputsUsed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: Soil & Water Certificate */}
          {activeMediaTab === 'soil' && (
            <div className="bg-white rounded-xl p-5 border border-stone-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">
                    Annual FPO Soil & Bio-Residue Audit
                  </h4>
                  <p className="text-xs text-stone-500">
                    Certified pesticide-free baseline verified by Tamil Nadu Organic Certification Department
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Grade A Organic
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-xs text-stone-400">Soil Organic Carbon</div>
                  <div className="text-lg font-black text-emerald-800 mt-1">1.42%</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Optimal High</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-xs text-stone-400">Topsoil pH Level</div>
                  <div className="text-lg font-black text-emerald-800 mt-1">6.8 pH</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Perfect Neutral</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-xs text-stone-400">Heavy Metals Test</div>
                  <div className="text-lg font-black text-emerald-800 mt-1">0.00 ppm</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Zero Contaminants</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="text-xs text-stone-400">Water Source</div>
                  <div className="text-lg font-black text-emerald-800 mt-1">Well / Rain</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Solar Drip Fed</div>
                </div>
              </div>
            </div>
          )}

          {/* Active Produce from this Farmer */}
          {farmerCrops.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-stone-900 flex items-center justify-between">
                <span>Direct Harvest Available from this Farm ({farmerCrops.length})</span>
                <span className="text-xs font-normal text-stone-500">
                  Shipped direct from {farmer.location}
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {farmerCrops.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200 hover:border-emerald-500 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={c.photos[0]}
                        alt={c.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-bold text-xs text-stone-900 line-clamp-1">{c.name}</div>
                        <div className="text-[11px] text-emerald-700 font-bold">
                          ₹{c.pricePerUnit} / {c.unit}{' '}
                          <span className="line-through text-stone-400 font-normal text-[10px]">
                            ₹{c.marketPriceComparison}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        actions.addToCart(c, 1);
                        alert(`Added 1 ${c.unit} of ${c.name} to cart!`);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>FarmEra Direct Verification Protocol • Verified on {farmer.verificationDate}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg font-semibold transition-colors"
          >
            Close Passport
          </button>
        </div>
      </div>
    </div>
  );
};
