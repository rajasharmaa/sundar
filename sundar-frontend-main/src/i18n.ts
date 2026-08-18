import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Define resources for translation
const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "products": "Products",
        "about": "About Us",
        "contact": "Contact",
        "account": "My Account",
        "allCategories": "All Categories"
      },
      "common": {
        "search": "Search products...",
        "loading": "Loading...",
        "error": "An error occurred",
        "orderNow": "Order on WhatsApp",
        "viewDetails": "View Details",
        "submit": "Submit",
        "cancel": "Cancel",
        "success": "Success",
        "noProducts": "No products found",
        "back": "Back",
      },
      "accessibility": {
        "title": "Accessibility Options",
        "language": "Language / भाषा",
        "liteMode": "Lite Mode (Saves Data)",
        "liteModeDesc": "Disables animations & 3D for slower networks",
        "highContrast": "High Contrast (Sunlight)",
        "highContrastDesc": "Increases contrast for outdoor reading",
        "textSize": "Text Size",
        "textNormal": "Normal",
        "textLarge": "Large",
        "textExtraLarge": "Extra Large",
        "installApp": "Install Offline App",
        "installAppDesc": "Access catalog even without internet",
        "voiceSearchDesc": "Voice Search (Hindi / English)"
      },
      "auth": {
        "login": "Login",
        "register": "Register",
        "email": "Email Address",
        "password": "Password",
        "fullName": "Full Name",
        "phone": "Phone Number",
        "dontHaveAccount": "Don't have an account?",
        "alreadyHaveAccount": "Already have an account?",
        "passwordStrength": "Password must contain uppercase, lowercase & numbers",
      },
      "whatsapp": {
        "modalTitle": "Order via WhatsApp",
        "fullName": "Your Full Name",
        "quantity": "Quantity",
        "remarks": "Delivery Address / Special Instructions",
        "sendButton": "Send Order on WhatsApp",
        "hiMessage": "Hello Sundar Corporation, my name is {{name}}. I would like to order {{quantity}} piece(s) of {{product}}. Delivery Address: {{remarks}}."
      },
      "home": {
        "heroTitle": "Premium Agricultural & Industrial Tools",
        "heroSubtitle": "Your trusted partner for robust, farmer-friendly tools and heavy equipment.",
        "exploreCatalog": "Explore Catalog",
        "topCategories": "Top Categories",
        "excellenceSince": "Excellence Since {{year}}",
        "establishedDesc": "Established in {{year}}, {{name}} has grown to become a trusted leader in packaging materials and woven sacks.",
        "exploreProducts": "Explore Products",
        "getQuote": "Get Quote",
        "whyChooseUs": "Why Choose Us",
        "whyChooseUsDesc": "We combine traditional craftsmanship with modern technology to deliver unmatched industrial excellence.",
        "qualityCertified": "Quality Certified",
        "qualityCertifiedDesc": "ISO 9001 certified products with BIS approval",
        "fastDelivery": "Fast Delivery",
        "fastDeliveryDesc": "Pan-India delivery within 3-7 business days",
        "support247": "24/7 Support",
        "support247Desc": "Round-the-clock customer service and technical support",
        "industryLeader": "Industry Leader",
        "industryLeaderDesc": "Trusted by top industrial companies since {{year}}",
        "happyClients": "Happy Clients",
        "products": "Products",
        "yearsExperience": "Years Experience",
        "industryAwards": "Industry Awards",
        "trustedByLeaders": "Trusted by Industry Leaders",
        "satisfiedCustomers": "Join {{count}} satisfied customers who rely on our quality products",
        "customerRating": "Customer Rating",
        "repeatBusiness": "Repeat Business",
        "corporateClients": "Corporate Clients",
        "heroText1": "Industrial Excellence in Packaging",
        "heroText2": "Premium HDPE & PP Bags",
        "heroText3": "Trusted by {{count}} Industries",
        "heroText4": "ISO Certified Solutions",
        "ourSolutions": "Our Industrial Solutions",
        "ourSolutionsDesc": "Discover our comprehensive range of products engineered for demanding environments.",
        "allProducts": "All Products",
        "trending": "Trending Now",
        "searchSolutions": "Search solutions...",
        "collection": "Collection",
        "variations": "{{count}} Variations",
        "noSolutions": "No solutions found",
        "ceoQuote": "Sundar Corporation has been our trusted supplier for over 5 years. Their product quality and service reliability are unmatched in the industry."
      }
    }
  },
  hi: {
    translation: {
      "nav": {
        "home": "मुख्य पृष्ठ",
        "products": "उत्पाद",
        "about": "हमारे बारे में",
        "contact": "संपर्क करें",
        "account": "मेरा खाता",
        "allCategories": "सभी श्रेणियां"
      },
      "common": {
        "search": "उत्पाद खोजें...",
        "loading": "लोड हो रहा है...",
        "error": "एक त्रुटि हुई",
        "orderNow": "WhatsApp पर ऑर्डर करें",
        "viewDetails": "विवरण देखें",
        "submit": "जमा करें",
        "cancel": "रद्द करें",
        "success": "सफलता",
        "noProducts": "कोई उत्पाद नहीं मिला",
        "back": "पीछे जाएं",
      },
      "accessibility": {
        "title": "पहुंच-योग्यता विकल्प",
        "language": "भाषा / Language",
        "liteMode": "लाइट मोड (डेटा बचाएं)",
        "liteModeDesc": "धीमी नेटवर्क के लिए एनिमेशन और 3D बंद करें",
        "highContrast": "उच्च कंट्रास्ट (धूप में पढ़ें)",
        "highContrastDesc": "बाहर धूप में स्पष्ट पढ़ने के लिए कंट्रास्ट बढ़ाएं",
        "textSize": "अक्षर का आकार",
        "textNormal": "सामान्य",
        "textLarge": "बड़ा",
        "textExtraLarge": "अति बड़ा",
        "installApp": "ऑफलाइन ऐप इंस्टॉल करें",
        "installAppDesc": "बिना इंटरनेट के भी उत्पादों की सूची देखें",
        "voiceSearchDesc": "आवाज खोज (हिंदी / अंग्रेजी)"
      },
      "auth": {
        "login": "लॉगिन करें",
        "register": "रजिस्टर करें",
        "email": "ईमेल पता",
        "password": "पासवर्ड",
        "fullName": "पूरा नाम",
        "phone": "फ़ोन नंबर",
        "dontHaveAccount": "खाता नहीं है? रजिस्टर करें",
        "alreadyHaveAccount": "पहले से खाता है? लॉगिन करें",
        "passwordStrength": "पासवर्ड में बड़े, छोटे अक्षर और संख्या होनी चाहिए",
      },
      "whatsapp": {
        "modalTitle": "व्हाट्सएप के माध्यम से ऑर्डर करें",
        "fullName": "आपका पूरा नाम",
        "quantity": "मात्रा (पीस)",
        "remarks": "डिलिवरी का पता / विशेष निर्देश",
        "sendButton": "व्हाट्सएप पर ऑर्डर भेजें",
        "hiMessage": "नमस्ते दामोदर ट्रेडर्स, मेरा नाम {{name}} है। मैं आपके उत्पाद {{product}} के {{quantity}} पीस ऑर्डर करना चाहता हूँ। डिलीवरी का पता: {{remarks}}।"
      },
      "home": {
        "heroTitle": "प्रीमियम कृषि और औद्योगिक उपकरण",
        "heroSubtitle": "मजबूत, किसान-अनुकूल उपकरणों और भारी मशीनरी के लिए आपका विश्वसनीय साथी।",
        "exploreCatalog": "सूची देखें",
        "topCategories": "प्रमुख श्रेणियां",
        "excellenceSince": "{{year}} से उत्कृष्टता",
        "establishedDesc": "{{year}} में स्थापित, {{name}} औद्योगिक पाइप फिटिंग्स और समाधानों में एक विश्वसनीय अग्रणी बन गया है।",
        "exploreProducts": "उत्पाद देखें",
        "getQuote": "कोटेशन प्राप्त करें",
        "whyChooseUs": "हमें क्यों चुनें",
        "whyChooseUsDesc": "हम बेजोड़ औद्योगिक उत्कृष्टता प्रदान करने के लिए आधुनिक तकनीक के साथ पारंपरिक शिल्प कौशल को जोड़ते हैं।",
        "qualityCertified": "गुणवत्ता प्रमाणित",
        "qualityCertifiedDesc": "बीआईएस (BIS) अनुमोदन के साथ आईएसओ 9001 प्रमाणित उत्पाद",
        "fastDelivery": "तेज डिलीवरी",
        "fastDeliveryDesc": "3-7 कार्य दिवसों के भीतर पूरे भारत में डिलीवरी",
        "support247": "24/7 सहायता",
        "support247Desc": "चौबीसों घंटे ग्राहक सेवा और तकनीकी सहायता",
        "industryLeader": "उद्योग के अग्रणी",
        "industryLeaderDesc": "{{year}} से शीर्ष औद्योगिक कंपनियों द्वारा विश्वसनीय",
        "happyClients": "संतुष्ट ग्राहक",
        "products": "उत्पाद",
        "yearsExperience": "वर्षों का अनुभव",
        "industryAwards": "औद्योगिक पुरस्कार",
        "trustedByLeaders": "उद्योग के नेताओं द्वारा विश्वसनीय",
        "satisfiedCustomers": "{{count}} संतुष्ट ग्राहकों में शामिल हों जो हमारे गुणवत्तापूर्ण उत्पादों पर भरोसा करते हैं",
        "customerRating": "ग्राहक रेटिंग",
        "repeatBusiness": "दोबारा व्यापार",
        "corporateClients": "कॉर्पोरेट ग्राहक",
        "heroText1": "हर पाइप में औद्योगिक उत्कृष्टता",
        "heroText2": "2011 से गुणवत्तापूर्ण पाइप फिटिंग्स",
        "heroText3": "{{count}} उद्योगों द्वारा विश्वसनीय",
        "heroText4": "आईएसओ प्रमाणित समाधान",
        "ourSolutions": "हमारे औद्योगिक समाधान",
        "ourSolutionsDesc": "कठिन परिस्थितियों के लिए डिज़ाइन किए गए उत्पादों की हमारी विस्तृत श्रृंखला खोजें।",
        "allProducts": "सभी उत्पाद",
        "trending": "अभी लोकप्रिय",
        "searchSolutions": "समाधान खोजें...",
        "collection": "संग्रह",
        "variations": "{{count}} प्रकार",
        "noSolutions": "कोई समाधान नहीं मिला",
        "ceoQuote": "दामोदर ट्रेडर्स पिछले 5 वर्षों से हमारा विश्वसनीय आपूर्तिकर्ता रहा है। उनके उत्पाद की गुणवत्ता और सेवा की विश्वसनीयता उद्योग में बेजोड़ हैं।"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
