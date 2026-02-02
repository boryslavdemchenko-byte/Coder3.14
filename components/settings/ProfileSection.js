import { useRef } from 'react';

export default function ProfileSection({ formData, onChange }) {
  const fileInputRef = useRef(null);

  const handleAvatarUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange('avatarImage', e.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 mb-8 shadow-2xl relative overflow-hidden group/card">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          Profile Information
        </h2>
      
        {/* Avatar */}
        <div className="mb-10 flex flex-col md:flex-row gap-10 items-start">
          <div className="relative group shrink-0">
             <div className={`w-36 h-36 rounded-full overflow-hidden border-4 shadow-2xl transition-all duration-300 group-hover:scale-105 ${formData.avatarColor === 'blue' ? 'border-blue-500 shadow-blue-500/20' : 'border-gray-700'}`}>
               {formData.avatarImage ? (
                 <img src={formData.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <div className={`w-full h-full flex items-center justify-center text-5xl font-bold text-white transition-colors duration-300
                   ${formData.avatarColor==='blue'?'bg-gradient-to-br from-blue-500 to-blue-700':
                     formData.avatarColor==='purple'?'bg-gradient-to-br from-purple-500 to-purple-700':
                     formData.avatarColor==='green'?'bg-gradient-to-br from-green-500 to-green-700':
                     formData.avatarColor==='orange'?'bg-gradient-to-br from-orange-500 to-orange-700':
                     formData.avatarColor==='red'?'bg-gradient-to-br from-red-500 to-red-700':'bg-gradient-to-br from-gray-600 to-gray-800'}
                 `}>
                   {formData.username?.[0]?.toUpperCase() || 'U'}
                 </div>
               )}
             </div>
             
             <div className="absolute -bottom-2 -right-2 flex gap-2">
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="bg-gray-900 p-2.5 rounded-full border border-gray-700 hover:bg-blue-600 hover:border-blue-500 hover:text-white text-gray-400 transition-all shadow-lg hover:scale-110"
                 title="Upload Image"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               </button>
               {formData.avatarImage && (
                 <button 
                   onClick={() => onChange('avatarImage', null)}
                   className="bg-gray-900 p-2.5 rounded-full border border-gray-700 hover:bg-red-600 hover:border-red-500 hover:text-white text-gray-400 transition-all shadow-lg hover:scale-110"
                   title="Remove Image"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
               )}
             </div>
             
             <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleAvatarUpload(e.target.files?.[0])} />
          </div>
          
          <div className="flex-1 space-y-6 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">Avatar Theme</label>
              <div className="flex flex-wrap gap-4">
                {['blue','purple','green','orange','red','gray'].map(c => (
                  <button
                    key={c}
                    onClick={() => onChange('avatarColor', c)}
                    className={`w-12 h-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] focus:ring-white relative
                      ${formData.avatarColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a] scale-110 shadow-lg' : 'opacity-60 hover:opacity-100 hover:scale-105'} 
                      ${c==='blue'?'bg-gradient-to-br from-blue-500 to-blue-600':c==='purple'?'bg-gradient-to-br from-purple-500 to-purple-600':c==='green'?'bg-gradient-to-br from-green-500 to-green-600':c==='orange'?'bg-gradient-to-br from-orange-500 to-orange-600':c==='red'?'bg-gradient-to-br from-red-500 to-red-600':'bg-gradient-to-br from-gray-500 to-gray-600'}
                    `}
                    aria-label={`Set avatar background to ${c}`}
                    title={c.charAt(0).toUpperCase() + c.slice(1)}
                  >
                    {formData.avatarColor === c && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
              Personalize your profile with a custom avatar or choose a theme color that matches your style. This will be visible across the platform.
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="col-span-1 md:col-span-2 group">
            <label className="block text-sm font-medium text-gray-400 mb-2 transition-colors group-hover:text-blue-400">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={formData.email || ''} 
                disabled 
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-gray-500 cursor-not-allowed font-medium" 
              />
              <div className="absolute left-4 top-3.5 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div className="absolute right-4 top-3.5 text-gray-700">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              To change your email, please contact support.
            </p>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-blue-400">Username</label>
            <div className="relative">
              <input 
                type="text" 
                value={formData.username || ''} 
                onChange={e => onChange('username', e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-blue-900/10 outline-none transition-all font-medium"
                placeholder="Enter your username"
              />
              <div className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
