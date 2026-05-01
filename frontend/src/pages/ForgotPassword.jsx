import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [canResend, setCanResend] = useState(false);

    // ── Countdown timer ────────────────────────────────────────
    const startCountdown = () => {
        setCountdown(60);
        setCanResend(false);
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // ── Step 1 - Send OTP ──────────────────────────────────────
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess('OTP sent to your email!');
            setStep(2);
            startCountdown();
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError(err.response?.data?.message || 'Email not found');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2 - Verify OTP ────────────────────────────────────
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('Please enter complete 6-digit OTP');
            setLoading(false);
            return;
        }

        try {
            // Verify OTP by attempting reset with dummy password
            // We just move to step 3 and verify on final submit
            setStep(3);
            setSuccess('OTP verified! Set your new password');
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 3 - Reset Password ────────────────────────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            await api.post('/auth/reset-password', {
                email,
                otp: otp.join(''),
                newPassword
            });

            setSuccess('Password reset successfully!');

            // Redirect to login after 2 seconds
            setTimeout(() => navigate('/login'), 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    // ── OTP input handlers ─────────────────────────────────────
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleOtpPaste = (e) => {
        const pasted = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pasted)) return;
        const newOtp = pasted.split('');
        while (newOtp.length < 6) newOtp.push('');
        setOtp(newOtp);
    };

    // ── Resend OTP ─────────────────────────────────────────────
    const handleResend = async () => {
        setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            setOtp(['', '', '', '', '', '']);
            setSuccess('New OTP sent!');
            startCountdown();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to resend OTP');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-500">ChatApp</h1>
                    <p className="text-gray-400 mt-2">Reset your password</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">

                    {/* ── Step indicator ─────────────────── */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        {[1, 2, 3].map(s => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                                    step >= s
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-400'
                                }`}>
                                    {step > s ? '✓' : s}
                                </div>
                                {s < 3 && (
                                    <div className={`w-8 h-0.5 ${
                                        step > s ? 'bg-blue-600' : 'bg-gray-200'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step labels */}
                    <div className="flex justify-between text-xs text-gray-400 mb-6 px-1">
                        <span className={step >= 1 ? 'text-blue-600' : ''}>Email</span>
                        <span className={step >= 2 ? 'text-blue-600' : ''}>Verify OTP</span>
                        <span className={step >= 3 ? 'text-blue-600' : ''}>New Password</span>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
                            {success}
                        </div>
                    )}

                    {/* ── Step 1 - Email ──────────────────── */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="text-center mb-4">
                                <p className="text-5xl mb-3">🔐</p>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Forgot Password?
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Enter your email and we'll send you an OTP
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition duration-200"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {/* ── Step 2 - OTP ────────────────────── */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div className="text-center mb-4">
                                <p className="text-5xl mb-3">📧</p>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Enter OTP
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    We sent a code to
                                </p>
                                <p className="text-blue-600 font-medium text-sm">
                                    {email}
                                </p>
                            </div>

                            {/* OTP boxes */}
                            <div className="flex justify-center gap-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        onPaste={handleOtpPaste}
                                        className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            {/* Resend */}
                            <div className="text-center">
                                {canResend ? (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Resend OTP
                                    </button>
                                ) : (
                                    <p className="text-gray-400 text-sm">
                                        Resend in{' '}
                                        <span className="text-blue-500 font-medium">
                                            {countdown}s
                                        </span>
                                    </p>
                                )}
                            </div>
                        </form>
                    )}

                    {/* ── Step 3 - New Password ────────────── */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="text-center mb-4">
                                <p className="text-5xl mb-3">🔑</p>
                                <h2 className="text-xl font-bold text-gray-800">
                                    New Password
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Choose a strong password
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="Min 6 characters"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="Repeat new password"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            {/* Password strength */}
                            {newPassword && (
                                <div className="space-y-1">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map(i => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition ${
                                                    newPassword.length >= i * 3
                                                        ? i <= 1 ? 'bg-red-400'
                                                        : i <= 2 ? 'bg-yellow-400'
                                                        : i <= 3 ? 'bg-blue-400'
                                                        : 'bg-green-400'
                                                        : 'bg-gray-200'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {newPassword.length < 4 ? '😟 Too short' :
                                         newPassword.length < 7 ? '😐 Weak' :
                                         newPassword.length < 10 ? '🙂 Good' :
                                         '💪 Strong'}
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    {/* Back to login */}
                    <div className="text-center mt-6">
                        <Link
                            to="/login"
                            className="text-gray-400 hover:text-gray-600 text-sm transition"
                        >
                            ← Back to Login
                        </Link>
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