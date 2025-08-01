import express from 'express';
import { registerUser, loginUser, getUserProfile, getMe, updateUserProfile, logoutUser, setUserPokemonNickname, getUserPokemon, getUserPokemonMoves } from '../controllers/authController.js';
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

router.get('/me', getMe);
router.put('/profile/:user_id', (req, res, next) => {
  console.log('PUT /profile/:user_id route hit');
  console.log('Request params:', req.params);
  console.log('Request headers:', req.headers);
  next();
}, upload.single('profile_image'), updateUserProfile);
router.get('/profile/:user_id', getUserProfile);
router.post('/logout', logoutUser);
router.get('/profile/:userId/pokemon', getUserPokemon);
router.get('/profile/:userId/:userPokemonId/moves', getUserPokemonMoves);
router.post('/profile/:userId/:userPokemonId/nickname', setUserPokemonNickname);

// Debug route to check user's admin status
router.get('/debug/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided', user: null });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided', user: null });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, 'super_secret_key');
    res.json({ 
      message: 'Token decoded successfully', 
      user: decoded,
      isAdmin: decoded.is_admin,
      hasAdminField: 'is_admin' in decoded
    });
  } catch (error) {
    res.status(401).json({ 
      message: 'Invalid or expired token', 
      error: error.message,
      user: null 
    });
  }
});

export default router;
