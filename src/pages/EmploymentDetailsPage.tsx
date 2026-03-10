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
    InputNumber,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useApplication } from '../hooks/useRedux';
import { updateApplicationStep } from '../slices/applicationSlice';
import { validateEmploymentForm } from '../utils/validation';
import { ApplicationStepper } from '../components/ApplicationStepper';
import { getEmploymentTypes } from '../services/fakerService';
import HeaderComponent from '../components/Header';
import './FormPages.css';

const { Content } = Layout;

export const EmploymentDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentApplication, loading } = useApplication();
    const [form] = Form.useForm();
    const [employmentType, setEmploymentType] = React.useState<string>('SALARIED');

    useEffect(() => {
        if (!currentApplication) {
            navigate('/application');
            return;
        }

        // Pre-fill form if employment details already entered
        if (currentApplication.employmentDetails) {
            form.setFieldsValue({
                employmentType: currentApplication.employmentDetails.employmentType,
                companyName: currentApplication.employmentDetails.companyName,
                designation: currentApplication.employmentDetails.designation,
                yearsOfExperience: currentApplication.employmentDetails.yearsOfExperience,
                monthlyIncome: currentApplication.employmentDetails.monthlyIncome,
            });
            // Syncing state with form field value
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEmploymentType(currentApplication.employmentDetails.employmentType);
        } else {
            setEmploymentType('SALARIED');
        }
    }, [currentApplication, form, navigate]);

    const handleSubmit = async (values: any) => {
        // Validate form
        const validation = validateEmploymentForm(values);
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

        const employmentData = {
            employmentType: values.employmentType,
            companyName: values.companyName || '',
            designation: values.designation || '',
            yearsOfExperience: values.yearsOfExperience || 0,
            monthlyIncome: values.monthlyIncome,
            annualIncome: values.monthlyIncome * 12,
        };

        message.success('Employment details saved!');

        // Redux synchronous reducer type quirk - dispatch with reducer action
        // @ts-expect-error Redux sync reducer type quirk
        dispatch(updateApplicationStep({
            applicationId: currentApplication.applicationId,
            step: 4,
            data: { employmentDetails: employmentData },
        }));

        // Navigate to income step
        setTimeout(() => {
            navigate('/application/income');
        }, 1000);
    };

    const handleBack = () => {
        navigate('/application/kyc');
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
                            <h2>Employment Details</h2>
                            <p>Tell us about your employment and income</p>
                        </div>

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
                                    employmentType: 'SALARIED',
                                }}
                            >
                                <div className="form-section">
                                    <h3>Employment Information</h3>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={24} md={12}>
                                            <Form.Item
                                                name="employmentType"
                                                label="Employment Type"
                                                rules={[
                                                    { required: true, message: 'Employment type is required' },
                                                ]}
                                            >
                                                <Select
                                                    placeholder="Select employment type"
                                                    onChange={setEmploymentType}
                                                >
                                                    {getEmploymentTypes().map((type) => (
                                                        <Select.Option key={type.value} value={type.value}>
                                                            {type.label}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    {employmentType === 'SALARIED' && (
                                        <>
                                            <Row gutter={16}>
                                                <Col xs={24} sm={12}>
                                                    <Form.Item
                                                        name="companyName"
                                                        label="Company Name"
                                                        rules={[
                                                            { required: true, message: 'Company name is required' },
                                                            {
                                                                min: 2,
                                                                message: 'Company name must be at least 2 characters',
                                                            },
                                                        ]}
                                                    >
                                                        <Input placeholder="Enter company name" />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} sm={12}>
                                                    <Form.Item
                                                        name="designation"
                                                        label="Designation"
                                                        rules={[
                                                            { required: false, message: 'Designation is required' },
                                                        ]}
                                                    >
                                                        <Input placeholder="e.g., Software Engineer" />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Row gutter={16}>
                                                <Col xs={24} sm={12}>
                                                    <Form.Item
                                                        name="yearsOfExperience"
                                                        label="Years of Experience"
                                                    >
                                                        <InputNumber
                                                            min={0}
                                                            max={70}
                                                            placeholder="Enter years of experience"
                                                            style={{ width: '100%' }}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </>
                                    )}

                                    {employmentType === 'SELF_EMPLOYED' && (
                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    name="businessName"
                                                    label="Business Name"
                                                    rules={[
                                                        {
                                                            min: 2,
                                                            message: 'Business name must be at least 2 characters',
                                                        },
                                                    ]}
                                                >
                                                    <Input placeholder="Enter business name" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    )}
                                </div>

                                <div className="form-section">
                                    <h3>Income Information</h3>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="monthlyIncome"
                                                label="Monthly Income (₹)"
                                                rules={[
                                                    { required: true, message: 'Monthly income is required' },
                                                    {
                                                        type: 'number',
                                                        min: 25000,
                                                        message: 'Minimum monthly income is ₹25,000',
                                                    },
                                                ]}
                                            >
                                                <InputNumber
                                                    min={25000}
                                                    placeholder="Enter monthly income"
                                                    style={{ width: '100%' }}
                                                    formatter={(value) =>
                                                        `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                                    }
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label="Annual Income (₹)"
                                            >
                                                <InputNumber
                                                    disabled
                                                    value={
                                                        form.getFieldValue('monthlyIncome')
                                                            ? form.getFieldValue('monthlyIncome') * 12
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

                                {/* Form Actions */}
                                <div className="form-actions">
                                    <Space>
                                        <Button onClick={handleBack}>Back</Button>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            Continue to Income Details
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

export default EmploymentDetailsPage;
