import React, { useState, useRef, useEffect } from 'react';
import { Settings, Languages, Eye, Zap, Type, Download, X } from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface AccessibilityPanelProps {
  highContrast: boolean;
  t: any;
  setIsOpen?: (open: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
  liteMode: boolean;
  toggleLiteMode: () => void;
  toggleHighContrast: () => void;
  textScale: 'normal' | 'large' | 'extra-large';
  setTextScale: (scale: 'normal' | 'large' | 'extra-large') => void;
  pwaInstallable: boolean;
  triggerPwaInstall: () => void;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  highContrast,
  t,
  setIsOpen,
  language,
  setLanguage,
  liteMode,
  toggleLiteMode,
  toggleHighContrast,
  textScale,
  setTextScale,
  pwaInstallable,
  triggerPwaInstall,
}) => (
  <>
    {/* Header */}
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
        <Settings className="w-5 h-5 text-green-600 animate-spin-slow" />
        {t('accessibility.title')}
      </h3>
      {setIsOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close accessibility options"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>

    <div className="space-y-5">
      {/* Language Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
          {t('accessibility.language')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold border transition-all ${
              language === 'en'
                ? 'bg-green-600 border-green-600 text-white shadow-md'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
            } ${highContrast && language === 'en' ? 'bg-black text-white border-black' : ''}`}
          >
            <span>🇬🇧</span> English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold border transition-all ${
              language === 'hi'
                ? 'bg-green-600 border-green-600 text-white shadow-md'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
            } ${highContrast && language === 'hi' ? 'bg-black text-white border-black' : ''}`}
          >
            <span>🇮🇳</span> हिंदी
          </button>
        </div>
      </div>

      {/* Lite Mode Switch */}
      <div className="flex items-center justify-between gap-4 p-3 bg-gray-50/50 border border-gray-100 rounded-2xl">
        <div className="flex-1">
          <div className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            {t('accessibility.liteMode')}
          </div>
          <div className="text-[10px] text-gray-500 font-medium">
            {t('accessibility.liteModeDesc')}
          </div>
        </div>
        <button
          onClick={toggleLiteMode}
          className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
            liteMode ? 'bg-green-500' : 'bg-gray-300'
          }`}
          aria-checked={liteMode}
          role="switch"
        >
          <motion.div
            className="bg-white w-6 h-6 rounded-full shadow-md"
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            animate={{ x: liteMode ? 24 : 0 }}
          />
        </button>
      </div>

      {/* High Contrast Switch */}
      <div className="flex items-center justify-between gap-4 p-3 bg-gray-50/50 border border-gray-100 rounded-2xl">
        <div className="flex-1">
          <div className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-green-500" />
            {t('accessibility.highContrast')}
          </div>
          <div className="text-[10px] text-gray-500 font-medium">
            {t('accessibility.highContrastDesc')}
          </div>
        </div>
        <button
          onClick={toggleHighContrast}
          className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
            highContrast ? 'bg-green-500' : 'bg-gray-300'
          }`}
          aria-checked={highContrast}
          role="switch"
        >
          <motion.div
            className="bg-white w-6 h-6 rounded-full shadow-md"
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            animate={{ x: highContrast ? 24 : 0 }}
          />
        </button>
      </div>

      {/* Text Scaling Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
          <Type className="w-4 h-4 text-gray-400" />
          {t('accessibility.textSize')}
        </label>
        <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl">
          {(['normal', 'large', 'extra-large'] as const).map(scale => (
            <button
              key={scale}
              onClick={() => setTextScale(scale)}
              className={`py-2 px-1 text-xs font-bold rounded-lg transition-all ${
                textScale === scale
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {scale === 'normal' && t('accessibility.textNormal')}
              {scale === 'large' && t('accessibility.textLarge')}
              {scale === 'extra-large' && t('accessibility.textExtraLarge')}
            </button>
          ))}
        </div>
      </div>

      {/* PWA Installer Button */}
      {pwaInstallable && (
        <button
          onClick={triggerPwaInstall}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold bg-gradient-to-r from-green-600 -green- hover:from-green-700 hover:-green- text-white shadow-lg hover:shadow-xl transition-all ${
            highContrast ? 'bg-black text-white border-2 border-black' : ''
          }`}
        >
          <Download className="w-5 h-5" />
          <div className="text-left flex-1">
            <div className="text-sm font-extrabold">{t('accessibility.installApp')}</div>
            <div className="text-[9px] text-green-100 font-medium">
              {t('accessibility.installAppDesc')}
            </div>
          </div>
        </button>
      )}
    </div>
  </>
);

interface AccessibilityWidgetProps {
  isDropdown?: boolean;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  align?: 'left' | 'right';
}

const AccessibilityWidget: React.FC<AccessibilityWidgetProps> = ({
  isDropdown = false,
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen,
  align = 'right'
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isDropdown ? !!externalIsOpen : internalIsOpen;
  const setIsOpen = isDropdown ? externalSetIsOpen : setInternalIsOpen;

  const widgetRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  
  const {
    liteMode,
    highContrast,
    textScale,
    language,
    pwaInstallable,
    toggleLiteMode,
    toggleHighContrast,
    setTextScale,
    setLanguage,
    triggerPwaInstall,
  } = useAccessibility();

  // Close when clicking outside (only active for floating mode)
  useEffect(() => {
    if (isDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isDropdown, setIsOpen]);

  const panelProps = {
    highContrast,
    t,
    setIsOpen,
    language,
    setLanguage,
    liteMode,
    toggleLiteMode,
    toggleHighContrast,
    textScale,
    setTextScale,
    pwaInstallable,
    triggerPwaInstall,
  };

  if (isDropdown) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`
              fixed top-20 left-4 right-4 w-auto
              sm:absolute sm:top-full sm:mt-3 sm:left-auto sm:right-auto sm:w-80
              ${align === 'left' ? 'sm:left-0' : 'sm:right-0'}
              bg-white/95 backdrop-blur-xl border border-green-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl transition-all duration-300 z-[150]
              ${highContrast ? 'border-2 border-black bg-white text-black' : ''}
            `}
          >
            <AccessibilityPanel {...panelProps} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div ref={widgetRef} className="fixed bottom-28 lg:bottom-6 left-6 z-[999] flex flex-col items-start">
      {/* Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`mb-4 w-[280px] sm:w-80 bg-white/95 backdrop-blur-xl border border-green-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl origin-bottom-left ${
              highContrast ? 'border-2 border-black bg-white text-black' : ''
            }`}
          >
            <AccessibilityPanel {...panelProps} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full bg-gradient-to-br from-green-600 -green- hover:from-green-700 hover:-green- text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 relative group ${
          highContrast ? 'bg-black border-2 border-white' : ''
        }`}
        aria-label="Accessibility settings"
        aria-expanded={isOpen}
      >
        <Languages className="w-7 h-7 drop-shadow-md group-hover:rotate-12 transition-transform duration-300" />
        
        {/* Tooltip */}
        <div className="absolute left-full ml-4 px-3 py-1.5 bg-white text-gray-800 text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-green-50">
          Accessibility Options ♿
        </div>
      </button>
    </div>
  );
};

export default AccessibilityWidget;
