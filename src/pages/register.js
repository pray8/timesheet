import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [roleId, setRoleId] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [managerId, setManagerId] = useState('');
    const navigate = useNavigate();

    const handleRegister = (values) => {
        const { name, email, password, confirmPassword, roleId, departmentId, managerId } = values;

        if (confirmPassword !== password) {
            message.error('Passwords do not match. Please try again.');
        }

        axios.post(`${process.env.REACT_APP_DNIO_PIPES_BASE_URL}/${process.env.REACT_APP_DNIO_APP_NAME}/register`, {
            name,
            email,
            password,
            confirmPassword,
            roleId: { _id: roleId },
            departmentId: { _id: departmentId },
            managerId: { _id: managerId }
        })
            .then(response => {
                message.success('Registration successful!');
                navigate('/login');
            })
            .catch(error => {
                console.error('Registration error', error);
                message.error('Registration failed. Please try again.');
            });
    };

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
            <Title level={3} style={{ textAlign: 'center' }}>Register</Title>
            <Form
                name="register"
                layout="vertical"
                onFinish={handleRegister}
                autoComplete="off"
            >
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Please enter your username!' }]}
                >
                    <Input
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Form.Item>

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

                <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    rules={[{ required: true, message: 'Please enter confirm password!' }]}
                >
                    <Input.Password
                        placeholder="Enter confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </Form.Item>

                <Form.Item
                    label="Role ID"
                    name="roleId"
                    rules={[{ required: false, message: 'Please enter the role ID!' }]}
                >
                    <Input
                        placeholder="Enter the role ID"
                        value={roleId}
                        onChange={(e) => setRoleId(e.target.value)}
                    />
                </Form.Item>

                <Form.Item
                    label="Department ID"
                    name="departmentId"
                    rules={[{ required: false, message: 'Please enter the department ID!' }]}
                >
                    <Input
                        placeholder="Enter the department ID"
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                    />
                </Form.Item>

                <Form.Item
                    label="Manager ID"
                    name="managerId"
                    rules={[{ required: false, message: 'Please enter the manager ID!' }]}
                >
                    <Input
                        placeholder="Enter the manager ID"
                        value={managerId}
                        onChange={(e) => setManagerId(e.target.value)}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Register
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default RegisterPage;
