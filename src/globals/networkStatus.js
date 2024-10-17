import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useNetworkStatus = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const updateNetworkStatus = () => {
            if (!navigator.onLine) {
                navigate('/maintenance');
            }
        };

        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);

        // Check initial network status
        updateNetworkStatus();

        return () => {
            window.removeEventListener('online', updateNetworkStatus);
            window.removeEventListener('offline', updateNetworkStatus);
        };
    }, [navigate]);
};

export default useNetworkStatus;
