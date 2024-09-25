import React from 'react';
import { Layout, Typography, Button, Row, Col, Image } from 'antd';
import home_page from '../assets/home_page.jpg';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const HomePage = () => {
    return (
        <Layout style={{ backgroundColor: '#ffffff', minHeight: '60vh' }}> {/* Change to white */}
            <div>
                <Title level={2} style={{ color: 'black', marginTop: '50px', textAlign: 'center' }}>
                    Welcome to Our Timesheet App
                </Title>
            </div>
            <Content style={{ padding: '50px 0', backgroundColor: '#ffffff' }}> {/* White background for content */}
                <div>
                    <Row justify="center" align="middle" style={{ minHeight: '40vh' }}>
                        <Col span={8} style={{ textAlign: 'center' }}>
                            <Title level={1}>Manage Your Time Effectively</Title>
                            <Paragraph>
                                Keep track of your work hours, manage your tasks, and optimize your productivity with our intuitive timesheet application.
                            </Paragraph>
                            <Button type="primary" size="large" href="/login">Get Started</Button>
                        </Col>
                        <Col span={8}>
                            <Image
                                width={300}
                                src={home_page}
                                alt="Timesheet Illustration"
                            />
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>
    );
};

export default HomePage;
