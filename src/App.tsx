/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { MarketplaceView } from './components/MarketplaceView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { FarmPassportModal } from './components/FarmPassportModal';
import { QRScannerModal } from './components/QRScannerModal';
import { CartAndCheckoutModal } from './components/CartAndCheckoutModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { FarmerDashboard } from './components/FarmerDashboard';
import { AIDemandForecastView } from './components/AIDemandForecastView';
import { AIRouteOptimizationView } from './components/AIRouteOptimizationView';
import { AuthModal } from './components/AuthModal';
import { SMSSimulatorModal } from './components/SMSSimulatorModal';
import { SMSToastBanner } from './components/SMSToastBanner';
import { AIChatbotModal } from './components/AIChatbotModal';
import { RegularCustomerOffersModal } from './components/RegularCustomerOffersModal';
import { ContactUsView } from './components/ContactUsView';
import { LiveWeatherPredictionView } from './components/LiveWeatherPredictionView';
import { WhatsAppFloat, WhatsAppIcon } from './components/WhatsAppFloat';
import { useFarmStore } from './services/store';
import { FarmerProfile, CropListing, Order, SMSMessage, RegularCustomerOffer } from './types';
import { translations } from './i18n/translations';
import { Sprout, ShieldCheck, Heart, ArrowUpRight, Smartphone, Bot, Sparkles, Gift, PhoneCall, Phone } from 'lucide-react';

export default function App() {
  const { currentLang, currentUser, farmers, smsMessages } = useFarmStore();
  const t = translations[currentLang];

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('marketplace');

  // Modals state
  const [activePassportFarmer, setActivePassportFarmer] = useState<FarmerProfile | null>(null);
  const [activeDetailCrop, setActiveDetailCrop] = useState<CropListing | null>(null);
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showSMSSimulator, setShowSMSSimulator] = useState<boolean>(false);
  const [selectedSMSForSimulator, setSelectedSMSForSimulator] = useState<SMSMessage | null>(null);
  const [showAIChatbot, setShowAIChatbot] = useState<boolean>(false);
  const [chatbotInitialPrompt, setChatbotInitialPrompt] = useState<string>('');
  const [showOffersModal, setShowOffersModal] = useState<boolean>(false);
  const [selectedOfferForCart, setSelectedOfferForCart] = useState<RegularCustomerOffer | null>(null);

  const unreadSMSCount = smsMessages.filter((m) => !m.read).length;

  const handleOpenPassportById = (farmerId: string) => {
    const found = farmers.find((f) => f.id === farmerId);
    if (found) {
      setActivePassportFarmer(found);
    }
  };

  const handleScanSuccess = (farmer: FarmerProfile) => {
    setShowQRScanner(false);
    setActivePassportFarmer(farmer);
  };

  const handleOrderCreated = (order: Order) => {
    setActiveTab('orders');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900 selection:bg-emerald-600 selection:text-white relative">
      {/* Live Push SMS Notification Toast */}
      <SMSToastBanner
        onOpenSimulator={(msg) => {
          setSelectedSMSForSimulator(msg || null);
          setShowSMSSimulator(true);
        }}
      />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCart={() => setShowCart(true)}
        openQRScanner={() => setShowQRScanner(true)}
        openAuthModal={() => setShowAuthModal(true)}
        openSMSSimulator={() => setShowSMSSimulator(true)}
        openAIChatbot={() => setShowAIChatbot(true)}
        openOffersModal={() => setShowOffersModal(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'marketplace' && (
          <>
            <LandingHero
              currentLang={currentLang}
              onExploreMarketplace={() => {
                const el = document.getElementById('marketplace-search-input');
                el?.scrollIntoView({ behavior: 'smooth' });
                el?.focus();
              }}
              onOpenFarmerHub={() => setActiveTab('farmer')}
              onOpenQRScanner={() => setShowQRScanner(true)}
            />
            <MarketplaceView
              onOpenPassport={(farmer) => setActivePassportFarmer(farmer)}
              onOpenProductDetail={(crop) => setActiveDetailCrop(crop)}
              onOpenOffersModal={() => setShowOffersModal(true)}
            />
          </>
        )}

        {activeTab === 'farmer' && (
          <FarmerDashboard
            onOpenPassport={(farmer) => setActivePassportFarmer(farmer)}
            onOpenSMSSimulator={() => setShowSMSSimulator(true)}
            onNavigateToWeather={() => setActiveTab('weather')}
          />
        )}

        {activeTab === 'orders' && (
          <OrderTrackingView
            onOpenPassportById={handleOpenPassportById}
            onOpenSMSSimulator={() => setShowSMSSimulator(true)}
          />
        )}

        {activeTab === 'ai-demand' && (
          <AIDemandForecastView />
        )}

        {activeTab === 'ai-route' && (
          <AIRouteOptimizationView />
        )}

        {activeTab === 'weather' && (
          <LiveWeatherPredictionView
            onOpenAIChatbot={(initialMessage) => {
              if (initialMessage) setChatbotInitialPrompt(initialMessage);
              setShowAIChatbot(true);
            }}
            onOpenSMSSimulator={() => setShowSMSSimulator(true)}
          />
        )}

        {activeTab === 'contact' && (
          <ContactUsView onExploreMarketplace={() => setActiveTab('marketplace')} />
        )}
      </main>

      {/* Floating Action Buttons: AI Chatbot, SMS Simulator & Floating WhatsApp Chat Button */}
      {/* 1. Quick Helper Toggles (Kisan AI & SMS Simulator) */}
      <div className="fixed bottom-22 sm:bottom-5 right-5 sm:right-22 z-40 flex flex-row items-center gap-2">
        {/* Floating AI Chatbot Button */}
        <button
          onClick={() => setShowAIChatbot(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-stone-900 hover:from-emerald-500 hover:to-black text-white text-xs font-black shadow-2xl border border-emerald-400/40 backdrop-blur-md hover:scale-105 active:scale-95 transition-all group ring-2 ring-emerald-500/20"
          id="floating-ai-chatbot-btn"
          title="Open FarmEra Kisan & Customer AI Assistant"
        >
          <div className="relative">
            <Bot className="w-4 h-4 text-emerald-300 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-stone-900 animate-pulse"></span>
          </div>
          <span className="tracking-wide hidden md:flex items-center gap-1">
            <span>Kisan AI</span>
            <Sparkles className="w-3 h-3 text-amber-300" />
          </span>
        </button>

        {/* Floating SMS Simulator Quick Button */}
        <button
          onClick={() => setShowSMSSimulator(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-stone-900/95 hover:bg-black text-amber-300 text-xs font-black shadow-2xl border border-stone-700/90 backdrop-blur-md hover:scale-105 active:scale-95 transition-all group"
          id="floating-sms-simulator-btn"
          title="Open Direct Kisan & Customer SMS Simulator"
        >
          <div className="relative">
            <Smartphone className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
            {unreadSMSCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-stone-900 animate-pulse"></span>
            )}
          </div>
          <span className="tracking-wide hidden md:inline">SMS</span>
          {unreadSMSCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-700 text-white text-[10px] font-bold">
              {unreadSMSCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. Floating WhatsApp Chat Button (Visible on all pages, bottom-right) */}
      <WhatsAppFloat
        onOpenContactPage={() => {
          setActiveTab('contact');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* AI Chatbot Modal */}
      <AIChatbotModal
        isOpen={showAIChatbot}
        onClose={() => {
          setShowAIChatbot(false);
          setChatbotInitialPrompt('');
        }}
        initialPrompt={chatbotInitialPrompt}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          setShowAIChatbot(false);
        }}
        onOpenQRScanner={() => {
          setShowQRScanner(true);
          setShowAIChatbot(false);
        }}
        onOpenPassportById={(farmerId) => {
          handleOpenPassportById(farmerId);
          setShowAIChatbot(false);
        }}
      />
      {showSMSSimulator && (
        <SMSSimulatorModal
          onClose={() => {
            setShowSMSSimulator(false);
            setSelectedSMSForSimulator(null);
          }}
          initialSelectedSMS={selectedSMSForSimulator}
        />
      )}

      {/* Product Detail Modal */}
      {activeDetailCrop && (
        <ProductDetailModal
          crop={activeDetailCrop}
          onClose={() => setActiveDetailCrop(null)}
          onOpenPassport={(farmer) => {
            setActiveDetailCrop(null);
            setActivePassportFarmer(farmer);
          }}
          onAddToCartSuccess={() => {
            // Optional callback
          }}
        />
      )}

      {/* Digital Farm Passport Modal */}
      {activePassportFarmer && (
        <FarmPassportModal
          farmer={activePassportFarmer}
          onClose={() => setActivePassportFarmer(null)}
          onSelectCrop={(crop) => {
            setActivePassportFarmer(null);
            setActiveDetailCrop(crop);
          }}
        />
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScannerModal
          onClose={() => setShowQRScanner(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {/* Cart & Checkout Modal */}
      {showCart && (
        <CartAndCheckoutModal
          onClose={() => setShowCart(false)}
          onOrderCreated={handleOrderCreated}
          onOpenOffersModal={() => {
            setShowCart(false);
            setShowOffersModal(true);
          }}
          preselectedOffer={selectedOfferForCart}
        />
      )}

      {/* Regular Customer Offers Modal */}
      {showOffersModal && (
        <RegularCustomerOffersModal
          isOpen={showOffersModal}
          onClose={() => setShowOffersModal(false)}
          onSelectOffer={(offer) => setSelectedOfferForCart(offer)}
          onOpenCart={() => setShowCart(true)}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            // User switched or logged in
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 py-10 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <Sprout className="w-5 h-5" />
                </div>
                <span className="text-xl font-black text-white">{t.brandName}</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
                AI-powered direct farmer-to-consumer decentralized marketplace. Eliminating 40% middlemen commissions, providing transparent Digital Farm Passports, and optimizing delivery routes for fresh harvest distribution.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Direct Bank Settlement Protocol</span>
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <h4 className="font-bold text-white uppercase tracking-wider mb-2.5">
                  Platform Views
                </h4>
                <ul className="space-y-1.5 text-stone-400">
                  <li>
                    <button onClick={() => setActiveTab('marketplace')} className="hover:text-white">
                      Fresh Marketplace
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setShowQRScanner(true)} className="hover:text-white">
                      Scan Farm Passport
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('farmer')} className="hover:text-white">
                      Farmer & FPO Hub
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('orders')} className="hover:text-white">
                      Live Order Tracker
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setShowOffersModal(true)} className="text-amber-300 font-bold hover:text-amber-200 flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-amber-400" />
                      <span>Regular Patron Offers</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setShowSMSSimulator(true)} className="text-amber-400 font-bold hover:text-amber-300 flex items-center gap-1">
                      <span>📲 SMS Simulator (DLT)</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setActiveTab('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-emerald-300 font-bold hover:text-emerald-200 flex items-center gap-1">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Contact Us & Helpline</span>
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase tracking-wider mb-2.5">
                  AI Modules
                </h4>
                <ul className="space-y-1.5 text-stone-400">
                  <li>
                    <button onClick={() => setShowAIChatbot(true)} className="text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Kisan AI Assistant</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('ai-demand')} className="hover:text-white">
                      AI Demand Forecasting
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActiveTab('ai-route')} className="hover:text-white">
                      AI Route Optimization
                    </button>
                  </li>
                  <li>
                    <span className="text-stone-500">Seed Lifecycle Vision</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span>Farmer Group Contacts</span>
                </h4>
                <div className="space-y-2 text-stone-300 text-xs">
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Direct WhatsApp chat & phone calls to our verified producers:
                  </p>
                  
                  {/* Farmer 1 */}
                  <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-stone-850 border border-stone-800">
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold block">Farmer 1: Murugan (Pollachi)</span>
                      <span className="font-mono text-[11px] text-stone-200">+91 96772 66757</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href="https://wa.me/919677266757"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded bg-[#25D366] text-white hover:bg-[#20ba5a]"
                        title="Farmer 1 WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href="tel:+919677266757"
                        className="p-1 rounded bg-stone-700 text-amber-300 hover:bg-stone-600"
                        title="Farmer 1 Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Farmer 2 */}
                  <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-stone-850 border border-stone-800">
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold block">Farmer 2: Priya (Thanjavur)</span>
                      <span className="font-mono text-[11px] text-stone-200">+91 73394 91022</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href="https://wa.me/917339491022"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded bg-[#25D366] text-white hover:bg-[#20ba5a]"
                        title="Farmer 2 WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href="tel:+917339491022"
                        className="p-1 rounded bg-stone-700 text-amber-300 hover:bg-stone-600"
                        title="Farmer 2 Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Farmer 3 */}
                  <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-stone-850 border border-stone-800">
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold block">Farmer 3: Ramanathan (Nilgiris)</span>
                      <span className="font-mono text-[11px] text-stone-200">+91 88702 20499</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href="https://wa.me/918870220499"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded bg-[#25D366] text-white hover:bg-[#20ba5a]"
                        title="Farmer 3 WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href="tel:+918870220499"
                        className="p-1 rounded bg-stone-700 text-amber-300 hover:bg-stone-600"
                        title="Farmer 3 Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={() => { setActiveTab('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="pt-1 text-left text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open Full Contact Us Directory</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2">
            <div>
              © 2026 FarmEra Technologies. Built for hackathon demonstration. Zero Middlemen Initiative.
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <Heart className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
              <span>Empowering Indian Farmers Directly</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
