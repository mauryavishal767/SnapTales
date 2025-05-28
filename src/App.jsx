import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Save the attempted location for redirecting after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

// Auth Route component (for login/signup pages)
const AuthRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (isAuthenticated) {
        // Redirect to the page they were trying to visit, or timeline
        const from = location.state?.from?.pathname || '/timeline';
        return <Navigate to={from} replace />;
    }

    return children;
};

// Layout wrapper component
const LayoutWrapper = ({ children }) => {
    const [showAddMemory, setShowAddMemory] = useState(false);
    
    return (
        <Layout showAddMemory={showAddMemory} setShowAddMemory={setShowAddMemory}>
            {children}
        </Layout>
    );
};

// Main App Routes
const AppRoutes = () => {
    const [showAddMemory, setShowAddMemory] = useState(false);

    return (
        <Routes>
            {/* Public routes */}
            <Route 
                path="/login" 
                element={
                    <AuthRoute>
                        <LoginPage />
                    </AuthRoute>
                } 
            />
            <Route 
                path="/signup" 
                element={
                    <AuthRoute>
                        <SignupPage />
                    </AuthRoute>
                } 
            />
            <Route 
                path="/verify" 
                element={<VerificationPage />} 
            />

            {/* Protected routes */}
            <Route 
                path="/timeline" 
                element={
                    <ProtectedRoute>
                        <Layout showAddMemory={showAddMemory} setShowAddMemory={setShowAddMemory}>
                            <TimelinePage onAddMemory={setShowAddMemory} />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/profile" 
                element={
                    <ProtectedRoute>
                        <Layout showAddMemory={showAddMemory} setShowAddMemory={setShowAddMemory}>
                            <ProfilePage />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/connection" 
                element={
                    <ProtectedRoute>
                        <Layout showAddMemory={showAddMemory} setShowAddMemory={setShowAddMemory}>
                            <CoupleConnection />
                        </Layout>
                    </ProtectedRoute>
                } 
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/timeline" replace />} />
            
            {/* Catch all route - redirect to timeline */}
            <Route path="*" element={<Navigate to="/timeline" replace />} />
        </Routes>
    );
};

// Router component (simple client-side routing)
// const Router = () => {
//     const [currentPage, setCurrentPage] = useState('timeline');
//     const [showAddMemory, setShowAddMemory] = useState(false);
//     const { isAuthenticated, loading } = useAuth();

//     useEffect(() => {
        
//         // Simple routing based on hash
//         const handleHashChange = () => {
//             const path = window.location.pathname;
//             const hash = window.location.hash.slice(1);
            
//             if (path === '/verify') {
//                 setCurrentPage('verify');
//             } else {
//                 setCurrentPage(hash || 'timeline');
//             }

//             // const hash = window.location.hash.slice(1) || 'timeline';
//             // setCurrentPage(hash);
//         };

//         // window.addEventListener('popstate', handleRouteChange);
//         window.addEventListener('hashchange', handleHashChange);
//         handleHashChange(); // Initial load

//         return () => window.removeEventListener('hashchange', handleHashChange);
//     }, []);

//     if (loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center">
//                 <LoadingSpinner size="large" />
//             </div>
//         );
//     }

//     if (!isAuthenticated) {
//         const currentPath = window.location.pathname;
//         if(currentPath === '/verify'){
//             console.log("verify")
//             setCurrentPage('verify')
//             return <VerificationPage onNavigate={setCurrentPage}/>;
//         }
//         if (currentPage === 'signup' || currentPath === '/signup') {
//             return <SignupPage onNavigate={setCurrentPage} />;
//         }
//         return <LoginPage onNavigate={setCurrentPage} />;
//     }

//     const renderPage = () => {
//         switch (currentPage.toLowerCase()) {
//             case 'profile':
//                 return <ProfilePage onNavigate={setCurrentPage}/>;
//             case 'timeline':
//                 return <TimelinePage onAddMemory={setShowAddMemory}/>;
//             case 'connection':
//                 return <CoupleConnection/>;
//             case 'verify':
//                 return <VerificationPage onNavigate={setCurrentPage}/>;
//             default:
//                 return <TimelinePage />;
//         }
//     };

//     return (
//         <Layout onNavigate={setCurrentPage} showAddMemory={showAddMemory} setShowAddMemory={setShowAddMemory}>
//             {renderPage()}
//         </Layout>
//     );
// };

// const App = () => {
//     return (
//         <AuthProvider>
//             <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
//                 <Router />
//             </div>
//         </AuthProvider>
//     );
// };

const App = () => {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
                <Router>
                    <AppRoutes />
                </Router>
            </div>
        </AuthProvider>
    );
};

export default App;