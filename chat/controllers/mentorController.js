import {
    requestMentor,
    checkExistingRequest,
    approveRequest,
    rejectRequest,
    getPendingRequests,
    getMyMentees,
    getMyMentor,
    getGirlRequests
} from '../models/mentorModel.js';

import {
    findUserById,
    getAllMentors
} from '../models/userModel.js';

// ─── Get all mentors (girls can see this) ──────────────────────
export const getMentors = async (req, res) => {
    try {
        const mentors = await getAllMentors();

        return res.status(200).json({
            success: true,
            mentors
        });

    } catch (error) {
        console.error('getMentors error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// ─── Girl requests a mentor ────────────────────────────────────
export const sendMentorRequest = async (req, res) => {
    const { mentorId } = req.body;
    const girlId = req.user.id;

    try {
        if (!mentorId) {
            return res.status(400).json({
                success: false,
                message: 'Mentor ID is required'
            });
        }

        const mentor = await findUserById(mentorId);
        if (!mentor || mentor.role !== 'mentor') {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        // Check if request already exists
        const existing = await checkExistingRequest(girlId, mentorId);
        if (existing) {
            return res.status(400).json({
                success: false,
                message: `Request already ${existing.status}`
            });
        }

        const request = await requestMentor(girlId, mentorId);

        return res.status(201).json({
            success: true,
            message: 'Mentor request sent successfully',
            request
        });

    } catch (error) {
        console.error('sendMentorRequest error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// ─── Girl sees her requests ────────────────────────────────────
export const myRequests = async (req, res) => {
    const girlId = req.user.id;

    try {
        const requests = await getGirlRequests(girlId);

        return res.status(200).json({
            success: true,
            requests
        });

    } catch (error) {
        console.error('myRequests error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// ─── Girl sees her approved mentor ────────────────────────────
export const myMentor = async (req, res) => {
    const girlId = req.user.id;

    try {
        const mentor = await getMyMentor(girlId);

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'No approved mentor yet'
            });
        }

        return res.status(200).json({
            success: true,
            mentor
        });

    } catch (error) {
        console.error('myMentor error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// ─── Mentor sees pending requests ─────────────────────────────
export const pendingRequests = async (req, res) => {
    const mentorId = req.user.id;

    try {
        const requests = await getPendingRequests(mentorId);

        return res.status(200).json({
            success: true,
            requests
        });

    } catch (error) {
        console.error('pendingRequests error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// ─── Mentor approves a girl ────────────────────────────────────
export const approve = async (req, res) => {
    const { requestId } = req.params;
    const mentorId = req.user.id;

    try {
        const request = await approveRequest(requestId, mentorId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Request approved successfully',
            request
        });

    } catch (error) {
        console.error('approve error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// ─── Mentor rejects a girl ────────────────────────────────────
export const reject = async (req, res) => {
    const { requestId } = req.params;
    const mentorId = req.user.id;

    try {
        const request = await rejectRequest(requestId, mentorId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Request rejected',
            request
        });

    } catch (error) {
        console.error('reject error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

// ─── Mentor sees all his mentees ──────────────────────────────
export const myMentees = async (req, res) => {
    const mentorId = req.user.id;

    try {
        const mentees = await getMyMentees(mentorId);

        return res.status(200).json({
            success: true,
            mentees
        });

    } catch (error) {
        console.error('myMentees error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};
