import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TimelinePage from './pages/TimelinePage';
import Timeline from './components/memories/Timeline';
import VerificationPage from './pages/VerificationPage';
import ProfilePage from './pages/ProfilePage';
import CoupleConnection from './pages/CoupleConnection';
import LoadingSpinner from './components/ui/LoadingSpinner';
import './styles/globals.css';

// Router component (simple client-side routing)
const Router = () => {
    const [currentPage, setCurrentPage] = useState('timeline');
    const [showAddMemory, setShowAddMemory] = useState(false);
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        
        // Simple routing based on hash
        const handleHashChange = () => {
            const path = window.location.pathname;
            const hash = window.location.hash.slice(1);
            
            if (path === '/verify') {
                setCurrentPage('verify');
            } else {
                setCurrentPage(hash || 'timeline');
            }

            // const hash = window.location.hash.slice(1) || 'timeline';
            // setCurrentPage(hash);
        };

        // window.addEventListener('popstate', handleRouteChange);
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Initial load

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (!isAuthenticated) {
        const currentPath = window.location.pathname;
        if(currentPath === '/verify'){
            console.log("verify")
            setCurrentPage('verify')
            return <VerificationPage onNavigate={setCurrentPage}/>;
        }
        if (currentPage === 'signup' || currentPath === '/signup') {
            return <SignupPage onNavigate={setCurrentPage} />;
        }
        return <LoginPage onNavigate={setCurrentPage} />;
    }

    const renderPage = () => {
        switch (currentPage.toLowerCase()) {
            case 'profile':
                return <ProfilePage onNavigate={setCurrentPage}/>;
            case 'timeline':
                return <TimelinePage onAddMemory={setShowAddMemory}/>;
            case 'connection':
                return <CoupleConnection/>;
            case 'verify':
                return <VerificationPage onNavigate={setCurrentPage}/>;
            default:
                return <TimelinePage />;
        }
    };

    return (
        <Layout onNavigate={setCurrentPage} showAddMemory={showAddMemory} setShowAddMemory={setShowAddMemory}>
            {renderPage()}
        </Layout>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
                <Router />
            </div>
        </AuthProvider>
    );
};

export default App;