// components/GlobalSearch.tsx - FIXED FOR BETTER UX AND MOBILE
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, Loader2, Package, ArrowRight, Mic } from 'lucide-react';
import { api } from '../../services/api/api-client';
import logger from '@/lib/logger';
import { useDebounce } from '@/hooks/usePerformanceOptimization';
import { getOptimizedUrl } from '@/lib/utils';
import { useAccessibility } from '@/context/AccessibilityContext';
import { useTranslation } from 'react-i18next';

const GlobalSearch = () => {
    const { language } = useAccessibility();
    const { t } = useTranslation();
    const [displayQuery, setDisplayQuery] = useState(''); // 🔥 REAL-TIME STATE FOR INPUT
    const [query, setQuery] = useState(''); // DEBOUNCED STATE FOR API CALLS
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [error, setError] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounced search to prevent excessive API calls
    const debouncedSetSearchQuery = useDebounce(setQuery, 300);

    // Initial sync with URL
    useEffect(() => {
        if (location.pathname === '/products') {
            const params = new URLSearchParams(location.search);
            const searchParam = params.get('search');
            if (searchParam) {
                setDisplayQuery(searchParam);
                setQuery(searchParam);
            }
        }
    }, [location.pathname, location.search]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
                setSelectedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions with debouncing and error handling
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                setShowDropdown(false);
                setSelectedIndex(-1);
                setError(null);
                return;
            }

            setIsLoading(true);
            setError(null);
            setShowDropdown(true);

            try {
                // 🔧 FIXED: Use correct API endpoint and handle response properly
                const data = await api.products.getSuggestions(query);
                console.log('Search results:', data); // Debug log
                
                // API already handles response format, just ensure it's an array
                const products: any[] = Array.isArray(data) ? data : [];
                
                setResults(products);
                setSelectedIndex(-1);
                
                if (products.length === 0) {
                    logger.info('No products found for query:', query);
                }
            } catch (error: any) {
                logger.error('Search error', error);
                setError(error?.message || 'Failed to load search results');
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [query]);

    const handleSearch = useCallback((e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (selectedIndex >= 0 && results[selectedIndex]) {
            // Validate the product ID before navigating
            const selectedResult = results[selectedIndex];
            const productId = selectedResult?.id || selectedResult?._id?.toString?.() || selectedResult?._id;

            if (productId) {
                navigate(`/products/${productId}`);
                setShowDropdown(false);
                setQuery('');
                setError(null);
                inputRef.current?.blur();
                return;
            } else {
                logger.warn('Product ID missing, falling back to search', {
                    resultName: selectedResult?.name,
                    resultKeys: Object.keys(selectedResult || {})
                });
                navigate(`/products?search=${encodeURIComponent(query)}`);
                setShowDropdown(false);
                setQuery('');
                setError(null);
                inputRef.current?.blur();
            }
        }

        if (displayQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(displayQuery)}`);
            setShowDropdown(false);
            setError(null);
            inputRef.current?.blur();
        }
    }, [selectedIndex, results, query, displayQuery, navigate]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1));
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
            setSelectedIndex(-1);
            inputRef.current?.blur();
        } else if (e.key === 'Enter') {
            handleSearch();
        }
    }, [results.length, handleSearch]);

    const clearSearch = useCallback(() => {
        setDisplayQuery('');
        setQuery('');
        setResults([]);
        setShowDropdown(false);
        setError(null);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    }, []);

    const toggleVoiceSearch = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            const alertMsg = language === 'hi' 
                ? 'आपका ब्राउज़र वॉयस सर्च का समर्थन नहीं करता है (कृपया क्रोम का उपयोग करें)।' 
                : 'Your browser does not support voice search (please use Chrome).';
            alert(alertMsg);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        const listeningMsg = language === 'hi' 
            ? 'सुन रहे हैं... बोलना शुरू करें 🎙️' 
            : 'Listening... Please speak now 🎙️';

        recognition.onstart = () => {
            setIsListening(true);
            setDisplayQuery(listeningMsg);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setDisplayQuery(transcript);
            debouncedSetSearchQuery(transcript);
            setIsListening(false);
            setShowDropdown(true);
        };

        recognition.onerror = (event: any) => {
            logger.error('Speech recognition error', event.error);
            setIsListening(false);
            
            if (event.error === 'network') {
                const errorMsg = language === 'hi'
                    ? 'वॉयस सर्च नेटवर्क त्रुटि। कृपया सुनिश्चित करें कि आप सुरक्षित कनेक्शन (HTTPS) का उपयोग कर रहे हैं या किसी अन्य ब्राउज़र (जैसे क्रोम) का प्रयास करें।'
                    : 'Voice search network error. This browser may not support it or requires HTTPS. Try using Google Chrome.';
                alert(errorMsg);
                setDisplayQuery('');
            } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                const errorMsg = language === 'hi'
                    ? 'माइक्रोफ़ोन की अनुमति नहीं दी गई है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।'
                    : 'Microphone access denied. Please allow microphone permissions in your browser settings.';
                alert(errorMsg);
                setDisplayQuery('');
            } else if (displayQuery === listeningMsg) {
                setDisplayQuery('');
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            if (displayQuery === listeningMsg) {
                setDisplayQuery('');
            }
        };

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    }, [isListening, displayQuery, debouncedSetSearchQuery, language]);

    return (
        <div className="relative w-full max-w-[320px]" ref={searchRef}>
            <form onSubmit={handleSearch} className="group relative">
                <input
                    ref={inputRef}
                    id="global-search"
                    name="globalSearch"
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-11 pr-16 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all duration-300 text-sm placeholder:text-gray-400"
                    value={displayQuery}
                    onChange={(e) => {
                        const val = e.target.value;
                        setDisplayQuery(val);
                        debouncedSetSearchQuery(val);
                    }}
                    onFocus={() => displayQuery.trim().length >= 2 && setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                    aria-label="Search products"
                    aria-expanded={showDropdown}
                    aria-controls="search-results"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors" />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {displayQuery && displayQuery !== 'Listening... Bolna shuru karein' && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={toggleVoiceSearch}
                        className={`p-1.5 rounded-full transition-all duration-300 ${
                            isListening 
                                ? 'bg-red-100 text-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse' 
                                : 'hover:bg-green-50 text-gray-400 hover:text-green-600'
                        }`}
                        title="Voice Search (Hindi/English)"
                    >
                        <Mic className="w-4 h-4" />
                    </button>
                </div>
            </form>

            {showDropdown && (
                <div
                    id="search-results"
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden z-[110] animate-in fade-in animate-out fade-out slide-in-from-top-2 duration-200 origin-top min-w-[300px]"
                >
                    <div className="max-h-[60vh] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-6 text-green-500">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="ml-3 text-sm font-medium">Searching...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-6 px-4">
                                <div className="text-red-500 text-sm font-medium">{error}</div>
                                <button
                                    onClick={() => {
                                        setError(null);
                                        setQuery('');
                                        setShowDropdown(false);
                                    }}
                                    className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
                                >
                                    Clear and try again
                                </button>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="p-1 space-y-0.5">
                                {results.map((item: any, index) => (
                                    <button
                                        key={item.id || item._id || `search-${item.name}`}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        onClick={() => {
                                            // Use id field, fallback to _id, or fallback to search by name
                                            const productId = item?.id || item?._id?.toString?.() || item?._id;

                                            if (productId) {
                                                navigate(`/products/${productId}`);
                                                setShowDropdown(false);
                                                setQuery('');
                                                setDisplayQuery('');
                                            } else {
                                                // Fallback: search for the product by name
                                                logger.warn('Product ID missing, falling back to search by name', {
                                                    productName: item?.name
                                                });
                                                navigate(`/products?search=${encodeURIComponent(item?.name || query)}`);
                                                setShowDropdown(false);
                                                setQuery('');
                                                setDisplayQuery('');
                                            }
                                        }}
                                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all group ${selectedIndex === index ? 'bg-green-50' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 group-hover:bg-white transition-all">
                                            {item.image || (item.images && item.images.length > 0) ? (
                                                <img
                                                    src={getOptimizedUrl(item.image || item.images[0])}
                                                    alt=""
                                                    className="w-full h-full object-contain p-1"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            ) : (
                                                <Package className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-gray-900 text-sm truncate group-hover:text-green-600 transition-colors">{item.name}</div>
                                            <div className="text-[10px] text-gray-500 flex items-center gap-2">
                                                <span className="truncate uppercase tracking-wider font-semibold">{item.category}</span>
                                                {item.price > 0 && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                        <span className="font-bold text-gray-900 italic">₹{item.price}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 px-4">
                                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <div className="text-gray-500 text-sm font-medium">No products found for "{query}"</div>
                                <div className="text-gray-400 text-xs mt-2">Try different keywords or browse all products</div>
                                <button
                                    onClick={() => {
                                        navigate('/products');
                                        setShowDropdown(false);
                                        setQuery('');
                                        setDisplayQuery('');
                                    }}
                                    className="mt-4 px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Browse All Products
                                </button>
                            </div>
                        )}
                    </div>

                    {results.length > 0 && (
                        <div className="p-2 bg-gray-50 border-t border-gray-100">
                            <button
                                onClick={handleSearch}
                                className="w-full py-2.5 bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 rounded-lg"
                            >
                                View All Search Results
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
