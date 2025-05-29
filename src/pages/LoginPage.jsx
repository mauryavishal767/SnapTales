import { useState }                   from 'react';
import { useNavigate }                from 'react-router-dom';
import { signInUser, getCurrentUser } from '../lib/appwrite';
import { useAuth }                    from '../context/AuthContext';
import { Button }                     from '../components/ui/Button';
import { Input }                      from '../components/ui/Input';

const LoginPage = () => {
    // TODO: if user is logdein and visit login page redirect to timeline, if this is a issue i dont know
    const navigate                        = useNavigate();
    const [form    , setForm]             = useState({ email: '', password: '' });
    const [loading , setLoading]          = useState(false);
    const [error   , setError]            = useState('');
    const { setUser, setIsAuthenticated } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const session = await signInUser(form.email, form.password);
            console.log('session', session);
            if (session) {
                console.log('inside session', session);
                const user = await getCurrentUser();
                if(!user?.emailVerification) {
                    throw new Error("User not verified! check your email");
                }
                else{
                    setUser(user);
                    setIsAuthenticated(true);
                    console.log('user', user);
                    navigate('/timeline');
                }
            }
        } catch (error) {
            setError(error.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full glass-card rounded-2xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        SnapTales
                    </h1>
                    <p className="text-gray-600 mt-2">Welcome back to your love story</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="Enter your email"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Enter your password"
                        required
                    />

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        loading={loading}
                        className="w-full"
                        size="large"
                    >
                        Sign In
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <button
                            onClick={() => {
                                window.location.hash = 'signup';
                                navigate('/signup');
                            }}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;