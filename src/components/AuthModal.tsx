import React, { useState } from 'react';
import {
  X,
  UserCheck,
  ShieldCheck,
  Sprout,
  ShoppingBag,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { useFarmStore, PRESET_USERS } from '../services/store';
import { UserRole, User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const { actions } = useFarmStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [farmName, setFarmName] = useState('');
  const [fpoId, setFpoId] = useState('');

  const handleQuickDemoSelect = (userRole: 'farmer' | 'customer' | 'bulk_buyer') => {
    actions.switchPresetUser(userRole);
    onSuccess();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      phone: phone || '+91 98000 12345',
      avatar:
        role === 'farmer'
          ? 'https://images.pexels.com/photos/18620460/pexels-photo-18620460.jpeg?cs=srgb&dl=pexels-gowtham-agm-609630353-18620460.jpg&fm=jpg'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      farmerProfileId: role === 'farmer' ? 'farmer-1' : undefined,
    };

    actions.setUser(newUser);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <span className="font-extrabold text-sm tracking-tight">FarmEra Authentication</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-emerald-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* 1-Click Demo Profiles */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
            <div className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
              Fast Demo Logins (1-Click Switch)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoSelect('farmer')}
                className="p-2 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 text-center transition-all group"
              >
                <div className="text-base mb-0.5">🌾</div>
                <div className="font-bold text-stone-900 group-hover:text-emerald-700">Farmer</div>
                <div className="text-[10px] text-stone-400">Murugan S.</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSelect('customer')}
                className="p-2 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 text-center transition-all group"
              >
                <div className="text-base mb-0.5">🥗</div>
                <div className="font-bold text-stone-900 group-hover:text-emerald-700">Customer</div>
                <div className="text-[10px] text-stone-400">Ananya K.</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSelect('bulk_buyer')}
                className="p-2 rounded-lg bg-white border border-stone-200 hover:border-emerald-600 text-center transition-all group"
              >
                <div className="text-base mb-0.5">🏢</div>
                <div className="font-bold text-stone-900 group-hover:text-emerald-700">Bulk Buyer</div>
                <div className="text-[10px] text-stone-400">GreenBasket</div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-stone-400 text-center justify-center">
            <span className="w-12 h-px bg-stone-200"></span>
            <span className="text-[11px] uppercase font-semibold">Or custom account</span>
            <span className="w-12 h-px bg-stone-200"></span>
          </div>

          {/* Role selector */}
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">Select Your Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                  role === 'farmer'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                🌾 Farmer / FPO
              </button>
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                  role === 'customer'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                🥗 Consumer / Buyer
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'farmer' ? 'e.g. Murugan Selvam' : 'e.g. Ananya Krishnan'}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98421 XXXXX"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            {role === 'farmer' && (
              <>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Farm / Estate Name</label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Pollachi Green Meadows"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">FPO Registration ID</label>
                  <input
                    type="text"
                    value={fpoId}
                    onChange={(e) => setFpoId(e.target.value)}
                    placeholder="e.g. FPO-TN-CBE-2024-89"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>Continue to FarmEra</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
