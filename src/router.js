// src/Router.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './common/header.js';
import Footer from './common/footer.js';
import TimesheetPage from './pages/timesheet.js';
import LoginPage from './pages/login.js';
import RegisterPage from './pages/register.js';


const AppRouter = () => {
    return (
        <Router>
            <div style={styles.appContainer}>
                <Header />
                <div style={styles.content}>
                    <Routes>
                        <Route path="/timesheet" element={<TimesheetPage />} />
                        {/* Add more routes as needed */}
                    </Routes>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        {/* Add more routes as needed */}
                    </Routes>
                    <Routes>
                        <Route path="/register" element={<RegisterPage />} />
                        {/* Add more routes as needed */}
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
};

const styles = {
    appContainer: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
    },
    content: {
        flex: 1,
        padding: '20px',
    },
};

export default AppRouter;
