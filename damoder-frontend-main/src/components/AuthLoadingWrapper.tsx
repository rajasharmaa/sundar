import { useState, useEffect, useContext } from 'react';
import AuthContext from '@/context/AuthContext';
import { AuthLoadingOverlay } from '@/components/AuthLoadingOverlay';

export const AuthLoadingWrapper = () => {
    const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Initializing authentication...');
    const [progress, setProgress] = useState(0);

    // Get auth context - must be called at top level using useContext directly
    // to avoid the throw in useAuth() if provider is not yet ready
    const authContext = useContext(AuthContext);

    const { 
        authReady = false, 
        initializing = false, 
        isAuthenticated = false, 
        isLoading = false, 
        serverStatus = 'idle' 
    } = authContext || {};

    // Handle authentication initialization loading
    useEffect(() => {
        if (!authContext) return;
        
        // Priority to server waking state
        if (serverStatus === 'waking') return;

        if (initializing) {
            setShowLoadingOverlay(true);
            setLoadingMessage('Initializing authentication...');
            setProgress(30);
        } else if (!authReady) {
            // Auth is initializing but not ready yet
            setShowLoadingOverlay(true);
            setLoadingMessage('Restoring your session...');
            setProgress(60);
        } else {
            // Auth is ready
            setProgress(100);
            // Brief delay to show completion before hiding
            const timer = setTimeout(() => {
                setShowLoadingOverlay(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [initializing, authReady, serverStatus, authContext]);

    // Handle authentication state loading (login/logout operations)
    useEffect(() => {
        if (!authContext) return;
        
        // Priority to server waking state
        if (serverStatus === 'waking') return;

        if (isLoading && isAuthenticated) {
            setShowLoadingOverlay(true);
            setLoadingMessage('Updating your session...');
            setProgress(80);
        } else if (isLoading && !isAuthenticated) {
            setShowLoadingOverlay(true);
            setLoadingMessage('Processing authentication...');
            setProgress(70);
        }
    }, [isLoading, isAuthenticated, serverStatus, authContext]);

    if (!authContext) return null;

    return (
        <AuthLoadingOverlay
            show={showLoadingOverlay}
            message={loadingMessage}
            progress={progress}
        />
    );
};
