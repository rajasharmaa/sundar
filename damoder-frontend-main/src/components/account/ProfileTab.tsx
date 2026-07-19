import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircle, Mail, Phone, Building, Laptop, Calendar, 
  UserCheck, Shield, Globe, Edit3, X, Check, Save 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api/api-client';
import logger from '@/lib/logger';
import { useTranslation } from 'react-i18next';

interface ProfileTabProps {
  user: any;
  checkAuth: (force?: boolean) => Promise<any>;
  isHindi: boolean;
  activeTheme: {
    primary: string;
    text: string;
    shadow: string;
  };
  getAvatarGradientClass: (key: string) => string;
}

const ProfileTab = ({
  user,
  checkAuth,
  isHindi,
  activeTheme,
  getAvatarGradientClass
}: ProfileTabProps) => {
  const { toast } = useToast();
  const { i18n } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [avatarColor, setAvatarColor] = useState('ocean');
  const [themeColor, setThemeColor] = useState('blue');
  const [saveLoading, setSaveLoading] = useState(false);

  // Sync state values when user details are loaded/changed
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setBusinessName(user.businessName || '');
      setBusinessType(user.businessType || 'wholesaler');
      setAvatarColor(user.avatarColor || 'ocean');
      setThemeColor(user.themeColor || 'blue');
    }
  }, [user]);

  // Cancel Button Data Restore Fix (Issue 10)
  const handleCancel = () => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setBusinessName(user.businessName || '');
      setBusinessType(user.businessType || 'wholesaler');
      setAvatarColor(user.avatarColor || 'ocean');
      setThemeColor(user.themeColor || 'blue');
    }
    setIsEditing(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: isHindi ? 'नाम आवश्यक है' : 'Name is required',
        description: isHindi ? 'कृपया एक वैध नाम दर्ज करें।' : 'Please enter a valid full name.',
        variant: 'destructive',
      });
      return;
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone.trim())) {
      toast({
        title: isHindi ? 'अमान्य फोन नंबर' : 'Invalid Phone Number',
        description: isHindi ? 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit Indian phone number.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaveLoading(true);
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        avatarColor,
        businessName: businessName.trim(),
        businessType,
        themeColor
      };
      
      const response = await api.user.updateProfile(payload);
      
      if (response && response.success) {
        // Refresh local session and update AuthContext
        await checkAuth(true);
        setIsEditing(false);
        toast({
          title: isHindi ? 'प्रोफ़ाइल अपडेट की गई' : 'Profile Updated',
          description: isHindi ? 'आपकी प्रोफ़ाइल और अनुकूलन विवरण सफलतापूर्वक सहेज लिए गए हैं!' : 'Your profile details and customizations have been saved successfully!',
        });
      }
    } catch (error: any) {
      logger.error('Save profile details error', error);
      toast({
        title: isHindi ? 'सहेजने में विफल' : 'Failed to Save',
        description: error.message || (isHindi ? 'विवरण सहेजने में कोई त्रुटि हुई।' : 'An error occurred while saving details.'),
        variant: 'destructive',
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // Accent selector mapping elements
  const accentOptions = [
    { key: 'blue', label: 'Ocean Blue', color: 'bg-blue-600' },
    { key: 'emerald', label: 'Teal Green', color: 'bg-emerald-600' },
    { key: 'indigo', label: 'Indigo Tech', color: 'bg-indigo-600' },
    { key: 'rose', label: 'Rose Pink', color: 'bg-rose-600' },
    { key: 'amber', label: 'Sunset Amber', color: 'bg-amber-500' }
  ];

  // Gradients selector mapping elements
  const gradientOptions = [
    { key: 'ocean', label: 'Ocean Breeze', css: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
    { key: 'sunset', label: 'Sunset Glow', css: 'bg-gradient-to-br from-orange-500 to-rose-500' },
    { key: 'emerald', label: 'Emerald Wave', css: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
    { key: 'cosmic', label: 'Cosmic Indigo', css: 'bg-gradient-to-br from-indigo-600 to-purple-600' },
    { key: 'charcoal', label: 'Charcoal Premium', css: 'bg-gradient-to-br from-slate-700 to-slate-900' }
  ];

  // Business type selector mapping elements
  const businessTypes = [
    { key: 'wholesaler', label: isHindi ? 'थोक व्यापारी' : 'Wholesaler / Bulk Buyer' },
    { key: 'retail', label: isHindi ? 'खुदरा विक्रेता' : 'Retailer / Store Owner' },
    { key: 'manufacturer', label: isHindi ? 'निर्माता / उद्योग' : 'Manufacturer / Industrial User' },
    { key: 'contractor', label: isHindi ? 'ठेकेदार / इंजीनियर' : 'Contractor / Engineer' },
    { key: 'other', label: isHindi ? 'अन्य श्रेणी' : 'Other' }
  ];

  // Animation Variant Helpers
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const scaleItem = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
  };

  // Safe avatar name rendering fallback
  const avatarName = name || user.name || '';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isHindi ? 'व्यक्तिगत और व्यावसायिक जानकारी' : 'Account Customization & Settings'}
          </h2>
          <p className="text-slate-500 mt-1">
            {isHindi ? 'अपनी व्यक्तिगत सेटिंग्स, रंग और व्यावसायिक विवरण कस्टमाइज़ करें' : 'Personalize your preferences, colors, and organization details'}
          </p>
        </div>
        {!isEditing && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditing(true)} 
            className={`px-4.5 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${activeTheme.primary} shadow-md ${activeTheme.shadow}`}
          >
            <Edit3 className="w-4 h-4" />
            {isHindi ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile'}
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left/Top Column: Dynamic Avatar Preview & Design Settings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Dynamic Avatar Preview Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200/20 rounded-full blur-xl pointer-events-none" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              {isHindi ? 'अवतार पूर्वावलोकन' : 'Live Avatar Preview'}
            </h3>
            
            <div className="flex flex-col items-center">
              <motion.div 
                key={avatarColor}
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${getAvatarGradientClass(avatarColor)} p-[3px] shadow-xl relative mb-4`}
              >
                <div className="w-full h-full rounded-3xl bg-slate-900/90 flex items-center justify-center text-4xl font-black text-white border border-white/5">
                  {avatarName.charAt(0).toUpperCase() || 'U'}
                </div>
              </motion.div>
              <h4 className="font-extrabold text-slate-900 text-lg flex items-center gap-1.5">
                {avatarName || (isHindi ? 'अनाम उपयोगकर्ता' : 'Your Name')}
              </h4>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {user.email}
              </p>
              
              {/* Business Tag Badge if present */}
              {(businessName || businessType) && (
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {businessName && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700 flex items-center gap-1">
                      <Building className="w-2.5 h-2.5" />
                      {businessName}
                    </span>
                  )}
                  {businessType && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                      {businessTypes.find(b => b.key === businessType)?.label || businessType}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Avatar Customizer Grid (Visible only in edit mode) */}
          <AnimatePresence>
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white border border-slate-100 rounded-2xl p-5 space-y-5"
              >
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                    {isHindi ? 'अवतार रंग चुनें' : 'Choose Avatar Gradient'}
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {gradientOptions.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setAvatarColor(opt.key)}
                        className={`h-10 rounded-xl ${opt.css} flex items-center justify-center transition-all duration-300 relative ${
                          avatarColor === opt.key ? 'ring-4 ring-offset-2 ring-blue-500 scale-105' : 'hover:scale-105'
                        }`}
                        title={opt.label}
                        type="button"
                        aria-label={opt.label} // Issue 11
                      >
                        {avatarColor === opt.key && (
                          <Check className="w-5 h-5 text-white drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                    {isHindi ? 'डैशबोर्ड एक्सेंट थीम' : 'Dashboard Accent Theme'}
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {accentOptions.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setThemeColor(opt.key)}
                        className={`h-10 rounded-xl ${opt.color} flex items-center justify-center transition-all duration-300 ${
                          themeColor === opt.key ? 'ring-4 ring-offset-2 ring-slate-900 scale-105' : 'hover:scale-105'
                        }`}
                        title={opt.label}
                        type="button"
                        aria-label={opt.label} // Issue 11
                      >
                        {themeColor === opt.key && (
                          <Check className="w-5 h-5 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right/Bottom Column: Settings Form */}
        <div className="lg:col-span-8">
          {!isEditing ? (
            /* Read-only Profile Information View */
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <motion.div variants={scaleItem} className="p-4 sm:p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all duration-300">
                <div className="flex items-center gap-2.5 mb-2">
                  <UserCircle className="w-5 h-5 text-slate-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isHindi ? 'पूरा नाम' : 'Full Name'}</span>
                </div>
                <p className="font-extrabold text-slate-900 ml-0 sm:ml-8 text-base sm:text-lg break-words">{user.name}</p>
              </motion.div>
              
              <motion.div variants={scaleItem} className="p-4 sm:p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all duration-300">
                <div className="flex items-center gap-2.5 mb-2">
                  <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isHindi ? 'ईमेल पता' : 'Email Address'}</span>
                </div>
                <p className="font-extrabold text-slate-900 ml-0 sm:ml-8 text-base sm:text-lg break-all">{user.email}</p>
              </motion.div>

              <motion.div variants={scaleItem} className="p-4 sm:p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all duration-300">
                <div className="flex items-center gap-2.5 mb-2">
                  <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isHindi ? 'संपर्क नंबर' : 'Contact Number'}</span>
                </div>
                <p className="font-extrabold text-slate-900 ml-0 sm:ml-8 text-base sm:text-lg break-words">{user.phone || (isHindi ? 'प्रदान नहीं किया गया' : 'Not provided')}</p>
              </motion.div>

              <motion.div variants={scaleItem} className="p-4 sm:p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all duration-300">
                <div className="flex items-center gap-2.5 mb-2">
                  <Building className="w-5 h-5 text-slate-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isHindi ? 'कंपनी / संगठन' : 'Company / Organization'}</span>
                </div>
                <p className="font-extrabold text-slate-900 ml-0 sm:ml-8 text-base sm:text-lg break-words">{user.businessName || (isHindi ? 'व्यक्तिगत / रिटेल' : 'Personal / Retail Client')}</p>
              </motion.div>

              <motion.div variants={scaleItem} className="p-4 sm:p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all duration-300">
                <div className="flex items-center gap-2.5 mb-2">
                  <Laptop className="w-5 h-5 text-slate-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isHindi ? 'व्यापारिक श्रेणी' : 'Business Category'}</span>
                </div>
                <p className="font-extrabold text-slate-900 ml-0 sm:ml-8 text-base sm:text-lg break-words">
                  {businessTypes.find(t => t.key === user.businessType)?.label || (isHindi ? 'थोक व्यापारी' : 'Wholesaler / Bulk Buyer')}
                </p>
              </motion.div>

              <motion.div variants={scaleItem} className="p-4 sm:p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all duration-300">
                <div className="flex items-center gap-2.5 mb-2">
                  <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isHindi ? 'सदस्यता तिथि' : 'Member Since'}</span>
                </div>
                <p className="font-extrabold text-slate-900 ml-0 sm:ml-8 text-base sm:text-lg break-words">
                  {new Date(user.createdAt || Date.now()).toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </motion.div>
            </motion.div>
          ) : (
            /* Profile Settings Editing Form Layout */
            <motion.form 
              onSubmit={handleSaveProfile}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 md:p-8 space-y-6 shadow-sm"
            >
              <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
                <UserCheck className={`w-5 h-5 ${activeTheme.text}`} />
                {isHindi ? 'व्यक्तिगत और व्यवसाय सेटिंग्स विवरण' : 'Edit Account Details'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    {isHindi ? 'पूरा नाम' : 'Full Name'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold text-slate-800 transition-all"
                    placeholder={isHindi ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                    required
                    minLength={2}
                    maxLength={50}
                  />
                </div>

                {/* Phone Input with sanitization (Issue 7) */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    {isHindi ? 'भारतीय मोबाइल नंबर (10 अंक)' : 'Phone Number (10 digits)'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} // Issue 7
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold text-slate-800 transition-all"
                    placeholder={isHindi ? 'उदा: 9876543210' : 'e.g. 9876543210'}
                    maxLength={10}
                  />
                </div>

                {/* Email Input (Disabled) */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-505 flex items-center gap-1.5">
                    {isHindi ? 'ईमेल पता (संशोधित नहीं किया जा सकता)' : 'Email Address (Locked)'}
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 font-semibold cursor-not-allowed"
                  />
                </div>

                {/* Company Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    {isHindi ? 'कंपनी / व्यवसाय का नाम' : 'Company Name'}
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold text-slate-800 transition-all"
                    placeholder={isHindi ? 'कंपनी का नाम दर्ज करें' : 'Enter company / firm name'}
                    maxLength={100}
                  />
                </div>

                {/* Business Type Selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    {isHindi ? 'व्यवसाय का प्रकार' : 'Type of Business'}
                  </label>
                  <select
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold text-slate-800 bg-white transition-all"
                  >
                    {businessTypes.map(opt => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preferred Language Select */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-slate-400" />
                    {isHindi ? 'पसंदीदा भाषा' : 'Interface Language'}
                  </label>
                  <select
                    value={i18n.language}
                    onChange={e => {
                      i18n.changeLanguage(e.target.value);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold text-slate-800 bg-white transition-all"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                  </select>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel} // Issue 10
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-1.5 shadow-md ${
                    saveLoading 
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                      : `${activeTheme.primary} ${activeTheme.shadow}`
                  }`}
                >
                  {saveLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                      {isHindi ? 'सहेज रहा है...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isHindi ? 'बदलाव सहेजें' : 'Save Changes'}
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
