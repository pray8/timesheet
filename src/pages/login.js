import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        axios.post(`${process.env.REACT_APP_DNIO_PIPES_BASE_URL}/${process.env.REACT_APP_DNIO_APP_NAME}/login`, { email, password })
            .then(response => {
                localStorage.setItem('token', response.data.token);
                message.success('Login successful!');
                navigate('/timesheet');
            })
            .catch(error => {
                console.error('Login error', error);
                message.error('Login failed. Please try again.');
                navigate('/login');
            });
    };

    return (
        <div style={{ maxWidth: 400, margin: '0 auto', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
            <Title level={3} style={{ textAlign: 'center' }}>Login</Title>
            <Form
                name="login"
                layout="vertical"
                onFinish={handleLogin}
                autoComplete="off"
            >
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Please enter your email!' }, { type: 'email', message: 'Enter a valid email!' }]}
                >
                    <Input
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please enter your password!' }]}
                >
                    <Input.Password
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Login
                    </Button>
                </Form.Item>
            </Form>

            {/* Register Button */}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Button type="link" onClick={() => navigate('/register')}>
                    Don't have an account? Register here.
                </Button>
            </div>
        </div>
    );
};

export default LoginPage;
