import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Get email from navigation state
    const email = location.state?.email;

    // Redirect if no email
    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown === 0) {
            setCanResend(true);
            return;
        }
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // numbers only

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    // Handle backspace
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    // Handle paste
    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pasted)) return;
        const newOtp = pasted.split('');
        while (newOtp.length < 6) newOtp.push('');
        setOtp(newOtp);
    };

    // Submit OTP
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            setLoading(false);
            return;
        }

        try {
            await api.post('/auth/verify-email', {
                email,
                otp: otpCode
            });

            setSuccess('Email verified successfully!');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResend = async () => {
        setResending(true);
        setError('');

        try {
            await api.post('/auth/forgot-password', { email });
            setCountdown(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            setSuccess('New OTP sent to your email!');
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-500">ChatApp</h1>
                    <p className="text-gray-400 mt-2">Verify your email</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">

                    {/* Icon */}
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-4">📧</div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Check your email
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                            We sent a 6-digit code to
                        </p>
                        <p className="text-blue-600 font-medium text-sm">
                            {email}
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm text-center">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* OTP inputs */}
                        <div className="flex justify-center gap-3 mb-6">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            ))}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition duration-200"
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>

                    </form>

                    {/* Resend */}
                    <div className="text-center mt-6">
                        {canResend ? (
                            <button
                                onClick={handleResend}
                                disabled={resending}
                                className="text-blue-500 hover:text-blue-700 font-medium text-sm"
                            >
                                {resending ? 'Sending...' : 'Resend OTP'}
                            </button>
                        ) : (
                            <p className="text-gray-400 text-sm">
                                Resend OTP in{' '}
                                <span className="text-blue-500 font-medium">
                                    {countdown}s
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Back to register */}
                    <div className="text-center mt-4">
                        <button
                            onClick={() => navigate('/register')}
                            className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                            ← Back to Register
                        </button>
                    </div>

                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 text-xs mt-6">
                    © 2024 ChatApp. All rights reserved.
                </p>

            </div>
        </div>
    );
}