import express from 'express';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware.js';
import { uploadPokemonGif, uploadImage } from '../middleware/uploadMiddleware.js';

import {
  getAllUsers,
  toggleUserAdmin,
  addPokemon, editPokemon, deletePokemon, getAllPokemon,
  addItem, editItem, deleteItem,
  addCharacter, editCharacter, deleteCharacter, getDropdownData
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticateJWT);
router.use(isAdmin);

// User controls
router.get('/users', getAllUsers);
router.patch('/users/:user_id/toggle-admin', toggleUserAdmin);

// Pokémons
router.get('/dropdown-data', getDropdownData);
router.get('/pokemon', getAllPokemon);
router.post('/pokemon', addPokemon);
router.put('/pokemon/:sp_id', editPokemon);
router.delete('/pokemon/:sp_id', deletePokemon);

// Items
router.post('/item', addItem);
router.put('/item/:item_id', editItem);
router.delete('/item/:item_id', deleteItem);

// Characters
router.post('/character', addCharacter);
router.put('/character/:character_id', editCharacter);
router.delete('/character/:character_id', deleteCharacter);

// Pokémon gif upload
router.post('/upload-pokemon-gif', uploadPokemonGif, (req, res) => {
  res.json({ message: 'Pokémon GIF uploaded successfully' });
});

// Image upload (characters/items)
router.post('/upload-image', uploadImage, (req, res) => {
  res.json({ message: 'Image uploaded successfully', filename: req.file.filename });
});
export default router;
