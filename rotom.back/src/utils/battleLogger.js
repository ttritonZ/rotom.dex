import pool from '../db.js';

/**
 * Add a log entry to a battle
 * @param {number} battleId - The ID of the battle
 * @param {string} message - The log message
 * @param {string} logType - The type of log (from BATTLE_LOG_TYPES)
 * @param {number|null} userId - The ID of the user who performed the action (optional)
 * @param {Object} req - Express request object (for WebSocket)
 * @returns {Promise<Object>} The created log entry
 */
export const addBattleLogEntry = async (battleId, message, logType = 'info', userId = null, req = null) => {
  try {
    // Insert the log entry
    const result = await pool.query(
      `INSERT INTO "Battle_Log" ("battle_id", "message", "log_type", "user_id", "log_timestamp")
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [battleId, message, logType, userId]
    );

    // Get the full log entry with user info
    const logWithUser = await pool.query(
      `SELECT bl.*, u.username 
       FROM "Battle_Log" bl
       LEFT JOIN "User" u ON bl.user_id = u.user_id
       WHERE bl.log_id = $1`,
      [result.rows[0].log_id]
    );

    // If WebSocket is available, emit the log
    if (req?.io) {
      const roomName = `battle_${battleId}`;
      req.io.to(roomName).emit('battle_log', logWithUser.rows[0]);
      
      // Get battle details for user notifications
      const battle = await pool.query(
        'SELECT user1, user2 FROM "Battle" WHERE battle_id = $1',
        [battleId]
      );
      
      if (battle.rows[0]) {
        // Emit to both players' rooms for their recent battles list
        if (battle.rows[0].user1) {
          req.io.to(`user_${battle.rows[0].user1}`).emit('battle_updated');
        }
        if (battle.rows[0].user2) {
          req.io.to(`user_${battle.rows[0].user2}`).emit('battle_updated');
        }
      }
    }

    return logWithUser.rows[0];
  } catch (error) {
    console.error('Error adding battle log:', error);
    throw error;
  }
};
