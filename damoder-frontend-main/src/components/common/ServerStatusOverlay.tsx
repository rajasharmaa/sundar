import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, Server, AlertCircle } from 'lucide-react';

export const ServerStatusOverlay = () => {
    const [status, setStatus] = useState<'hidden' | 'waking' | 'error'>('hidden');
    const [retryCount, setRetryCount] = useState(0);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        const handleServerWaking = (event: CustomEvent) => {
            const retryAfter = event.detail?.retryAfter || 15;
            setStatus('waking');
            setCountdown(Math.ceil(retryAfter));
        };

        const handleServerAwake = () => {
            setStatus('hidden');
            setRetryCount(0);
        };

        const handleAuthError = (event: CustomEvent) => {
            // Optional: Show error state if critical auth issue
        };

        window.addEventListener('server-waking-up', handleServerWaking as EventListener);
        window.addEventListener('server-awake', handleServerAwake as EventListener);

        return () => {
            window.removeEventListener('server-waking-up', handleServerWaking as EventListener);
            window.removeEventListener('server-awake', handleServerAwake as EventListener);
        };
    }, []);

    // Countdown timer
    useEffect(() => {
        if (status === 'waking' && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [status, countdown]);

    if (status === 'hidden') return null;

    return (
        <AnimatePresence>
            {status === 'waking' && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed top-24 right-6 z-[100] max-w-sm w-full bg-white rounded-xl shadow-2xl border border-blue-100 overflow-hidden"
                >
                    <div className="p-5">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-full animate-pulse">
                                <Server className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 mb-1">Connecting to Server</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    The server is waking up from sleep mode. This may take a few seconds.
                                </p>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium text-gray-500">
                                        <span>Est. time remaining</span>
                                        <span>{countdown}s</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-blue-600 rounded-full"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 15, ease: "linear" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Retrying automatically...
                        </span>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                            Reload Page
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
