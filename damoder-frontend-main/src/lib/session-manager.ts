// 🔐 Session Manager - Advanced Session Persistence and Synchronization
// Handles cross-tab synchronization, storage consistency, and session recovery

import logger from './logger';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------
interface SessionData {
  user: any;
  timestamp: number;
  sessionId?: string;
  tabId: string;
}

interface StorageEvent extends Event {
  key: string;
  oldValue: string | null;
  newValue: string | null;
}

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------
const STORAGE_KEYS = {
  USER: 'auth_user',
  SESSION: 'auth_session',
  TAB_ID: 'tab_id'
} as const;

const SESSION_CONFIG = {
  SYNC_INTERVAL: 1000, // 1 second sync check
  EXPIRY_BUFFER: 30 * 24 * 60 * 60 * 1000, // 30 days buffer to align with refresh token lifetime
  MAX_TABS: 10
} as const;

// -----------------------------------------------------------------------------
// GLOBAL STATE
// -----------------------------------------------------------------------------
let currentTabId: string;
let syncInterval: NodeJS.Timeout | null = null;
let isMasterTab = false;
let sessionListeners: Array<(data: SessionData | null) => void> = [];

// -----------------------------------------------------------------------------
// UTILITY FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Generate unique tab identifier
 */
function generateTabId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current tab ID (create if doesn't exist)
 */
function getTabId(): string {
  if (!currentTabId) {
    currentTabId = localStorage.getItem(STORAGE_KEYS.TAB_ID) || generateTabId();
    localStorage.setItem(STORAGE_KEYS.TAB_ID, currentTabId);
  }
  return currentTabId;
}

/**
 * Serialize session data for storage
 */
function serializeSession(data: any): string {
  return JSON.stringify({
    user: data,
    timestamp: Date.now(),
    tabId: getTabId()
  });
}

/**
 * Deserialize session data from storage
 */
function deserializeSession(serialized: string | null): SessionData | null {
  if (!serialized) return null;
  
  try {
    const parsed = JSON.parse(serialized);
    return {
      user: parsed.user,
      timestamp: parsed.timestamp,
      tabId: parsed.tabId
    };
  } catch (err) {
    logger.error('Failed to deserialize session', err);
    return null;
  }
}

/**
 * Check if session is still valid
 */
function isSessionValid(session: SessionData | null): boolean {
  if (!session) return false;
  
  const age = Date.now() - session.timestamp;
  return age < SESSION_CONFIG.EXPIRY_BUFFER;
}

// -----------------------------------------------------------------------------
// SESSION MANAGER CLASS
// -----------------------------------------------------------------------------
class SessionManager {
  private static instance: SessionManager;
  
  private constructor() {
    this.initialize();
  }
  
  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }
  
  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopSync();
    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener('beforeunload', this.handleTabClose);
    sessionListeners = [];
    logger.info('🔐 Session manager destroyed');
  }
  
  /**
   * Initialize session manager
   */
  private initialize(): void {
    // Set up storage event listener for cross-tab sync
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // Set up beforeunload for cleanup
    window.addEventListener('beforeunload', this.handleTabClose.bind(this));
    
    // Determine master tab
    this.determineMasterTab();
    
    // Start sync interval
    this.startSync();
    
    logger.info('🔐 Session manager initialized', { 
      tabId: getTabId(), 
      isMaster: isMasterTab 
    });
  }
  private determineMasterTab(): void {
    const tabs = this.getActiveTabs();
    const myTabId = getTabId();
    
    // Master tab is the one with earliest timestamp
    isMasterTab = tabs.length === 0 || tabs[0] === myTabId;
    
    if (isMasterTab) {
      logger.debug('👑 This tab is now master tab');
    }
  }
  
  /**
   * Get list of active tab IDs
   */
  private getActiveTabs(): string[] {
    const tabs: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('tab_active_')) {
        tabs.push(key.replace('tab_active_', ''));
      }
    }
    return tabs.sort();
  }
  
  /**
   * Start periodic sync
   */
  private startSync(): void {
    if (syncInterval) return;
    
    syncInterval = setInterval(() => {
      this.syncWithStorage();
    }, SESSION_CONFIG.SYNC_INTERVAL);
  }
  
  /**
   * Stop periodic sync
   */
  private stopSync(): void {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
      logger.debug('🛑 Sync interval cleared');
    }
  }
  
  /**
   * Handle storage change events (cross-tab sync)
   */
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === STORAGE_KEYS.USER) {
      logger.debug('🔄 Storage change detected', { 
        key: event.key, 
        oldValue: !!event.oldValue, 
        newValue: !!event.newValue 
      });
      
      const session = deserializeSession(event.newValue);
      
      // Notify listeners of session change
      sessionListeners.forEach(listener => listener(session));
      
      // If session was cleared, clear local state
      if (!event.newValue) {
        this.clearLocalSession();
      }
    }
  }
  
  /**
   * Handle tab closing
   */
  private handleTabClose(): void {
    sessionStorage.removeItem(`tab_active_${getTabId()}`);
    if (isMasterTab) {
      // Transfer master status to another tab
      const remainingTabs = this.getActiveTabs();
      if (remainingTabs.length > 0) {
        // First tab becomes new master
        const newMasterKey = `tab_master_${remainingTabs[0]}`;
        localStorage.setItem(newMasterKey, 'true');
      }
    }
  }
  
  /**
   * Sync current session with storage
   */
  private syncWithStorage(): void {
    // Mark this tab as active
    sessionStorage.setItem(`tab_active_${getTabId()}`, Date.now().toString());
    
    if (isMasterTab) {
      // Master tab is responsible for session consistency
      const storedSession = deserializeSession(localStorage.getItem(STORAGE_KEYS.USER));
      
      if (storedSession && !isSessionValid(storedSession)) {
        logger.debug('⏰ Session expired, clearing storage');
        this.clearSession();
      }
    }
  }
  
  /**
   * Clear local session state
   */
  private clearLocalSession(): void {
    // Clear local storage but don't trigger storage events
    localStorage.removeItem(STORAGE_KEYS.USER);
    logger.debug('🧹 Local session cleared');
  }
  
  // -------------------------------------------------------------------------
  // PUBLIC METHODS
  // -------------------------------------------------------------------------
  
  /**
   * Save user session
   */
  saveSession(user: any): void {
    try {
      const serialized = serializeSession(user);
      localStorage.setItem(STORAGE_KEYS.USER, serialized);
      logger.debug('💾 Session saved to storage');
    } catch (err) {
      logger.error('Failed to save session', err);
    }
  }
  
  /**
   * Load user session
   */
  loadSession(): any | null {
    try {
      const serialized = localStorage.getItem(STORAGE_KEYS.USER);
      const session = deserializeSession(serialized);
      
      if (!session) return null;
      
      if (isSessionValid(session)) {
        logger.debug('📂 Session loaded from storage');
        return session.user;
      } else {
        logger.debug('⏰ Loaded session expired, clearing');
        this.clearSession();
        return null;
      }
    } catch (err) {
      logger.error('Failed to load session', err);
      return null;
    }
  }
  
  /**
   * Clear session completely
   */
  clearSession(): void {
    try {
      // Clear all storage
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.removeItem(STORAGE_KEYS.TAB_ID);
      
      // Clear session storage entries
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('tab_')) {
          sessionStorage.removeItem(key);
        }
      });
      
      logger.info('🧨 Complete session cleared');
    } catch (err) {
      logger.error('Failed to clear session', err);
    }
  }
  
  /**
   * Add session change listener
   */
  addListener(callback: (data: SessionData | null) => void): void {
    sessionListeners.push(callback);
  }
  
  /**
   * Remove session change listener
   */
  removeListener(callback: (data: SessionData | null) => void): void {
    sessionListeners = sessionListeners.filter(listener => listener !== callback);
  }
  
  /**
   * Get session age in milliseconds
   */
  getSessionAge(): number | null {
    const session = deserializeSession(localStorage.getItem(STORAGE_KEYS.USER));
    return session ? Date.now() - session.timestamp : null;
  }
  
  /**
   * Check if session exists and is valid
   */
  hasValidSession(): boolean {
    const session = deserializeSession(localStorage.getItem(STORAGE_KEYS.USER));
    return !!session && isSessionValid(session);
  }
}

// -----------------------------------------------------------------------------
// EXPORT SINGLETON INSTANCE
// -----------------------------------------------------------------------------
const sessionManager = SessionManager.getInstance();

export default sessionManager;

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------------------------------------
export function saveUserSession(user: any): void {
  sessionManager.saveSession(user);
}

export function loadUserSession(): any | null {
  return sessionManager.loadSession();
}

export function clearUserSession(): void {
  sessionManager.clearSession();
}

export function addSessionListener(callback: (data: any | null) => void): void {
  sessionManager.addListener((sessionData) => {
    callback(sessionData?.user || null);
  });
}

export function removeSessionListener(callback: (data: any | null) => void): void {
  sessionManager.removeListener((sessionData) => {
    callback(sessionData?.user || null);
  });
}

export function hasValidUserSession(): boolean {
  return sessionManager.hasValidSession();
}

export function getUserSessionAge(): number | null {
  return sessionManager.getSessionAge();
}