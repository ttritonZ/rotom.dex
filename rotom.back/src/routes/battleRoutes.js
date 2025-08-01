import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { 
  getMyPokemon, 
  getMyPokemonDetail,
  getPokemonMoves, 
  getActiveBattles,
  getBattleHistory,
  getBattle, 
  addBattleLog,
  getBattleLogs,
  getRecentBattles
} from '../controllers/battleController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Get specific Pokemon details (must come before /pokemon to avoid conflicts)
router.get('/pokemon/:pokemonId', getMyPokemonDetail);

// Get Pokemon moves
router.get('/pokemon/:pokemonId/moves', getPokemonMoves);

// Get user's Pokemon (must come after specific routes)
router.get('/pokemon', getMyPokemon);

// Get active battles
router.get('/active', getActiveBattles);

// Get battle history
router.get('/history', getBattleHistory);

// Get battle details
router.get('/:battleId', getBattle);

// Battle log routes
router.post('/logs', addBattleLog);
router.get('/logs/:battleId', getBattleLogs);
router.get('/recent/:userId', getRecentBattles);

export default router;
