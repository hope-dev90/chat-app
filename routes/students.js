import { Router } from 'express';
import { getAll, getById, createStudent, updateStudent, deleteStudent } from '../controler/studentController.js';

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;
