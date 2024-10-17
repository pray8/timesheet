import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorBoundary = ({ children }) => {
    const navigate = useNavigate();
    
    const handleError = (error) => {
        // Check if the error is a network error
        if (!error.response) {
            navigate('/maintenance');
        }
    };

    useEffect(() => {
        // You can listen to errors globally if you want
        const handleGlobalError = (error) => {
            handleError(error);
        };

        window.addEventListener('error', handleGlobalError);

        return () => {
            window.removeEventListener('error', handleGlobalError);
        };
    }, [navigate]);

    return children; // Render the children if no error
};

export default ErrorBoundary;
