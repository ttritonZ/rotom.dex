import express from 'express';
import { 
    createTrade,
    getTradeDetails,
    acceptTrade,
    rejectTrade,
    cancelTrade,
    getTradeHistory
} from '../controllers/tradeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new trade
router.post('/', createTrade);

// Get trade details
router.get('/:tradeId', getTradeDetails);

// Accept a trade
router.post('/:tradeId/accept', acceptTrade);

// Reject a trade
router.post('/:tradeId/reject', rejectTrade);

// Cancel a trade
router.post('/:tradeId/cancel', cancelTrade);

// Get trade history
router.get('/', getTradeHistory);

export default router;
