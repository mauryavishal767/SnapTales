import { useState, useEffect }   from 'react';
import                                './styles/globals.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout                    from './components/layout/Layout';
import LoginPage                 from './pages/LoginPage';
import SignupPage                from './pages/SignupPage';
import TimelinePage              from './pages/TimelinePage';
import VerificationPage          from './pages/VerificationPage';
import ProfilePage               from './pages/ProfilePage';
import CoupleConnection          from './pages/CoupleConnection';
import LoadingSpinner            from './components/ui/LoadingSpinner';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location                     = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return  <Navigate 
                    to="/login" 
                    state={{ from: location }} 
                    replace 
                />;
    }
    
    return children;
};

// Auth Route component (for login/signup pages)
const AuthRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location                     = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (isAuthenticated) {
        const from = location.state?.from?.pathname || '/timeline';
        return  <Navigate 
                    to={from} 
                    replace 
                />;
    }

    return children;
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