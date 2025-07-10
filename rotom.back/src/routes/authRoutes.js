import express from 'express';
import { registerUser, loginUser, getUserProfile, getMe, logoutUser } from '../controllers/authController.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Allow registration with or without a file
router.post('/register', (req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    upload.single('profileImage')(req, res, next);
  } else {
    next();
  }
}, registerUser);

// Add express.json() middleware to the /login route
router.post('/login', express.json(), loginUser);

router.get('/profile/:user_id', getUserProfile);
router.get('/me', getMe);
router.post('/logout', logoutUser);

export default router;
