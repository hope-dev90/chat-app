import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function PendingRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/mentor/pending');
            setRequests(res.data.requests);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, action) => {
        setProcessing(requestId);
        try {
            await api.put(`/mentor/${action}/${requestId}`);
            setMessage(`Request ${action}d successfully!`);
            fetchRequests();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Something went wrong');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Loading...</p>
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-white font-semibold text-lg mb-4">
                Pending Requests
                <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {requests.length}
                </span>
            </h3>

            {/* Message */}
            {message && (
                <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg mb-4 text-sm">
                    {message}
                </div>
            )}

            {/* Empty state */}
            {requests.length === 0 && (
                <div className="text-center mt-16">
                    <p className="text-6xl mb-4">📭</p>
                    <p className="text-gray-400">No pending requests</p>
                    <p className="text-gray-600 text-sm mt-1">
                        Girls will appear here when they request you
                    </p>
                </div>
            )}

            {/* Requests list */}
            <div className="space-y-4">
                {requests.map(req => (
                    <div
                        key={req.id}
                        className="bg-gray-900 rounded-xl p-4 flex items-center gap-4"
                    >
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {req.girl_name?.[0]?.toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <p className="text-white font-medium">{req.girl_name}</p>
                            <p className="text-gray-500 text-sm">{req.girl_email}</p>
                            <p className="text-gray-600 text-xs mt-1">
                                {new Date(req.created_at).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAction(req.id, 'approve')}
                                disabled={processing === req.id}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm px-4 py-2 rounded-lg transition"
                            >
                                {processing === req.id ? '...' : '✅ Approve'}
                            </button>
                            <button
                                onClick={() => handleAction(req.id, 'reject')}
                                disabled={processing === req.id}
                                className="bg-gray-700 hover:bg-red-600 disabled:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition"
                            >
                                {processing === req.id ? '...' : '❌ Reject'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}