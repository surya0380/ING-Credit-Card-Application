import React, { useEffect } from 'react';
import {
    Layout,
    Card,
    Button,
    Space,
    Row,
    Col,
    message,
    Spin,
    Divider,
    Alert,
    Statistic,
    Progress,
    Tag,
    Typography,
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    WarningOutlined,
    EditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useApplication } from '../hooks/useRedux';
import { submitApplication } from '../slices/applicationSlice';
import { ApplicationStepper } from '../components/ApplicationStepper';
import { formatCurrency, formatDate, getCreditScoreColor, getRiskLevelColor } from '../utils/helpers';
import HeaderComponent from '../components/Header';
import './ReviewPage.css';

const { Content } = Layout;
const { Text } = Typography;

export const ReviewPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentApplication, loading } = useApplication();
    const [submitting, setSubmitting] = React.useState(false);

    useEffect(() => {
        if (!currentApplication || currentApplication.step < 5) {
            navigate('/application');
            return;
        }
    }, [currentApplication, navigate]);

    const handleSubmit = async () => {
        if (!currentApplication) return;

        setSubmitting(true);
        try {
            message.loading('Submitting your application...');
            await dispatch(submitApplication(currentApplication.applicationId));
            message.success('Application submitted successfully!');

            setTimeout(() => {
                navigate('/application/confirmation');
            }, 1500);
        } catch {
            message.error('Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (step: number) => {
        const routes: Record<number, string> = {
            2: '/application/kyc',
            3: '/application/employment',
            4: '/application/income',
        };
        navigate(routes[step]);
    };

    const handleBack = () => {
        navigate('/application/income');
    };

    if (!currentApplication) {
        return (
            <Layout className="review-page">
                <HeaderComponent />
                <Content style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Spin size="large" />
                </Content>
            </Layout>
        );
    }

    return (
        <Layout className="review-page">
            <HeaderComponent />
            <Content className="review-content">
                <div className="review-container">
                    <Card className="review-card">
                        {/* Stepper */}
                        <ApplicationStepper currentStep={currentApplication.step} />

                        <div className="form-header">
                            <h2>Review Application</h2>
                            <p>Review your information before final submission</p>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <Spin size="large" tip="Loading your application..." />
                            </div>
                        ) : (
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                {/* Eligibility Check */}
                                {currentApplication.eligibilityCheck && (
                                    <Card title="Eligibility Check" className="section-card">
                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <div className="eligibility-box">
                                                    {currentApplication.eligibilityCheck.eligible ? (
                                                        <CheckCircleOutlined className="success-icon" />
                                                    ) : (
                                                        <CloseCircleOutlined className="error-icon" />
                                                    )}
                                                    <Text strong style={{ fontSize: 16 }}>
                                                        {currentApplication.eligibilityCheck.eligible
                                                            ? 'Eligible'
                                                            : 'Not Eligible'}
                                                    </Text>
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Statistic
                                                    title="Annual Income Required"
                                                    value={currentApplication.eligibilityCheck.minIncomeRequired}
                                                    prefix={<Text>₹</Text>}
                                                    suffix=""
                                                    valueStyle={{ fontSize: '16px' }}
                                                />
                                            </Col>
                                        </Row>

                                        {currentApplication.eligibilityCheck.loanEligibility && (
                                            <>
                                                <Divider />
                                                <Row gutter={16}>
                                                    <Col xs={12} sm={12}>
                                                        <Statistic
                                                            title="Max Credit Limit"
                                                            value={
                                                                currentApplication.eligibilityCheck.loanEligibility
                                                                    .maxCreditLimit
                                                            }
                                                            prefix={<Text>₹</Text>}
                                                            valueStyle={{ fontSize: '16px', color: '#1890ff' }}
                                                        />
                                                    </Col>
                                                    <Col xs={12} sm={12}>
                                                        <Statistic
                                                            title="Recommended Limit"
                                                            value={
                                                                currentApplication.eligibilityCheck.loanEligibility
                                                                    .recommendedCreditLimit
                                                            }
                                                            prefix={<Text>₹</Text>}
                                                            valueStyle={{ fontSize: '16px', color: '#52c41a' }}
                                                        />
                                                    </Col>
                                                </Row>
                                            </>
                                        )}

                                        {currentApplication.eligibilityCheck.failedChecks.length > 0 && (
                                            <>
                                                <Divider />
                                                <Alert
                                                    message="Failed Checks"
                                                    description={
                                                        <ul>
                                                            {currentApplication.eligibilityCheck.failedChecks.map(
                                                                (check, idx) => (
                                                                    <li key={idx}>{check}</li>
                                                                )
                                                            )}
                                                        </ul>
                                                    }
                                                    type="warning"
                                                    showIcon
                                                />
                                            </>
                                        )}
                                    </Card>
                                )}

                                {/* Risk Assessment */}
                                {currentApplication.riskCheck && (
                                    <Card title="Risk Assessment" className="section-card">
                                        <Row gutter={[16, 16]}>
                                            <Col xs={24} sm={8}>
                                                <div className="risk-metric">
                                                    <Text type="secondary">Credit Score</Text>
                                                    <br />
                                                    <Statistic
                                                        value={currentApplication.riskCheck.creditScore}
                                                        valueStyle={{
                                                            fontSize: '24px',
                                                            color: getCreditScoreColor(
                                                                currentApplication.riskCheck.creditScore
                                                            ),
                                                        }}
                                                    />
                                                    <Progress
                                                        percent={(currentApplication.riskCheck.creditScore / 900) * 100}
                                                        strokeColor={getCreditScoreColor(
                                                            currentApplication.riskCheck.creditScore
                                                        )}
                                                        format={() => ''}
                                                    />
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <div className="risk-metric">
                                                    <Text type="secondary">Risk Level</Text>
                                                    <br />
                                                    <Tag
                                                        color={getRiskLevelColor(
                                                            currentApplication.riskCheck.riskLevel
                                                        )}
                                                        style={{ fontSize: '14px', padding: '4px 12px' }}
                                                    >
                                                        {currentApplication.riskCheck.riskLevel}
                                                    </Tag>
                                                    <br />
                                                    <Text type="secondary" style={{ marginTop: 8 }}>
                                                        Action: {currentApplication.riskCheck.recommendedAction}
                                                    </Text>
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <div className="risk-metric">
                                                    <Text type="secondary">Debt to Income</Text>
                                                    <br />
                                                    <Statistic
                                                        value={currentApplication.riskCheck.debtToIncomeRatio}
                                                        suffix="%"
                                                        valueStyle={{ fontSize: '24px' }}
                                                    />
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        (Recommended: &lt;50%)
                                                    </Text>
                                                </div>
                                            </Col>
                                        </Row>

                                        {currentApplication.riskCheck.riskFlags.length > 0 && (
                                            <>
                                                <Divider />
                                                <Alert
                                                    message="Risk Flags"
                                                    description={
                                                        <ul>
                                                            {currentApplication.riskCheck.riskFlags.map((flag, idx) => (
                                                                <li key={idx}>{flag}</li>
                                                            ))}
                                                        </ul>
                                                    }
                                                    type="warning"
                                                    showIcon
                                                    icon={<WarningOutlined />}
                                                />
                                            </>
                                        )}
                                    </Card>
                                )}

                                {/* KYC Details Review */}
                                {currentApplication.kycDetails && (
                                    <ReviewSection
                                        title="KYC Details"
                                        step={2}
                                        onEdit={handleEdit}
                                        content={
                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} sm={12}>
                                                    <ReviewItem
                                                        label="PAN"
                                                        value={currentApplication.kycDetails.pan}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={12}>
                                                    <ReviewItem
                                                        label="Name"
                                                        value={currentApplication.kycDetails.panName}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={12}>
                                                    <ReviewItem
                                                        label="Date of Birth"
                                                        value={formatDate(currentApplication.kycDetails.dateOfBirth)}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={12}>
                                                    <ReviewItem
                                                        label="Gender"
                                                        value={currentApplication.kycDetails.gender}
                                                    />
                                                </Col>
                                                <Col xs={24}>
                                                    <ReviewItem
                                                        label="Address"
                                                        value={currentApplication.kycDetails.address}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={12}>
                                                    <ReviewItem
                                                        label="City"
                                                        value={currentApplication.kycDetails.city}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={12}>
                                                    <ReviewItem
                                                        label="State"
                                                        value={currentApplication.kycDetails.state}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={12}>
                                                    <ReviewItem
                                                        label="Pincode"
                                                        value={currentApplication.kycDetails.pincode}
                                                    />
                                                </Col>
                                            </Row>
                                        }
                                    />
                                )}

                                {/* Employment Details Review */}
                                {currentApplication.employmentDetails && (
                                    <ReviewSection
                                        title="Employment Details"
                                        step={3}
                                        onEdit={handleEdit}
                                        content={
                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} sm={12}>
                                                    <ReviewItem
                                                        label="Employment Type"
                                                        value={currentApplication.employmentDetails.employmentType}
                                                    />
                                                </Col>
                                                {currentApplication.employmentDetails.companyName && (
                                                    <Col xs={24} sm={12}>
                                                        <ReviewItem
                                                            label="Company"
                                                            value={currentApplication.employmentDetails.companyName}
                                                        />
                                                    </Col>
                                                )}
                                                {currentApplication.employmentDetails.designation && (
                                                    <Col xs={24} sm={12}>
                                                        <ReviewItem
                                                            label="Designation"
                                                            value={currentApplication.employmentDetails.designation}
                                                        />
                                                    </Col>
                                                )}
                                                {currentApplication.employmentDetails.yearsOfExperience && (
                                                    <Col xs={24} sm={12}>
                                                        <ReviewItem
                                                            label="Years of Experience"
                                                            value={`${currentApplication.employmentDetails.yearsOfExperience} years`}
                                                        />
                                                    </Col>
                                                )}
                                            </Row>
                                        }
                                    />
                                )}

                                {/* Income Details Review */}
                                {currentApplication.incomeDetails && (
                                    <ReviewSection
                                        title="Income Details"
                                        step={4}
                                        onEdit={handleEdit}
                                        content={
                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} sm={12}>
                                                    <ReviewItem
                                                        label="Monthly Income"
                                                        value={formatCurrency(
                                                            currentApplication.incomeDetails.monthlyIncome
                                                        )}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={12}>
                                                    <ReviewItem
                                                        label="Annual Income"
                                                        value={formatCurrency(
                                                            currentApplication.incomeDetails.annualIncome
                                                        )}
                                                    />
                                                </Col>
                                            </Row>
                                        }
                                    />
                                )}

                                {/* Submit Button */}
                                <div className="form-actions">
                                    <Space>
                                        <Button onClick={handleBack}>Back</Button>
                                        <Button type="primary" size="large" onClick={handleSubmit} loading={submitting}>
                                            Submit Application
                                        </Button>
                                    </Space>
                                </div>
                            </Space>
                        )}
                    </Card>
                </div>
            </Content>
        </Layout>
    );
};

interface ReviewSectionProps {
    title: string;
    step: number;
    onEdit: (step: number) => void;
    content: React.ReactNode;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ title, step, onEdit, content }) => {
    return (
        <Card
            title={title}
            extra={
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => onEdit(step)}
                >
                    Edit
                </Button>
            }
            className="section-card"
        >
            {content}
        </Card>
    );
};

interface ReviewItemProps {
    label: string;
    value: string | React.ReactNode;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ label, value }) => {
    return (
        <div className="review-item">
            <Text type="secondary" style={{ fontSize: '12px' }}>
                {label}
            </Text>
            <br />
            <Text strong style={{ fontSize: '14px' }}>
                {value}
            </Text>
        </div>
    );
};

export default ReviewPage;
