import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, Customer, SessionState } from '../types';
import { clearSession, getStoredSession, storeSession } from '../utils/sessionStorage';

const initialState: AuthState = {
    isAuthenticated: false,
    currentCustomer: undefined,
    loading: false,
    error: undefined,
    session: getStoredSession() || undefined,
};

/**
 * Async thunk for login
 */
export const loginCustomer = createAsyncThunk(
    'auth/loginCustomer',
    async (
        { phoneNumber }: { phoneNumber: string; otp?: string },
        { rejectWithValue }
    ) => {
        try {
            // Simulate API call - In production, call your backend
            // const response = await api.post('/auth/login', { phoneNumber, otp });

            // For now, create a customer object
            const customerId = `CUST_${Date.now()}`;
            const customer: Customer = {
                id: customerId,
                phoneNumber,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const session: SessionState = {
                isLoggedIn: true,
                customerId,
                phoneNumber,
                sessionToken: `TOKEN_${Date.now()}`,
                expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            };

            // Store session in localStorage and cookies
            storeSession(session);

            return { customer, session };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            return rejectWithValue(message);
        }
    }
);

/**
 * Async thunk for logout
 */
export const logoutCustomer = createAsyncThunk(
    'auth/logoutCustomer',
    async (_: void, { rejectWithValue }) => {
        try {
            // Simulate API call
            clearSession();
            return null;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Logout failed';
            return rejectWithValue(message);
        }
    }
);

/**
 * Async thunk to restore session from storage
 */
export const restoreSession = createAsyncThunk(
    'auth/restoreSession',
    async (_: void, { rejectWithValue }) => {
        try {
            const storedSession = getStoredSession();
            if (!storedSession || !storedSession.isLoggedIn) {
                // No session found is normal for first-time users, don't show error
                return null;
            }

            // Check if session has expired
            if (storedSession.expiresAt && storedSession.expiresAt < Date.now()) {
                clearSession();
                return rejectWithValue('Session expired');
            }

            // Verify with backend if needed
            // For now, restore from stored session
            return storedSession;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to restore session';
            return rejectWithValue(message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state: AuthState) => {
            state.error = undefined;
        },
        resetAuth: (state: AuthState) => {
            state.isAuthenticated = false;
            state.currentCustomer = undefined;
            state.session = undefined;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginCustomer.pending, (state: AuthState) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(loginCustomer.fulfilled, (state: AuthState, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.currentCustomer = action.payload.customer;
                state.session = action.payload.session;
            })
            .addCase(loginCustomer.rejected, (state: AuthState, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            });

        // Logout
        builder
            .addCase(logoutCustomer.pending, (state: AuthState) => {
                state.loading = true;
            })
            .addCase(logoutCustomer.fulfilled, (state: AuthState) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.currentCustomer = undefined;
                state.session = undefined;
            })
            .addCase(logoutCustomer.rejected, (state: AuthState, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Restore Session
        builder
            .addCase(restoreSession.pending, (state: AuthState) => {
                state.loading = true;
            })
            .addCase(restoreSession.fulfilled, (state: AuthState, action) => {
                state.loading = false;
                // Only set as authenticated if we have a valid session
                if (action.payload) {
                    state.session = action.payload;
                    state.isAuthenticated = true;
                } else {
                    state.session = undefined;
                    state.isAuthenticated = false;
                }
            })
            .addCase(restoreSession.rejected, (state: AuthState, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
