import Layout from '../components/Layout'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Toast from '../components/Toast'
import ProfileSection from '../components/settings/ProfileSection'
import RegionSection from '../components/settings/RegionSection'
import SecuritySection from '../components/settings/SecuritySection'

export default function Settings() {
  const user = useUser()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [toastMsg, setToastMsg] = useState(null)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    avatarColor: 'blue',
    avatarImage: null,
    region: 'US'
  })

  // Load Data
  useEffect(() => {
    if(!user) return
    
    // Load from Local Storage & User Metadata
    const lsRegion = localStorage.getItem('flico_region')
    const lsColor = localStorage.getItem('flico_avatar_color')
    const lsImage = localStorage.getItem('flico_avatar_image')
    
    setFormData({
      username: user.user_metadata?.username || '',
      phone: user.user_metadata?.phone || '',
      email: user.email || '',
      avatarColor: lsColor || 'blue',
      avatarImage: lsImage || null,
      region: lsRegion || 'US'
    })
  }, [user])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const handleBulkSave = async () => {
    setSaving(true)
    try {
      // 1. Local Storage Updates
      if (typeof window !== 'undefined') {
        localStorage.setItem('flico_region', formData.region)
        localStorage.setItem('flico_avatar_color', formData.avatarColor)
        if (formData.avatarImage) localStorage.setItem('flico_avatar_image', formData.avatarImage)
        else localStorage.removeItem('flico_avatar_image')
        
        // 2. Dispatch Events for immediate UI update
        window.dispatchEvent(new CustomEvent('flico-avatar-color', { detail: formData.avatarColor }))
        if (formData.avatarImage) window.dispatchEvent(new CustomEvent('flico-avatar-image', { detail: formData.avatarImage }))
        window.dispatchEvent(new CustomEvent('flico-region-change', { detail: formData.region }))
      }

      // 3. Supabase Update
      const { error } = await supabase.auth.updateUser({
        data: {
          username: formData.username,
          phone: formData.phone,
          preferences: { genres: formData.genres, platforms: formData.platforms, services: formData.platforms },
          avatarImage: formData.avatarImage ? 'set' : null
        }
      })
      
      if (error) throw error
      
      setToastMsg('Settings saved successfully')
      setIsDirty(false)
      
      // Refresh router to ensure any server-side props or context updates
      // router.replace(router.asPath) 
    } catch (e) {
      console.error(e)
      setToastMsg('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (current, newPass) => {
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass })
      if (error) throw error
      setToastMsg('Password updated successfully')
    } catch (e) {
      console.error(e)
      setToastMsg('Error updating password')
    } finally {
      setSaving(false)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <Layout title="Account Settings - Flico">
      <div className="min-h-screen bg-[#121212] relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">Settings</h1>
              <p className="text-gray-400">Manage your account preferences, security, and personalization.</p>
            </div>
            <button 
              onClick={logout} 
              className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all font-medium flex items-center gap-2 group"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sign Out
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 pb-24">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-72 flex-shrink-0">
              <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide sticky top-24">
                {[
                  { id: 'profile', label: 'Profile & Region', description: 'Manage your identity', icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  )},
                  { id: 'security', label: 'Security', description: 'Password & 2FA', icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  )}
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-left relative overflow-hidden group min-w-[200px] lg:min-w-0
                      ${activeTab === tab.id 
                        ? 'bg-gradient-to-r from-blue-600/20 to-blue-600/5 text-white border border-blue-500/30 shadow-lg shadow-blue-900/10' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }
                    `}
                  >
                    {activeTab === tab.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl" />
                    )}
                    <div className={`p-2 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-white/5 group-hover:bg-white/10'}`}>
                      {tab.icon}
                    </div>
                    <div>
                      <span className="block font-bold text-sm md:text-base">{tab.label}</span>
                      <span className={`text-xs block mt-0.5 transition-colors ${activeTab === tab.id ? 'text-blue-200' : 'text-gray-500 group-hover:text-gray-400'}`}>{tab.description}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <ProfileSection formData={formData} onChange={handleChange} />
                    <RegionSection region={formData.region} onChange={handleChange} />
                  </div>
                )}
                
                {activeTab === 'security' && (
                  <SecuritySection onPasswordChange={handlePasswordChange} />
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Floating Save Bar */}
        <div className={`fixed bottom-0 left-0 right-0 p-4 bg-[#1a1a1a]/90 border-t border-white/10 backdrop-blur-md flex justify-between items-center transition-transform duration-300 z-50 ${isDirty ? 'translate-y-0' : 'translate-y-full'}`}>
           <div className="max-w-4xl mx-auto w-full flex justify-between items-center px-4">
             <span className="text-white font-medium flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"/>
               You have unsaved changes
             </span>
             <div className="flex gap-3">
               <button 
                 onClick={() => router.reload()} 
                 className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition text-sm"
                 disabled={saving}
               >
                 Discard
               </button>
               <button 
                 onClick={handleBulkSave} 
                 disabled={saving} 
                 className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
               >
                 {saving ? (
                   <>
                     <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Saving...
                   </>
                 ) : (
                   'Save Changes'
                 )}
               </button>
             </div>
           </div>
        </div>

        {toastMsg && (
          <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
        )}
      </div>
    </Layout>
  )
}
