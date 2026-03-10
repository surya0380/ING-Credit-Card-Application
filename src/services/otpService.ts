/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateOTP } from '../utils/helpers';

/**
 * Mock OTP Service - In production, integrate with real OTP provider
 * Free OTP APIs to consider:
 * 1. Twilio (free trial)
 * 2. Vonage (free tier)
 * 3. Plivo (free credits)
 * 4. AWS SNS (free tier)
 * 5. Firebase Authentication (free tier with SMS)
 */

interface OTPStore {
    [phoneNumber: string]: {
        otp: string;
        timestamp: number;
        attempts: number;
        failedAttempts: number;
    };
}

const otpStore: OTPStore = {};
const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
const MAX_OTP_ATTEMPTS = 5;
const MAX_FAILED_VERIFY_ATTEMPTS = 3;

/**
 * Send OTP to phone number
 * In production, replace with actual OTP provider API
 */
export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
    try {
        // Validate phone number
        if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
            return { success: false, message: 'Invalid phone number' };
        }

        // Check if max attempts exceeded
        const storedOTP = otpStore[phoneNumber];
        if (storedOTP && storedOTP.attempts >= MAX_OTP_ATTEMPTS) {
            return { success: false, message: 'Too many OTP requests. Please try again later.' };
        }

        // Generate OTP
        const otp = generateOTP(6);

        // Store OTP in memory (in production, use Redis or database)
        otpStore[phoneNumber] = {
            otp,
            timestamp: Date.now(),
            attempts: (storedOTP?.attempts ?? 0) + 1,
            failedAttempts: 0,
        };

        // Mock API call to OTP service
        // Example with Twilio:
        // await twilioClient.messages.create({
        //   body: `Your OTP is ${otp}. Valid for 5 minutes.`,
        //   from: 'YOUR_TWILIO_NUMBER',
        //   to: `+91${phoneNumber}`,
        // });

        // For demo purposes, log to console
        console.log(`[OTP Demo] OTP for ${phoneNumber}: ${otp}`);

        // Also store in localStorage for development purposes
        localStorage.setItem(`demo_otp_${phoneNumber}`, otp);

        return { success: true, message: 'OTP sent successfully' };
    } catch (error: any) {
        console.error('Failed to send OTP:', error);
        return { success: false, message: 'Failed to send OTP' };
    }
};

/**
 * Verify OTP with attempt tracking
 */
export const verifyOTP = async (
    phoneNumber: string,
    providedOTP: string
): Promise<{ success: boolean; message: string; attemptsLeft?: number; locked?: boolean }> => {
    try {
        const storedOTP = otpStore[phoneNumber];

        if (!storedOTP) {
            return { success: false, message: 'OTP not found. Please request a new OTP.' };
        }

        // Check if max attempts exceeded
        if (storedOTP.failedAttempts >= MAX_FAILED_VERIFY_ATTEMPTS) {
            return {
                success: false,
                message: 'Maximum OTP verification attempts exceeded. Please request a new OTP.',
                locked: true,
                attemptsLeft: 0,
            };
        }

        // Check if OTP expired
        if (Date.now() - storedOTP.timestamp > OTP_EXPIRY_TIME) {
            delete otpStore[phoneNumber];
            return { success: false, message: 'OTP expired. Please request a new OTP.' };
        }

        // Check if OTP matches
        if (storedOTP.otp !== providedOTP) {
            storedOTP.failedAttempts += 1;
            const attemptsLeft = MAX_FAILED_VERIFY_ATTEMPTS - storedOTP.failedAttempts;

            if (attemptsLeft === 0) {
                return {
                    success: false,
                    message: 'Invalid OTP. Maximum attempts exceeded. Please request a new OTP.',
                    attemptsLeft: 0,
                    locked: true,
                };
            }

            return {
                success: false,
                message: `Invalid OTP. ${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left.`,
                attemptsLeft,
            };
        }

        // OTP verified successfully
        delete otpStore[phoneNumber];
        return { success: true, message: 'OTP verified successfully' };
    } catch (error: any) {
        console.error('Failed to verify OTP:', error);
        return { success: false, message: 'Failed to verify OTP' };
    }
};

/**
 * Resend OTP
 */
export const resendOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
    try {
        // Clear previous OTP
        delete otpStore[phoneNumber];
        localStorage.removeItem(`demo_otp_${phoneNumber}`);

        // Send new OTP
        return sendOTP(phoneNumber);
    } catch (error: any) {
        console.error('Failed to resend OTP:', error);
        return { success: false, message: 'Failed to resend OTP' };
    }
};

/**
 * Get OTP for demo/testing purposes
 */
export const getDemoOTP = (phoneNumber: string): string | null => {
    try {
        return localStorage.getItem(`demo_otp_${phoneNumber}`);
    } catch {
        return null;
    }
};

/**
 * Clear all OTPs (admin function)
 */
export const clearAllOTPs = (): void => {
    Object.keys(otpStore).forEach((key) => delete otpStore[key]);
};
