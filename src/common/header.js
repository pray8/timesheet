import React, { useState } from 'react';
import { AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import CustomIcon from './customeIcon.js';
import '../styles/topNavigation.css'; // For additional custom styles
import logo from '../assets/logo.jpg';

const items = [
    {
        label: '',
        key: 'logo',
        icon: <CustomIcon src={logo} alt="Logo" style={{ width: '100px', height: '200%' }} />,
    },
    {
        label: 'Dashboard',
        key: 'dashboard',
        icon: <AppstoreOutlined />,
    },
    {
        label: 'Settings',
        key: 'settings',
        icon: <SettingOutlined />,
        children: [
            {
                type: 'group',
                label: 'User Preferences',
                children: [
                    {
                        label: 'Profile',
                        key: 'profile',
                    },
                    {
                        label: 'Privacy',
                        key: 'privacy',
                    },
                ],
            },
            {
                type: 'group',
                label: 'System Settings',
                children: [
                    {
                        label: 'Notifications',
                        key: 'notifications',
                    },
                    {
                        label: 'Security',
                        key: 'security',
                    },
                ],
            },
        ],
    },
    {
        key: 'help',
        label: (
            <a href="https://help.site" target="_blank" rel="noopener noreferrer">
                Help Center
            </a>
        ),
    },
];

const Header = () => {
    const [current, setCurrent] = useState('dashboard');

    const onClick = (e) => {
        setCurrent(e.key);
    };

    return (
        <header className="custom-header">
            <Menu
                onClick={onClick}
                selectedKeys={[current]}
                mode="horizontal"
                items={items}
                className="custom-menu"
            />
        </header>
    );
};

export default Header;
