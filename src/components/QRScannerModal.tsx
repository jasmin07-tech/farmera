import React, { useState } from 'react';
import {
  X,
  QrCode,
  Sparkles,
  Camera,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ScanLine,
} from 'lucide-react';
import { useFarmStore } from '../services/store';
import { FarmerProfile } from '../types';

interface QRScannerModalProps {
  onClose: () => void;
  onScanSuccess: (farmer: FarmerProfile) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  onClose,
  onScanSuccess,
}) => {
  const { farmers } = useFarmStore();
  const [isScanning, setIsScanning] = useState(true);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  const handleSimulateScan = (farmer: FarmerProfile) => {
    setScannedFeedback(`Decoded QR: ${farmer.farmName} (${farmer.fpoId})`);
    setTimeout(() => {
      onScanSuccess(farmer);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 text-white rounded-2xl w-full max-w-lg shadow-2xl border border-stone-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Digital Farm Passport Scanner</h3>
              <p className="text-xs text-stone-400">Scan packaging QR code to verify origin</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewfinder Simulation */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 bg-stone-950 rounded-2xl border-2 border-stone-800 flex items-center justify-center overflow-hidden shadow-inner">
            {/* Corner guide markers */}
            <div className="absolute top-3 left-3 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
            <div className="absolute top-3 right-3 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
            <div className="absolute bottom-3 left-3 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
            <div className="absolute bottom-3 right-3 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

            {/* Scanning line animation */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_15px_#10b981]"></div>
            )}

            <div className="text-center space-y-2 p-4 z-10">
              <Camera className="w-10 h-10 text-emerald-400/80 mx-auto animate-bounce" />
              <p className="text-xs text-stone-300 font-medium">
                Point camera at FarmEra crate QR code
              </p>
              <div className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                <ScanLine className="w-3 h-3" />
                <span>Auto-detecting farm cryptographic passport</span>
              </div>
            </div>

            {/* Success flash */}
            {scannedFeedback && (
              <div className="absolute inset-0 bg-emerald-900/90 flex flex-col items-center justify-center p-4 text-center z-20 animate-in fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2" />
                <p className="text-xs font-bold text-white">{scannedFeedback}</p>
                <p className="text-[11px] text-emerald-200 mt-1">Opening verified passport...</p>
              </div>
            )}
          </div>

          {/* Quick Demo Test Bar */}
          <div className="w-full mt-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Demo Instant Scan Triggers
              </span>
              <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Click any farm to test
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {farmers.slice(0, 3).map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleSimulateScan(f)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700/90 text-left border border-stone-700 transition-all hover:border-emerald-500 group"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={f.profilePhoto}
                      alt={f.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{f.name}</span>
                        <span className="text-[10px] px-1 rounded bg-emerald-900/80 text-emerald-300 font-mono">
                          {f.fpoId}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 truncate max-w-[240px]">
                        {f.farmName} • {f.district}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Scan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Cryptographic Farm Traceability
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
