/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Layout, Button, Dropdown, Space, Drawer, Avatar, Divider } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAuth } from '../hooks/useRedux';
import { logoutCustomer } from '../slices/authSlice';
import { formatPhoneNumber } from '../utils/helpers';
import './Header.css';

const { Header } = Layout;

interface HeaderComponentProps {
    disableNav?: boolean;
}

export const HeaderComponent: React.FC<HeaderComponentProps> = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { session } = useAuth();
    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const handleLogout = async () => {
        await dispatch(logoutCustomer());
        navigate('/login');
    };

    const userMenu = [
        {
            label: (
                <span>
                    <UserOutlined /> Profile
                </span>
            ),
            key: 'profile',
            onClick: () => navigate('/profile'),
        },
        {
            type: 'divider',
        },
        {
            label: (
                <span>
                    <LogoutOutlined /> Logout
                </span>
            ),
            key: 'logout',
            onClick: handleLogout,
            danger: true,
        },
    ];

    return (
        <>
            <Header className="header-container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <span className="logo-icon">💳</span>
                        <span className="logo-text">ING Credit Card</span>
                    </Link>

                    {session?.isLoggedIn && (
                        <div className="header-actions">
                            <Space>
                                <div className="user-info">
                                    <span className="phone-number">
                                        {session.phoneNumber && formatPhoneNumber(session.phoneNumber)}
                                    </span>
                                </div>
                                <Dropdown menu={{ items: userMenu as any }} trigger={['click']}>
                                    <Avatar
                                        size="large"
                                        icon={<UserOutlined />}
                                        style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
                                    />
                                </Dropdown>
                            </Space>
                        </div>
                    )}
                </div>
            </Header>

            <Drawer
                title="Menu"
                placement="left"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Link to="/">Home</Link>
                    {session?.isLoggedIn && (
                        <>
                            <Link to="/application">My Application</Link>
                            <Divider />
                            <Button danger block onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    )}
                </Space>
            </Drawer>
        </>
    );
};

export default HeaderComponent;
