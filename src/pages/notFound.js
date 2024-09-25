// src/components/NotFound.js
import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import '../styles/notFound.css' // Optional for custom styles

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{ paddingTop: '100px' }}>
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>We're sorry, but the page you were looking for doesn't exist.</p>
            <Button type="primary" onClick={() => navigate('/')}>
                Go to Home
            </Button>
        </div>
    );
};

export default NotFound;
