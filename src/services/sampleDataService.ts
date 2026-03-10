import type { CreditCardApplication, Customer } from '../types';

interface SampleUserData {
    customer: Customer;
    application: CreditCardApplication;
}

const sampleUsers: Record<string, SampleUserData> = {
    '9876543210': {
        customer: {
            id: 'cust_001',
            phoneNumber: '9876543210',
            firstName: 'Rajesh',
            lastName: 'Kumar',
            email: 'rajesh.kumar@email.com',
            dateOfBirth: '1985-05-15',
            pan: 'AAAP5055K',
            createdAt: '2025-01-10',
        },
        application: {
            applicationId: 'APP_2025_001',
            customerId: 'cust_001',
            phoneNumber: '9876543210',
            status: 'DRAFT',
            step: 2,
            applicationDate: '2025-01-10',
            createdAt: '2025-01-10',
            updatedAt: '2025-02-20',
        },
    },
    '9123456789': {
        customer: {
            id: 'cust_002',
            phoneNumber: '9123456789',
            firstName: 'Priya',
            lastName: 'Singh',
            email: 'priya.singh@email.com',
            dateOfBirth: '1990-08-22',
            pan: 'BBBS2234M',
            createdAt: '2025-01-05',
        },
        application: {
            applicationId: 'APP_2025_002',
            customerId: 'cust_002',
            phoneNumber: '9123456789',
            status: 'DRAFT',
            step: 2,
            applicationDate: '2025-01-05',
            createdAt: '2025-01-05',
            updatedAt: '2025-02-18',
        },
    },
    '9654321098': {
        customer: {
            id: 'cust_003',
            phoneNumber: '9654321098',
            firstName: 'Amit',
            lastName: 'Patel',
            email: 'amit.patel@email.com',
            dateOfBirth: '1988-03-10',
            pan: 'CCCC3456P',
            createdAt: '2024-12-28',
        },
        application: {
            applicationId: 'APP_2025_003',
            customerId: 'cust_003',
            phoneNumber: '9654321098',
            status: 'DRAFT',
            step: 2,
            applicationDate: '2024-12-28',
            createdAt: '2024-12-28',
            updatedAt: '2025-02-22',
        },
    },
};

export const getSampleApplication = (phoneNumber: string): SampleUserData | null => {
    return sampleUsers[phoneNumber] || null;
};

export const hasExistingApplication = (phoneNumber: string): boolean => {
    return phoneNumber in sampleUsers;
};

export const getAllSamplePhoneNumbers = (): string[] => {
    return Object.keys(sampleUsers);
};
