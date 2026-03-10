/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
    Layout,
    Card,
    Form,
    Input,
    Select,
    Button,
    Space,
    Row,
    Col,
    message,
    Alert,
    DatePicker,
    Divider,
    Statistic,
    Steps,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useApplication } from '../hooks/useRedux';
import { updateApplicationStep } from '../slices/applicationSlice';
import { validateKYCForm, validatePAN } from '../utils/validation';
import { getIndianStates } from '../services/fakerService';
import HeaderComponent from '../components/Header';
import dayjs from 'dayjs';
import './FormPages.css';

const { Content } = Layout;

type KYCStep = 'pan-verification' | 'credit-check' | 'eligibility' | 'personal-details';

interface CreditCheckResult {
    creditScore: number;
    eligible: boolean;
    message: string;
}

export const KYCPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentApplication } = useApplication();
    const [form] = Form.useForm();
    const [kycStep, setKycStep] = useState<KYCStep>('pan-verification');
    const [loading, setLoading] = useState(false);
    const [creditResult, setCreditResult] = useState<CreditCheckResult | null>(null);
    const [panData, setPanData] = useState<any>(null);
    useEffect(() => {
        if (!currentApplication) {
            navigate('/login');
        }
    }, [currentApplication, navigate]);

    const simulatePANVerification = async (pan: string): Promise<any> => {
        setLoading(true);
        try {
            const panValidation = validatePAN(pan);
            if (!panValidation.isValid) {
                throw new Error('Invalid PAN format');
            }

            await new Promise((resolve) => setTimeout(resolve, 2000));

            const verified = Math.random() > 0.1;
            if (!verified) {
                throw new Error('PAN not found in records');
            }

            const upperPan = pan.toUpperCase();
            const panName = form.getFieldValue('panName');
            if (!panName) {
                throw new Error('Please enter name as per PAN');
            }

            return {
                pan: upperPan,
                panName: panName,
                verified: true,
            };
        } finally {
            setLoading(false);
        }
    };

    const generateCreditScore = (): CreditCheckResult => {
        const dob = form.getFieldValue('dateOfBirth');
        const dobDate = dob ? new Date(dob) : new Date();
        const age = new Date().getFullYear() - dobDate.getFullYear();

        let baseScore = 650;
        if (age < 25) baseScore -= 50;
        if (age > 60) baseScore -= 30;

        const variance = Math.random() * 150 - 75;
        const creditScore = Math.min(850, Math.max(300, Math.round(baseScore + variance)));

        const eligible = creditScore >= 600;

        return {
            creditScore,
            eligible,
            message: eligible
                ? `Congratulations! Your credit score is ${creditScore}. You are eligible to apply for our credit card.`
                : `Your credit score is ${creditScore}. Unfortunately, you do not meet the minimum eligibility criteria of 600.`,
        };
    };

    const handlePANVerification = async () => {
        const pan = form.getFieldValue('pan');
        const panName = form.getFieldValue('panName');

        if (!pan || !panName) {
            message.error('Please fill PAN and name as per PAN');
            return;
        }

        try {
            setLoading(true);
            message.loading('Verifying PAN and checking eligibility...');

            const panResult = await simulatePANVerification(pan);
            setPanData(panResult);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            const creditResult = generateCreditScore();
            setCreditResult(creditResult);

            setKycStep('credit-check');
            message.destroy();
            message.success('Verification complete. Here is your eligibility status.');
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'PAN verification failed';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handlePersonalDetailsSubmit = async (values: any) => {
        // Convert dayjs object to string for validation
        // Include verified PAN data since Step 3 doesn't have those fields
        const validationValues = {
            pan: panData?.pan || form.getFieldValue('pan'),
            panName: panData?.panName || form.getFieldValue('panName'),
            ...values,
            dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
        };

        const validation = validateKYCForm(validationValues);
        if (!validation.isValid) {
            Object.keys(validation.errors).forEach((key) => {
                form.setFields([
                    {
                        name: key,
                        errors: [validation.errors[key]],
                    },
                ]);
            });
            return;
        }

        if (!currentApplication) return;

        const kycData = {
            pan: (panData?.pan || values.pan).toUpperCase(),
            panName: panData?.panName || values.panName,
            dateOfBirth: validationValues.dateOfBirth,
            gender: values.gender,
            address: values.address,
            city: values.city,
            state: values.state,
            pincode: values.pincode,
            motherName: values.motherName || '',
            panVerified: true,
            verificationDate: new Date().toISOString().split('T')[0],
        };

        setLoading(true);
        try {
            const payload = {
                applicationId: currentApplication.applicationId,
                step: 3,
                data: { kycDetails: kycData },
            };
            // @ts-expect-error - Redux type handling
            dispatch(updateApplicationStep(payload));

            message.success('KYC completed successfully');

            setTimeout(() => {
                navigate('/application/employment');
            }, 1000);
        } finally {
            setLoading(false);
        }
    };

    if (!currentApplication) {
        return null;
    }

    const steps = [
        { title: 'PAN Verification', status: kycStep === 'pan-verification' ? 'process' : 'finish' as any },
        { title: 'Credit Check', status: kycStep === 'credit-check' ? 'process' : kycStep !== 'pan-verification' ? 'finish' : 'wait' as any },
        { title: 'Personal Details', status: kycStep === 'personal-details' ? 'process' : 'wait' as any },
    ];

    return (
        <Layout className="form-page">
            <HeaderComponent />
            <Content className="form-content">
                <div className="form-container">
                    <Card className="form-card">
                        <div className="form-header">
                            <h2>KYC Verification</h2>
                            <p>Complete verification to apply for credit card</p>
                        </div>

                        <div style={{ marginBottom: 32 }}>
                            <Steps current={kycStep === 'pan-verification' ? 0 : kycStep === 'credit-check' ? 1 : 2} items={steps} />
                        </div>

                        {kycStep === 'pan-verification' && (
                            <div className="kyc-section">
                                <h3>Step 1: PAN Verification</h3>
                                <Divider />
                                <Form form={form} layout="vertical">
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="pan"
                                                label="PAN (10 characters)"
                                                rules={[
                                                    { required: true, message: 'PAN is required' },
                                                    { len: 10, message: 'PAN must be 10 characters' },
                                                ]}
                                            >
                                                <Input placeholder="AAAPA5055K" maxLength={10} disabled={loading} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="panName"
                                                label="Name as per PAN"
                                                rules={[{ required: true, message: 'Name is required' }]}
                                            >
                                                <Input placeholder="Enter name as per PAN" disabled={loading} />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Alert
                                        message="PAN will be verified with NSDL (National Securities Depository Limited)"
                                        type="info"
                                        style={{ marginBottom: 16 }}
                                    />

                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={handlePANVerification}
                                        loading={loading}
                                        block
                                    >
                                        Verify PAN
                                    </Button>
                                </Form>
                            </div>
                        )}

                        {kycStep === 'credit-check' && (
                            <div className="kyc-section">
                                <h3>Step 2: Eligibility Status</h3>
                                <Divider />

                                {creditResult && (
                                    <>
                                        <Row gutter={16} style={{ marginBottom: 24 }}>
                                            <Col xs={24} sm={12}>
                                                <Card>
                                                    <Statistic
                                                        title="Credit Score"
                                                        value={creditResult.creditScore}
                                                        suffix="/ 850"
                                                        valueStyle={{ color: creditResult.eligible ? '#52c41a' : '#f5222d' }}
                                                    />
                                                </Card>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Card>
                                                    <Statistic
                                                        title="Eligibility"
                                                        value={creditResult.eligible ? 'Eligible' : 'Not Eligible'}
                                                        valueStyle={{ color: creditResult.eligible ? '#52c41a' : '#f5222d', fontSize: 20 }}
                                                    />
                                                </Card>
                                            </Col>
                                        </Row>

                                        <Alert
                                            message={creditResult.message}
                                            type={creditResult.eligible ? 'success' : 'error'}
                                            showIcon
                                            style={{ marginBottom: 24 }}
                                        />

                                        {creditResult.eligible && (
                                            <Button
                                                type="primary"
                                                size="large"
                                                onClick={() => setKycStep('personal-details')}
                                                block
                                            >
                                                Continue to Personal Details
                                            </Button>
                                        )}

                                        {!creditResult.eligible && (
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ color: '#f5222d', marginBottom: 16 }}>
                                                    You are currently not eligible for this credit card.
                                                </p>
                                                <Button type="primary" block onClick={() => navigate('/login')}>
                                                    Back to Login
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {kycStep === 'personal-details' && (
                            <div className="kyc-section">
                                <h3>Step 3: Personal Details</h3>
                                <Divider />

                                <Form form={form} layout="vertical" onFinish={handlePersonalDetailsSubmit}>
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true }]}>
                                                <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current.isAfter(dayjs().subtract(18, 'years'))} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                                                <Select placeholder="Select gender">
                                                    <Select.Option value="M">Male</Select.Option>
                                                    <Select.Option value="F">Female</Select.Option>
                                                    <Select.Option value="O">Other</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        name="motherName"
                                        label="Mother's Maiden Name (Optional)"
                                        rules={[{ required: false }]}
                                    >
                                        <Input placeholder="Enter mother's maiden name" />
                                    </Form.Item>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="address" label="Address" rules={[{ required: true }]}>
                                                <Input placeholder="Enter residential address" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="city" label="City" rules={[{ required: true }]}>
                                                <Input placeholder="Enter city" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="state" label="State" rules={[{ required: true }]}>
                                                <Select
                                                    placeholder="Select state"
                                                    allowClear
                                                    showSearch
                                                >
                                                    {getIndianStates().map((state) => (
                                                        <Select.Option key={state} value={state}>
                                                            {state}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="pincode"
                                                label="PIN Code"
                                                rules={[
                                                    { required: true, message: 'PIN code is required' },
                                                    { len: 6, message: 'PIN code must be 6 digits' },
                                                    { pattern: /^\d+$/, message: 'PIN code must contain only numbers' },
                                                ]}
                                            >
                                                <Input
                                                    placeholder="Enter 6-digit PIN code"
                                                    maxLength={6}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Space style={{ width: '100%', marginTop: 24 }}>
                                        <Button onClick={() => setKycStep('credit-check')}>Back</Button>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            Complete KYC
                                        </Button>
                                    </Space>
                                </Form>
                            </div>
                        )}
                    </Card>
                </div>
            </Content>
        </Layout>
    );
};

export default KYCPage;
