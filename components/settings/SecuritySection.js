import { useState, useEffect } from 'react';

export default function SecuritySection({ onPasswordChange, onDeleteAccount, deletingAccount, supabase }) {
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [strength, setStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [factors, setFactors] = useState([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const fetchFactors = async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (!error) setFactors(data.all || []);
    };
    fetchFactors();
  }, [supabase]);

  const is2FAEnabled = factors.some(f => f.status === 'verified');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const calculateStrength = (pass) => {
    let s = 0;
    if (!pass) { setStrength(0); return; }
    if (pass.length > 6) s += 20;
    if (pass.length > 10) s += 20;
    if (/[A-Z]/.test(pass)) s += 20;
    if (/[0-9]/.test(pass)) s += 20;
    if (/[^A-Za-z0-9]/.test(pass)) s += 20;
    setStrength(Math.min(s, 100));
  };

  const handleChange = (field, val) => {
    const newData = { ...passData, [field]: val };
    setPassData(newData);
    if (field === 'new') calculateStrength(val);
  };

  const handleSave = () => {
    if (!passData.current || !passData.new || !passData.confirm) return;
    if (passData.new !== passData.confirm) {
      // In a real app, use a toast here. Parent handles success/failure.
      alert("Passwords do not match!"); 
      return;
    }
    onPasswordChange(passData.current, passData.new);
    setPassData({ current: '', new: '', confirm: '' });
    setStrength(0);
  };

  const getStrengthColor = () => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (strength === 0) return '';
    if (strength < 40) return 'Weak';
    if (strength < 80) return 'Medium';
    return 'Strong';
  };

  const handleToggle2FA = async () => {
    if (is2FAEnabled) {
      if (!confirm('Disable 2FA? This lowers your security.')) return;
      const verifiedFactors = factors.filter(f => f.status === 'verified');
      for (const f of verifiedFactors) await supabase.auth.mfa.unenroll({ factorId: f.id });
      const { data } = await supabase.auth.mfa.listFactors();
      setFactors(data.all || []);
    } else if (isEnrolling) {
      setIsEnrolling(false);
      setQrCode('');
      setFactorId('');
    } else {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) return alert(error.message);
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setIsEnrolling(true);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length < 6) return;
    setIsVerifying(true);
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: verificationCode
    });
    setIsVerifying(false);
    if (error) {
      alert(error.message);
    } else {
      alert('2FA Enabled Successfully!');
      setIsEnrolling(false);
      setQrCode('');
      setVerificationCode('');
      const { data: list } = await supabase.auth.mfa.listFactors();
      setFactors(list.all || []);
    }
  };

  const canConfirmDelete = deleteText.trim().toUpperCase() === 'DELETE';

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 mb-8 shadow-2xl relative overflow-hidden group/card">
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-orange-600/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            Security & Privacy
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Password Change */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={passData.current}
                  onChange={e => handleChange('current', e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={passData.new}
                  onChange={e => handleChange('new', e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium"
                  placeholder="Enter new password"
                />
                {/* Strength Meter */}
                <div className="mt-3 h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ease-out ${getStrengthColor()}`} 
                    style={{ width: `${strength}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">Password Strength</span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${strength < 40 ? 'text-red-400' : strength < 80 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {getStrengthLabel()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm Password</label>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={passData.confirm}
                  onChange={e => handleChange('confirm', e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${showPassword ? 'bg-red-500 border-red-500' : 'border-gray-600 bg-transparent group-hover:border-red-400'}`}>
                  {showPassword && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="hidden" />
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Show Passwords</span>
              </label>
              
              <button 
                onClick={handleSave}
                disabled={!passData.current || !passData.new || !passData.confirm}
                className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-white/20 hover:-translate-y-0.5"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Additional Security Settings */}
          <div className="space-y-6">
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    Two-Factor Authentication
                    <div className="group relative">
                      <svg className="w-4 h-4 text-gray-500 cursor-help hover:text-gray-300 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 border border-white/10 rounded-xl shadow-xl text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 backdrop-blur-xl">
                        Add an extra layer of security to your account by requiring a code from an authenticator app when signing in.
                      </div>
                    </div>
                  </h4>
                  <p className="text-sm text-gray-400 max-w-[280px] leading-relaxed">
                    Secure your account with 2FA using Google Authenticator or similar apps.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={is2FAEnabled || isEnrolling}
                    onChange={handleToggle2FA}
                  />
                  <div className="w-12 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 transition-colors duration-300"></div>
                </label>
              </div>
              
              {isEnrolling && (
                <div className="mt-6 p-5 bg-black/40 rounded-xl border border-white/10 animate-in slide-in-from-top-2 duration-300">
                  <h5 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs">1</span>
                    Setup Instructions
                  </h5>
                  <div className="flex gap-5">
                    <div className="w-24 h-24 bg-white p-2 rounded-lg flex-shrink-0 shadow-lg overflow-hidden">
                      <div className="w-full h-full bg-white flex items-center justify-center relative">
                         {qrCode && <img src={qrCode} alt="QR Code" className="w-full h-full object-contain" />}
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <ol className="list-decimal list-inside text-xs text-gray-400 space-y-2">
                        <li>Install <strong>Google Authenticator</strong></li>
                        <li>Scan the QR code</li>
                        <li>Enter the 6-digit code below</li>
                      </ol>
                      <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="000 000" 
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            maxLength={6}
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-center tracking-[0.2em] text-sm focus:border-green-500 outline-none font-mono" 
                        />
                        <button 
                            onClick={handleVerify2FA}
                            disabled={isVerifying || !verificationCode}
                            className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-500 transition shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isVerifying ? '...' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Backup codes removed as Supabase doesn't provide them by default yet */}
                </div>
              )}
              
              {is2FAEnabled && !isEnrolling && (
                 <div className="mt-4 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                       <p className="text-sm font-bold text-green-400">2FA is Active</p>
                       <p className="text-xs text-green-500/70">Your account is protected with two-factor authentication.</p>
                    </div>
                 </div>
              )}
            </div>

            <div className="bg-black/20 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors">
               <div className="flex items-center justify-between mb-4">
                 <h4 className="text-base font-bold text-white">Privacy Settings</h4>
               </div>
               <div className="space-y-4">
                 {[
                   { label: 'Share watch activity', desc: 'Allow friends to see what you watch', checked: true },
                   { label: 'Allow personalized ads', desc: 'Get relevant offers based on activity', checked: false },
                   { label: 'Public profile', desc: 'Let others find you by username', checked: true }
                 ].map((item, idx) => (
                   <label key={idx} className="flex items-center justify-between cursor-pointer group p-2 hover:bg-white/5 rounded-lg transition-colors -mx-2">
                     <div>
                       <span className="block text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
                       <span className="text-xs text-gray-500">{item.desc}</span>
                     </div>
                     <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                     </div>
                   </label>
                 ))}
               </div>
            </div>

            <div className="bg-black/20 rounded-2xl p-6 border border-red-500/20 hover:border-red-500/30 transition-colors">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h4 className="text-base font-bold text-white mb-2">Delete Account</h4>
                  <p className="text-sm text-gray-400 max-w-[320px] leading-relaxed">
                    Permanently delete your account and associated data. This action cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError('');
                    setDeleteText('');
                    setDeleteOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all font-bold text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setDeleteOpen(false)}>
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">Confirm account deletion</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Type <span className="font-bold text-white">DELETE</span> to confirm. This cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="rounded-xl p-2 text-gray-400 hover:text-white hover:bg-white/5 transition"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="mt-5">
              <input
                type="text"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium"
                placeholder="Type DELETE"
                autoComplete="off"
              />
              {deleteError && (
                <div className="mt-3 p-3 rounded-xl text-sm bg-red-500/10 text-red-300 border border-red-500/20">
                  {deleteError}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                disabled={deletingAccount}
                className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-200 hover:bg-white/10 border border-white/10 transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canConfirmDelete || deletingAccount}
                onClick={async () => {
                  setDeleteError('');
                  try {
                    await onDeleteAccount?.();
                    setDeleteOpen(false);
                  } catch (e) {
                    setDeleteError(e?.message || 'Delete failed');
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-500 transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingAccount ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
