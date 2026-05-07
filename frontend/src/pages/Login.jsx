import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import api from '../api/axios';

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', formData);
            const { token, user } = res.data;

            
            login(user, token);

            // Redirect based on role
            if (user.role === 'mentor') {
                navigate('/mentor-dashboard');
            } else {
                navigate('/dashboard');
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-500">ChatApp</h1>
                    <p className="text-gray-400 mt-2">Welcome back!</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        Sign In
                    </h2>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                autoComplete="email"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* Forgot password */}
                        <div className="text-right">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-blue-500 hover:text-blue-700"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition duration-200"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                    </form>

                    {/* Register link */}
                    <p className="text-center text-gray-500 text-sm mt-6">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-blue-500 hover:text-blue-700 font-medium"
                        >
                            Sign Up
                        </Link>
                    </p>

                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 text-xs mt-6">
                    © 2024 ChatApp. All rights reserved.
                </p>

            </div>
        </div>
    );
}
