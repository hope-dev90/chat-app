import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function MentorList({ onSelectMentor }) {
    const [mentor, setMentor] = useState(null);
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Get my approved mentor
            const mentorRes = await api.get('/mentor/my-mentor').catch(() => null);
            if (mentorRes?.data?.mentor) {
                setMentor(mentorRes.data.mentor);
            }

            // Get all mentors
            const allRes = await api.get('/mentor/all');
            setMentors(allRes.data.mentors);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (mentorId) => {
        setRequesting(mentorId);
        try {
            await api.post('/mentor/request', { mentorId });
            setMessage('Request sent successfully!');
            fetchData();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to send request');
        } finally {
            setRequesting(null);
        }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Loading...</p>
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto p-6">

            {/* My Mentor */}
            {mentor && (
                <div className="mb-8">
                    <h3 className="text-white font-semibold mb-3">My Mentor</h3>
                    <div
                        onClick={() => onSelectMentor({
                            id: mentor.mentor_id,
                            name: mentor.mentor_name
                        })}
                        className="bg-blue-600 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-blue-700 transition"
                    >
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-lg">
                            {mentor.mentor_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="text-white font-semibold">{mentor.mentor_name}</p>
                            <p className="text-blue-200 text-sm">{mentor.mentor_email}</p>
                        </div>
                        <div className="ml-auto text-white">
                            💬 Chat
                        </div>
                    </div>
                </div>
            )}

            {/* Message */}
            {message && (
                <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg mb-4 text-sm">
                    {message}
                </div>
            )}

            {/* All mentors */}
            <h3 className="text-white font-semibold mb-3">
                {mentor ? 'Other Mentors' : 'Find a Mentor'}
            </h3>
            <div className="space-y-3">
                {mentors.map(m => (
                    <div
                        key={m.id}
                        className="bg-gray-900 rounded-xl p-4 flex items-center gap-4"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                            {m.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-medium">{m.name}</p>
                            <p className="text-gray-500 text-sm">{m.email}</p>
                        </div>
                        {!mentor && (
                            <button
                                onClick={() => handleRequest(m.id)}
                                disabled={requesting === m.id}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm px-4 py-2 rounded-lg transition"
                            >
                                {requesting === m.id ? 'Sending...' : 'Request'}
                            </button>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
}