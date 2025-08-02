import express from 'express';
import {
  getAllDefaultPokemon, getPokemonByName, getPokemonByFilters,
  getAllTypes, getAllAbilities, getAllRegions,
  getPokemonById, getVariantsByNdex, getPokemonMoves, getEvolutionChain,
  getUserPokemon, updatePokemonNickname, releasePokemon
} from '../controllers/pokemonController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/', getAllDefaultPokemon);
router.get('/search/:name', getPokemonByName);
router.post('/filter', getPokemonByFilters);
router.get('/types', getAllTypes);
router.get('/abilities', getAllAbilities);
router.get('/regions', getAllRegions);
router.get('/user/:userId', getUserPokemon);
router.put('/nickname/:userPokemonId', authenticateJWT, updatePokemonNickname);
router.delete('/:userPokemonId', authenticateJWT, releasePokemon);
router.get('/:sp_id', getPokemonById);
router.get('/variants/:ndex', getVariantsByNdex);
router.get('/moves/:sp_id', getPokemonMoves);
router.get('/evolution/:sp_id', getEvolutionChain);


export default router;
