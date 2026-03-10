import React from 'react';
import { Steps } from 'antd';
import {
    PhoneOutlined,
    IdcardOutlined,
    BankOutlined,
    DollarOutlined,
    CheckOutlined,
    FileTextOutlined,
} from '@ant-design/icons';

interface ApplicationStepperProps {
    currentStep: number;
}

export const ApplicationStepper: React.FC<ApplicationStepperProps> = ({ currentStep }) => {
    const steps = [
        {
            title: 'Login',
            description: 'Phone & OTP',
            icon: <PhoneOutlined />,
        },
        {
            title: 'KYC',
            description: 'PAN & Personal Details',
            icon: <IdcardOutlined />,
        },
        {
            title: 'Employment',
            description: 'Job & Experience',
            icon: <BankOutlined />,
        },
        {
            title: 'Income',
            description: 'Monthly & Annual Income',
            icon: <DollarOutlined />,
        },
        {
            title: 'Review',
            description: 'Verification & Eligibility',
            icon: <FileTextOutlined />,
        },
        {
            title: 'Confirmation',
            description: 'Application Created',
            icon: <CheckOutlined />,
        },
    ];

    return (
        <div className="stepper-container">
            <Steps
                current={currentStep - 1}
                items={steps.map((step) => ({
                    title: step.title,
                    description: step.description,
                    icon: step.icon,
                }))}
                responsive
            />
        </div>
    );
};

export default ApplicationStepper;
