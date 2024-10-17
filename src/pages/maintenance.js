import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const Maintenance = () => {
    const navigate = useNavigate();

    const handleRetry = () => {
        // Logic to retry fetching data, or refresh the page
        window.location.reload();
    };

    return (
        <Result
            status="503"
            title="503"
            subTitle="Sorry, the site is under maintenance. Please try again later."
            extra={[
                <Button type="primary" onClick={() => navigate('/')}>
                    Back Home
                </Button>,
                <Button style={{ marginLeft: '10px' }} onClick={handleRetry}>
                    Retry
                </Button>,
                <Button style={{ marginLeft: '10px' }} onClick={() => navigate('/help')}>
                    Need Help?
                </Button>
            ]}
        />
    );
};

export default Maintenance;
