import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: location.state?.email || '',
        otp: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            await api.post('/auth/verify-email', form);
            navigate('/login');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-12">
            <section className="mx-auto max-w-md">
                <h1 className="text-3xl font-bold text-slate-900">Verify email</h1>
                <p className="mt-2 text-slate-600">Enter the OTP from the backend terminal.</p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-lg bg-white p-6 shadow">
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">Email</span>
                        <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" name="email" type="email" value={form.email} onChange={handleChange} required />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">OTP</span>
                        <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" name="otp" value={form.otp} onChange={handleChange} required />
                    </label>

                    {message && <p className="text-sm text-red-600">{message}</p>}

                    <button className="w-full rounded-md bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700 disabled:opacity-60" type="submit" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>

                    <p className="text-center text-sm text-slate-600">
                        Ready to sign in? <Link className="font-semibold text-teal-700" to="/login">Login</Link>
                    </p>
                </form>
            </section>
        </main>
    );
}
