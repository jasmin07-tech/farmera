import React, { useState } from 'react';
import {
  Sprout,
  ShoppingCart,
  QrCode,
  TrendingUp,
  Truck,
  UserCheck,
  Globe,
  Bell,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  RefreshCw,
  Store,
  Package,
  Smartphone,
  Bot,
  Gift,
  Coins,
  PhoneCall,
  CloudSun,
} from 'lucide-react';
import { useFarmStore } from '../services/store';
import { translations } from '../i18n/translations';
import { Language, UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openCart: () => void;
  openQRScanner: () => void;
  openAuthModal: () => void;
  openSMSSimulator: () => void;
  openAIChatbot: () => void;
  openOffersModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openCart,
  openQRScanner,
  openAuthModal,
  openSMSSimulator,
  openAIChatbot,
  openOffersModal,
}) => {
  const { currentUser, currentLang, cart, notifications, smsMessages, customerLoyalty, actions } = useFarmStore();
  const t = translations[currentLang];

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const unreadSMSCount = smsMessages.filter((m) => !m.read).length;

  const handleRoleSelect = (role: UserRole) => {
    actions.switchPresetUser(role);
    setShowRoleMenu(false);
    if (role === 'farmer') {
      setActiveTab('farmer');
    } else if (activeTab === 'farmer') {
      setActiveTab('marketplace');
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    actions.setLanguage(lang);
    setShowLangMenu(false);
  };

  const roleLabelMap: Record<UserRole, string> = {
    farmer: t.farmerRole,
    customer: t.customerRole,
    bulk_buyer: t.bulkBuyerRole,
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
      {/* Top micro-announcement banner: Middlemen elimination live ticker */}
      <div className="bg-emerald-900 text-emerald-100 text-xs px-4 py-1.5 flex items-center justify-between overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {t.brandTagline}
          </span>
          <span className="hidden md:inline text-emerald-400/60">•</span>
          <span className="hidden md:inline text-emerald-200">
            100% Direct Bank Settlement to Farmers • 0% Mandi Commission • AI Route Optimized
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              actions.resetDemoData();
            }}
            className="hover:text-amber-300 transition-colors flex items-center gap-1 text-[11px] underline"
            title="Reset to fresh demo state"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Demo
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo */}
          <button
            onClick={() => setActiveTab('marketplace')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
            id="brand-logo-btn"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-emerald-950">
                  {t.brandName}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  Direct
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
                Farm-to-Doorstep Network
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'marketplace'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
              id="nav-marketplace-btn"
            >
              <Store className="w-4 h-4 text-emerald-600" />
              {t.marketplace}
            </button>

            <button
              onClick={openQRScanner}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'passport'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
              id="nav-qr-scan-btn"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              {t.scanQR}
            </button>

            <button
              onClick={() => setActiveTab('ai-demand')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'ai-demand'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
              id="nav-ai-demand-btn"
            >
              <TrendingUp className="w-4 h-4 text-amber-600" />
              {t.aiDemand}
            </button>

            <button
              onClick={() => setActiveTab('ai-route')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'ai-route'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
              id="nav-ai-route-btn"
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              {t.aiRoute}
            </button>

            <button
              onClick={() => setActiveTab('weather')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'weather'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
              id="nav-weather-btn"
            >
              <CloudSun className="w-4 h-4 text-sky-600" />
              {t.liveWeather || 'Live Weather'}
            </button>

            <button
              onClick={openAIChatbot}
              className="px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all text-emerald-950 font-bold bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/80 shadow-xs group"
              id="nav-ai-chatbot-btn"
              title={t.aiChatbotDesc || 'Ask AI anything about farming and produce'}
            >
              <Bot className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>{t.aiChatbot || 'Kisan AI'}</span>
              <span className="text-[9px] font-black uppercase bg-emerald-600 text-white px-1.5 py-0.2 rounded-full tracking-wide">
                Gemini
              </span>
            </button>

            <button
              onClick={() => setActiveTab('farmer')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'farmer'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
              id="nav-farmer-hub-btn"
            >
              <UserCheck className="w-4 h-4 text-emerald-700" />
              {t.farmerDashboard}
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'orders'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
              id="nav-orders-btn"
            >
              <Package className="w-4 h-4 text-stone-600" />
              {t.myOrders}
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'contact'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
              id="nav-contact-btn"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              {t.contactUs || 'Contact Us'}
            </button>
          </nav>

          {/* Right Action Icons: Language, Role Switcher, Notifications, Cart */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowRoleMenu(false);
                  setShowNotifMenu(false);
                }}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50"
                id="lang-selector-btn"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-700" />
                <span className="uppercase">{currentLang}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50">
                  <button
                    onClick={() => handleLanguageSelect('en')}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-stone-50 ${
                      currentLang === 'en' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-stone-700'
                    }`}
                  >
                    <span>English</span>
                    {currentLang === 'en' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleLanguageSelect('ta')}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-stone-50 ${
                      currentLang === 'ta' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-stone-700'
                    }`}
                  >
                    <span>தமிழ் (Tamil)</span>
                    {currentLang === 'ta' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleLanguageSelect('hi')}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-stone-50 ${
                      currentLang === 'hi' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-stone-700'
                    }`}
                  >
                    <span>हिन्दी (Hindi)</span>
                    {currentLang === 'hi' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleMenu(!showRoleMenu);
                  setShowLangMenu(false);
                  setShowNotifMenu(false);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-stone-800 border border-stone-200"
                id="role-switcher-btn"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="max-w-[90px] sm:max-w-none truncate">{roleLabelMap[currentUser.role]}</span>
                <ChevronDown className="w-3 h-3 text-stone-500" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                    Switch Active User Role
                  </div>
                  <button
                    onClick={() => handleRoleSelect('farmer')}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-start gap-2.5 ${
                      currentUser.role === 'farmer' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-stone-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs mt-0.5">
                      🌾
                    </div>
                    <div>
                      <div className="font-semibold">{t.farmerRole}</div>
                      <div className="text-[11px] text-stone-500">Murugan Selvam (Pollachi FPO)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('customer')}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-start gap-2.5 ${
                      currentUser.role === 'customer' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-stone-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs mt-0.5">
                      🥗
                    </div>
                    <div>
                      <div className="font-semibold">{t.customerRole}</div>
                      <div className="text-[11px] text-stone-500">Ananya Krishnan (Chennai)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('bulk_buyer')}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-start gap-2.5 ${
                      currentUser.role === 'bulk_buyer' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-stone-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs mt-0.5">
                      🏢
                    </div>
                    <div>
                      <div className="font-semibold">{t.bulkBuyerRole}</div>
                      <div className="text-[11px] text-stone-500">Karthik Raja (GreenBasket Procure)</div>
                    </div>
                  </button>

                  <div className="border-t border-stone-100 mt-1 pt-1 px-2">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        openAuthModal();
                      }}
                      className="w-full text-center py-1 text-[11px] font-medium text-emerald-700 hover:underline"
                    >
                      + Login with different account
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowLangMenu(false);
                  setShowRoleMenu(false);
                  if (!showNotifMenu) actions.markNotificationsRead();
                }}
                className="relative p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                id="notifications-bell-btn"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50">
                  <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 flex items-center justify-between">
                    <span>Live Platform Alerts</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      {notifications.length} updates
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-3 text-xs hover:bg-stone-50">
                        <div className="font-semibold text-stone-800 mb-0.5">{notif.title}</div>
                        <p className="text-stone-600 text-[11px] leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] text-stone-400 mt-1 inline-block">
                          {notif.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Chatbot Header Trigger Button */}
            <button
              onClick={openAIChatbot}
              className="relative p-2 rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 transition-colors flex items-center gap-1.5 shadow-xs"
              id="ai-chatbot-header-btn"
              title="Open FarmEra Kisan AI Assistant"
              aria-label="AI Chatbot"
            >
              <div className="relative">
                <Bot className="w-5 h-5 text-emerald-700" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"></span>
              </div>
              <span className="hidden xl:inline text-xs font-bold text-emerald-900">AI Chat</span>
            </button>

            {/* SMS Simulator Trigger Button */}
            <button
              onClick={openSMSSimulator}
              className="relative p-2 rounded-lg text-stone-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors flex items-center gap-1 border border-stone-200"
              id="sms-simulator-header-btn"
              title="Open Direct Kisan & Customer SMS Simulator"
              aria-label="SMS Simulator"
            >
              <Smartphone className="w-5 h-5 text-emerald-700" />
              <span className="hidden xl:inline text-xs font-bold text-stone-700">SMS</span>
              {unreadSMSCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-black ring-2 ring-white">
                  {unreadSMSCount}
                </span>
              )}
            </button>

            {/* Regular Customer Offers Button */}
            {openOffersModal && (
              <button
                onClick={openOffersModal}
                className="relative px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100/80 hover:from-amber-100 hover:to-amber-200/90 text-amber-900 border border-amber-300/80 transition-all flex items-center gap-1.5 shadow-2xs group"
                id="regular-offers-nav-btn"
                title="Exclusive Offers & Loyalty for Regular Customers"
                aria-label="Regular Customer Offers"
              >
                <div className="relative">
                  <Gift className="w-4 h-4 text-amber-700 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                </div>
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="text-[11px] font-black text-amber-950 flex items-center gap-1">
                    <span>Offers</span>
                    <span className="text-[9px] font-bold bg-amber-400/40 text-amber-900 px-1 rounded">
                      {customerLoyalty.tierName.split(' ')[0]}
                    </span>
                  </span>
                  <span className="text-[9px] text-amber-700 font-mono font-bold">
                    {customerLoyalty.kisanPoints} pts
                  </span>
                </div>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm shadow-emerald-700/20 transition-all"
              id="cart-trigger-btn"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">{t.cart}</span>
              {cartCount > 0 && (
                <span className="bg-amber-400 text-stone-900 font-extrabold text-[10px] rounded-full px-1.5 py-0.2 min-w-[18px] text-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden border-t border-stone-100 bg-stone-50/80 px-2 py-1.5 flex items-center justify-around text-xs font-medium text-stone-600 overflow-x-auto">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap ${
            activeTab === 'marketplace' ? 'bg-emerald-100 text-emerald-900 font-bold' : ''
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          {t.marketplace}
        </button>
        <button
          onClick={openQRScanner}
          className={`px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap ${
            activeTab === 'passport' ? 'bg-emerald-100 text-emerald-900 font-bold' : ''
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          {t.scanQR}
        </button>
        <button
          onClick={() => setActiveTab('ai-demand')}
          className={`px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap ${
            activeTab === 'ai-demand' ? 'bg-emerald-100 text-emerald-900 font-bold' : ''
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          AI Demand
        </button>
        <button
          onClick={() => setActiveTab('ai-route')}
          className={`px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap ${
            activeTab === 'ai-route' ? 'bg-emerald-100 text-emerald-900 font-bold' : ''
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          AI Route
        </button>
        <button
          onClick={() => setActiveTab('weather')}
          className={`px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap ${
            activeTab === 'weather' ? 'bg-emerald-100 text-emerald-900 font-bold' : ''
          }`}
          id="mobile-nav-weather-btn"
        >
          <CloudSun className="w-3.5 h-3.5 text-sky-600" />
          {t.liveWeather || 'Live Weather'}
        </button>
        <button
          onClick={() => setActiveTab('farmer')}
          className={`px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap ${
            activeTab === 'farmer' ? 'bg-emerald-100 text-emerald-900 font-bold' : ''
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Farmer Hub
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap ${
            activeTab === 'orders' ? 'bg-emerald-100 text-emerald-900 font-bold' : ''
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Orders
        </button>
        {openOffersModal && (
          <button
            onClick={openOffersModal}
            className="px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap text-amber-900 bg-amber-100/90 font-bold border border-amber-300"
            title="Regular Customer Offers"
          >
            <Gift className="w-3.5 h-3.5 text-amber-700" />
            <span>Offers ({customerLoyalty.kisanPoints}p)</span>
          </button>
        )}
        <button
          onClick={openAIChatbot}
          className="px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap text-emerald-900 bg-emerald-100/80 font-bold border border-emerald-300"
          title="Kisan AI Assistant"
        >
          <Bot className="w-3.5 h-3.5 text-emerald-700" />
          Kisan AI
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap ${
            activeTab === 'contact' ? 'bg-emerald-100 text-emerald-900 font-bold' : ''
          }`}
          id="mobile-nav-contact-btn"
        >
          <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
          {t.contactUs || 'Contact Us'}
        </button>
        <button
          onClick={openSMSSimulator}
          className="px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap text-emerald-800 bg-emerald-50 font-bold border border-emerald-200"
          title="SMS Simulator"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
          SMS ({unreadSMSCount})
        </button>
      </div>
    </header>
  );
};
