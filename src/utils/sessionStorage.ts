import Cookies from 'js-cookie';
import type { SessionState } from '../types';

const SESSION_KEY = 'ccapp_session';
const SESSION_COOKIE_KEY = 'ccapp_session_token';

/**
 * Store session in localStorage and cookies
 */
export const storeSession = (session: SessionState): void => {
    try {
        // Store in localStorage
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        // Store session token in secure cookie (httpOnly flag would be set by server in production)
        if (session.sessionToken) {
            Cookies.set(SESSION_COOKIE_KEY, session.sessionToken, {
                expires: session.expiresAt ? new Date(session.expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000),
                sameSite: 'Strict',
            });
        }
    } catch (error) {
        console.error('Failed to store session:', error);
    }
};

/**
 * Retrieve session from localStorage
 */
export const getStoredSession = (): SessionState | null => {
    try {
        const sessionData = localStorage.getItem(SESSION_KEY);
        if (sessionData) {
            return JSON.parse(sessionData) as SessionState;
        }
        return null;
    } catch (error) {
        console.error('Failed to retrieve session:', error);
        return null;
    }
};

/**
 * Check if session is still valid
 */
export const isSessionValid = (): boolean => {
    try {
        const session = getStoredSession();
        if (!session || !session.isLoggedIn) {
            return false;
        }

        if (session.expiresAt && session.expiresAt < Date.now()) {
            clearSession();
            return false;
        }

        return true;
    } catch {
        return false;
    }
};

/**
 * Clear session from storage
 */
export const clearSession = (): void => {
    try {
        localStorage.removeItem(SESSION_KEY);
        Cookies.remove(SESSION_COOKIE_KEY);
    } catch (error) {
        console.error('Failed to clear session:', error);
    }
};

/**
 * Extend session expiry
 */
export const extendSessionExpiry = (): void => {
    try {
        const session = getStoredSession();
        if (session) {
            session.expiresAt = Date.now() + 24 * 60 * 60 * 1000; // Extend by 24 hours
            storeSession(session);
        }
    } catch (error) {
        console.error('Failed to extend session:', error);
    }
};
