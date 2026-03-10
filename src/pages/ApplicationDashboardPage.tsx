import React, { useEffect } from 'react';
import {
    Layout,
    Card,
    Button,
    Space,
    Row,
    Col,
    Statistic,
    Spin,
    Tooltip,
} from 'antd';
import {
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAuth, useApplication } from '../hooks/useRedux';
import { initializeApplication } from '../slices/applicationSlice';
import { ApplicationStepper } from '../components/ApplicationStepper';
import { formatDate } from '../utils/helpers';
import HeaderComponent from '../components/Header';
import './ApplicationDashboardPage.css';

const { Content } = Layout;

export const ApplicationDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { session } = useAuth();
    const { currentApplication, loading } = useApplication();

    useEffect(() => {
        if (!session?.isLoggedIn || !session?.customerId) {
            navigate('/login');
            return;
        }

        // Initialize or restore application
        if (!currentApplication) {
            dispatch(
                initializeApplication({
                    customerId: session.customerId,
                    phoneNumber: session.phoneNumber || '',
                })
            );
        }
    }, [session, dispatch, navigate, currentApplication]);

    const handleContinueApplication = () => {
        if (currentApplication) {
            const nextStep = currentApplication.step + 1;
            const routes: Record<number, string> = {
                2: '/application/kyc',
                3: '/application/employment',
                4: '/application/income',
                5: '/application/review',
                6: '/application/confirmation',
            };
            navigate(routes[nextStep] || '/application/kyc');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'DRAFT':
                return '#faad14';
            case 'SUBMITTED':
                return '#1890ff';
            case 'APPROVED':
                return '#52c41a';
            case 'REJECTED':
                return '#f5222d';
            default:
                return '#666';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED':
                return <CheckCircleOutlined />;
            case 'REJECTED':
                return <CloseCircleOutlined />;
            case 'SUBMITTED':
                return <ClockCircleOutlined />;
            default:
                return <FileTextOutlined />;
        }
    };

    return (
        <Layout className="application-dashboard">
            <HeaderComponent />
            <Content className="dashboard-content">
                <div className="dashboard-container">
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {/* Welcome Section */}
                        <Card className="welcome-card">
                            <Row gutter={16} align="middle">
                                <Col flex="auto">
                                    <h2 className="welcome-title">Welcome back! 👋</h2>
                                    <p className="welcome-subtitle">
                                        Complete your credit card application in 5 easy steps
                                    </p>
                                </Col>
                                <Col>
                                    <Button type="primary" size="large" onClick={handleContinueApplication}>
                                        {currentApplication?.step === 1 ? 'Start Application' : 'Continue Application'}
                                    </Button>
                                </Col>
                            </Row>
                        </Card>

                        {/* Application Progress */}
                        {currentApplication && (
                            <>
                                <Card>
                                    <ApplicationStepper currentStep={currentApplication.step} />
                                </Card>

                                {/* Application Status */}
                                <Card className="status-card">
                                    <Row gutter={24}>
                                        <Col xs={12} sm={6}>
                                            <Statistic
                                                title="Status"
                                                value={currentApplication.status}
                                                prefix={getStatusIcon(currentApplication.status)}
                                                valueStyle={{ color: getStatusColor(currentApplication.status) }}
                                            />
                                        </Col>
                                        <Col xs={12} sm={6}>
                                            <Statistic
                                                title="Application ID"
                                                value={currentApplication.applicationId.substring(0, 15) + '...'}
                                            />
                                        </Col>
                                        <Col xs={12} sm={6}>
                                            <Statistic
                                                title="Started On"
                                                value={formatDate(currentApplication.applicationDate)}
                                            />
                                        </Col>
                                        <Col xs={12} sm={6}>
                                            <Statistic
                                                title="Expires On"
                                                value={
                                                    currentApplication.expiresAt
                                                        ? formatDate(currentApplication.expiresAt)
                                                        : 'N/A'
                                                }
                                            />
                                        </Col>
                                    </Row>
                                </Card>

                                {/* Application Details */}
                                <Card title="Application Details" className="details-card">
                                    <Row gutter={[16, 16]}>
                                        {currentApplication.kycDetails && (
                                            <Col xs={24} sm={12} md={6}>
                                                <div className="detail-item">
                                                    <h4>KYC Details</h4>
                                                    <p className="completed">✓ Completed</p>
                                                </div>
                                            </Col>
                                        )}

                                        {currentApplication.employmentDetails && (
                                            <Col xs={24} sm={12} md={6}>
                                                <div className="detail-item">
                                                    <h4>Employment Details</h4>
                                                    <p className="completed">✓ Completed</p>
                                                </div>
                                            </Col>
                                        )}

                                        {currentApplication.incomeDetails && (
                                            <Col xs={24} sm={12} md={6}>
                                                <div className="detail-item">
                                                    <h4>Income Details</h4>
                                                    <p className="completed">✓ Completed</p>
                                                </div>
                                            </Col>
                                        )}

                                        {currentApplication.eligibilityCheck && (
                                            <Col xs={24} sm={12} md={6}>
                                                <div className="detail-item">
                                                    <h4>Eligibility Check</h4>
                                                    <p
                                                        className={
                                                            currentApplication.eligibilityCheck.eligible ? 'eligible' : 'not-eligible'
                                                        }
                                                    >
                                                        {currentApplication.eligibilityCheck.eligible ? '✓ Eligible' : '✗ Not Eligible'}
                                                    </p>
                                                </div>
                                            </Col>
                                        )}
                                    </Row>
                                </Card>

                                {/* Action Buttons */}
                                <div className="action-buttons">
                                    <Space>
                                        <Button type="primary" size="large" onClick={handleContinueApplication}>
                                            {currentApplication.step === 1 ? 'Start Application' : 'Continue Application'}
                                        </Button>
                                        <Tooltip title="Your draft application is auto-saved">
                                            <span>💾 Auto-saved</span>
                                        </Tooltip>
                                    </Space>
                                </div>
                            </>
                        )}

                        {loading && (
                            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <Spin size="large" />
                            </div>
                        )}
                    </Space>
                </div>
            </Content>
        </Layout>
    );
};

export default ApplicationDashboardPage;
