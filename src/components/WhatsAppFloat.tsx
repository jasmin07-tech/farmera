import React, { useState, useRef, useEffect } from 'react';
import { Phone, ExternalLink, X, MessageSquare, ChevronUp, UserCheck, Sparkles } from 'lucide-react';

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export interface FarmerContactItem {
  id: string;
  label: string;
  name: string;
  location: string;
  specialty: string;
  phoneDisplay: string;
  telLink: string;
  whatsappUrl: string;
  avatar: string;
}

export const FARMER_GROUP_CONTACTS: FarmerContactItem[] = [
  {
    id: 'farmer-1',
    label: 'Farmer 1',
    name: 'Murugan Selvam',
    location: 'Anaimalai Foothills, Pollachi',
    specialty: 'Organic Country Tomatoes, Greens & Tender Coconut',
    phoneDisplay: '+91 96772 66757',
    telLink: 'tel:+919677266757',
    whatsappUrl: 'https://wa.me/919677266757?text=Hello%20Murugan%20(Farmer%201),%20I%20have%20an%20inquiry%20regarding%20FarmEra%20fresh%20produce.',
    avatar: 'https://images.pexels.com/photos/18620460/pexels-photo-18620460.jpeg?cs=srgb&dl=pexels-gowtham-agm-609630353-18620460.jpg&fm=jpg',
  },
  {
    id: 'farmer-2',
    label: 'Farmer 2',
    name: 'Priya Jayaraman',
    location: 'Kumbakonam, Thanjavur Delta',
    specialty: 'Heritage Mappillai Samba Rice & Traditional Pulses',
    phoneDisplay: '+91 73394 91022',
    telLink: 'tel:+917339491022',
    whatsappUrl: 'https://wa.me/917339491022?text=Hello%20Priya%20(Farmer%202),%20I%20have%20an%20inquiry%20regarding%20FarmEra%20heritage%20crops.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'farmer-3',
    label: 'Farmer 3',
    name: 'Ramanathan Velu',
    location: 'Kotagiri Ridge, Nilgiris',
    specialty: 'Highland Hill Carrots, Mountain Potatoes & Tea',
    phoneDisplay: '+91 88702 20499',
    telLink: 'tel:+918870220499',
    whatsappUrl: 'https://wa.me/918870220499?text=Hello%20Ramanathan%20(Farmer%203),%20I%20have%20an%20inquiry%20regarding%20FarmEra%20hill%20vegetables.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
];

export const FARMER_CONTACTS = FARMER_GROUP_CONTACTS;

export interface WhatsAppFloatProps {
  onOpenContactPage?: () => void;
}

export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = ({ onOpenContactPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end"
      id="floating-whatsapp-group-container"
    >
      {/* Farmers Direct Contact Popup Card */}
      {isOpen && (
        <div className="mb-3 w-[92vw] max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl border-2 border-emerald-500/30 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow">
                <WhatsAppIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Farmer Group Contacts</span>
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                </h3>
                <p className="text-[11px] text-emerald-300">
                  Direct WhatsApp Chat & Normal Phone Call
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
              aria-label="Close farmer contact list"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Farmer Contact Items */}
          <div className="p-3.5 space-y-2.5 max-h-[65vh] overflow-y-auto bg-stone-50/50">
            {FARMER_GROUP_CONTACTS.map((farmer) => (
              <div
                key={farmer.id}
                className="p-3 bg-white rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-400 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={farmer.avatar}
                      alt={farmer.name}
                      className="w-10 h-10 rounded-xl object-cover border border-stone-200 shadow-inner shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                          {farmer.label}
                        </span>
                        <h4 className="text-xs font-bold text-stone-900">
                          {farmer.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-1">
                        {farmer.location}
                      </p>
                    </div>
                  </div>

                  {/* Phone Number Display */}
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block font-mono">Mobile</span>
                    <span className="text-[11px] font-bold font-mono text-stone-800 whitespace-nowrap">
                      {farmer.phoneDisplay}
                    </span>
                  </div>
                </div>

                {/* Two Action Buttons: WhatsApp and Normal Call */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                  {/* WhatsApp Contact */}
                  <a
                    href={farmer.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                    title={`Chat with ${farmer.name} on WhatsApp (${farmer.phoneDisplay})`}
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Normal Call */}
                  <a
                    href={farmer.telLink}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-900 hover:bg-black text-amber-300 font-bold text-xs shadow-xs transition-all active:scale-95"
                    title={`Call ${farmer.name} directly (${farmer.phoneDisplay})`}
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Normal Call</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="p-2.5 bg-emerald-50/80 border-t border-emerald-100 flex items-center justify-between text-[11px] text-emerald-900 px-4">
            <span className="font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              100% Direct Producer Contact
            </span>
            <div className="flex items-center gap-2">
              <a
                href="https://wa.me/919677266757"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-emerald-800 underline hover:text-emerald-950"
              >
                Helpline
              </a>
              {onOpenContactPage && (
                <>
                  <span className="text-stone-300">•</span>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenContactPage();
                    }}
                    className="text-[10px] font-bold text-stone-700 hover:text-emerald-900 underline"
                  >
                    Contact Us Page
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="flex items-center gap-2">
        {/* Quick hint badge */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/95 text-white text-xs font-semibold shadow-xl border border-stone-700/80 backdrop-blur-md hover:bg-black transition-all group"
          >
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
            <span>WhatsApp & Call:</span>
            <span className="font-mono text-emerald-300 font-bold">3 Farmers</span>
          </button>
        )}

        {/* Floating WhatsApp Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          id="floating-whatsapp-chat-btn"
          aria-label="WhatsApp and Call Farmers Group: Murugan, Priya, Ramanathan"
          title="WhatsApp and Normal Call Farmers Group: +91 96772 66757, 73394 91022, 88702 20499"
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-2xl transition-transform duration-200 hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 cursor-pointer"
        >
          {/* Subtle Pulse / Glow Ripple Rings */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping"></span>
          <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 blur-sm group-hover:bg-[#25D366]/50 transition-colors"></span>

          {/* WhatsApp Icon */}
          <div className="relative z-10 flex items-center justify-center">
            <WhatsAppIcon className="w-8 h-8 drop-shadow-md group-hover:rotate-6 transition-transform" />
          </div>

          {/* Online Farmer Group Badge */}
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-stone-900 text-white border-2 border-[#25D366] flex items-center justify-center text-[10px] font-black">
            3
          </span>
        </button>
      </div>
    </div>
  );
};
