import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  X,
  Search,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Trash2,
  RotateCcw,
  Volume2,
  VolumeX,
  Filter,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  DollarSign,
  Package,
  Truck,
  CloudRain,
  KeyRound,
  MessageSquare,
  Radio,
  Wifi,
  BatteryCharging,
} from 'lucide-react';
import { useFarmStore } from '../services/store';
import { SMSMessage, SMSRecipientRole, SMSCategory } from '../types';

interface SMSSimulatorModalProps {
  onClose: () => void;
  initialSelectedSMS?: SMSMessage | null;
}

export const SMSSimulatorModal: React.FC<SMSSimulatorModalProps> = ({
  onClose,
  initialSelectedSMS,
}) => {
  const { smsMessages, actions, currentUser } = useFarmStore();

  // State
  const [deviceMode, setDeviceMode] = useState<'smartphone' | 'feature_phone'>('smartphone');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active view tab: 'inbox' | 'composer' | 'scenarios'
  const [activeTab, setActiveTab] = useState<'inbox' | 'composer' | 'scenarios'>('inbox');

  // Custom SMS Composer state
  const [customToRole, setCustomToRole] = useState<SMSRecipientRole>('farmer');
  const [customPhone, setCustomPhone] = useState('+91 98421 88412');
  const [customRecipientName, setCustomRecipientName] = useState('Murugan Selvam (Farmer)');
  const [customSenderId, setCustomSenderId] = useState('DM-KISAN');
  const [customCategory, setCustomCategory] = useState<SMSCategory>('order');
  const [customMessage, setCustomMessage] = useState('');

  // Keypad audio click sound for feature phone
  const playKeypadTone = (freq = 440) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch {}
  };

  // Recipient options definition
  const recipientPresets = [
    {
      role: 'farmer' as SMSRecipientRole,
      name: 'Murugan Selvam (Farmer)',
      phone: '+91 98421 88412',
      badge: 'Pollachi Green Meadows Farm',
      icon: '🌾',
    },
    {
      role: 'customer' as SMSRecipientRole,
      name: 'Ananya Krishnan (Customer)',
      phone: '+91 98402 11983',
      badge: 'Valmiki Nagar, Chennai',
      icon: '🥗',
    },
    {
      role: 'bulk_buyer' as SMSRecipientRole,
      name: 'Karthik Raja (GreenBasket)',
      phone: '+91 98840 99401',
      badge: 'B2B Retail Procurement',
      icon: '🏢',
    },
    {
      role: 'driver' as SMSRecipientRole,
      name: 'R. Palani (Cluster Driver)',
      phone: '+91 94432 01827',
      badge: 'Route Vehicle KA-04-E-8812',
      icon: '🚚',
    },
  ];

  const handleSelectRecipientRole = (role: SMSRecipientRole) => {
    const found = recipientPresets.find((r) => r.role === role);
    if (found) {
      setCustomToRole(found.role);
      setCustomPhone(found.phone);
      setCustomRecipientName(found.name);
    }
  };

  // Filter messages
  const filteredMessages = useMemo(() => {
    return smsMessages.filter((msg) => {
      // Role filter
      if (selectedRoleFilter !== 'all' && msg.recipientRole !== selectedRoleFilter) {
        return false;
      }
      // Category filter
      if (selectedCategoryFilter !== 'all' && msg.category !== selectedCategoryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchMsg = msg.message.toLowerCase().includes(query);
        const matchSender = msg.senderId.toLowerCase().includes(query);
        const matchRecipient = msg.recipientName.toLowerCase().includes(query);
        const matchPhone = msg.to.toLowerCase().includes(query);
        return matchMsg || matchSender || matchRecipient || matchPhone;
      }
      return true;
    });
  }, [smsMessages, selectedRoleFilter, selectedCategoryFilter, searchQuery]);

  const unreadCount = smsMessages.filter((m) => !m.read).length;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendCustomSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;

    actions.sendSMS({
      senderId: customSenderId,
      to: customPhone,
      recipientName: customRecipientName,
      recipientRole: customToRole,
      category: customCategory,
      message: customMessage.trim(),
    });

    setCustomMessage('');
    setActiveTab('inbox');
  };

  // Pre-configured simulation scenarios
  const triggerPresetScenario = (scenarioKey: string) => {
    switch (scenarioKey) {
      case 'farmer_order':
        actions.sendSMS({
          senderId: 'DM-KISAN',
          to: '+91 98421 88412',
          recipientName: 'Murugan Selvam (Farmer)',
          recipientRole: 'farmer',
          category: 'order',
          message: 'Kisan Alert (FarmEra): Urgent harvest order #ORD-9104 received from GreenBasket bulk buyer! 40kg Country Tomatoes required for tomorrow 6:00 AM gate pickup. Payout ₹1,600 reserved in direct escrow.',
          orderId: 'ORD-9104',
          amount: 1600,
        });
        break;

      case 'upi_payout':
        actions.sendSMS({
          senderId: 'AX-SBIUPI',
          to: '+91 98421 88412',
          recipientName: 'Murugan Selvam (Farmer)',
          recipientRole: 'farmer',
          category: 'payment',
          message: 'Dear Kisan Murugan, ₹1,240.00 credited to your Bank A/C XX4112 via Direct UPI Ref UPI/FRM-9104. 100% farm-gate proceeds with 0% middleman deduction. FarmEra Direct Settlement Protocol.',
          orderId: 'ORD-9104',
          amount: 1240,
        });
        break;

      case 'dispatch_transit':
        actions.sendSMS({
          senderId: 'VK-FRMERA',
          to: '+91 98402 11983',
          recipientName: 'Ananya Krishnan (Customer)',
          recipientRole: 'customer',
          category: 'dispatch',
          message: 'FarmEra: Your harvest package is OUT FOR DELIVERY! Vehicle KA-04-E-8812 has completed cluster pickup from Pollachi Farm. Estimated arrival at your doorstep: 4:30 PM. Live map: farmera.in/t/ORD-8821',
          orderId: 'ORD-8821',
        });
        break;

      case 'weather_advisory':
        actions.sendSMS({
          senderId: 'DM-KISAN',
          to: '+91 98421 88412',
          recipientName: 'Murugan Selvam (Farmer)',
          recipientRole: 'farmer',
          category: 'harvest_ai',
          message: 'வானிலை எச்சரிக்கை (Weather Alert): கோவை/பொள்ளாச்சி பகுதியில் அடுத்த 48 மணி நேரத்தில் பலத்த மழை எதிர்பார்க்கப்படுகிறது. தக்காளி அறுவடையை இன்று மாலைக்குள் முடிக்கவும். (Heavy rain expected in Coimbatore belt in 48h. Conclude tomato harvest by evening).',
        });
        break;

      case 'kisan_otp':
        const randomOtp = Math.floor(100000 + Math.random() * 900000);
        actions.sendSMS({
          senderId: 'VK-FRMERA',
          to: '+91 98421 88412',
          recipientName: 'Murugan Selvam (Farmer)',
          recipientRole: 'farmer',
          category: 'otp',
          message: `Your FarmEra Kisan Verification OTP is ${randomOtp}. Valid for 10 minutes. Use this to verify FPO certification and release instant direct bank settlement.`,
        });
        break;

      default:
        break;
    }
    setActiveTab('inbox');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-stone-900 rounded-3xl w-full max-w-5xl shadow-2xl border border-stone-800 text-stone-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar */}
        <div className="px-5 py-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  FarmEra SMS & Telecom Simulator
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  DLT Gateway Active
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Simulating direct transactional SMS alerts for farmers, consumers, and FPO hubs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Handset View Switcher */}
            <div className="bg-stone-800 p-0.5 rounded-xl border border-stone-700 flex items-center text-xs">
              <button
                onClick={() => setDeviceMode('smartphone')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  deviceMode === 'smartphone'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="Modern Smartphone Screen"
              >
                Smartphone
              </button>
              <button
                onClick={() => setDeviceMode('feature_phone')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  deviceMode === 'feature_phone'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="Kisan Keypad Feature Phone (Nokia/JioBharat)"
              >
                Kisan Keypad Phone
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled
                  ? 'bg-stone-800 border-stone-700 text-emerald-400 hover:bg-stone-700'
                  : 'bg-stone-800/50 border-stone-800 text-stone-500'
              }`}
              title={soundEnabled ? 'Audio Chimes Enabled' : 'Audio Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors border border-stone-700"
              aria-label="Close modal"
              id="close-sms-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Layout: Left Handset Simulator / Right Control Center */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-stone-800">
          {/* LEFT: Realistic Phone Handset Preview (5 Cols) */}
          <div className="lg:col-span-5 p-4 sm:p-6 bg-stone-950 flex flex-col items-center justify-start overflow-y-auto">
            {deviceMode === 'smartphone' ? (
              /* SMARTPHONE HANDSET SHELL */
              <div className="w-full max-w-[340px] bg-stone-900 rounded-[40px] p-3 border-4 border-stone-700 shadow-2xl relative flex flex-col min-h-[580px] max-h-[620px]">
                {/* Phone Speaker & Notch */}
                <div className="flex items-center justify-between px-6 pt-1 pb-2">
                  <span className="text-[11px] font-bold text-stone-400">9:41</span>
                  <div className="w-20 h-4 bg-stone-950 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-stone-800"></div>
                  </div>
                  <div className="flex items-center gap-1 text-stone-400">
                    <Wifi className="w-3 h-3" />
                    <BatteryCharging className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>

                {/* Smartphone Messaging Header */}
                <div className="bg-stone-800/80 backdrop-blur rounded-2xl p-2.5 mb-2 border border-stone-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-800/60 border border-emerald-600 text-emerald-300 flex items-center justify-center font-bold text-xs">
                      💬
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>Messages</span>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          ({filteredMessages.length})
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-400">Jio 5G • Indian DLT Route</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => actions.markAllSMSRead()}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 px-1.5 py-0.5 rounded bg-stone-700/50"
                      title="Mark all messages read"
                    >
                      Read All
                    </button>
                  </div>
                </div>

                {/* Messages List Area inside phone */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-16 text-stone-500 space-y-2">
                      <MessageSquare className="w-8 h-8 mx-auto text-stone-600" />
                      <p className="text-xs">No SMS matches your filter.</p>
                      <button
                        onClick={() => {
                          setSelectedRoleFilter('all');
                          setSelectedCategoryFilter('all');
                          setSearchQuery('');
                        }}
                        className="text-[11px] text-emerald-400 underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  ) : (
                    filteredMessages.map((sms) => {
                      const isUnread = !sms.read;
                      const isPayment = sms.category === 'payment';
                      const isOTP = sms.category === 'otp';

                      return (
                        <div
                          key={sms.id}
                          onClick={() => actions.markSMSRead(sms.id)}
                          className={`p-3 rounded-2xl transition-all border relative cursor-pointer group ${
                            isUnread
                              ? 'bg-stone-800/95 border-emerald-600/70 shadow-md'
                              : 'bg-stone-850/70 border-stone-750 hover:border-stone-650'
                          }`}
                        >
                          {isUnread && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-stone-900 animate-pulse"></span>
                          )}

                          {/* Header row */}
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-extrabold text-[11px] text-amber-300 tracking-wider">
                                {sms.senderId}
                              </span>
                              <span className="text-[9px] px-1 py-0.2 rounded bg-stone-700/60 text-stone-300 uppercase font-semibold">
                                {sms.category}
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-400 font-mono">{sms.timestamp}</span>
                          </div>

                          {/* Recipient info */}
                          <div className="text-[10px] text-stone-400 mb-1.5 flex items-center justify-between">
                            <span className="truncate max-w-[170px]">To: {sms.recipientName}</span>
                            <span className="font-mono text-stone-500">{sms.to}</span>
                          </div>

                          {/* SMS Text Body */}
                          <div
                            className={`text-xs leading-relaxed font-sans ${
                              isPayment
                                ? 'text-emerald-200'
                                : isOTP
                                ? 'text-amber-200 font-mono'
                                : 'text-stone-200'
                            }`}
                          >
                            {sms.message}
                          </div>

                          {/* Action footer */}
                          <div className="mt-2 pt-1.5 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(sms.id, sms.message);
                              }}
                              className="flex items-center gap-1 hover:text-white"
                            >
                              {copiedId === sms.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>{copiedId === sms.id ? 'Copied' : 'Copy'}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                actions.deleteSMS(sms.id);
                              }}
                              className="hover:text-red-400"
                              title="Delete SMS"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Smartphone Home Bar */}
                <div className="pt-2 flex justify-center">
                  <div className="w-32 h-1 bg-stone-600 rounded-full"></div>
                </div>
              </div>
            ) : (
              /* KISAN KEYPAD FEATURE PHONE (NOKIA / JIOBHARAT STYLE) */
              <div className="w-full max-w-[320px] bg-slate-900 rounded-[36px] p-4 border-4 border-slate-700 shadow-2xl flex flex-col items-center select-none min-h-[580px]">
                {/* Earpiece slit */}
                <div className="w-12 h-1.5 bg-slate-800 rounded-full mb-3"></div>

                {/* Brand label */}
                <div className="text-[10px] font-black tracking-widest text-emerald-400 mb-2 uppercase">
                  FarmEra Kisan • JioBharat
                </div>

                {/* Backlit Monochrome LCD Screen */}
                <div className="w-full bg-[#1b382b] border-2 border-[#2b5843] rounded-xl p-3 shadow-inner text-[#a8f0cf] font-mono text-xs flex flex-col min-h-[220px] max-h-[230px] overflow-hidden">
                  {/* Top Status LCD */}
                  <div className="flex items-center justify-between border-b border-[#2b5843] pb-1 mb-1 text-[10px] font-bold">
                    <span>📶 AIRTEL 2G</span>
                    <span>10:30 AM</span>
                    <span>🔋 85%</span>
                  </div>

                  {/* Active Message in LCD */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
                    {filteredMessages.length === 0 ? (
                      <div className="text-center py-6 text-emerald-400/60">
                        [ NO INCOMING SMS ]
                      </div>
                    ) : (
                      filteredMessages.slice(0, 4).map((sms, i) => (
                        <div
                          key={sms.id}
                          className="bg-[#12281e] p-1.5 rounded border border-[#234b37] text-[11px]"
                        >
                          <div className="flex items-center justify-between font-bold text-[#e6fff2] text-[10px]">
                            <span>{sms.senderId}</span>
                            <span>{sms.timestamp}</span>
                          </div>
                          <div className="line-clamp-2 text-[#bdfada] mt-0.5">
                            {sms.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* LCD Footer */}
                  <div className="border-t border-[#2b5843] pt-1 flex justify-between text-[9px] text-emerald-300 font-bold">
                    <span>Options</span>
                    <span>Back</span>
                  </div>
                </div>

                {/* Physical Nav Keys */}
                <div className="grid grid-cols-3 gap-2 w-full mt-4 mb-2">
                  <button
                    onClick={() => playKeypadTone(520)}
                    className="py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl text-xs font-bold text-slate-300 shadow active:translate-y-0.5 border border-slate-700"
                  >
                    Select
                  </button>
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      ▲
                    </div>
                  </div>
                  <button
                    onClick={() => playKeypadTone(420)}
                    className="py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl text-xs font-bold text-slate-300 shadow active:translate-y-0.5 border border-slate-700"
                  >
                    Back
                  </button>
                </div>

                {/* Number Keypad 1 to 9, *, 0, # */}
                <div className="grid grid-cols-3 gap-1.5 w-full">
                  {[
                    { num: '1', sub: 'oo' },
                    { num: '2', sub: 'abc' },
                    { num: '3', sub: 'def' },
                    { num: '4', sub: 'ghi' },
                    { num: '5', sub: 'jkl' },
                    { num: '6', sub: 'mno' },
                    { num: '7', sub: 'pqrs' },
                    { num: '8', sub: 'tuv' },
                    { num: '9', sub: 'wxyz' },
                    { num: '*', sub: '+' },
                    { num: '0', sub: '␣' },
                    { num: '#', sub: '⇧' },
                  ].map((k) => (
                    <button
                      key={k.num}
                      onClick={() => playKeypadTone(350 + Number(k.num || 5) * 40)}
                      className="py-1.5 bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 rounded-lg text-center shadow-sm border border-slate-750 transition-all active:scale-95"
                    >
                      <div className="text-xs font-bold text-white leading-none">{k.num}</div>
                      <div className="text-[9px] text-slate-400 uppercase leading-none mt-0.5">
                        {k.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Simulator Controls, Interactive Scenarios & Custom Composer (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 bg-stone-900 flex flex-col space-y-5 overflow-y-auto">
            {/* View Tabs */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('inbox')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'inbox'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-stone-800 text-stone-300 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Inbox & Log ({smsMessages.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('scenarios')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'scenarios'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-stone-800 text-stone-300 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Quick Test Scenarios</span>
                </button>

                <button
                  onClick={() => setActiveTab('composer')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'composer'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-stone-800 text-stone-300 hover:text-white'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Compose SMS</span>
                </button>
              </div>

              <button
                onClick={() => actions.resetSMS()}
                className="text-stone-400 hover:text-stone-200 text-xs flex items-center gap-1"
                title="Reset to default seed messages"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

            {/* TAB 1: INBOX & LOG */}
            {activeTab === 'inbox' && (
              <div className="space-y-4">
                {/* Search and Filters Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-6 relative">
                    <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by keywords, sender, phone..."
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <select
                      value={selectedRoleFilter}
                      onChange={(e) => setSelectedRoleFilter(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-2 text-xs text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">All Roles</option>
                      <option value="farmer">🌾 Farmers</option>
                      <option value="customer">🥗 Customers</option>
                      <option value="bulk_buyer">🏢 Bulk Buyers</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-2 text-xs text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="payment">💰 Bank UPI Payouts</option>
                      <option value="order">📦 Order Alerts</option>
                      <option value="dispatch">🚚 Transit Updates</option>
                      <option value="harvest_ai">🌾 AI Weather/Agri</option>
                      <option value="otp">🔐 Verification OTP</option>
                    </select>
                  </div>
                </div>

                {/* Recipient Quick Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <button
                    onClick={() => setSelectedRoleFilter('all')}
                    className={`px-2.5 py-1 rounded-lg shrink-0 font-medium ${
                      selectedRoleFilter === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    All ({smsMessages.length})
                  </button>
                  {recipientPresets.map((rec) => {
                    const count = smsMessages.filter((m) => m.recipientRole === rec.role).length;
                    return (
                      <button
                        key={rec.role}
                        onClick={() => setSelectedRoleFilter(rec.role)}
                        className={`px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 font-medium ${
                          selectedRoleFilter === rec.role
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        <span>{rec.icon}</span>
                        <span className="truncate max-w-[100px]">{rec.name.split(' ')[0]}</span>
                        <span className="text-[10px] opacity-75">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Informational Box on Direct Telecom Integration */}
                <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-3.5 space-y-1 text-xs text-emerald-200">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>DLT Registered Transactional Headers</span>
                  </div>
                  <p className="text-[11px] text-emerald-300 leading-relaxed">
                    Compliant with Telecom Regulatory Authority of India (TRAI) DLT standards. Headers{' '}
                    <span className="font-mono text-amber-300">VK-FRMERA</span> and{' '}
                    <span className="font-mono text-amber-300">DM-KISAN</span> bypass DND filters for
                    urgent harvest dispatch, weather advisories, and instant UPI bank settlements.
                  </p>
                </div>

                {/* Recent Messages Summary Table */}
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {filteredMessages.map((sms) => (
                    <div
                      key={sms.id}
                      className="bg-stone-950 p-3 rounded-xl border border-stone-800 hover:border-stone-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-400">
                            {sms.senderId}
                          </span>
                          <span className="text-[10px] text-stone-400 font-medium">
                            ➔ {sms.recipientName} ({sms.to})
                          </span>
                          <span className="text-[10px] text-stone-500">• {sms.timestamp}</span>
                        </div>
                        <p className="text-xs text-stone-300 truncate">{sms.message}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopy(sms.id, sms.message)}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1"
                          title="Copy message"
                        >
                          {copiedId === sms.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => actions.deleteSMS(sms.id)}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-red-900/50 text-stone-400 hover:text-red-300"
                          title="Delete SMS"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: QUICK TEST SCENARIOS */}
            {activeTab === 'scenarios' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-white">
                    One-Click Simulation Scenarios
                  </h4>
                  <p className="text-xs text-stone-400">
                    Trigger authentic agri-telecom workflows to demonstrate how farmers and customers receive immediate updates on feature phones and smartphones.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Scenario 1 */}
                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 hover:border-emerald-700 transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <Package className="w-4 h-4" />
                        <span>New Harvest Order to Farmer</span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        Simulate an SMS alert to Murugan Selvam with crate quantity and pickup time.
                      </p>
                    </div>
                    <button
                      onClick={() => triggerPresetScenario('farmer_order')}
                      className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      id="sim-farmer-order-btn"
                    >
                      <Send className="w-3 h-3" />
                      <span>Trigger Order Alert SMS</span>
                    </button>
                  </div>

                  {/* Scenario 2 */}
                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 hover:border-emerald-700 transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                        <DollarSign className="w-4 h-4" />
                        <span>Direct UPI Bank Settlement</span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        Instant bank credit SMS to farmer with zero middleman deductions and SBI UPI reference.
                      </p>
                    </div>
                    <button
                      onClick={() => triggerPresetScenario('upi_payout')}
                      className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
                      id="sim-upi-payout-btn"
                    >
                      <DollarSign className="w-3 h-3" />
                      <span>Trigger Direct UPI SMS</span>
                    </button>
                  </div>

                  {/* Scenario 3 */}
                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 hover:border-emerald-700 transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                        <Truck className="w-4 h-4" />
                        <span>AI Cluster Route Dispatch</span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        Transit notification to customer with electric vehicle number and driver ETA.
                      </p>
                    </div>
                    <button
                      onClick={() => triggerPresetScenario('dispatch_transit')}
                      className="w-full py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Truck className="w-3 h-3" />
                      <span>Trigger Dispatch Notice</span>
                    </button>
                  </div>

                  {/* Scenario 4 */}
                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 hover:border-emerald-700 transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                        <CloudRain className="w-4 h-4" />
                        <span>AI Weather Advisory (Tamil/Eng)</span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        Regional rainfall advisory recommending immediate dawn harvesting before monsoon showers.
                      </p>
                    </div>
                    <button
                      onClick={() => triggerPresetScenario('weather_advisory')}
                      className="w-full py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CloudRain className="w-3 h-3" />
                      <span>Send Weather Advisory</span>
                    </button>
                  </div>

                  {/* Scenario 5 */}
                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 hover:border-emerald-700 transition-all flex flex-col justify-between space-y-3 sm:col-span-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                        <KeyRound className="w-4 h-4" />
                        <span>Digital Farm Passport Verification OTP</span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        Simulate one-time password SMS to verify farmer identity, geo-location, and award the Verified FPO badge.
                      </p>
                    </div>
                    <button
                      onClick={() => triggerPresetScenario('kisan_otp')}
                      className="w-full py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Trigger Verification OTP</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CUSTOM SMS COMPOSER */}
            {activeTab === 'composer' && (
              <form onSubmit={handleSendCustomSMS} className="space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-white">Compose Custom Transactional SMS</h4>
                  <p className="text-xs text-stone-400">
                    Send a custom SMS simulation to any recipient with DLT headers and real-time delivery.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Recipient Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Recipient Preset
                    </label>
                    <select
                      value={customToRole}
                      onChange={(e) => handleSelectRecipientRole(e.target.value as SMSRecipientRole)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {recipientPresets.map((r) => (
                        <option key={r.role} value={r.role}>
                          {r.icon} {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Recipient Phone Number
                    </label>
                    <input
                      type="text"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      placeholder="+91 98421 XXXXX"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  {/* Sender ID Header */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      DLT Sender Header
                    </label>
                    <select
                      value={customSenderId}
                      onChange={(e) => setCustomSenderId(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="VK-FRMERA">VK-FRMERA (FarmEra Marketplace)</option>
                      <option value="DM-KISAN">DM-KISAN (Kisan Harvest Portal)</option>
                      <option value="AX-SBIUPI">AX-SBIUPI (Direct Bank Settlement)</option>
                      <option value="VK-LOGIST">VK-LOGIST (Smart Route Dispatch)</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      SMS Category
                    </label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value as SMSCategory)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="order">Order Update</option>
                      <option value="payment">Direct Payment Settlement</option>
                      <option value="dispatch">Route & Logistics</option>
                      <option value="harvest_ai">AI Krishi / Weather Advisory</option>
                      <option value="otp">Security OTP</option>
                    </select>
                  </div>
                </div>

                {/* Quick Variable Insertion Chips */}
                <div>
                  <div className="text-[11px] text-stone-400 mb-1 font-medium">
                    Quick template inserts:
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() =>
                        setCustomMessage((prev) => prev + ' Order #ORD-' + Math.floor(1000 + Math.random() * 9000))
                      }
                      className="px-2 py-1 rounded bg-stone-800 text-stone-300 hover:text-white"
                    >
                      + Order ID
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCustomMessage((prev) => prev + ' ₹' + (500 + Math.floor(Math.random() * 800)) + '.00 credited via UPI')
                      }
                      className="px-2 py-1 rounded bg-stone-800 text-stone-300 hover:text-white"
                    >
                      + UPI Amount
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCustomMessage((prev) => prev + ' Pollachi Farm cluster vehicle KA-04-E-8812')
                      }
                      className="px-2 py-1 rounded bg-stone-800 text-stone-300 hover:text-white"
                    >
                      + Vehicle Number
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCustomMessage((prev) => prev + ' 100% direct payout. 0% broker fee.')
                      }
                      className="px-2 py-1 rounded bg-stone-800 text-stone-300 hover:text-white"
                    >
                      + Zero Commission
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                    <label className="font-semibold">SMS Message Body</label>
                    <span className="text-[11px] text-stone-500 font-mono">
                      {customMessage.length} / 160 characters (GSM 7-bit)
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Type transaction message text (e.g. FarmEra: Your fresh harvest has departed the farm...)"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                    required
                  ></textarea>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomMessage('')}
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-xs font-semibold"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={!customMessage.trim()}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Simulated SMS</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
