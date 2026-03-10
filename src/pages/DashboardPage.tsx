import React, { useEffect } from 'react';
import { Layout, Card, Button, Space, Row, Col, Divider, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAuth } from '../hooks/useRedux';
import { setCurrentApplication } from '../slices/applicationSlice';
import { getSampleApplication } from '../services/sampleDataService';
import HeaderComponent from '../components/Header';
import type { CreditCardApplication } from '../types';
import './DashboardPage.css';

const { Content } = Layout;

const stepLabels: Record<number, string> = {
    1: 'Personal Information',
    2: 'KYC Verification',
    3: 'Employment Details',
    4: 'Income Details',
    5: 'Review Application',
    6: 'Confirmation',
};

const getStepPercentage = (step: number): number => {
    return (step / 6) * 100;
};

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'DRAFT':
            return 'orange';
        case 'SUBMITTED':
            return 'blue';
        case 'APPROVED':
            return 'green';
        case 'REJECTED':
            return 'red';
        default:
            return 'default';
    }
};

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentCustomer } = useAuth();
    const [applications, setApplications] = React.useState<CreditCardApplication[]>([]);

    useEffect(() => {
        if (!currentCustomer?.phoneNumber) {
            navigate('/login');
            return;
        }

        const sampleData = getSampleApplication(currentCustomer.phoneNumber);
        if (sampleData) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setApplications([sampleData.application]);
        }
    }, [currentCustomer, navigate]);

    const handleContinueApplication = (application: CreditCardApplication) => {
        // @ts-expect-error Redux sync reducer type quirk
        dispatch(setCurrentApplication(application));
        if (application.step === 2) {
            navigate('/application/kyc');
        } else if (application.step === 3) {
            navigate('/application/employment');
        } else if (application.step === 4) {
            navigate('/application/income');
        } else if (application.step === 5) {
            navigate('/application/review');
        } else {
            navigate('/application/kyc');
        }
    };

    const handleNewApplication = () => {
        navigate('/application');
    };

    if (!currentCustomer) {
        return null;
    }

    return (
        <Layout className="dashboard-page">
            <HeaderComponent />
            <Content className="dashboard-content">
                <div className="dashboard-container">
                    <div className="welcome-section">
                        <h1>Welcome, {currentCustomer.firstName || 'Customer'}</h1>
                        <p>Manage your credit card application</p>
                    </div>

                    {applications.length > 0 ? (
                        <Card className="applications-card">
                            <h2>Your Applications</h2>
                            <Divider />

                            {applications.map((app) => (
                                <div key={app.applicationId} className="application-item">
                                    <Row gutter={[16, 16]} align="middle">
                                        <Col xs={24} sm={12}>
                                            <div className="app-info">
                                                <p className="app-id">
                                                    Application ID: <strong>{app.applicationId}</strong>
                                                </p>
                                                <p className="app-date">
                                                    Started: {new Date(app.applicationDate).toLocaleDateString()}
                                                </p>
                                                <div className="status-section">
                                                    <Tag color={getStatusColor(app.status)}>{app.status}</Tag>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <div className="progress-section">
                                                <p className="progress-label">
                                                    Step {app.step} of 6: {stepLabels[app.step]}
                                                </p>
                                                <div className="progress-bar-container">
                                                    <div
                                                        className="progress-bar"
                                                        style={{ width: `${getStepPercentage(app.step)}%` }}
                                                    />
                                                </div>
                                                <p className="progress-percentage">
                                                    {Math.round(getStepPercentage(app.step))}% Complete
                                                </p>
                                            </div>
                                        </Col>
                                    </Row>

                                    <Divider />

                                    <div className="application-details">
                                        {app.kycDetails && (
                                            <div className="detail-item">
                                                <span className="detail-label">PAN</span>
                                                <span className="detail-value">{app.kycDetails.pan}</span>
                                            </div>
                                        )}
                                        {app.employmentDetails && (
                                            <div className="detail-item">
                                                <span className="detail-label">Employment</span>
                                                <span className="detail-value">
                                                    {app.employmentDetails.designation} at{' '}
                                                    {app.employmentDetails.companyName}
                                                </span>
                                            </div>
                                        )}
                                        {app.incomeDetails && (
                                            <div className="detail-item">
                                                <span className="detail-label">Annual Income</span>
                                                <span className="detail-value">
                                                    ₹{app.incomeDetails.annualIncome.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <Divider />

                                    <Space>
                                        <Button
                                            type="primary"
                                            size="large"
                                            onClick={() => handleContinueApplication(app)}
                                        >
                                            Continue Application
                                        </Button>
                                    </Space>
                                </div>
                            ))}
                        </Card>
                    ) : (
                        <Card className="no-applications-card">
                            <div className="empty-state">
                                <h3>No Active Applications</h3>
                                <p>Start a new credit card application to proceed</p>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleNewApplication}
                                >
                                    New Application
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </Content>
        </Layout>
    );
};

export default DashboardPage;
