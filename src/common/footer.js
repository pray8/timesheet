import React from 'react';
import { Layout } from 'antd';
// import { FacebookOutlined, TwitterOutlined, LinkedinOutlined, GithubOutlined } from '@ant-design/icons';

const { Footer } = Layout;

const AppFooter = () => {
    return (
        <Footer
            style={{
                padding: '5px 0', // Compact height
                background: 'rgba(0, 0, 0, 0.2)', // Darker translucent background for contrast
                backdropFilter: 'blur(10px)', // Glass effect with blur
                color: '#000000', // Light cyan for better visibility
                textAlign: 'center',
                marginTop: '40px',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)', // Subtle border for separation
                boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)', // Enhanced shadow
            }}
        >
            {/* <div style={{ marginBottom: '10px' }}>
                <Space size="middle">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#a2e3f5' }}>
                        <FacebookOutlined style={{ fontSize: '20px' }} />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: '#a2e3f5' }}>
                        <TwitterOutlined style={{ fontSize: '20px' }} />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: '#a2e3f5' }}>
                        <LinkedinOutlined style={{ fontSize: '20px' }} />
                    </a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ color: '#a2e3f5' }}>
                        <GithubOutlined style={{ fontSize: '20px' }} />
                    </a>
                </Space>
            </div> */}
            <p style={{ fontSize: '14px', marginBottom: '5px', opacity: '0.9' }}>
                &copy; {new Date().getFullYear()} Timesheet Application. All rights reserved.
            </p>
            <p style={{ fontSize: '12px', opacity: '0.8' }}>
                Designed and developed with ❤️ by Datanimbus
            </p>
        </Footer>
    );
};

export default AppFooter;
