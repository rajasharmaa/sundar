import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '@/i18n';

type TextScale = 'normal' | 'large' | 'extra-large';
type Language = 'hi' | 'en';

interface AccessibilityContextType {
  liteMode: boolean;
  highContrast: boolean;
  textScale: TextScale;
  language: Language;
  pwaInstallable: boolean;
  toggleLiteMode: () => void;
  toggleHighContrast: () => void;
  setTextScale: (scale: TextScale) => void;
  setLanguage: (lang: Language) => void;
  triggerPwaInstall: () => Promise<void>;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liteMode, setLiteMode] = useState<boolean>(() => {
    return localStorage.getItem('accessibility_lite_mode') === 'true';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('accessibility_high_contrast') === 'true';
  });

  const [textScale, setInternalTextScale] = useState<TextScale>(() => {
    return (localStorage.getItem('accessibility_text_scale') as TextScale) || 'normal';
  });

  const [language, setInternalLanguage] = useState<Language>(() => {
    return (localStorage.getItem('i18nextLng') as Language) || 'en';
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pwaInstallable, setPwaInstallable] = useState<boolean>(false);

  // Monitor PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setPwaInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Update HTML classes based on accessibility configuration
  useEffect(() => {
    const root = window.document.documentElement;

    // Apply High Contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply Lite Mode (disable complex animations)
    if (liteMode) {
      root.classList.add('lite-mode');
    } else {
      root.classList.remove('lite-mode');
    }

    // Apply Text Scale
    root.classList.remove('text-scale-normal', 'text-scale-large', 'text-scale-extra-large');
    root.classList.add(`text-scale-${textScale}`);
  }, [highContrast, liteMode, textScale]);

  const toggleLiteMode = () => {
    setLiteMode(prev => {
      const next = !prev;
      localStorage.setItem('accessibility_lite_mode', String(next));
      return next;
    });
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => {
      const next = !prev;
      localStorage.setItem('accessibility_high_contrast', String(next));
      return next;
    });
  };

  const setTextScale = (scale: TextScale) => {
    setInternalTextScale(scale);
    localStorage.setItem('accessibility_text_scale', scale);
  };

  const setLanguage = (lang: Language) => {
    setInternalLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  const triggerPwaInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA installation outcome: ${outcome}`);
    setDeferredPrompt(null);
    setPwaInstallable(false);
  };

  return (
    <AccessibilityContext.Provider
      value={{
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
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
