import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const Maintenance = () => {
    const navigate = useNavigate();

    return (
        <Result
            status="503"
            title="503"
            subTitle="Sorry, the site is under maintenance. Please try again later."
            extra={<Button type="primary" onClick={() => navigate('/')}>Back Home</Button>}
        />
    );
};

export default Maintenance;
