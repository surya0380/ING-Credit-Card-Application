import React, { useEffect } from 'react';
import {
    Layout,
    Card,
    Button,
    Space,
    Row,
    Col,
    Typography,
    Divider,
    Statistic,
    Alert,
} from 'antd';
import {
    CheckCircleOutlined,
    DownloadOutlined,
    PrinterOutlined,
    HomeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useApplication } from '../hooks/useRedux';
import { formatDate, formatCurrency } from '../utils/helpers';
import HeaderComponent from '../components/Header';
import './ConfirmationPage.css';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export const ConfirmationPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentApplication } = useApplication();

    useEffect(() => {
        if (!currentApplication || currentApplication.status !== 'SUBMITTED') {
            navigate('/application');
            return;
        }
    }, [currentApplication, navigate]);

    const handleDownload = () => {
        // In production, generate and download PDF
        alert('Application PDF download feature coming soon!');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleGoHome = () => {
        navigate('/application');
    };

    if (!currentApplication) {
        return null;
    }

    return (
        <Layout className="confirmation-page">
            <HeaderComponent />
            <Content className="confirmation-content">
                <div className="confirmation-container">
                    <Card className="confirmation-card">
                        {/* Success Message */}
                        <div className="success-section">
                            <CheckCircleOutlined className="success-check" />
                            <Title level={2}>Application Submitted Successfully!</Title>
                            <Paragraph>
                                Your credit card application has been received and is being processed.
                            </Paragraph>
                        </div>

                        <Divider />

                        {/* Application Details */}
                        <div className="details-section">
                            <Title level={3}>Application Details</Title>

                            <Row gutter={[24, 24]}>
                                <Col xs={24} sm={12}>
                                    <Statistic
                                        title="Application ID"
                                        value={currentApplication.applicationId}
                                        valueStyle={{ fontSize: '14px', wordBreak: 'break-word' }}
                                    />
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Statistic
                                        title="Submitted On"
                                        value={formatDate(
                                            currentApplication.submissionDate || new Date().toISOString()
                                        )}
                                    />
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Statistic title="Status" value="SUBMITTED" />
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Statistic
                                        title="Your Phone"
                                        value={currentApplication.phoneNumber}
                                    />
                                </Col>
                            </Row>
                        </div>

                        {/* Credit Limit Info */}
                        {currentApplication.eligibilityCheck?.loanEligibility && (
                            <>
                                <Divider />
                                <div className="credit-limit-section">
                                    <Title level={3}>Your Credit Limit</Title>
                                    <Row gutter={[24, 24]}>
                                        <Col xs={24} sm={12}>
                                            <div className="limit-box max-limit">
                                                <Text type="secondary">Maximum Credit Limit</Text>
                                                <br />
                                                <div className="limit-amount">
                                                    {formatCurrency(
                                                        currentApplication.eligibilityCheck.loanEligibility
                                                            .maxCreditLimit
                                                    )}
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <div className="limit-box recommended-limit">
                                                <Text type="secondary">Recommended Credit Limit</Text>
                                                <br />
                                                <div className="limit-amount">
                                                    {formatCurrency(
                                                        currentApplication.eligibilityCheck.loanEligibility
                                                            .recommendedCreditLimit
                                                    )}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </>
                        )}

                        {/* Next Steps */}
                        <Divider />
                        <div className="next-steps-section">
                            <Title level={3}>What's Next?</Title>
                            <ol className="steps-list">
                                <li>
                                    <Text strong>Review & Approval (1-2 business days)</Text>
                                    <br />
                                    <Text type="secondary">
                                        Our team will review your application and verify your documents.
                                    </Text>
                                </li>
                                <li>
                                    <Text strong>Decision Notification (SMS/Email)</Text>
                                    <br />
                                    <Text type="secondary">
                                        You'll receive notification about the decision on your registered phone
                                        and email.
                                    </Text>
                                </li>
                                <li>
                                    <Text strong>Card Delivery</Text>
                                    <br />
                                    <Text type="secondary">
                                        Once approved, your credit card will be delivered within 5-7 business
                                        days.
                                    </Text>
                                </li>
                            </ol>
                        </div>

                        {/* Important Notes */}
                        <Divider />
                        <Alert
                            message="Important Information"
                            description={
                                <ul className="notes-list">
                                    <li>
                                        Login to your account anytime to check the status of your application
                                    </li>
                                    <li>Keep your application ID safe for future reference</li>
                                    <li>Do not share your application details with anyone</li>
                                    <li>
                                        You'll receive a one-time password (OTP) for verification at the phone
                                        number you provided
                                    </li>
                                </ul>
                            }
                            type="info"
                            showIcon
                        />

                        {/* Action Buttons */}
                        <div className="action-section">
                            <Space direction="vertical" style={{ width: '100%' }} size="large">
                                <Space wrap>
                                    <Button
                                        icon={<DownloadOutlined />}
                                        onClick={handleDownload}
                                    >
                                        Download Summary
                                    </Button>
                                    <Button
                                        icon={<PrinterOutlined />}
                                        onClick={handlePrint}
                                    >
                                        Print
                                    </Button>
                                </Space>

                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    icon={<HomeOutlined />}
                                    onClick={handleGoHome}
                                >
                                    Go to Dashboard
                                </Button>
                            </Space>
                        </div>

                        {/* Tips */}
                        <Divider />
                        <div className="tips-section">
                            <Title level={4}>💡 Quick Tips</Title>
                            <ul className="tips-list">
                                <li>
                                    <Text strong>Track your application:</Text> Use your application ID to check
                                    status anytime
                                </li>
                                <li>
                                    <Text strong>Complete your KYC:</Text> Ensure all documents are uploaded for
                                    faster approval
                                </li>
                                <li>
                                    <Text strong>Maintain credit score:</Text> Regular on-time payments help in
                                    increasing your credit limit
                                </li>
                                <li>
                                    <Text strong>Manage your card:</Text> Download our mobile app for easy card
                                    management
                                </li>
                            </ul>
                        </div>
                    </Card>
                </div>
            </Content>
        </Layout>
    );
};

export default ConfirmationPage;
