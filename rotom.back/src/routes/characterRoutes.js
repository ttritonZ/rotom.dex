import express from 'express';
import { getAllCharacters, getCharacterDetails, getTrainerClasses, getRegions, getTypes } from '../controllers/characterController.js';
const router = express.Router();

router.get('/', getAllCharacters);
router.get('/trainer-classes', getTrainerClasses);
router.get('/regions', getRegions);
router.get('/types', getTypes);
router.get('/:character_id', getCharacterDetails);

export default router;
