import { Router } from 'express';
import { getAll, createRecipient, updateRecipient, deleteRecipient } from '../controler/recipientController.js';

const router = Router();

router.get('/', getAll);
router.post('/', createRecipient);
router.put('/:id', updateRecipient);
router.delete('/:id', deleteRecipient);

export default router;
