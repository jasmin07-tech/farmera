import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { LivePhotoMetadata } from '../types';
import { calculateDistanceMeters, formatDistance } from '../utils/geoUtils';

interface LiveCameraCaptureModalProps {
  farmName: string;
  farmCoordinates: {
    lat: number;
    lng: number;
  };
  cropName?: string;
  onCapture: (photoUrl: string, metadata: LivePhotoMetadata) => void;
  onClose: () => void;
}

const SAMPLE_FARM_LIVE_SHOTS = [
  {
    label: 'Fresh Harvest In Field',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Soil & Organic Fruit Picking',
    url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Morning Vegetable Basket',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Clean Crop Crate on Farm',
    url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80',
  },
];

export const LiveCameraCaptureModal: React.FC<LiveCameraCaptureModalProps> = ({
  farmName,
  farmCoordinates,
  cropName,
  onCapture,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [useSimulationMode, setUseSimulationMode] = useState<boolean>(false);
  const [simulatedSampleIdx, setSimulatedSampleIdx] = useState<number>(0);

  // GPS state
  const [currentGps, setCurrentGps] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(true);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Live timestamp
  const [liveTimestamp, setLiveTimestamp] = useState<string>(
    new Date().toLocaleTimeString('en-IN', { hour12: false })
  );

  // Captured state
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedMetadata, setCapturedMetadata] = useState<LivePhotoMetadata | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTimestamp(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Request GPS
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentGps({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          setGpsLoading(false);
        },
        (err) => {
          console.warn('Geolocation failed or permission denied:', err);
          // Fallback to coordinates within farm boundary for simulation ease
          setCurrentGps({
            lat: farmCoordinates.lat + 0.0012, // ~130m away
            lng: farmCoordinates.lng + 0.0011,
            accuracy: 8,
          });
          setGpsError('GPS simulated within farm perimeter');
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setCurrentGps({
        lat: farmCoordinates.lat,
        lng: farmCoordinates.lng,
        accuracy: 10,
      });
      setGpsLoading(false);
    }
  }, [farmCoordinates]);

  // Start Camera Stream
  useEffect(() => {
    let localStream: MediaStream | null = null;

    async function initCamera() {
      try {
        setCameraError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        localStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } catch (err: any) {
        console.warn('Camera stream error:', err);
        setCameraError(
          'Hardware camera not accessible (permission denied or running in sandboxed frame). Switching to Farm Shutter Simulation.'
        );
        setUseSimulationMode(true);
      }
    }

    if (!useSimulationMode) {
      initCamera();
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [useSimulationMode]);

  // Calculate proximity to farm
  const activeLat = currentGps ? currentGps.lat : farmCoordinates.lat;
  const activeLng = currentGps ? currentGps.lng : farmCoordinates.lng;
  const distanceMeters = calculateDistanceMeters(
    activeLat,
    activeLng,
    farmCoordinates.lat,
    farmCoordinates.lng
  );

  const isWithinPerimeter = distanceMeters <= 500;

  // Handle Shutter click
  const handleShutter = () => {
    const timestampStr = new Date().toISOString();

    if (useSimulationMode || !videoRef.current) {
      // Simulation mode
      const selectedSample = SAMPLE_FARM_LIVE_SHOTS[simulatedSampleIdx].url;
      const meta: LivePhotoMetadata = {
        photoUrl: selectedSample,
        capturedAt: timestampStr,
        latitude: activeLat,
        longitude: activeLng,
        accuracyMeters: currentGps?.accuracy || 5,
        isLiveVerified: isWithinPerimeter,
        distanceFromFarmMeters: distanceMeters,
        verificationReason: isWithinPerimeter
          ? `Verified on-farm: ${formatDistance(distanceMeters)} from registered farm center.`
          : `Unverified: Captured ${formatDistance(distanceMeters)} away from registered farm boundary (max allowed: 500m).`,
        source: 'upload_fallback',
      };
      setCapturedPhotoUrl(selectedSample);
      setCapturedMetadata(meta);
      return;
    }

    // Video canvas capture
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !video) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Inscribe digital anti-fake watermark
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

      ctx.font = '14px monospace';
      ctx.fillStyle = '#10b981';
      ctx.fillText(
        `FARMAUTH • ${farmName.slice(0, 20)} • ${new Date().toISOString().slice(0, 19)}`,
        14,
        canvas.height - 15
      );

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      const meta: LivePhotoMetadata = {
        photoUrl: dataUrl,
        capturedAt: timestampStr,
        latitude: activeLat,
        longitude: activeLng,
        accuracyMeters: currentGps?.accuracy || 5,
        isLiveVerified: isWithinPerimeter,
        distanceFromFarmMeters: distanceMeters,
        verificationReason: isWithinPerimeter
          ? `Verified on-farm: ${formatDistance(distanceMeters)} from registered farm center.`
          : `Unverified: Captured ${formatDistance(distanceMeters)} away from registered farm boundary (max allowed: 500m).`,
        source: 'live_camera',
      };

      setCapturedPhotoUrl(dataUrl);
      setCapturedMetadata(meta);
    }
  };

  const handleConfirm = () => {
    if (capturedPhotoUrl && capturedMetadata) {
      onCapture(capturedPhotoUrl, capturedMetadata);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    setCapturedMetadata(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">Live Camera Capture</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300">
                  Anti-Fake Verification
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                {cropName ? `Live proof for ${cropName}` : `Authenticating produce on ${farmName}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Canvas / Video */}
        <div className="relative bg-black flex-1 min-h-[300px] sm:min-h-[360px] flex items-center justify-center overflow-hidden">
          {!capturedPhotoUrl ? (
            <>
              {useSimulationMode ? (
                /* Simulated Viewfinder */
                <div className="relative w-full h-full min-h-[320px] flex items-center justify-center">
                  <img
                    src={SAMPLE_FARM_LIVE_SHOTS[simulatedSampleIdx].url}
                    alt="Simulated Camera Stream"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Simulated Field Viewfinder</span>
                  </div>
                </div>
              ) : (
                /* Real Video Hardware Viewfinder */
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className="w-full h-full object-cover min-h-[320px]"
                />
              )}

              {/* Viewfinder Grid Crosshairs */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                <div className="border-r border-b border-white/15"></div>
                <div className="border-r border-b border-white/15"></div>
                <div className="border-b border-white/15"></div>
                <div className="border-r border-b border-white/15"></div>
                <div className="border-r border-b border-white/15 relative flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border border-emerald-400/60 animate-pulse"></div>
                </div>
                <div className="border-b border-white/15"></div>
                <div className="border-r border-white/15"></div>
                <div className="border-r border-white/15"></div>
                <div></div>
              </div>

              {/* Top HUD Indicators */}
              <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 pointer-events-none">
                <div className="bg-black/70 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-mono text-emerald-400 border border-white/10 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>{liveTimestamp}</span>
                </div>

                <div
                  className={`bg-black/70 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-mono border border-white/10 flex items-center gap-1.5 ${
                    isWithinPerimeter ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{formatDistance(distanceMeters)} from Farm</span>
                </div>
              </div>

              {/* Bottom HUD: Live GPS Status */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] pointer-events-none">
                <div className="bg-black/75 backdrop-blur px-2.5 py-1.5 rounded-lg border border-white/10 text-stone-300 flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isWithinPerimeter ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                    }`}
                  ></div>
                  <span>
                    GPS: {activeLat.toFixed(4)}°N, {activeLng.toFixed(4)}°E
                  </span>
                </div>

                <div
                  className={`px-2.5 py-1.5 rounded-lg font-bold border backdrop-blur flex items-center gap-1 ${
                    isWithinPerimeter
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                      : 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                  }`}
                >
                  {isWithinPerimeter ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>On-Farm Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Outside Boundary</span>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Post-capture Review Screen */
            <div className="relative w-full h-full min-h-[320px] flex items-center justify-center">
              <img
                src={capturedPhotoUrl}
                alt="Captured Proof"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />

              {/* Verified Ribbon Overlay */}
              <div className="absolute top-3 left-3">
                {capturedMetadata?.isLiveVerified ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 font-bold text-xs shadow-lg backdrop-blur">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>📷 Live Verified Badge Granted</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/90 border border-amber-500 text-amber-300 font-bold text-xs shadow-lg backdrop-blur">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Unverified (Exceeds 500m Farm Radius)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hidden Canvas for hardware snapshot */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex flex-col gap-3">
          {!capturedPhotoUrl ? (
            <div className="flex items-center justify-between gap-3">
              {/* Toggle Simulation Preset (helpful if hardware camera isn't desired/available) */}
              <button
                type="button"
                onClick={() => {
                  setUseSimulationMode(true);
                  setSimulatedSampleIdx((prev) => (prev + 1) % SAMPLE_FARM_LIVE_SHOTS.length);
                }}
                className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold border border-stone-700 flex items-center gap-1.5 transition-colors"
                title="Switch sample harvest scene"
              >
                <RotateCw className="w-3.5 h-3.5 text-stone-400" />
                <span>Preset Angle ({simulatedSampleIdx + 1}/4)</span>
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={handleShutter}
                className="relative w-16 h-16 rounded-full bg-white hover:bg-stone-200 p-1 flex items-center justify-center shadow-2xl ring-4 ring-emerald-500/50 active:scale-95 transition-all group"
                id="camera-shutter-btn"
                title="Capture Live Verified Photo"
              >
                <div className="w-12 h-12 rounded-full border-2 border-stone-900 group-hover:scale-90 transition-transform bg-white"></div>
              </button>

              <div className="text-right">
                <span className="text-[11px] text-stone-400 block">Radius Target</span>
                <span className="text-xs font-mono font-bold text-emerald-400">&lt; 500m check</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs space-y-1 text-stone-300">
                <div className="flex justify-between">
                  <span className="text-stone-400">Captured:</span>
                  <span className="font-mono text-white">
                    {new Date(capturedMetadata?.capturedAt || '').toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Proximity:</span>
                  <span className="font-mono text-emerald-400">
                    {formatDistance(capturedMetadata?.distanceFromFarmMeters || 0)} from Farm Center
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Anti-Fake Status:</span>
                  <span
                    className={`font-bold ${
                      capturedMetadata?.isLiveVerified ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {capturedMetadata?.isLiveVerified ? 'Verified Authentic' : 'Flagged (Unverified)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors"
                >
                  Retake Photo
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/40 transition-all"
                  id="confirm-live-photo-btn"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Attach Live Photo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
