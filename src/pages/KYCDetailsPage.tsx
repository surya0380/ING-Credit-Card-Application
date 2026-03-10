/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
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
    Spin,
    Alert,
    DatePicker,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useApplication } from '../hooks/useRedux';
import { validateAndProcessKYC } from '../slices/applicationSlice';
import { validateKYCForm } from '../utils/validation';
import { ApplicationStepper } from '../components/ApplicationStepper';
import { getIndianStates } from '../services/fakerService';
import HeaderComponent from '../components/Header';
import dayjs from 'dayjs';
import './FormPages.css';

const { Content } = Layout;

export const KYCDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentApplication, loading, error } = useApplication();
    const [form] = Form.useForm();

    useEffect(() => {
        if (!currentApplication) {
            navigate('/application');
            return;
        }

        // Pre-fill form if KYC already entered
        if (currentApplication.kycDetails) {
            form.setFieldsValue({
                pan: currentApplication.kycDetails.pan,
                panName: currentApplication.kycDetails.panName,
                dateOfBirth: dayjs(currentApplication.kycDetails.dateOfBirth),
                gender: currentApplication.kycDetails.gender,
                address: currentApplication.kycDetails.address,
                city: currentApplication.kycDetails.city,
                state: currentApplication.kycDetails.state,
                pincode: currentApplication.kycDetails.pincode,
                motherName: currentApplication.kycDetails.motherName,
            });
        }
    }, [currentApplication, form, navigate]);

    const handleSubmit = async (values: any) => {
        // Validate form
        const validation = validateKYCForm(values);
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

        // Process KYC
        const formattedDOB = values.dateOfBirth.format('YYYY-MM-DD');
        const kycData = {
            pan: values.pan.toUpperCase(),
            panName: values.panName,
            dateOfBirth: formattedDOB,
            gender: values.gender,
            address: values.address,
            city: values.city,
            state: values.state,
            pincode: values.pincode,
            motherName: values.motherName || '',
            panVerified: false,
        };

        await dispatch(
            validateAndProcessKYC({
                applicationId: currentApplication.applicationId,
                customerData: kycData,
            })
        );

        message.success('KYC details saved successfully!');

        // Navigate to next step
        setTimeout(() => {
            navigate('/application/employment');
        }, 1000);
    };

    const handleBack = () => {
        navigate('/application');
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
                            <h2>KYC - Know Your Customer</h2>
                            <p>Enter your PAN and personal details for verification</p>
                        </div>

                        {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 16 }} />}

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <Spin size="large" />
                            </div>
                        ) : (
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleSubmit}
                                initialValues={{
                                    gender: 'M',
                                }}
                            >
                                {/* PAN Section */}
                                <div className="form-section">
                                    <h3>PAN Details</h3>
                                    <Row gutter={16}>
                                        <Col xs={24} sm={24} md={12}>
                                            <Form.Item
                                                name="pan"
                                                label="PAN (Permanent Account Number)"
                                                rules={[
                                                    { required: true, message: 'PAN is required' },
                                                    {
                                                        pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i,
                                                        message: 'Invalid PAN format. Example: AAAPL5055K',
                                                    },
                                                ]}
                                            >
                                                <Input
                                                    placeholder="e.g., AAAPL5055K"
                                                    maxLength={10}
                                                    onChange={(e) => {
                                                        e.target.value = e.target.value.toUpperCase();
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={24} md={12}>
                                            <Form.Item
                                                name="panName"
                                                label="Name as per PAN"
                                                rules={[
                                                    { required: true, message: 'Name is required' },
                                                    {
                                                        min: 3,
                                                        message: 'Name must be at least 3 characters',
                                                    },
                                                ]}
                                            >
                                                <Input placeholder="Enter full name" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>

                                {/* Personal Details Section */}
                                <div className="form-section">
                                    <h3>Personal Details</h3>
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="dateOfBirth"
                                                label="Date of Birth"
                                                rules={[
                                                    { required: true, message: 'Date of birth is required' },
                                                ]}
                                            >
                                                <DatePicker style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="gender"
                                                label="Gender"
                                                rules={[{ required: true, message: 'Gender is required' }]}
                                            >
                                                <Select placeholder="Select gender">
                                                    <Select.Option value="M">Male</Select.Option>
                                                    <Select.Option value="F">Female</Select.Option>
                                                    <Select.Option value="O">Other</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>

                                {/* Address Section */}
                                <div className="form-section">
                                    <h3>Address Details</h3>
                                    <Row gutter={16}>
                                        <Col xs={24}>
                                            <Form.Item
                                                name="address"
                                                label="Residential Address"
                                                rules={[
                                                    { required: true, message: 'Address is required' },
                                                    {
                                                        min: 5,
                                                        message: 'Address must be at least 5 characters',
                                                    },
                                                ]}
                                            >
                                                <Input.TextArea
                                                    placeholder="Enter your complete address"
                                                    rows={3}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="city"
                                                label="City"
                                                rules={[
                                                    { required: true, message: 'City is required' },
                                                    {
                                                        min: 2,
                                                        message: 'City must be at least 2 characters',
                                                    },
                                                ]}
                                            >
                                                <Input placeholder="Enter city name" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="state"
                                                label="State"
                                                rules={[{ required: true, message: 'State is required' }]}
                                            >
                                                <Select placeholder="Select state">
                                                    {getIndianStates().map((state) => (
                                                        <Select.Option key={state} value={state}>
                                                            {state}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="pincode"
                                                label="Pincode"
                                                rules={[
                                                    { required: true, message: 'Pincode is required' },
                                                    {
                                                        pattern: /^[1-9][0-9]{5}$/,
                                                        message: 'Invalid pincode. Must be 6 digits',
                                                    },
                                                ]}
                                            >
                                                <Input placeholder="e.g., 560001" maxLength={6} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="motherName"
                                                label="Mother's Name (Optional)"
                                                rules={[
                                                    {
                                                        min: 3,
                                                        message: 'Name must be at least 3 characters',
                                                    },
                                                ]}
                                            >
                                                <Input placeholder="Enter mother's name" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>

                                {/* Form Actions */}
                                <div className="form-actions">
                                    <Space>
                                        <Button onClick={handleBack}>Back</Button>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            Continue to Employment Details
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

export default KYCDetailsPage;
