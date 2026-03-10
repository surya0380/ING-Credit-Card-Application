import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from '../store';

/**
 * Typed version of useDispatch
 */
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();

/**
 * Typed version of useSelector
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Hook for auth state and actions
 */
export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated, currentCustomer, loading, error, session } = useAppSelector(
        (state) => state.auth
    );

    return {
        isAuthenticated,
        currentCustomer,
        loading,
        error,
        session,
        dispatch,
    };
};

/**
 * Hook for application state and actions
 */
export const useApplication = () => {
    const dispatch = useAppDispatch();
    const { currentApplication, draftApplications, submittedApplications, loading, error, success, successMessage } =
        useAppSelector((state) => state.application);

    return {
        currentApplication,
        draftApplications,
        submittedApplications,
        loading,
        error,
        success,
        successMessage,
        dispatch,
    };
};
