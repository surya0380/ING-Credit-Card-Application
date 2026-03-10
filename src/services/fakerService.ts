import { faker } from '@faker-js/faker/locale/en_IN';
import type { Customer, KYCDetails, EmploymentDetails, IncomeDetails, CreditCardApplication } from '../types';
import { generateCustomerId, generateApplicationId } from '../utils/helpers';

/**
 * Generate fake customer data
 */
export const generateFakeCustomer = (phoneNumber: string): Customer => {
    return {
        id: generateCustomerId(),
        phoneNumber,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
};

/**
 * Generate fake KYC details
 */
export const generateFakeKYCDetails = (): KYCDetails => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
        pan: generateFakePAN(),
        panName: `${firstName} ${lastName}`,
        dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString(),
        gender: faker.helpers.arrayElement(['M', 'F', 'O']) as 'M' | 'F' | 'O',
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.helpers.arrayElement([
            'Andhra Pradesh',
            'Arunachal Pradesh',
            'Assam',
            'Bihar',
            'Chhattisgarh',
            'Delhi',
            'Goa',
            'Gujarat',
            'Haryana',
            'Himachal Pradesh',
            'Jharkhand',
            'Karnataka',
            'Kerala',
            'Madhya Pradesh',
            'Maharashtra',
            'Manipur',
            'Meghalaya',
            'Mizoram',
            'Nagaland',
            'Odisha',
            'Punjab',
            'Rajasthan',
            'Sikkim',
            'Tamil Nadu',
            'Telangana',
            'Tripura',
            'Uttar Pradesh',
            'Uttarakhand',
            'West Bengal',
        ]),
        pincode: faker.location.zipCode('######'),
        motherName: faker.person.firstName(),
        panVerified: false,
    };
};

/**
 * Generate fake PAN
 */
const generateFakePAN = (): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const panLetters = letters.substring(0, 5);
    const pType = 'ACPHBGLFJPT'[Math.floor(Math.random() * 10)]; // Personal type
    const serialNum = Math.random().toString().substring(2, 6).padStart(4, '0');
    const checkDigit = letters[Math.floor(Math.random() * 26)];

    return (
        panLetters
            .split('')
            .map(() => panLetters[Math.floor(Math.random() * panLetters.length)])
            .join('') +
        pType +
        panLetters[Math.floor(Math.random() * panLetters.length)] +
        serialNum +
        checkDigit
    ).toUpperCase();
};

/**
 * Generate fake employment details
 */
export const generateFakeEmploymentDetails = (): EmploymentDetails => {
    const employmentType = faker.helpers.arrayElement([
        'SALARIED',
        'SELF_EMPLOYED',
        'UNEMPLOYED',
    ]) as 'SALARIED' | 'SELF_EMPLOYED' | 'UNEMPLOYED';

    const yearsOfExperience = Math.floor(Math.random() * 20) + 1;
    const monthlyIncome = Math.floor(Math.random() * 200000) + 50000; // 50k to 250k

    return {
        employmentType,
        companyName: employmentType !== 'SELF_EMPLOYED' ? faker.company.name() : undefined,
        designation: faker.person.jobTitle(),
        yearsOfExperience,
        monthlyIncome,
        annualIncome: monthlyIncome * 12,
        companyAddress: faker.location.streetAddress(),
    };
};

/**
 * Generate fake income details
 */
export const generateFakeIncomeDetails = (): IncomeDetails => {
    const monthlyIncome = Math.floor(Math.random() * 200000) + 50000; // 50k to 250k

    return {
        annualIncome: monthlyIncome * 12,
        monthlyIncome,
        incomeSources: ['Salary', 'Rental Income'],
        salaryProof: 'Uploaded',
    };
};

/**
 * Generate fake credit card application
 */
export const generateFakeCreditCardApplication = (
    phoneNumber: string,
    customerId: string
): CreditCardApplication => {
    const applicationId = generateApplicationId();
    const kycDetails = generateFakeKYCDetails();
    const employmentDetails = generateFakeEmploymentDetails();
    const incomeDetails = generateFakeIncomeDetails();

    return {
        applicationId,
        customerId,
        phoneNumber,
        status: 'DRAFT',
        step: 1,
        applicationDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        kycDetails,
        employmentDetails,
        incomeDetails,
        cardProduct: {
            name: 'Premium Credit Card',
            type: 'CREDIT_CARD',
            annualFee: 499,
            benefits: [
                'Cashback on all spends',
                'Free airport lounge access',
                'Insurance coverage',
                'Reward points',
            ],
        },
    };
};

/**
 * Generate list of available credit card products
 */
export const getAvailableCreditCards = () => {
    return [
        {
            id: 'platinum',
            name: 'Platinum Card',
            description: 'Premium card with exceptional benefits',
            annualFee: 999,
            benefits: [
                'Cashback on all spends',
                'Free airport lounge access',
                'Complimentary travel insurance',
                'Reward points at 5x rate',
                'Priority customer service',
            ],
            minIncome: 600000, // 6 LPA
            maxCreditLimit: 500000,
        },
        {
            id: 'gold',
            name: 'Gold Card',
            description: 'Great card for everyday spending',
            annualFee: 499,
            benefits: [
                'Cashback on select categories',
                'Free airport lounge access (4x per year)',
                'Reward points at 3x rate',
                'Fuel surcharge waiver',
            ],
            minIncome: 400000, // 4 LPA
            maxCreditLimit: 300000,
        },
        {
            id: 'classic',
            name: 'Classic Card',
            description: 'Perfect for building credit',
            annualFee: 0,
            benefits: [
                'Cashback on select spends',
                'Reward points at 1x rate',
                'Fuel surcharge waiver',
                'Basic travel insurance',
            ],
            minIncome: 300000, // 3 LPA
            maxCreditLimit: 200000,
        },
    ];
};

/**
 * Get Indian states
 */
export const getIndianStates = () => {
    return [
        'Andhra Pradesh',
        'Arunachal Pradesh',
        'Assam',
        'Bihar',
        'Chhattisgarh',
        'Delhi',
        'Goa',
        'Gujarat',
        'Haryana',
        'Himachal Pradesh',
        'Jharkhand',
        'Karnataka',
        'Kerala',
        'Madhya Pradesh',
        'Maharashtra',
        'Manipur',
        'Meghalaya',
        'Mizoram',
        'Nagaland',
        'Odisha',
        'Punjab',
        'Rajasthan',
        'Sikkim',
        'Tamil Nadu',
        'Telangana',
        'Tripura',
        'Uttar Pradesh',
        'Uttarakhand',
        'West Bengal',
    ];
};

/**
 * Get employment types
 */
export const getEmploymentTypes = () => {
    return [
        { label: 'Salaried', value: 'SALARIED' },
        { label: 'Self Employed', value: 'SELF_EMPLOYED' },
        { label: 'Student', value: 'STUDENT' },
        { label: 'Unemployed', value: 'UNEMPLOYED' },
    ];
};
