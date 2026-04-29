import express from 'express';
import {
    getMentors,
    sendMentorRequest,
    myRequests,
    myMentor,
    pendingRequests,
    approve,
    reject,
    myMentees
} from '../controllers/mentorController.js';
import {
    authMiddleware,
    girlOnly,
    mentorOnly
} from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── Girl routes ───────────────────────────────────────────────
router.get('/all', authMiddleware, girlOnly, getMentors);
router.post('/request', authMiddleware, girlOnly, sendMentorRequest);
router.get('/my-requests', authMiddleware, girlOnly, myRequests);
router.get('/my-mentor', authMiddleware, girlOnly, myMentor);

// ─── Mentor routes ─────────────────────────────────────────────
router.get('/pending', authMiddleware, mentorOnly, pendingRequests);
router.get('/my-mentees', authMiddleware, mentorOnly, myMentees);
router.put('/approve/:requestId', authMiddleware, mentorOnly, approve);
router.put('/reject/:requestId', authMiddleware, mentorOnly, reject);

export default router;