/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import {
    Layout,
    Card,
    Form,
    Button,
    Space,
    Row,
    Col,
    message,
    Spin,
    InputNumber,
    Checkbox,
    Typography,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useApplication } from '../hooks/useRedux';
import { updateApplicationStep, checkEligibility, performRiskCheck } from '../slices/applicationSlice';
import { ApplicationStepper } from '../components/ApplicationStepper';
import { formatCurrency } from '../utils/helpers';
import HeaderComponent from '../components/Header';
import './FormPages.css';

const { Content } = Layout;
const { Text } = Typography;

export const IncomeDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentApplication, loading } = useApplication();
    const [form] = Form.useForm();
    const [processing, setProcessing] = React.useState(false);

    useEffect(() => {
        if (!currentApplication) {
            navigate('/application');
            return;
        }

        // Pre-fill form if income details already entered
        if (currentApplication.incomeDetails) {
            form.setFieldsValue({
                annualIncome: currentApplication.incomeDetails.annualIncome,
                monthlyIncome: currentApplication.incomeDetails.monthlyIncome,
            });
        }
    }, [currentApplication, form, navigate]);

    const handleSubmit = async (values: any) => {
        if (!currentApplication) return;

        if (!values.annualIncome || values.annualIncome < 300000) {
            message.error('Minimum annual income must be ₹3,00,000');
            return;
        }

        if (!values.termsAccepted) {
            message.error('You must accept the terms and conditions');
            return;
        }

        setProcessing(true);
        try {
            const incomeData = {
                annualIncome: values.annualIncome,
                monthlyIncome: values.monthlyIncome || values.annualIncome / 12,
                incomeSources: ['Salary'],
            };

            // Save income details
            // @ts-expect-error Redux sync reducer type quirk
            dispatch(updateApplicationStep({
                applicationId: currentApplication.applicationId,
                step: 4,
                data: { incomeDetails: incomeData },
            }));

            message.loading('Checking eligibility and risk...');

            // Check eligibility
            await dispatch(
                checkEligibility({
                    applicationId: currentApplication.applicationId,
                    incomeDetails: incomeData,
                })
            );

            // Perform risk assessment
            await dispatch(
                performRiskCheck({
                    applicationId: currentApplication.applicationId,
                    customerData: {
                        incomeDetails: incomeData,
                        ...currentApplication,
                    },
                })
            );

            message.success('Income verified! Proceeding to review...');

            // Navigate to review
            setTimeout(() => {
                navigate('/application/review');
            }, 1500);
        } catch {
            message.error('Failed to process income details');
        } finally {
            setProcessing(false);
        }
    };

    const handleBack = () => {
        navigate('/application/employment');
    };

    return (
        <Layout className="form-page">
            <HeaderComponent />
            <Content className="form-content">
                <div className="form-container">
                    <Card className="form-card">
                        {/* Stepper */}
                        {currentApplication && (
                            <ApplicationStepper currentStep={currentApplication.step} />
                        )}

                        <div className="form-header">
                            <h2>Income Details</h2>
                            <p>Provide your income information for eligibility assessment</p>
                        </div>

                        {loading || processing ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <Spin size="large" tip="Processing your application..." />
                            </div>
                        ) : (
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleSubmit}
                            >
                                <div className="form-section">
                                    <h3>Annual & Monthly Income</h3>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="annualIncome"
                                                label="Annual Income (₹)"
                                                rules={[
                                                    { required: true, message: 'Annual income is required' },
                                                    {
                                                        type: 'number',
                                                        min: 300000,
                                                        message: 'Minimum annual income required is ₹3,00,000',
                                                    },
                                                ]}
                                            >
                                                <InputNumber
                                                    min={300000}
                                                    placeholder="Enter annual income"
                                                    style={{ width: '100%' }}
                                                    formatter={(value) =>
                                                        `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                                    }
                                                    onChange={(value) => {
                                                        if (value) {
                                                            form.setFieldValue('monthlyIncome', Math.round(value / 12));
                                                        }
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="monthlyIncome"
                                                label="Monthly Income (₹)"
                                            >
                                                <InputNumber
                                                    disabled
                                                    value={
                                                        form.getFieldValue('annualIncome')
                                                            ? Math.round(form.getFieldValue('annualIncome') / 12)
                                                            : 0
                                                    }
                                                    style={{ width: '100%' }}
                                                    formatter={(value) =>
                                                        `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                                    }
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>

                                <div className="form-section">
                                    <h3>Income Breakdown</h3>
                                    <div className="income-info">
                                        <Row gutter={[16, 16]}>
                                            <Col xs={12} sm={6}>
                                                <div className="income-box">
                                                    <Text type="secondary">Annual</Text>
                                                    <br />
                                                    <Text strong style={{ fontSize: 16 }}>
                                                        {formatCurrency(form.getFieldValue('annualIncome') || 0)}
                                                    </Text>
                                                </div>
                                            </Col>
                                            <Col xs={12} sm={6}>
                                                <div className="income-box">
                                                    <Text type="secondary">Monthly</Text>
                                                    <br />
                                                    <Text strong style={{ fontSize: 16 }}>
                                                        {formatCurrency(
                                                            Math.round((form.getFieldValue('annualIncome') || 0) / 12)
                                                        )}
                                                    </Text>
                                                </div>
                                            </Col>
                                            <Col xs={12} sm={6}>
                                                <div className="income-box">
                                                    <Text type="secondary">Max Credit</Text>
                                                    <br />
                                                    <Text strong style={{ fontSize: 16 }}>
                                                        {formatCurrency(
                                                            Math.min((form.getFieldValue('annualIncome') || 0) * 0.5, 500000)
                                                        )}
                                                    </Text>
                                                </div>
                                            </Col>
                                            <Col xs={12} sm={6}>
                                                <div className="income-box">
                                                    <Text type="secondary">Recommended</Text>
                                                    <br />
                                                    <Text strong style={{ fontSize: 16 }}>
                                                        {formatCurrency((form.getFieldValue('annualIncome') || 0) * 0.25)}
                                                    </Text>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3>Terms & Conditions</h3>
                                    <Form.Item
                                        name="termsAccepted"
                                        valuePropName="checked"
                                        rules={[
                                            {
                                                validator: (_, value) =>
                                                    value
                                                        ? Promise.resolve()
                                                        : Promise.reject(
                                                            new Error('You must accept the terms and conditions')
                                                        ),
                                            },
                                        ]}
                                    >
                                        <Checkbox>
                                            I agree to the{' '}
                                            <a href="#" onClick={(e) => e.preventDefault()}>
                                                terms and conditions
                                            </a>{' '}
                                            and{' '}
                                            <a href="#" onClick={(e) => e.preventDefault()}>
                                                privacy policy
                                            </a>
                                        </Checkbox>
                                    </Form.Item>
                                </div>

                                {/* Form Actions */}
                                <div className="form-actions">
                                    <Space>
                                        <Button onClick={handleBack}>Back</Button>
                                        <Button type="primary" htmlType="submit" loading={processing}>
                                            Review Application
                                        </Button>
                                    </Space>
                                </div>
                            </Form>
                        )}
                    </Card>
                </div>
            </Content>
        </Layout>
    );
};

export default IncomeDetailsPage;
