import express from 'express';
import {
  getAllDefaultPokemon, getPokemonByName, getPokemonByFilters,
  getAllTypes, getAllAbilities, getAllRegions,
  getPokemonById, getVariantsByNdex, getPokemonMoves, getEvolutionChain
} from '../controllers/pokemonController.js';
const router = express.Router();

router.get('/', getAllDefaultPokemon);
router.get('/search/:name', getPokemonByName);
router.post('/filter', getPokemonByFilters);
router.get('/types', getAllTypes);
router.get('/abilities', getAllAbilities);
router.get('/regions', getAllRegions);
router.get('/:sp_id', getPokemonById);
router.get('/variants/:ndex', getVariantsByNdex);
router.get('/moves/:sp_id', getPokemonMoves);
router.get('/evolution/:sp_id', getEvolutionChain);


export default router;
