import express from 'express';
import { searchForums, createForum, getForumComments, addComment, deleteComment } from '../controllers/forumController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', searchForums);
router.post('/', authenticateJWT, createForum);
router.get('/:forum_id/comments', getForumComments);
router.post('/comment', authenticateJWT, addComment);
router.delete('/comment', authenticateJWT, deleteComment);

export default router;
