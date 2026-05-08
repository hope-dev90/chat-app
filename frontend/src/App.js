import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext, AuthProvider } from './context/authContext';
import { SocketProvider, SocketContext } from './context/socketContext';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import GirlDashboard from './pages/GirlDashboard';
import MentorDashboard from './pages/MentorDashboard';
import VerifyEmail from './pages/VerifyEmail';
import IncomingCallModal from './components/chat/IncomingCallModal';
import VideoCall from './components/chat/VideoCall';
import CommunityHub from './pages/CommunityHub';
import DirectMessages from './pages/DirectMessages';
import Circles from './pages/Circles';
import MentorChat from './pages/MentorChat';

// Protected route component
const ProtectedRoute = ({ children, role }) => {
    const { user } = useContext(AuthContext);

    if (!user) return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to="/login" />;

    return children;
};

const AppRoutes = () => {
    const { user } = useContext(AuthContext);

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Girl routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute role="girl">
                    <GirlDashboard />
                </ProtectedRoute>
            } />
            <Route path="/community" element={
                <ProtectedRoute role="girl">
                    <CommunityHub />
                </ProtectedRoute>
            } />
            <Route path="/chat" element={
                <ProtectedRoute role="girl">
                    <DirectMessages />
                </ProtectedRoute>
            } />
            <Route path="/circles" element={
                <ProtectedRoute role="girl">
                    <Circles />
                </ProtectedRoute>
            } />

            {/* Mentor routes */}
            <Route path="/mentor-dashboard" element={
                <ProtectedRoute role="mentor">
                    <MentorDashboard />
                </ProtectedRoute>
            } />
            <Route path="/mentorship/chat" element={
                <ProtectedRoute role="mentor">
                    <MentorChat />
                </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={
                user?.role === 'mentor'
                    ? <Navigate to="/mentor-dashboard" />
                    : user?.role === 'girl'
                        ? <Navigate to="/community" />
                        : <Navigate to="/login" />
            } />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <SocketProvider>
                    <AppRoutes />
                    <GlobalCallHandler />
                </SocketProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

// Handles incoming calls globally — shown on top of any page
function GlobalCallHandler() {
    const { socket, incomingCall, setIncomingCall } = useContext(SocketContext);
    const [activeCall, setActiveCall] = useState(null);

    const accept = () => {
        setActiveCall({ roomUrl: incomingCall.roomUrl, callType: incomingCall.callType });
        setIncomingCall(null);
    };

    const decline = () => {
        if (socket) socket.emit('call-declined', { toUserId: incomingCall.fromId });
        setIncomingCall(null);
    };

    const endCall = () => {
        if (socket) socket.emit('call-ended', {});
        setActiveCall(null);
    };

    return (
        <>
            {incomingCall && !activeCall && (
                <IncomingCallModal call={incomingCall} onAccept={accept} onDecline={decline} />
            )}
            {activeCall && (
                <VideoCall roomUrl={activeCall.roomUrl} audioOnly={activeCall.callType === 'audio'} onLeave={endCall} />
            )}
        </>
    );
}
