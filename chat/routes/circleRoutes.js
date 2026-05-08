import express from 'express';
import { create, list, myCircles, join, leave } from '../controllers/circleController.js';
import { authMiddleware, mentorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',           authMiddleware, list);          // all circles (girls + mentors)
router.post('/',          authMiddleware, mentorOnly, create);  // mentor creates
router.get('/mine',       authMiddleware, mentorOnly, myCircles); // mentor's own circles
router.post('/:id/join',  authMiddleware, join);          // anyone joins
router.post('/:id/leave', authMiddleware, leave);         // anyone leaves

export default router;
