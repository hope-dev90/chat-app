import { Router } from 'express';
import { getConfig, setConfig, updateConfig } from '../controler/configController.js';

const router = Router();

router.get('/', getConfig);
router.post('/', setConfig);
router.put('/', updateConfig);

export default router;
