import express from 'express';
import { getItems, getItemById } from '../controllers/itemController.js';

const router = express.Router();

router.get('/', getItems);
router.get('/:item_id', getItemById);

export default router;
