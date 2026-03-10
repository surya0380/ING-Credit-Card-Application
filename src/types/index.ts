/**
 * User/Customer Types
 */
export interface Customer {
    id: string;
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    dateOfBirth?: string;
    pan?: string;
    kyc?: KYCDetails;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * KYC (Know Your Customer) Details
 */
export interface KYCDetails {
    pan: string;
    panName: string;
    dateOfBirth: string;
    gender: 'M' | 'F' | 'O';
    address: string;
    city: string;
    state: string;
    pincode: string;
    motherName?: string;
    panVerified?: boolean;
    verificationDate?: string;
}

/**
 * Employment Details
 */
export interface EmploymentDetails {
    employmentType: 'SALARIED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'STUDENT';
    companyName?: string;
    designation?: string;
    yearsOfExperience?: number;
    monthlyIncome: number;
    annualIncome: number;
    companyAddress?: string;
}

/**
 * Income Details
 */
export interface IncomeDetails {
    annualIncome: number;
    monthlyIncome: number;
    incomeSources: string[];
    salaryProof?: string;
}

/**
 * Eligibility Check Result
 */
export interface EligibilityCheckResult {
    eligible: boolean;
    reason?: string;
    failedChecks: string[];
    minIncomeRequired: number;
    loanEligibility?: {
        maxCreditLimit: number;
        recommendedCreditLimit: number;
    };
}

/**
 * Risk Check Result
 */
export interface RiskCheckResult {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    creditScore: number;
    existingDebt: number;
    debtToIncomeRatio: number;
    riskFlags: string[];
    recommendedAction: 'AUTO_APPROVE' | 'REVIEW' | 'AUTO_REJECT';
}

/**
 * Credit Card Application
 */
export interface CreditCardApplication {
    applicationId: string;
    customerId: string;
    phoneNumber: string;
    status: 'DRAFT' | 'SUBMITTED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
    step: number; // 1: Login, 2: Pan/KYC, 3: Employment, 4: Income, 5: Review, 6: Confirmation
    customerDetails?: Customer;
    kycDetails?: KYCDetails;
    employmentDetails?: EmploymentDetails;
    incomeDetails?: IncomeDetails;
    eligibilityCheck?: EligibilityCheckResult;
    riskCheck?: RiskCheckResult;
    cardProduct?: {
        name: string;
        type: string;
        annualFee: number;
        benefits: string[];
    };
    applicationDate: string;
    submissionDate?: string;
    decisionDate?: string;
    decision?: 'APPROVED' | 'REJECTED' | 'PENDING';
    reasonForRejection?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    expiresAt?: string; // For draft applications that expire after certain time
}

/**
 * OTP Request/Response
 */
export interface OTPRequest {
    phoneNumber: string;
    type: 'LOGIN' | 'VERIFICATION';
}

export interface OTPVerification {
    phoneNumber: string;
    otp: string;
    type: 'LOGIN' | 'VERIFICATION';
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        field?: string;
    };
    timestamp: string;
}

/**
 * Session State
 */
export interface SessionState {
    isLoggedIn: boolean;
    customerId?: string;
    phoneNumber?: string;
    applicationId?: string;
    sessionToken?: string;
    expiresAt?: number;
}

/**
 * Authentication State
 */
export interface AuthState {
    isAuthenticated: boolean;
    currentCustomer?: Customer;
    loading: boolean;
    error?: string;
    session?: SessionState;
}

/**
 * Application State
 */
export interface ApplicationState {
    currentApplication?: CreditCardApplication;
    draftApplications: CreditCardApplication[];
    submittedApplications: CreditCardApplication[];
    loading: boolean;
    error?: string;
    success?: boolean;
    successMessage?: string;
}

/**
 * Validation Result
 */
export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
    warnings?: Record<string, string>;
}

/**
 * Notification
 */
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
    timestamp: number;
}
