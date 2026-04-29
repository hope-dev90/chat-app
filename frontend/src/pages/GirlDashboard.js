import { useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/authContext';
import { SocketContext } from '../context/socketContext';

export default function GirlDashboard() {
    const { user, logout } = useContext(AuthContext);
    const { onlineUsers } = useContext(SocketContext);
    const [mentors, setMentors] = useState([]);
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState('');

    const loadDashboard = async () => {
        const [mentorResponse, requestResponse] = await Promise.all([
            api.get('/mentor/all'),
            api.get('/mentor/my-requests')
        ]);
        setMentors(mentorResponse.data.mentors || []);
        setRequests(requestResponse.data.requests || []);
    };

    useEffect(() => {
        loadDashboard().catch((error) => {
            setMessage(error.response?.data?.message || 'Unable to load dashboard');
        });
    }, []);

    const requestMentor = async (mentorId) => {
        setMessage('');

        try {
            const { data } = await api.post('/mentor/request', { mentorId });
            setMessage(data.message);
            await loadDashboard();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Unable to send request');
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8">
            <section className="mx-auto max-w-5xl">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Girl dashboard</h1>
                        <p className="text-slate-600">Hi {user?.name}, choose a mentor to start.</p>
                    </div>
                    <button className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-white" onClick={logout}>Logout</button>
                </header>

                {message && <p className="mt-6 rounded-md bg-white p-3 text-sm text-slate-700 shadow">{message}</p>}

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <section>
                        <h2 className="text-xl font-semibold text-slate-900">Available mentors</h2>
                        <div className="mt-4 space-y-3">
                            {mentors.map((mentor) => (
                                <article className="rounded-lg bg-white p-4 shadow" key={mentor.id}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{mentor.name}</h3>
                                            <p className="text-sm text-slate-600">{mentor.email}</p>
                                            <p className="mt-1 text-xs text-slate-500">{onlineUsers.includes(mentor.id) ? 'Online' : 'Offline'}</p>
                                        </div>
                                        <button className="rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700" onClick={() => requestMentor(mentor.id)}>
                                            Request
                                        </button>
                                    </div>
                                </article>
                            ))}
                            {!mentors.length && <p className="text-slate-600">No mentors found.</p>}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900">My requests</h2>
                        <div className="mt-4 space-y-3">
                            {requests.map((request) => (
                                <article className="rounded-lg bg-white p-4 shadow" key={request.id}>
                                    <h3 className="font-semibold text-slate-900">{request.mentor_name || 'Mentor'}</h3>
                                    <p className="text-sm capitalize text-slate-600">{request.status}</p>
                                </article>
                            ))}
                            {!requests.length && <p className="text-slate-600">No requests yet.</p>}
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
}
