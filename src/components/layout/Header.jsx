import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <button 
                            onClick={() => navigate('/timeline')}
                            className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
                        >
                            SnapTales
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => navigate('/timeline')}
                            className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Timeline
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Profile
                        </button>
                    </nav>

                    {/* Actions: profile & logout */}
                    <div className="flex items-center space-x-4">
                        {/* User Menu */}
                        <div className="relative">
                            <div className="flex items-center space-x-3">
                                <span 
                                    className="text-sm text-gray-700 hover:cursor-pointer hover:text-primary-600"
                                    onClick={()=> navigate('/profile')}
                                >Hi, {user?.name}</span>
                                <button
                                    onClick={logout}
                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                    title="Sign out"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;