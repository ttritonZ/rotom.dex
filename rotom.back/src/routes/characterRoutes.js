import express from 'express';
import { getAllCharacters, getCharacterDetails, getTrainerClasses } from '../controllers/characterController.js';
const router = express.Router();

router.get('/', getAllCharacters);
router.get('/trainer-classes', getTrainerClasses);
router.get('/:character_id', getCharacterDetails);

export default router;
