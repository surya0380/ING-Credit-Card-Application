/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ApplicationState, CreditCardApplication } from '../types';
import { validatePAN } from '../utils/validation';
import { generateApplicationId } from '../utils/helpers';

const initialState: ApplicationState = {
  currentApplication: undefined,
  draftApplications: [],
  submittedApplications: [],
  loading: false,
  error: undefined,
  success: false,
};

/**
 * Async thunk to create or fetch existing application
 */
export const initializeApplication = createAsyncThunk(
  'application/initialize',
  async (
    { customerId, phoneNumber }: { customerId: string; phoneNumber: string },
    { rejectWithValue }
  ) => {
    try {
      // Check if previous draft exists in localStorage
      const savedDrafts = localStorage.getItem(`drafts_${customerId}`);
      if (savedDrafts) {
        try {
          const drafts = JSON.parse(savedDrafts) as CreditCardApplication[];
          const existingDraft = drafts.find((app) => app.status === 'DRAFT');
          if (existingDraft) {
            return { application: existingDraft, isNew: false };
          }
        } catch {
          // Invalid JSON, continue with new application
        }
      }

      // Create new application
      const newApplication: CreditCardApplication = {
        applicationId: generateApplicationId(),
        customerId,
        phoneNumber,
        status: 'DRAFT',
        step: 2,
        applicationDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      };

      return { application: newApplication, isNew: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize application';
      return rejectWithValue(message);
    }
  }
);

/**
 * Async thunk to validate and process KYC
 */
export const validateAndProcessKYC = createAsyncThunk(
  'application/validateKYC',
  async (
    { applicationId, customerData }: any,
    { rejectWithValue }
  ) => {
    try {
      // Validate PAN
      const panValidation = validatePAN(customerData.pan);
      if (!panValidation.isValid) {
        return rejectWithValue('Invalid PAN format');
      }

      // Mock API call to verify PAN
      // In production: await api.post('/kyc/verify-pan', { pan: customerData.pan })

      // Simulate minor processing delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        applicationId,
        kycDetails: customerData,
        verified: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'KYC validation failed';
      return rejectWithValue(message);
    }
  }
);

/**
 * Async thunk for eligibility check
 */
export const checkEligibility = createAsyncThunk(
  'application/checkEligibility',
  async (
    { applicationId, incomeDetails }: any,
    { rejectWithValue }
  ) => {
    try {
      // Mock eligibility check
      // In production: await api.post('/eligibility/check', { incomeDetails })

      const minIncomeRequired = 300000; // 3 lakh per annum
      const annualIncome = incomeDetails.annualIncome;

      const eligibilityResult = {
        eligible: annualIncome >= minIncomeRequired,
        minIncomeRequired,
        failedChecks: annualIncome < minIncomeRequired ? ['Minimum income requirement'] : [],
        loanEligibility: {
          maxCreditLimit: Math.min(annualIncome * 0.5, 500000), // 50% of income, max 5 lakh
          recommendedCreditLimit: annualIncome * 0.25, // 25% of income
        },
      };

      return {
        applicationId,
        eligibilityCheck: eligibilityResult,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eligibility check failed';
      return rejectWithValue(message);
    }
  }
);

/**
 * Async thunk for risk check
 */
export const performRiskCheck = createAsyncThunk(
  'application/performRiskCheck',
  async (
    { applicationId, customerData }: any,
    { rejectWithValue }
  ) => {
    try {
      // Mock risk check
      // In production: await api.post('/risk/evaluate', { customerData })

      // Generate random credit score between 600-850
      const creditScore = Math.floor(Math.random() * 250) + 600;
      const existingDebt = Math.random() * 500000; // Random debt up to 5 lakh
      const monthlyIncome = customerData.incomeDetails?.monthlyIncome || 50000;
      const debtToIncomeRatio = (existingDebt / (monthlyIncome * 12)) * 100;

      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
      let recommendedAction: 'AUTO_APPROVE' | 'REVIEW' | 'AUTO_REJECT' = 'REVIEW';

      if (creditScore >= 750 && debtToIncomeRatio < 30) {
        riskLevel = 'LOW';
        recommendedAction = 'AUTO_APPROVE';
      } else if (creditScore < 650 || debtToIncomeRatio > 60) {
        riskLevel = 'HIGH';
        recommendedAction = 'AUTO_REJECT';
      }

      const riskCheckResult = {
        riskLevel,
        creditScore,
        existingDebt,
        debtToIncomeRatio: parseFloat(debtToIncomeRatio.toFixed(2)),
        riskFlags:
          creditScore < 700 ? ['Low credit score'] :
            debtToIncomeRatio > 50 ? ['High debt to income ratio'] : [],
        recommendedAction,
      };

      return {
        applicationId,
        riskCheck: riskCheckResult,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Risk check failed';
      return rejectWithValue(message);
    }
  }
);

/**
 * Async thunk to submit application
 */
export const submitApplication = createAsyncThunk(
  'application/submit',
  async (applicationId: string, { rejectWithValue }) => {
    try {
      // In production: await api.post(`/applications/${applicationId}/submit`)

      // Simulate submission delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        applicationId,
        status: 'SUBMITTED',
        submissionDate: new Date().toISOString(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit application';
      return rejectWithValue(message);
    }
  }
);

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    updateApplicationStep: (
      state: ApplicationState,
      action: any

    ): any => {
      if (state.currentApplication && state.currentApplication.applicationId === action.payload.applicationId) {
        state.currentApplication.step = action.payload.step;
        Object.assign(state.currentApplication, action.payload.data);
        state.currentApplication.updatedAt = new Date().toISOString();
        saveApplicationToDraft(state.currentApplication);
      }
    },
    setCurrentApplication: (state: ApplicationState, action: any) => {
      state.currentApplication = action.payload;
    },
    clearApplication: (state: ApplicationState) => {
      state.currentApplication = undefined;
      state.error = undefined;
      state.success = false;
    },
    clearError: (state: ApplicationState) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder: any) => {
    // Initialize Application
    builder
      .addCase(initializeApplication.pending, (state: any) => {
        state.loading = true;
      })
      .addCase(initializeApplication.fulfilled, (state: any, action: any) => {
        state.loading = false;
        state.currentApplication = action.payload.application;
      })
      .addCase(initializeApplication.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Validate KYC
    builder
      .addCase(validateAndProcessKYC.pending, (state: any) => {
        state.loading = true;
      })
      .addCase(validateAndProcessKYC.fulfilled, (state: any, action: any) => {
        state.loading = false;
        if (state.currentApplication) {
          state.currentApplication.kycDetails = action.payload.kycDetails;
          state.currentApplication.step = 3;
          state.currentApplication.updatedAt = new Date().toISOString();
          saveApplicationToDraft(state.currentApplication);
        }
      })
      .addCase(validateAndProcessKYC.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Check Eligibility
    builder
      .addCase(checkEligibility.pending, (state: any) => {
        state.loading = true;
      })
      .addCase(checkEligibility.fulfilled, (state: any, action: any) => {
        state.loading = false;
        if (state.currentApplication) {
          state.currentApplication.eligibilityCheck = action.payload.eligibilityCheck;
          saveApplicationToDraft(state.currentApplication);
        }
      })
      .addCase(checkEligibility.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Perform Risk Check
    builder
      .addCase(performRiskCheck.pending, (state: any) => {
        state.loading = true;
      })
      .addCase(performRiskCheck.fulfilled, (state: any, action: any) => {
        state.loading = false;
        if (state.currentApplication) {
          state.currentApplication.riskCheck = action.payload.riskCheck;
          state.currentApplication.step = 5;
          saveApplicationToDraft(state.currentApplication);
        }
      })
      .addCase(performRiskCheck.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Submit Application
    builder
      .addCase(submitApplication.pending, (state: any) => {
        state.loading = true;
      })
      .addCase(submitApplication.fulfilled, (state: any, action: any) => {
        state.loading = false;
        state.success = true;
        state.successMessage = 'Application submitted successfully!';
        if (state.currentApplication) {
          state.currentApplication.status = 'SUBMITTED';
          state.currentApplication.submissionDate = action.payload.submissionDate;
          state.currentApplication.step = 6;
        }
      })
      .addCase(submitApplication.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  updateApplicationStep,
  setCurrentApplication,
  clearApplication,
  clearError,
} = applicationSlice.actions;

export default applicationSlice.reducer;

/**
 * Helper function to save application draft to localStorage
 */
function saveApplicationToDraft(application: CreditCardApplication) {
  try {
    const draftKey = `drafts_${application.customerId}`;
    const existing = localStorage.getItem(draftKey);
    const drafts = existing ? JSON.parse(existing) : [];
    const index = drafts.findIndex((app: CreditCardApplication) => app.applicationId === application.applicationId);

    if (index >= 0) {
      drafts[index] = application;
    } else {
      drafts.push(application);
    }

    localStorage.setItem(draftKey, JSON.stringify(drafts));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}
