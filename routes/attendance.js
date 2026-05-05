import { Router } from 'express';
import { getAll, getSummary, getByTime, markAttendance } from '../controler/attendanceController.js';

const router = Router();

router.get('/', getAll);
router.get('/summary', getSummary);
router.get('/by-time', getByTime);
router.post('/mark', markAttendance);

export default router;
