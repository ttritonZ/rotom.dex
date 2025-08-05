import express from "express";
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// User profile routes will go here

export default router;
