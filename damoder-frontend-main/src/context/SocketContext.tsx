import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logger from '@/lib/logger';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
    connectSocket: () => void;
    disconnectSocket: () => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false,
    connectSocket: () => {},
    disconnectSocket: () => {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const socketRef = useRef<Socket | null>(null);
    const isAuthenticatedRef = useRef(false);
    const mountRef = useRef(true);

    // Function to connect socket
    const connectSocket = useCallback(() => {
        if (socketRef.current || !mountRef.current) {
            logger.warn('Socket already connected or component unmounted, skipping duplicate connection');
            return;
        }

        const apiUrl = import.meta.env.VITE_API_URL;
        const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
        
        // 🔥 FIX #4: Require VITE_API_URL to prevent connecting to wrong domain
        if (!apiUrl) {
            logger.error('❌ VITE_API_URL is required for socket connection');
            throw new Error('VITE_API_URL environment variable is required for real-time features');
        }

        // 🔥 FIX: Always use backend URL for socket connection
        const socketBaseUrl = new URL(apiUrl).origin;
        const socketInstance = io(socketBaseUrl, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            autoConnect: false,                  // Manual connection control
            reconnection: true,                  // Enable reconnection
            reconnectionAttempts: 5,             // Maximum reconnection attempts
            reconnectionDelay: 1000,             // Initial delay
            reconnectionDelayMax: 5000,          // Maximum delay
            randomizationFactor: 0.5,            // Randomization factor
            timeout: 20000,                      // Connection timeout
            // Add auth token if available
            auth: (cb) => {
                // Get auth token from cookies
                const token = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('accessToken='))
                    ?.split('=')[1];
                
                cb({
                    token: token || null
                });
            }
        });

        // 🔥 CONNECTION EVENT HANDLERS
        socketInstance.on('connect', () => {
            if (!mountRef.current) return;
            logger.info('✅ Connected to socket server');
            setConnected(true);
            socketRef.current = socketInstance;
        });

        socketInstance.on('disconnect', (reason) => {
            if (!mountRef.current) return;
            logger.warn('🔌 Disconnected from socket:', reason);
            setConnected(false);
            socketRef.current = null;
            
            // Auto-reconnect logic with debounce
            if (reason === 'io server disconnect') {
                // Server actively disconnected - don't auto-reconnect
                logger.info('Server initiated disconnect, not auto-reconnecting');
            } else if (reason === 'io client disconnect') {
                // Client initiated disconnect (component unmount) - don't reconnect
                logger.debug('Client initiated disconnect, normal cleanup');
            } else {
                // Other disconnect reasons - auto-reconnect with delay
                logger.info('Attempting to reconnect...');
            }
        });

        socketInstance.on('connect_error', (error) => {
            if (!mountRef.current) return;
            logger.error('❌ Socket connection error:', error.message);
            setConnected(false);
            socketRef.current = null;
        });

        socketInstance.on('reconnect', (attemptNumber) => {
            if (!mountRef.current) return;
            logger.info(`🔄 Reconnected to socket (attempt ${attemptNumber})`);
            setConnected(true);
            socketRef.current = socketInstance;
        });

        socketInstance.on('reconnect_failed', () => {
            if (!mountRef.current) return;
            logger.error('❌ Socket reconnection failed after maximum attempts');
            setConnected(false);
            socketRef.current = null;
        });

        // 🔥 BUSINESS LOGIC EVENTS
        socketInstance.on('priceUpdate', (data: { productId: string, newPrice: number, productName: string }) => {
            if (!mountRef.current) return;
            logger.debug('💰 Price update received', data);

            toast({
                title: `Price Update: ${data.productName}`,
                description: `New Price: ₹${data.newPrice.toFixed(2)}`,
                className: 'bg-blue-600 text-white'
            });
        });

        // 🔥 INITIALIZE CONNECTION
        socketInstance.connect();
        setSocket(socketInstance);
        socketRef.current = socketInstance;
    }, [toast]);

    // Function to disconnect socket
    const disconnectSocket = useCallback(() => {
        if (socketRef.current) {
            logger.info('🔌 Disconnecting socket by user request');
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
            setConnected(false);
        }
    }, []);

    // Monitor authentication state changes via events (not polling)
    // 🔧 M1-10 FIX: Replaced 2s setInterval poll with event-driven detection
    useEffect(() => {
      const checkAuth = () => {
      if (!mountRef.current) return;
      if (document.visibilityState === 'hidden') return;

      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='));

      const isAuthenticated = !!token;

      if (isAuthenticated && !isAuthenticatedRef.current) {
        logger.info('👤 User authenticated, connecting socket');
        isAuthenticatedRef.current = true;
        connectSocket();
      } else if (!isAuthenticated && isAuthenticatedRef.current) {
        logger.info('🚪 User logged out, disconnecting socket');
        isAuthenticatedRef.current = false;
        disconnectSocket();
      }
    };

    // Run once on mount
    checkAuth();

    // Listen for auth events dispatched by AuthContext
    const handleLogin = () => {
      if (!mountRef.current) return;
      isAuthenticatedRef.current = true;
      connectSocket();
    };
    const handleLogout = () => {
      if (!mountRef.current) return;
      isAuthenticatedRef.current = false;
      disconnectSocket();
    };

    window.addEventListener('auth:login-success', handleLogin);
    window.addEventListener('auth:logout-required', handleLogout);

    return () => {
      window.removeEventListener('auth:login-success', handleLogin);
      window.removeEventListener('auth:logout-required', handleLogout);
    };
  }, [connectSocket, disconnectSocket]);

    // Monitor tab visibility to disconnect socket in background tabs and reconnect when active
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!mountRef.current) return;

            if (document.visibilityState === 'hidden') {
                logger.info('💤 Tab hidden - disconnecting socket to save server resources');
                disconnectSocket();
            } else {
                logger.info('⏰ Tab visible - checking socket connection');
                const token = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('accessToken='));
                
                if (token) {
                    isAuthenticatedRef.current = true;
                    connectSocket();
                } else {
                    isAuthenticatedRef.current = false;
                    disconnectSocket();
                }
            }
        };

        // Add event listener
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Run once on mount if tab starts hidden (e.g. opened in background)
        if (document.visibilityState === 'hidden') {
            disconnectSocket();
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [connectSocket, disconnectSocket]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            mountRef.current = false;
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, connected, connectSocket, disconnectSocket }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
