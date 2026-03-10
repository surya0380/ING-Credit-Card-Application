/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Space,
    message,
    Alert,
    Row,
    Col,
    Typography,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAuth } from '../hooks/useRedux';
import { loginCustomer } from '../slices/authSlice';
import { sendOTP, verifyOTP, getDemoOTP } from '../services/otpService';
import { validatePhoneNumber } from '../utils/validation';
import { hasExistingApplication, getSampleApplication, getAllSamplePhoneNumbers } from '../services/sampleDataService';
import { setCurrentApplication, initializeApplication } from '../slices/applicationSlice';
import './LoginPage.css';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { loading, error, isAuthenticated } = useAuth();

    const [form] = Form.useForm();
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [demoOTP, setDemoOTP] = useState<string | null>(null);
    const [showDemo, setShowDemo] = useState(false);
    const [otpLocked, setOtpLocked] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (otpTimer > 0) {
            const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [otpTimer]);

    const handleSendOTP = async (values: { phoneNumber: string }) => {
        const validation = validatePhoneNumber(values.phoneNumber);
        if (!validation.isValid) {
            form.setFields([
                {
                    name: 'phoneNumber',
                    errors: Object.values(validation.errors),
                },
            ]);
            return;
        }

        setOtpLoading(true);
        try {
            const result = await sendOTP(values.phoneNumber);
            if (result.success) {
                message.success('OTP sent successfully');
                setPhoneNumber(values.phoneNumber);
                setStep('otp');
                setOtpTimer(300);
                setOtpLocked(false);

                const demo = getDemoOTP(values.phoneNumber);
                if (demo) {
                    setDemoOTP(demo);
                    setShowDemo(true);
                }
            } else {
                message.error(result.message);
            }
        } catch {
            message.error('Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOTP = async (values: { otp: string }) => {
        setOtpLoading(true);
        try {
            const result = await verifyOTP(phoneNumber, values.otp);

            if (result.locked) {
                setOtpLocked(true);
            }

            if (result.success) {
                message.success('OTP verified');
                const loginResult = await dispatch(loginCustomer({ phoneNumber, otp: values.otp }));

                if (hasExistingApplication(phoneNumber)) {
                    const sampleData = getSampleApplication(phoneNumber);
                    if (sampleData) {
                        // @ts-expect-error Redux sync reducer type quirk
                        dispatch(setCurrentApplication(sampleData.application));
                        navigate('/dashboard');
                    }
                } else {
                    const userId = (loginResult.payload as any)?.customerId || '';
                    const initResult = await dispatch(
                        initializeApplication({
                            customerId: userId,
                            phoneNumber,
                        })
                    );

                    if (initResult.payload) {
                        dispatch(setCurrentApplication((initResult.payload as any).application));
                        navigate('/application/kyc');
                    }
                }
            } else {
                message.error(result.message);
            }
        } catch {
            message.error('Failed to verify OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setOtpLoading(true);
        try {
            const result = await sendOTP(phoneNumber);
            if (result.success) {
                message.success('OTP resent');
                setOtpTimer(300);
                setOtpLocked(false);
                form.resetFields();

                const demo = getDemoOTP(phoneNumber);
                if (demo) {
                    setDemoOTP(demo);
                }
            } else {
                message.error(result.message);
            }
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <div className="login-page">
            <Row gutter={32} className="login-container">
                <Col xs={24} sm={24} md={12} className="login-info">
                    <div className="info-content">
                        <Title level={2}>Credit Card Application</Title>
                        <Text>Fast and secure online application process</Text>

                        <div className="features-list">
                            <div className="feature-item">Instant eligibility check</div>
                            <div className="feature-item">Secure application</div>
                            <div className="feature-item">Quick approval process</div>
                            <div className="feature-item">Exclusive card benefits</div>
                        </div>

                        <div className="demo-numbers">
                            <Text type="secondary" className="demo-title">Test with these phone numbers:</Text>
                            <div className="number-list">
                                {getAllSamplePhoneNumbers().map((num) => (
                                    <div key={num} className="number-item">{num}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Col>

                <Col xs={24} sm={24} md={12} className="login-form-wrapper">
                    <Card className="login-card">
                        {error && <Alert message={error} type="error" closable style={{ marginBottom: 16 }} />}

                        {step === 'phone' ? (
                            <PhoneLoginForm
                                form={form}
                                loading={otpLoading || loading}
                                onSubmit={handleSendOTP}
                            />
                        ) : (
                            <OTPVerificationForm
                                form={form}
                                loading={otpLoading || loading}
                                phoneNumber={phoneNumber}
                                otpTimer={otpTimer}
                                demoOTP={demoOTP}
                                showDemo={showDemo}
                                otpLocked={otpLocked}
                                onVerify={handleVerifyOTP}
                                onResend={handleResendOTP}
                                onChangePhone={() => {
                                    setStep('phone');
                                    setPhoneNumber('');
                                    setDemoOTP(null);
                                    setOtpLocked(false);
                                    form.resetFields();
                                }}
                            />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

interface PhoneLoginFormProps {
    form: any;
    loading: boolean;
    onSubmit: (values: any) => Promise<void> | void;
}

const PhoneLoginForm: React.FC<PhoneLoginFormProps> = ({ form, loading, onSubmit }) => {
    return (
        <div>
            <Title level={3}>Login</Title>
            <Text type="secondary">Enter your 10-digit phone number</Text>

            <Form form={form} layout="vertical" onFinish={onSubmit} style={{ marginTop: 24 }}>
                <Form.Item
                    name="phoneNumber"
                    label="Phone Number"
                    rules={[
                        { required: true, message: 'Phone number is required' },
                        {
                            pattern: /^[6-9]\d{9}$/,
                            message: 'Invalid phone number',
                        },
                    ]}
                >
                    <Input
                        placeholder="10-digit number"
                        size="large"
                        maxLength={10}
                        disabled={loading}
                    />
                </Form.Item>

                <Button type="primary" size="large" block loading={loading} htmlType="submit">
                    Send OTP
                </Button>
            </Form>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    By continuing, you agree to our Terms of Service
                </Text>
            </div>
        </div>
    );
};

interface OTPVerificationFormProps {
    form: any;
    loading: boolean;
    phoneNumber: string;
    otpTimer: number;
    demoOTP: string | null;
    showDemo: boolean;
    otpLocked: boolean;
    onVerify: (values: any) => Promise<void> | void;
    onResend: () => void;
    onChangePhone: () => void;
}

const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({
    form,
    loading,
    phoneNumber,
    otpTimer,
    demoOTP,
    showDemo,
    otpLocked,
    onVerify,
    onResend,
    onChangePhone,
}) => {
    return (
        <div>
            <Title level={3}>Verify OTP</Title>
            <Text type="secondary">Enter the 6-digit code sent to {phoneNumber}</Text>

            {otpLocked && (
                <Alert
                    message="OTP Verification Locked"
                    description="Maximum verification attempts exceeded. Please request a new OTP."
                    type="error"
                    style={{ marginTop: 16, marginBottom: 16 }}
                    showIcon
                />
            )}

            {showDemo && demoOTP && !otpLocked && (
                <Alert
                    message={`Demo OTP: ${demoOTP}`}
                    type="info"
                    style={{ marginTop: 16, marginBottom: 16 }}
                    closable
                />
            )}

            <Form form={form} layout="vertical" onFinish={onVerify} style={{ marginTop: 24 }}>
                <Form.Item
                    name="otp"
                    label="One Time Password"
                    rules={[
                        { required: true, message: 'OTP is required' },
                        { len: 6, message: 'OTP must be 6 digits' },
                        { pattern: /^\d+$/, message: 'OTP must contain only numbers' },
                    ]}
                >
                    <Input
                        placeholder="Enter 6-digit OTP"
                        size="large"
                        maxLength={6}
                        disabled={loading || otpLocked}
                        type="number"
                    />
                </Form.Item>

                <Button
                    type="primary"
                    size="large"
                    block
                    loading={loading}
                    htmlType="submit"
                    disabled={otpLocked}
                >
                    Verify
                </Button>
            </Form>

            <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
                <Button
                    type="link"
                    block
                    disabled={otpTimer > 0 || loading || otpLocked}
                    onClick={onResend}
                >
                    {otpLocked ? 'Request New OTP' : otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                </Button>
                <Button type="link" block onClick={onChangePhone}>
                    Change phone number
                </Button>
            </Space>
        </div>
    );
};

export default LoginPage;
