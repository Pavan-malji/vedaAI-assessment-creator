import { Router } from 'express';
import { createAssignment, getAssignment, getResult } from '../controllers/assignment';

const router = Router();

router.post('/', createAssignment);
router.get('/:id', getAssignment);
router.get('/:id/result', getResult);

export default router;
