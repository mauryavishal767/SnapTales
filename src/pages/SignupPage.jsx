import { useState }          from 'react';
import { useNavigate }       from 'react-router-dom';
import { createUserAccount } from '../lib/appwrite';
import { useAuth }           from '../context/AuthContext';
import { Button }            from '../components/ui/Button';
import { Input }             from '../components/ui/Input';

const SignupPage = () => {
    const navigate              = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error  , setError]   = useState('');
    const [form   , setForm]    = useState({
        name           : '',
        email          : '',
        password       : '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (form.password.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            const {newAccount, session, link} = await createUserAccount(form.email, form.password, form.name);
            if (newAccount) {
                setSuccess('verification email has been sent.');
                setTimeout(() => {
                    // TODO: delete session
                }, 3000);
            }
        } catch (error) {
            setError(error.message || 'Sign up failed. Please try again.');
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
                    <p className="text-gray-600 mt-2">Start your love story journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Full Name"
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Enter your full name"
                        required
                    />

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
                        placeholder="Create a password (min. 8 characters)"
                        required
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        placeholder="Confirm your password"
                        required
                    />

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            {success}
                        </div>
                    )}

                    <Button
                        type="submit"
                        loading={loading}
                        className="w-full"
                        size="large"
                    >
                        Create Account
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <button
                            onClick={() => {
                                navigate('/login');
                            }}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;