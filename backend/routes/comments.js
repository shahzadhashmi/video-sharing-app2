import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { addComment, getComments } from '../controllers/commentController.js';

const router = express.Router();

router.get('/:videoId', getComments);
router.post('/:videoId', authenticate, addComment);

export default router;
