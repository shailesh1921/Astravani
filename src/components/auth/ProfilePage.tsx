import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User as UserIcon, Mail, ShieldCheck, LogOut, Laptop, 
  Trash2, Loader2, CheckCircle2, AlertTriangle, Edit3, Save 
} from 'lucide-react';
import { authApi } from '../../services/authApi';

export const ProfilePage: React.FC = () => {
  const { user, auditLog, logoutUser, logoutAllDevices, updateName } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Danger zone state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) return null;

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setIsUpdating(true);
    try {
      await updateName(nameInput.trim());
      setIsEditing(false);
      setStatusMessage('Name updated successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      setStatusMessage('Failed to update name.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await authApi.deleteAccount();
      window.location.reload();
    } catch {
      setStatusMessage('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in">
      
      {/* Top Banner / Avatar Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-black text-2xl shadow-sm">
                {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs" title="Verified Account">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isUpdating}
                    className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {user.name || 'Account User'}
                  </h2>
                  <button
                    onClick={() => { setIsEditing(true); setNameInput(user.name || ''); }}
                    className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 cursor-pointer transition"
                    title="Edit Name"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
              {user.emailVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              )}
            </div>

            {user.hasGoogleLinked && (
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-center sm:justify-start gap-1 pt-1">
                <span>🔗 Connected with Google Identity</span>
              </p>
            )}
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Device & Session Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Device Sessions &amp; Security
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your active login tokens across mobile and desktop devices.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => logoutUser()}
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Current Device</span>
          </button>

          <button
            onClick={() => logoutAllDevices()}
            className="w-full bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Laptop className="w-4 h-4" />
            <span>Revoke All Other Devices</span>
          </button>
        </div>
      </div>

      {/* Security Audit Log (Visible to User) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Security Audit Log
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Recent authentication events for your account.
          </p>
        </div>

        {auditLog.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No recent login events recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLog.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-semibold capitalize">
                      {log.method === 'email_otp' ? '✉️ Email OTP' : '🌐 Google 1-Tap'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'success' 
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                          : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {log.ip || 'Private / Local'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black text-red-900 dark:text-red-200">
              Danger Zone: Delete Account
            </h4>
            <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-0.5">
              Permanently delete your profile and all associated tokens. This action is irreversible.
            </p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-white dark:bg-red-950/60 hover:bg-red-600 hover:text-white border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer"
          >
            Delete My Account
          </button>
        ) : (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center gap-2"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span>Confirm Permanent Deletion</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-xs text-slate-500 hover:underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProfilePage;
