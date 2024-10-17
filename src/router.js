// src/Router.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './common/header.js';
import Footer from './common/footer.js';
import TimesheetPage from './pages/timesheet.js';
import LoginPage from './pages/login.js';
import RegisterPage from './pages/register.js';
import Approval from './pages/approval.js';
import Maintenance from './pages/maintenance.js';
import HomePage from './pages/homePage.js';
import NotFound from './pages/notFound.js';
import ErrorBoundary from './globals/errorBoundary.js';


const AppRouter = () => {
    return (
        <Router>
            <ErrorBoundary>
                <div style={styles.appContainer}>
                    <Header />
                    <div style={styles.content}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/timesheet" element={<TimesheetPage />} />
                            <Route path="/approval" element={<Approval />} />
                            <Route path="/maintenance" element={<Maintenance />} />
                            <Route path="*" element={<NotFound />} /> {/* This should be last */}
                        </Routes>
                    </div>

                    <Footer />
                </div>
            </ErrorBoundary>
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
