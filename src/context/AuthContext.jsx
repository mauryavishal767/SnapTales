import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, signOutUser } from '../lib/appwrite';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuthUser = async () => {
        setLoading(true);
        try {
            const currentAccount = await getCurrentUser();
            if (currentAccount) {
                setUser(currentAccount);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthUser();
    }, []);

    const logout = async () => {
        try {
            await signOutUser();
            setUser(null);
            setIsAuthenticated(false);
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        setUser,
        setIsAuthenticated,
        checkAuthUser,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};