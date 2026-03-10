/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ValidationResult } from '../types';

/**
 * Validate PAN (Permanent Account Number) format
 * PAN format: AAAPL5055K [10 characters]
 * - AAAA: Alphabetic
 * - P: Personal (A) or Non-personal (C/S/T/H/G/B/L/J/F/P)
 * - L: Alphabetic
 * - SSSS: Numeric [last 4 digits]
 * - K: Alphabetic check digit
 */
export const validatePAN = (pan: string): ValidationResult => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!pan) {
        errors.pan = 'PAN is required';
        isValid = false;
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())) {
        errors.pan = 'Invalid PAN format. Should be like AAAPL5055K';
        isValid = false;
    }

    return { isValid, errors };
};

/**
 * Validate phone number
 */
export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!phoneNumber) {
        errors.phoneNumber = 'Phone number is required';
        isValid = false;
    } else if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
        errors.phoneNumber = 'Invalid phone number. Should be 10 digits starting with 6-9';
        isValid = false;
    }

    return { isValid, errors };
};

/**
 * Validate email
 */
export const validateEmail = (email: string): ValidationResult => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!email) {
        errors.email = 'Email is required';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Invalid email format';
        isValid = false;
    }

    return { isValid, errors };
};

/**
 * Validate date of birth
 */
export const validateDateOfBirth = (dateString: string, minAge: number = 18): ValidationResult => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!dateString) {
        errors.dateOfBirth = 'Date of birth is required';
        isValid = false;
    } else {
        const date = new Date(dateString);
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
            const ageAdjusted = age - 1;
            if (ageAdjusted < minAge) {
                errors.dateOfBirth = `Must be at least ${minAge} years old`;
                isValid = false;
            }
        } else if (age < minAge) {
            errors.dateOfBirth = `Must be at least ${minAge} years old`;
            isValid = false;
        }
    }

    return { isValid, errors };
};

/**
 * Validate income
 */
export const validateIncome = (income: number, minIncome: number = 300000): ValidationResult => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!income || income <= 0) {
        errors.income = 'Please enter a valid income';
        isValid = false;
    } else if (income < minIncome) {
        errors.income = `Minimum annual income required is ₹${minIncome.toLocaleString()}`;
        isValid = false;
    }

    return { isValid, errors };
};

/**
 * Validate pincode (Indian)
 */
export const validatePincode = (pincode: string): ValidationResult => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!pincode) {
        errors.pincode = 'Pincode is required';
        isValid = false;
    } else if (!/^[1-9][0-9]{5}$/.test(pincode)) {
        errors.pincode = 'Invalid pincode format. Should be 6 digits';
        isValid = false;
    }

    return { isValid, errors };
};

/**
 * Validate form fields for KYC
 */
export const validateKYCForm = (data: Record<string, any>): ValidationResult => {
    const errors: Record<string, string> = {};
    let isValid = true;

    // Validate PAN
    const panValidation = validatePAN(data.pan);
    if (!panValidation.isValid) {
        errors.pan = Object.values(panValidation.errors)[0];
        isValid = false;
    }

    // Validate Name
    if (!data.panName || data.panName.trim().length < 3) {
        errors.panName = 'Name must be at least 3 characters';
        isValid = false;
    }

    // Validate Date of Birth
    const dobValidation = validateDateOfBirth(data.dateOfBirth, 18);
    if (!dobValidation.isValid) {
        errors.dateOfBirth = Object.values(dobValidation.errors)[0];
        isValid = false;
    }

    // Validate Gender
    if (!data.gender || !['M', 'F', 'O'].includes(data.gender)) {
        errors.gender = 'Please select a valid gender';
        isValid = false;
    }

    // Validate Address
    if (!data.address || data.address.trim().length < 5) {
        errors.address = 'Please enter a valid address';
        isValid = false;
    }

    // Validate City
    if (!data.city || data.city.trim().length < 2) {
        errors.city = 'Please enter a valid city';
        isValid = false;
    }

    // Validate State
    if (!data.state) {
        errors.state = 'Please select a state';
        isValid = false;
    }

    // Validate Pincode
    const pincodeValidation = validatePincode(data.pincode);
    if (!pincodeValidation.isValid) {
        errors.pincode = Object.values(pincodeValidation.errors)[0];
        isValid = false;
    }

    return { isValid, errors };
};

/**
 * Validate employment form
 */
export const validateEmploymentForm = (data: Record<string, any>): ValidationResult => {
    const errors: Record<string, string> = {};
    let isValid = true;

    // Validate employment type
    if (!data.employmentType) {
        errors.employmentType = 'Please select employment type';
        isValid = false;
    }

    // Validate company name for salaried employees
    if (data.employmentType === 'SALARIED' && (!data.companyName || data.companyName.trim().length < 2)) {
        errors.companyName = 'Company name is required';
        isValid = false;
    }

    // Validate monthly income
    if (!data.monthlyIncome || data.monthlyIncome < 25000) {
        errors.monthlyIncome = 'Minimum monthly income required is ₹25,000';
        isValid = false;
    }

    return { isValid, errors };
};
