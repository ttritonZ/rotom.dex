import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import {
  getPokemonList,
  getItemList,
  getUserMoney,
  buyProduct
} from '../controllers/shopController.js';

const router = express.Router();

router.get('/pokemon', authenticateJWT, getPokemonList);
router.get('/items', authenticateJWT, getItemList);
router.get('/money', authenticateJWT, getUserMoney);
router.post('/buy', authenticateJWT, buyProduct);

export default router;
