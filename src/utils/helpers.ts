/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate unique application ID
 */
export const generateApplicationId = (): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `APP_${timestamp}_${random}`;
};

/**
 * Generate customer ID
 */
export const generateCustomerId = (): string => {
    return `CUST_${uuidv4().substr(0, 8).toUpperCase()}`;
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
    }
    return phoneNumber;
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
    if (currency === 'INR') {
        return `₹${amount.toLocaleString('en-IN')}`;
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date: string | Date, format: string = 'DD/MM/YYYY'): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    switch (format) {
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        case 'DD MMM YYYY':
            return d.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        default:
            return d.toLocaleDateString();
    }
};

/**
 * Get current financial year
 */
export const getCurrentFinancialYear = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    if (month >= 3) { // April onwards
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
};

/**
 * Mask PAN for display
 */
export const maskPAN = (pan: string): string => {
    if (!pan || pan.length < 8) return pan;
    const visible = pan.substring(0, 2) + pan.substring(pan.length - 2);
    return visible + 'X'.repeat(pan.length - 4);
};

/**
 * Mask phone number for display
 */
export const maskPhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber || phoneNumber.length < 4) return phoneNumber;
    return 'XX' + phoneNumber.substring(2, 8) + 'XXXX';
};

/**
 * Sleep utility for promise-based delays
 */
export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Get credit score color
 */
export const getCreditScoreColor = (score: number): string => {
    if (score >= 750) return '#52c41a'; // Green - Excellent
    if (score >= 650) return '#faad14'; // Orange - Good
    return '#f5222d'; // Red - Poor
};

/**
 * Get risk level color
 */
export const getRiskLevelColor = (riskLevel: string): string => {
    switch (riskLevel.toUpperCase()) {
        case 'LOW':
            return '#52c41a'; // Green
        case 'MEDIUM':
            return '#faad14'; // Orange
        case 'HIGH':
            return '#f5222d'; // Red
        default:
            return '#d9d9d9'; // Gray
    }
};

/**
 * Generate OTP
 */
export const generateOTP = (length: number = 6): string => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};

/**
 * Validate OTP
 */
export const validateOTP = (otp: string, expected: string): boolean => {
    return otp === expected;
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: Record<string, any>): boolean => {
    return !obj || Object.keys(obj).length === 0;
};

/**
 * Retry mechanism for API calls
 */
export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
): Promise<T> => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (attempt < maxAttempts) {
                const delay = delayMs * Math.pow(2, attempt - 1); // Exponential backoff
                await sleep(delay);
            }
        }
    }

    throw lastError || new Error('Max retry attempts exceeded');
};
