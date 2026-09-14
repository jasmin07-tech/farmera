import React, { useState, useEffect } from 'react';
import { Smartphone, X, ChevronRight, CheckCircle2, DollarSign, Package } from 'lucide-react';
import { SMSMessage } from '../types';
import { subscribeNewSMS } from '../services/store';

interface SMSToastBannerProps {
  onOpenSimulator: (message?: SMSMessage) => void;
}

export const SMSToastBanner: React.FC<SMSToastBannerProps> = ({ onOpenSimulator }) => {
  const [activeToast, setActiveToast] = useState<SMSMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeNewSMS((newSMS) => {
      setActiveToast(newSMS);
      setIsVisible(true);

      // Web Audio API gentle notification chime
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const now = ctx.currentTime;
          
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(587.33, now); // D5
          gain1.gain.setValueAtTime(0.08, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(now);
          osc1.stop(now + 0.15);

          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(880, now + 0.12); // A5
          gain2.gain.setValueAtTime(0.1, now + 0.12);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(now + 0.12);
          osc2.stop(now + 0.35);
        }
      } catch {
        // Audio policy or un-interacted context safe fallback
      }

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    });

    return unsubscribe;
  }, []);

  if (!activeToast || !isVisible) return null;

  const isPayment = activeToast.category === 'payment';
  const isOrder = activeToast.category === 'order' || activeToast.category === 'dispatch';

  return (
    <div
      className="fixed top-20 right-4 z-50 max-w-sm w-full bg-stone-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-stone-700/80 p-3.5 transition-all transform duration-300 animate-in slide-in-from-top-4"
      id="sms-live-toast"
      role="alert"
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isPayment
                ? 'bg-emerald-600 text-amber-300'
                : isOrder
                ? 'bg-blue-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            {isPayment ? (
              <DollarSign className="w-4 h-4" />
            ) : isOrder ? (
              <Package className="w-4 h-4" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-amber-400">
                {activeToast.senderId}
              </span>
              <span className="text-[10px] text-stone-400">• Just now</span>
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 font-semibold border border-stone-700">
                DLT Verified
              </span>
            </div>
            <p className="text-[11px] text-stone-300 font-medium line-clamp-1">
              To: {activeToast.recipientName} ({activeToast.to})
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-stone-200 mt-2 font-sans line-clamp-2 leading-snug bg-stone-950/60 p-2 rounded-lg border border-stone-800">
        "{activeToast.message}"
      </p>

      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-stone-800/80">
        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          SMS Delivered
        </span>
        <button
          onClick={() => {
            setIsVisible(false);
            onOpenSimulator(activeToast);
          }}
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
          id="toast-open-phone-btn"
        >
          <span>Open Phone Simulator</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
