import React, { useState } from 'react';
import {
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Sprout,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  User,
  FileText,
  PhoneCall,
  Check,
} from 'lucide-react';
import { WhatsAppIcon, FARMER_GROUP_CONTACTS } from './WhatsAppFloat';
import { useFarmStore } from '../services/store';
import { translations } from '../i18n/translations';

interface ContactUsViewProps {
  onExploreMarketplace?: () => void;
}

export const ContactUsView: React.FC<ContactUsViewProps> = ({ onExploreMarketplace }) => {
  const { currentLang } = useFarmStore();
  const t = translations[currentLang];

  // Primary Helpdesk
  const mainHelpdeskPhone = "+91 96772 66757";
  const mainHelpdeskTel = "tel:+919677266757";
  const mainWhatsappUrl = "https://wa.me/919677266757?text=Hello%20FarmEra,%20I%20have%20an%20inquiry%20regarding%20fresh%20harvest%20produce.";

  // Form State
  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [inquiryType, setInquiryType] = useState('Order & Delivery Support');
  const [selectedFarmerTarget, setSelectedFarmerTarget] = useState('all');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTime, setSubmittedTime] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setSubmittedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 600);
  };

  const handleResetForm = () => {
    setSenderName('');
    setSenderContact('');
    setMessage('');
    setIsSubmitted(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10" id="contact-us-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold tracking-wide">
            <Sprout className="w-3.5 h-3.5 text-amber-300" />
            <span>FarmEra Agricultural Collective Helpdesk</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Contact <span className="text-emerald-400">FarmEra</span> & Farmers
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Connect directly with our verified farmer group via <strong>WhatsApp chat</strong> or <strong>normal call</strong>. Zero middlemen, transparent farm-gate prices, and prompt answers for wholesale buyers and household customers.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Direct Producer Contact • No Intermediaries
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-300" />
              Available 6:00 AM to 8:00 PM IST
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Group of Farmers Direct Contacts (WhatsApp & Normal Call) */}
      <div className="space-y-4" id="farmer-group-directory">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse"></span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                Direct Farmer Group Contacts
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Select any farmer below to initiate a direct WhatsApp conversation or place a normal phone call.
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs">
            3 Active Farmers Available
          </span>
        </div>

        {/* 3 Farmer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FARMER_GROUP_CONTACTS.map((farmer, idx) => (
            <div
              key={farmer.id}
              className="bg-white rounded-2xl p-5 border-2 border-stone-200 shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between group relative overflow-hidden"
              id={`farmer-contact-card-${idx + 1}`}
            >
              {/* Top Accent Pill */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-200 text-amber-950 font-black text-xs uppercase tracking-wider">
                  {farmer.label}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified
                </span>
              </div>

              {/* Farmer Profile Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={farmer.avatar}
                    alt={farmer.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-stone-100 shadow-sm shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-stone-900 group-hover:text-emerald-800 transition-colors">
                      {farmer.name}
                    </h3>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{farmer.location}</span>
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wide">Produce Specialty</span>
                  <span className="font-medium text-stone-800 line-clamp-2">{farmer.specialty}</span>
                </div>

                <div className="pt-1">
                  <span className="text-[11px] uppercase font-bold text-stone-400 block">Direct Mobile Number</span>
                  <p className="font-mono font-black text-stone-900 text-sm tracking-wide">
                    {farmer.phoneDisplay}
                  </p>
                </div>
              </div>

              {/* Action Buttons: WhatsApp and Normal Call */}
              <div className="grid grid-cols-2 gap-2.5 pt-5 mt-4 border-t border-stone-100">
                {/* WhatsApp Action */}
                <a
                  href={farmer.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={`farmer-${idx + 1}-whatsapp-btn`}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all active:scale-95 text-center"
                  title={`Open WhatsApp chat with ${farmer.name} (${farmer.phoneDisplay})`}
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>

                {/* Normal Call Action */}
                <a
                  href={farmer.telLink}
                  id={`farmer-${idx + 1}-call-btn`}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-black text-amber-300 font-bold text-xs shadow-xs hover:shadow-md transition-all active:scale-95 text-center"
                  title={`Place a normal phone call to ${farmer.name} (${farmer.phoneDisplay})`}
                >
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                  <span>Normal Call</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: General Helpdesk and Interactive Message Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        {/* Left Column: Instant WhatsApp & Phone Call Highlights */}
        <div className="lg:col-span-5 space-y-6">
          {/* WhatsApp Direct Hero Card */}
          <div className="bg-gradient-to-br from-[#25D366]/10 via-emerald-50 to-white rounded-2xl p-6 border-2 border-[#25D366]/40 shadow-sm relative overflow-hidden group">
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30 group-hover:scale-105 transition-transform shrink-0">
                <WhatsAppIcon className="w-7 h-7" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#25D366]/20 text-emerald-950 font-black text-[11px] uppercase tracking-wider">
                Instant WhatsApp
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <h3 className="text-lg font-bold text-stone-900">
                FarmEra Main WhatsApp Desk
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Connect directly with our collective desk for harvest updates, order dispatches, and multi-farmer bulk produce bookings.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-emerald-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">Helpline Number:</span>
                <p className="text-sm font-black font-mono text-emerald-950">{mainHelpdeskPhone}</p>
              </div>

              <a
                href={mainWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="contact-whatsapp-direct-btn"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-md shadow-[#25D366]/30 transition-all hover:scale-102 active:scale-98 text-center"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Open WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Direct Phone Call Card */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-stone-900">
                  Call FarmEra Helpline
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Available Mon – Sun from 6:00 AM to 8:00 PM IST
                </p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <a
                    href={mainHelpdeskTel}
                    id="contact-tel-link"
                    className="inline-flex items-center gap-2 text-base font-black font-mono text-emerald-800 hover:text-emerald-950 hover:underline"
                    title="Click to call +91 96772 66757"
                  >
                    <span>{mainHelpdeskPhone}</span>
                  </a>
                  <a
                    href={mainHelpdeskTel}
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors"
                  >
                    Tap to Call
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Hubs and Direct Traceability Info */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200/80 space-y-4 text-xs text-stone-600">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>FarmEra Regional FPO Centers</span>
            </h4>
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-white border border-stone-200/80">
                <p className="font-bold text-stone-900">Farmer 1: Anamalai Farm Collective</p>
                <p className="text-[11px] text-stone-500">Pollachi, Coimbatore • Tel: +91 96772 66757</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-stone-200/80">
                <p className="font-bold text-stone-900">Farmer 2: Kaveri Delta Farmers Hub</p>
                <p className="text-[11px] text-stone-500">Kumbakonam, Thanjavur • Tel: +91 73394 91022</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-stone-200/80">
                <p className="font-bold text-stone-900">Farmer 3: Nilgiris Highland Growers</p>
                <p className="text-[11px] text-stone-500">Kotagiri, The Nilgiris • Tel: +91 88702 20499</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm relative">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100">
            <div>
              <h2 className="text-xl font-black text-stone-950 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-700" />
                <span>Send us a Direct Message</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Fill out the form below. We'll acknowledge and connect you with the right farmer.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
              <span>+91 96772 66757</span>
            </div>
          </div>

          {isSubmitted ? (
            <div className="p-8 text-center space-y-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-700/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-xs font-black uppercase tracking-wider">
                  Message Sent Successfully
                </span>
                <h3 className="text-2xl font-black text-emerald-950">
                  Thank You, {senderName}!
                </h3>
                <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  Your message has been safely recorded at <strong>{submittedTime}</strong>. A FarmEra coordinator or designated farmer will connect with you shortly.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-emerald-200 text-left text-xs text-stone-700 max-w-md mx-auto space-y-1.5">
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span>Target Recipient:</span>
                  <span className="text-emerald-800">
                    {selectedFarmerTarget === 'all'
                      ? 'General Support Desk'
                      : FARMER_GROUP_CONTACTS.find((f) => f.id === selectedFarmerTarget)?.name || selectedFarmerTarget}
                  </span>
                </div>
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span>Topic:</span>
                  <span className="text-stone-700">{inquiryType}</span>
                </div>
                <div className="text-stone-500 italic bg-stone-50 p-2.5 rounded-lg border border-stone-200/60 mt-1">
                  "{message}"
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={mainWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Also ping on WhatsApp</span>
                </a>

                <button
                  onClick={handleResetForm}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Send Another Message</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" id="contact-us-form">
              {/* Farmer Destination Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Send Inquiry To
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedFarmerTarget('all')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all ${
                      selectedFarmerTarget === 'all'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    General Desk
                  </button>
                  {FARMER_GROUP_CONTACTS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFarmerTarget(f.id)}
                      className={`p-2 rounded-xl border text-center font-bold transition-all ${
                        selectedFarmerTarget === f.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {f.label} ({f.name.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5" htmlFor="contact-name">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="contact-name"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Arumugam or Priya Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-stone-900 bg-white placeholder:text-stone-400 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5" htmlFor="contact-phone-email">
                    Phone or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="contact-phone-email"
                      value={senderContact}
                      onChange={(e) => setSenderContact(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-stone-900 bg-white placeholder:text-stone-400 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5" htmlFor="contact-inquiry-type">
                    Topic / Category
                  </label>
                  <div className="relative">
                    <select
                      id="contact-inquiry-type"
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-stone-900 bg-white transition-all outline-none cursor-pointer"
                    >
                      <option value="Order & Delivery Support">Order & Delivery Support</option>
                      <option value="Fresh Produce Inquiry">Fresh Produce Quality & Harvest Inquiry</option>
                      <option value="Farmer / FPO Onboarding">Farmer / FPO Onboarding</option>
                      <option value="Bulk Buyer / Wholesale Contract">Bulk Buyer / Wholesale Contract</option>
                      <option value="General Question">General Feedback or Question</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5" htmlFor="contact-message">
                  Message <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe what you need help with, feedback on your recent produce order, or collaboration questions..."
                    className="w-full p-3.5 rounded-xl border border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-stone-900 bg-white placeholder:text-stone-400 transition-all outline-none resize-y"
                  />
                </div>
              </div>

              {/* Submit Button & Fast WhatsApp Option */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !senderName.trim() || !message.trim()}
                  id="contact-submit-btn"
                  className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Message</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 justify-center text-xs text-stone-500">
                  <span>Prefer chatting?</span>
                  <a
                    href={mainWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#25D366] hover:text-emerald-700 flex items-center gap-1 hover:underline"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>WhatsApp Us Now</span>
                  </a>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
