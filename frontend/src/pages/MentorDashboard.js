import { useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/authContext';

export default function MentorDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [mentees, setMentees] = useState([]);
    const [message, setMessage] = useState('');

    const loadDashboard = async () => {
        const [pendingResponse, menteeResponse] = await Promise.all([
            api.get('/mentor/pending'),
            api.get('/mentor/my-mentees')
        ]);
        setRequests(pendingResponse.data.requests || []);
        setMentees(menteeResponse.data.mentees || []);
    };

    useEffect(() => {
        loadDashboard().catch((error) => {
            setMessage(error.response?.data?.message || 'Unable to load dashboard');
        });
    }, []);

    const updateRequest = async (requestId, action) => {
        setMessage('');

        try {
            const { data } = await api.put(`/mentor/${action}/${requestId}`);
            setMessage(data.message);
            await loadDashboard();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Unable to update request');
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8">
            <section className="mx-auto max-w-5xl">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Mentor dashboard</h1>
                        <p className="text-slate-600">Hi {user?.name}, manage your mentee requests.</p>
                    </div>
                    <button className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-white" onClick={logout}>Logout</button>
                </header>

                {message && <p className="mt-6 rounded-md bg-white p-3 text-sm text-slate-700 shadow">{message}</p>}

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <section>
                        <h2 className="text-xl font-semibold text-slate-900">Pending requests</h2>
                        <div className="mt-4 space-y-3">
                            {requests.map((request) => (
                                <article className="rounded-lg bg-white p-4 shadow" key={request.id}>
                                    <h3 className="font-semibold text-slate-900">{request.girl_name || 'Student'}</h3>
                                    <p className="text-sm text-slate-600">{request.girl_email}</p>
                                    <div className="mt-4 flex gap-2">
                                        <button className="rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700" onClick={() => updateRequest(request.id, 'approve')}>
                                            Approve
                                        </button>
                                        <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={() => updateRequest(request.id, 'reject')}>
                                            Reject
                                        </button>
                                    </div>
                                </article>
                            ))}
                            {!requests.length && <p className="text-slate-600">No pending requests.</p>}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900">My mentees</h2>
                        <div className="mt-4 space-y-3">
                            {mentees.map((mentee) => (
                                <article className="rounded-lg bg-white p-4 shadow" key={mentee.id || mentee.girl_id}>
                                    <h3 className="font-semibold text-slate-900">{mentee.girl_name || mentee.name}</h3>
                                    <p className="text-sm text-slate-600">{mentee.girl_email || mentee.email}</p>
                                </article>
                            ))}
                            {!mentees.length && <p className="text-slate-600">No mentees yet.</p>}
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
}
