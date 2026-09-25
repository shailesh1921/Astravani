import React, { useState, useEffect } from 'react';
import { 
  X, User, Calendar, Clock, MapPin, Wallet, History, 
  Trash2, Plus, Check, ShieldCheck, LogOut, Phone, Mail, 
  ChevronRight, Sparkles, MessageSquare, PhoneCall, Save,
  AlertCircle, Award
} from 'lucide-react';
import { UserProfile, SavedKundli, ConsultationRecord, PaymentTransaction } from '../types/astrotalk';
import { cloudAuth } from '../services/cloudAuthService';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenRecharge: () => void;
  onSelectSavedKundli?: (kundli: SavedKundli) => void;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onOpenRecharge,
  onSelectSavedKundli
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'kundlis' | 'passbook' | 'history'>('profile');

  // Profile Form States
  const [profileForm, setProfileForm] = useState<UserProfile>(currentUser);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Saved Kundlis States
  const [savedKundlis, setSavedKundlis] = useState<SavedKundli[]>([]);
  const [isAddingKundli, setIsAddingKundli] = useState(false);
  const [newKundliName, setNewKundliName] = useState('');
  const [newKundliRelation, setNewKundliRelation] = useState<SavedKundli['relation']>('Spouse');
  const [newKundliGender, setNewKundliGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [newKundliDob, setNewKundliDob] = useState('1998-06-12');
  const [newKundliTob, setNewKundliTob] = useState('08:45');
  const [newKundliPob, setNewKundliPob] = useState('New Delhi, India');

  // Ledger & Consultations
  const [walletBalance, setWalletBalance] = useState<number>(100);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [expandedConsultationId, setExpandedConsultationId] = useState<string | null>(null);

  // Load cloud data on open
  useEffect(() => {
    if (isOpen) {
      setProfileForm(currentUser);
      setSavedKundlis(cloudAuth.getSavedKundlis());
      setWalletBalance(cloudAuth.getWalletBalance());
      setTransactions(cloudAuth.getTransactions());
      setConsultations(cloudAuth.getConsultations());
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = cloudAuth.updateProfile(profileForm);
      setProfileForm(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddKundli = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKundliName.trim()) return;

    const created = cloudAuth.saveKundli({
      name: newKundliName.trim(),
      relation: newKundliRelation,
      gender: newKundliGender,
      dob: newKundliDob,
      tob: newKundliTob,
      pob: newKundliPob
    });

    setSavedKundlis(prev => [created, ...prev]);
    setIsAddingKundli(false);
    setNewKundliName('');
  };

  const handleDeleteKundli = (id: string) => {
    cloudAuth.deleteKundli(id);
    setSavedKundlis(prev => prev.filter(k => k.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      
      {/* Slide-over panel */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-5 text-slate-900 flex-shrink-0 relative shadow-xs">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div className="w-14 h-14 rounded-2xl bg-white border-2 border-amber-300 text-amber-700 flex items-center justify-center text-2xl font-black shadow-md flex-shrink-0">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span>{currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'ॐ'}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-lg text-slate-950 truncate">
                  {currentUser.fullName}
                </h3>
                <ShieldCheck className="w-4 h-4 text-emerald-700 fill-emerald-100 flex-shrink-0" />
              </div>
              <p className="text-xs font-mono text-slate-800 font-semibold truncate">
                {currentUser.phone || currentUser.email}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-amber-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Verified Devotee
                </span>
                <span className="text-[11px] text-slate-800 font-medium">
                  Bal: <strong>₹{walletBalance}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold flex-shrink-0">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'kundlis', label: 'Saved Kundlis', icon: Calendar },
            { id: 'passbook', label: 'Passbook', icon: Wallet },
            { id: 'history', label: 'Past Chats', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 px-1 text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-white text-amber-700 border-b-2 border-amber-500 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px]">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: MY PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              {saveSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Profile updated &amp; synced across devices!</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Marital Status
                  </label>
                  <select
                    value={profileForm.maritalStatus || 'Single'}
                    onChange={(e) => setProfileForm({ ...profileForm, maritalStatus: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="In a Relationship">In a Relationship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={profileForm.dob}
                    onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Time of Birth
                  </label>
                  <input
                    type="time"
                    required
                    value={profileForm.tob}
                    onChange={(e) => setProfileForm({ ...profileForm, tob: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Place of Birth (City, Country)
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={profileForm.pob}
                    onChange={(e) => setProfileForm({ ...profileForm, pob: e.target.value })}
                    placeholder="e.g. Varanasi, Uttar Pradesh"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={profileForm.occupation || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })}
                    placeholder="e.g. Business / Service"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Preferred Language
                  </label>
                  <select
                    value={profileForm.preferredLanguage || 'Hindi'}
                    onChange={(e) => setProfileForm({ ...profileForm, preferredLanguage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500"
                  >
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="English">English</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-astrotalk w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save & Sync Cloud Profile'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SAVED FAMILY KUNDLIS */}
          {activeTab === 'kundlis' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Saved Profiles ({savedKundlis.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingKundli(!isAddingKundli)}
                  className="text-xs text-amber-700 font-bold hover:text-amber-800 flex items-center gap-1 cursor-pointer bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingKundli ? 'Cancel' : 'Add Family Member'}</span>
                </button>
              </div>

              {/* Add New Kundli Form */}
              {isAddingKundli && (
                <form onSubmit={handleAddKundli} className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-2.5 text-xs">
                  <div className="font-extrabold text-amber-950 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Add New Kundli Chart</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Person Name</label>
                    <input
                      type="text"
                      required
                      value={newKundliName}
                      onChange={(e) => setNewKundliName(e.target.value)}
                      placeholder="e.g. Priya Singh"
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Relation</label>
                      <select
                        value={newKundliRelation}
                        onChange={(e) => setNewKundliRelation(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs text-slate-900"
                      >
                        <option value="Spouse">Spouse / Partner</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Friend">Friend</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Gender</label>
                      <select
                        value={newKundliGender}
                        onChange={(e) => setNewKundliGender(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs text-slate-900"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Date of Birth</label>
                      <input
                        type="date"
                        required
                        value={newKundliDob}
                        onChange={(e) => setNewKundliDob(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Time of Birth</label>
                      <input
                        type="time"
                        required
                        value={newKundliTob}
                        onChange={(e) => setNewKundliTob(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Place of Birth</label>
                    <input
                      type="text"
                      required
                      value={newKundliPob}
                      onChange={(e) => setNewKundliPob(e.target.value)}
                      placeholder="e.g. Lucknow, Uttar Pradesh"
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-astrotalk w-full py-2 text-xs font-bold cursor-pointer"
                  >
                    Save Kundli Chart
                  </button>
                </form>
              )}

              {/* Saved Kundlis List */}
              <div className="space-y-2">
                {savedKundlis.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No saved family charts yet. Click "Add Family Member" to save charts for quick 1-tap consultations.
                  </div>
                ) : (
                  savedKundlis.map((kundli) => (
                    <div
                      key={kundli.id}
                      className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs hover:border-amber-300 transition flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900 truncate">
                            {kundli.name}
                          </span>
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.2 rounded-full">
                            {kundli.relation}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 space-x-2">
                          <span>{kundli.dob}</span>
                          <span>•</span>
                          <span>{kundli.tob}</span>
                          <span>•</span>
                          <span className="truncate">{kundli.pob}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {onSelectSavedKundli && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSavedKundli(kundli);
                              onClose();
                            }}
                            className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                          >
                            Use Chart
                          </button>
                        )}
                        {kundli.relation !== 'Self' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteKundli(kundli.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
                            title="Delete profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PASSBOOK & WALLET */}
          {activeTab === 'passbook' && (
            <div className="space-y-4">
              
              {/* Wallet Card */}
              <div className="bg-gradient-to-br from-amber-500 via-amber-400 to-orange-400 rounded-2xl p-4 text-slate-950 shadow-md">
                <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">
                  Available Talktime Balance
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold">₹</span>
                    <span className="text-3xl font-black font-mono tracking-tight">{walletBalance}</span>
                  </div>
                  <button
                    onClick={() => {
                      onOpenRecharge();
                      onClose();
                    }}
                    className="bg-slate-950 hover:bg-slate-800 text-amber-400 font-extrabold text-xs px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
                  >
                    + Recharge
                  </button>
                </div>
                <div className="mt-3 pt-2.5 border-t border-amber-600/30 flex items-center justify-between text-[11px] font-semibold">
                  <span>Direct UPI Enabled (0% Fee)</span>
                  <span>⚡ Instant Credit</span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Transaction History &amp; Receipts
                </span>

                {transactions.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No transactions recorded yet.
                  </div>
                ) : (
                  transactions.map(tx => (
                    <div
                      key={tx.id}
                      className="bg-white border border-slate-200 rounded-xl p-3 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">
                          Recharge Credited (+₹{tx.totalCredited})
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {new Date(tx.timestamp).toLocaleString()} • {tx.method.toUpperCase()}
                        </span>
                        {tx.receiptId && (
                          <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                            Ref: {tx.receiptId}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-600 font-black text-xs block">
                          +₹{tx.totalCredited}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 4: PAST CONSULTATIONS */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                Consultation Archives &amp; Remedies ({consultations.length})
              </span>

              {consultations.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No previous consultations. When you consult an astrologer, all chat transcripts and remedies are saved here permanently.
                </div>
              ) : (
                consultations.map(cons => {
                  const isExpanded = expandedConsultationId === cons.id;
                  return (
                    <div
                      key={cons.id}
                      className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs hover:border-amber-300 transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={cons.astrologerAvatar}
                            alt={cons.astrologerName}
                            className="w-10 h-10 rounded-full object-cover border border-amber-300"
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-extrabold text-xs text-slate-900">
                                {cons.astrologerName}
                              </span>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {new Date(cons.startedAt).toLocaleDateString()} • {cons.mode.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-slate-900 block">
                            ₹{cons.amountDeducted}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {Math.floor(cons.durationSeconds / 60)}m {cons.durationSeconds % 60}s
                          </span>
                        </div>
                      </div>

                      {/* Topic & Question */}
                      <div className="bg-slate-50 p-2 rounded-xl text-[11px] text-slate-700">
                        <span className="font-bold text-amber-800 block">
                          Topic: {cons.topic || cons.intake?.topic || 'Vedic Guidance'}
                        </span>
                        {cons.intake?.question && (
                          <p className="italic text-slate-600 mt-0.5">"{cons.intake.question}"</p>
                        )}
                      </div>

                      {/* Expand Messages Button */}
                      <button
                        type="button"
                        onClick={() => setExpandedConsultationId(isExpanded ? null : cons.id)}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Hide Chat Transcript' : `View Full Transcript (${cons.messages?.length || 0} messages)`}</span>
                      </button>

                      {/* Expanded Transcript Drawer */}
                      {isExpanded && cons.messages && (
                        <div className="bg-amber-50/50 border border-amber-200/70 rounded-xl p-2.5 max-h-60 overflow-y-auto space-y-2 mt-1">
                          {cons.messages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`text-[11px] p-2 rounded-lg ${
                                msg.sender === 'user'
                                  ? 'bg-amber-100 text-amber-950 ml-6 text-right'
                                  : msg.sender === 'astrologer'
                                  ? 'bg-white border border-slate-200 text-slate-800 mr-6'
                                  : 'bg-slate-100 text-slate-500 text-center italic text-[10px]'
                              }`}
                            >
                              <span className="font-bold text-[9px] block text-slate-400">
                                {msg.sender === 'user' ? 'You' : cons.astrologerName} • {msg.timestamp}
                              </span>
                              <p className="mt-0.5 whitespace-pre-line">{msg.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

        {/* Footer Logout Button */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="text-[10px] text-slate-400">
            AstraVani Cloud v2.4 • Logged in as <span className="font-bold text-slate-600">{currentUser.phone || currentUser.email}</span>
          </div>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>

    </div>
  );
};
