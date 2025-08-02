// Get details for a specific user's Pokémon
export const getMyPokemonDetail = async (req, res) => {
  try {
    const { pokemonId } = req.params;
    const userId = req.user.userId;
    
    console.log('Fetching Pokemon detail for:', { pokemonId, userId });
    
    const result = await pool.query(
      `SELECT up.*, p.*, t1.type_name as type1_name, t2.type_name as type2_name,
              a1.ability_name as ability1_name, a1.ability_description as ability1_description,
              a2.ability_name as ability2_name, a2.ability_description as ability2_description,
              ah.ability_name as ability_hidden_name, ah.ability_description as ability_hidden_description
       FROM "User_Pokemons" up
       JOIN "Pokemon" p ON up.sp_id = p.sp_id
       LEFT JOIN "Type" t1 ON p.type_1 = t1.type_id
       LEFT JOIN "Type" t2 ON p.type_2 = t2.type_id
       LEFT JOIN "Ability" a1 ON p.ability_1 = a1.ability_id
       LEFT JOIN "Ability" a2 ON p.ability_2 = a2.ability_id
       LEFT JOIN "Ability" ah ON p.ability_hidden = ah.ability_id
       WHERE up.user_pokemon_id = $1 AND up.user_id = $2`,
      [pokemonId, userId]
    );
    
    if (result.rows.length === 0) {
      console.log('No Pokemon found for:', { pokemonId, userId });
      return res.status(404).json({ error: 'Pokemon not found' });
    }
    
    console.log('Pokemon detail found:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching Pokemon detail:', err);
    res.status(500).json({ error: 'Failed to fetch Pokémon details' });
  }
};
import pool from '../db.js';
import { v4 as uuidv4 } from 'uuid';

// Add battle log entry
export const addBattleLog = async (req, res) => {
  try {
    const { battleId, message, logType = 'info', userId } = req.body;
    
    const result = await pool.query(
      'INSERT INTO "Battle_Log" ("battle_id", "log_message", "log_type", "user_id") VALUES ($1, $2, $3, $4) RETURNING *',
      [battleId, message, logType, userId]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding battle log:', error);
    res.status(500).json({ error: 'Failed to add battle log' });
  }
};

// Get battle logs for a specific battle
export const getBattleLogs = async (req, res) => {
  try {
    const { battleId } = req.params;
    
    const result = await pool.query(
      `SELECT bl.*, u.username 
       FROM "Battle_Log" bl 
       LEFT JOIN "User" u ON bl.user_id = u.user_id 
       WHERE bl.battle_id = $1 
       ORDER BY bl.log_timestamp ASC`,
      [battleId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting battle logs:', error);
    res.status(500).json({ error: 'Failed to get battle logs' });
  }
};

// Get recent battles with their logs
export const getRecentBattles = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      `SELECT b.*, 
              u1.username as user1_name,
              u2.username as user2_name,
              winner.username as winner_name,
              loser.username as loser_name,
              COUNT(bl.log_id) as log_count
       FROM "Battle" b
       LEFT JOIN "User" u1 ON b.user1 = u1.user_id
       LEFT JOIN "User" u2 ON b.user2 = u2.user_id
       LEFT JOIN "User" winner ON b.winner = winner.user_id
       LEFT JOIN "User" loser ON b.loser = loser.user_id
       LEFT JOIN "Battle_Log" bl ON b.battle_id = bl.battle_id
       WHERE (b.user1 = $1 OR b.user2 = $1) AND b.status = 'finished'
       GROUP BY b.battle_id, u1.username, u2.username, winner.username, loser.username
       ORDER BY b.battle_time DESC
       LIMIT 20`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting recent battles:', error);
    res.status(500).json({ error: 'Failed to get recent battles' });
  }
};

// Get user's Pokemon (for authenticated user)
export const getMyPokemon = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(400).json({ error: 'No userId in JWT payload' });
    }
    
    const result = await pool.query(`
      SELECT 
        up."user_pokemon_id", 
        up."sp_id", 
        up."nickname", 
        up."level", 
        up."exp", 
        p."pokemon_name", 
        p."n_dex", 
        p."hp", 
        p."attack", 
        p."defence", 
        p."sp_attack", 
        p."sp_defence", 
        p."speed", 
        p."type_1", 
        p."type_2", 
        t1."type_name" as type1_name, 
        t2."type_name" as type2_name 
      FROM "User_Pokemons" up 
      JOIN "Pokemon" p ON up."sp_id" = p."sp_id" 
      LEFT JOIN "Type" t1 ON p."type_1" = t1."type_id" 
      LEFT JOIN "Type" t2 ON p."type_2" = t2."type_id" 
      WHERE up."user_id" = $1
    `, [req.user.userId]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('getMyPokemon error:', err);
    res.status(500).json({ error: 'Failed to fetch user Pokemon' });
  }
};

// Get Pokemon moves
export const getPokemonMoves = async (req, res) => {
  const { pokemonId } = req.params;
  try {
    const result = await pool.query(`
      SELECT m."move_id", m."move_name", m."power", m."pp", m."category", m."type_id", t."type_name"
      FROM "User_Pokemons" up
      JOIN "Pokemon_Move" pm ON up."sp_id" = pm."sp_id"
      JOIN "Move" m ON pm."move_id" = m."move_id"
      LEFT JOIN "Type" t ON m."type_id" = t."type_id"
      WHERE up."user_pokemon_id" = $1 AND up."level" >= pm."level"
      ORDER BY pm."level" DESC
      LIMIT 4
    `, [pokemonId]);
    
    // If no moves found, return empty array - moves should be properly set up in database
    if (result.rows.length === 0) {
      return res.json([]);
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Pokemon moves' });
  }
};

// Get battle history
export const getBattleHistory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b."battle_id", b."battle_code", b."battle_time", b."status",
             u1."username" as user1_name, u2."username" as user2_name,
             winner."username" as winner_name, loser."username" as loser_name
      FROM "Battle" b
      JOIN "User" u1 ON b."user1" = u1."user_id"
      LEFT JOIN "User" u2 ON b."user2" = u2."user_id"
      LEFT JOIN "User" winner ON b."winner" = winner."user_id"
      LEFT JOIN "User" loser ON b."loser" = loser."user_id"
      WHERE b."user1" = $1 OR b."user2" = $1
      ORDER BY b."battle_time" DESC
      LIMIT 20
    `, [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch battle history' });
  }
};

// Get active battles
export const getActiveBattles = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b."battle_id", b."battle_code", b."battle_time", b."is_random",
             u1."username" as user1_name
      FROM "Battle" b
      JOIN "User" u1 ON b."user1" = u1."user_id"
      WHERE b."status" = 'waiting' AND b."user1" != $1
      ORDER BY b."battle_time" DESC
    `, [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch active battles' });
  }
};

// 📌 1. Create a new battle
export const createBattle = async (req, res) => {
  try {
    const { userId, selectedPokemon, isRandom } = req.body;
    const battleCode = uuidv4().slice(0, 6);

    const result = await pool.query(`
      INSERT INTO "Battle" ("user1", "battle_code", "is_random", "status")
      VALUES ($1, $2, $3, 'waiting')
      RETURNING "battle_id", "battle_code"
    `, [userId, battleCode, isRandom]);

    for (const pokemonId of selectedPokemon) {
      await pool.query(
        'INSERT INTO "Battle_Pokemons" ("battle_id", "pokemon_used") VALUES ($1, $2)',
        [result.rows[0].battle_id, pokemonId]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 2. Join an existing battle
export const joinBattle = async (req, res) => {
  try {
    const { battleCode, selectedPokemon } = req.body;
    
    // Verify user owns all selected Pokemon
    for (const pokemonId of selectedPokemon) {
      const ownerCheck = await pool.query(
        'SELECT "user_id" FROM "User_Pokemons" WHERE "user_pokemon_id" = $1',
        [pokemonId]
      );
      
      if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].user_id !== req.user.userId) {
        return res.status(403).json({ error: 'Invalid Pokemon selection' });
      }
    }
    
    const battleResult = await pool.query(
      'SELECT * FROM "Battle" WHERE "battle_code" = $1 AND "status" = $2',
      [battleCode, 'waiting']
    );

    if (battleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Battle not found or already started' });
    }

    const battle = battleResult.rows[0];
    
    // Check if user is trying to join their own battle
    if (battle.user1 === req.user.userId) {
      return res.status(400).json({ error: 'Cannot join your own battle' });
    }
    
    // Check if battle already has a second player
    if (battle.user2) {
      return res.status(400).json({ error: 'Battle is already full' });
    }
    
    await pool.query(
      'UPDATE "Battle" SET "user2" = $1, "status" = $2 WHERE "battle_id" = $3',
      [req.user.userId, 'active', battle.battle_id]
    );

    // Store selected Pokemon for user2
    for (const pokemonId of selectedPokemon) {
      await pool.query(
        'INSERT INTO "Battle_Pokemons" ("battle_id", "pokemon_used") VALUES ($1, $2)',
        [battle.battle_id, pokemonId]
      );
    }

    res.json({ battleId: battle.battle_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 3. Get battle status
export const getBattle = async (req, res) => {
  try {
    const { battleId } = req.params;
    
    const battleResult = await pool.query(`
      SELECT b.*, u1."username" as user1_name, u2."username" as user2_name
      FROM "Battle" b
      JOIN "User" u1 ON b."user1" = u1."user_id"
      LEFT JOIN "User" u2 ON b."user2" = u2."user_id"
      WHERE b."battle_id" = $1
    `, [battleId]);

    const pokemonResult = await pool.query(`
      SELECT bp.*, up.*, p."pokemon_name", p."type_1", p."type_2", p."hp", p."attack", p."defence",
             p."sp_attack", p."sp_defence", p."speed", t1."type_name" as type1_name, 
             t2."type_name" as type2_name
      FROM "Battle_Pokemons" bp
      JOIN "User_Pokemons" up ON bp."pokemon_used" = up."user_pokemon_id"
      JOIN "Pokemon" p ON up."sp_id" = p."sp_id"
      JOIN "Type" t1 ON p."type_1" = t1."type_id"
      LEFT JOIN "Type" t2 ON p."type_2" = t2."type_id"
      WHERE bp."battle_id" = $1
    `, [battleId]);

    res.json({
      battle: battleResult.rows[0],
      pokemon: pokemonResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get type effectiveness
export const getTypeEffectiveness = async (req, res) => {
  try {
    const { attackingType, defendingType } = req.params;
    
    const result = await pool.query(`
      SELECT "eff_value"
      FROM "Type_Efficiency"
      WHERE "attacking_type" = $1 AND "defending_type" = $2
    `, [attackingType, defendingType]);
    
    const effectiveness = result.rows.length > 0 ? result.rows[0].eff_value : 1;
    res.json({ effectiveness });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Use a move in battle
export const useMove = async (req, res) => {
  try {
    const { battleId } = req.params;
    const { moveId, targetPokemon } = req.body;
    
    // Get battle info
    const battleResult = await pool.query(
      'SELECT * FROM "Battle" WHERE "battle_id" = $1',
      [battleId]
    );
    
    if (battleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Battle not found' });
    }
    
    const battle = battleResult.rows[0];
    
    // Get move info
    const moveResult = await pool.query(
      'SELECT * FROM "Move" WHERE "move_id" = $1',
      [moveId]
    );
    
    if (moveResult.rows.length === 0) {
      return res.status(404).json({ error: 'Move not found' });
    }
    
    const move = moveResult.rows[0];
    
    // Get attacker Pokemon
    const attackerResult = await pool.query(`
      SELECT up.*, p."pokemon_name", p."hp", p."attack", p."defence", p."sp_attack", p."sp_defence", p."speed"
      FROM "User_Pokemons" up
      JOIN "Pokemon" p ON up."sp_id" = p."sp_id"
      WHERE up."user_pokemon_id" = $1
    `, [targetPokemon.attacker]);
    
    if (attackerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Attacker Pokemon not found' });
    }
    
    const attacker = attackerResult.rows[0];
    
    // Get defender Pokemon
    const defenderResult = await pool.query(`
      SELECT up.*, p."pokemon_name", p."hp", p."attack", p."defence", p."sp_attack", p."sp_defence", p."speed"
      FROM "User_Pokemons" up
      JOIN "Pokemon" p ON up."sp_id" = p."sp_id"
      WHERE up."user_pokemon_id" = $1
    `, [targetPokemon.defender]);
    
    if (defenderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Defender Pokemon not found' });
    }
    
    const defender = defenderResult.rows[0];
    
    // Calculate damage (simplified formula)
    const level = attacker.level;
    const attack = move.category === 'Physical' ? attacker.attack : attacker.sp_attack;
    const defence = move.category === 'Physical' ? defender.defence : defender.sp_defence;
    const power = move.power || 0;
    
    // Base damage formula
    let damage = Math.floor(((2 * level / 5 + 2) * power * attack / defence) / 50 + 2);
    
    // Apply STAB (Same Type Attack Bonus)
    const attackerTypes = [attacker.type_1, attacker.type_2].filter(Boolean);
    if (attackerTypes.includes(move.type_id)) {
      damage = Math.floor(damage * 1.5);
    }
    
    // Apply type effectiveness
    const effectivenessResult = await pool.query(`
      SELECT "eff_value"
      FROM "Type_Efficiency"
      WHERE "attacking_type" = $1 AND "defending_type" = $2
    `, [move.type_id, defender.type_1]);
    
    let effectiveness = 1;
    if (effectivenessResult.rows.length > 0) {
      effectiveness = effectivenessResult.rows[0].eff_value;
    }
    
    damage = Math.floor(damage * effectiveness);
    
    // Apply random factor (0.85 to 1.00)
    const randomFactor = 0.85 + Math.random() * 0.15;
    damage = Math.floor(damage * randomFactor);
    
    // Ensure minimum damage of 1
    damage = Math.max(1, damage);
    
    // Calculate damage but don't update HP since current_hp column doesn't exist
    // In a real implementation, you would need to add current_hp and is_fainted columns
    // or handle battle state differently
    const newHP = Math.max(0, defender.hp - damage);
    
    res.json({
      damage,
      effectiveness,
      newHP,
      fainted: newHP <= 0,
      moveName: move.move_name,
      note: "HP tracking not implemented - current_hp column missing from schema"
    });
    
  } catch (error) {
    console.error('Use move error:', error);
    res.status(500).json({ error: error.message });
  }
};

// End battle
export const endBattle = async (req, res) => {
  try {
    const { battleId } = req.params;
    const { winnerId, loserId } = req.body;
    
    // Update battle status
    await pool.query(
      'UPDATE "Battle" SET "status" = $1, "winner" = $2, "loser" = $3 WHERE "battle_id" = $4',
      ['finished', winnerId, loserId, battleId]
    );
    
    // Give coins to winner and loser
    const winnerCoins = 2000;
    const loserCoins = 1000;
    const experienceGain = 100; // Base experience
    
    // Award coins to winner
    await pool.query(
      'UPDATE "User" SET "money_amount" = "money_amount" + $1 WHERE "user_id" = $2',
      [winnerCoins, winnerId]
    );
    
    // Award coins to loser if not a draw (loserId exists)
    if (loserId) {
      await pool.query(
        'UPDATE "User" SET "money_amount" = "money_amount" + $1 WHERE "user_id" = $2',
        [loserCoins, loserId]
      );
    }
    
    // Give experience to winner's Pokemon
    const winnerPokemonResult = await pool.query(`
      SELECT up."user_pokemon_id", up."level", up."exp"
      FROM "Battle_Pokemons" bp
      JOIN "User_Pokemons" up ON bp."pokemon_used" = up."user_pokemon_id"
      WHERE bp."battle_id" = $1 AND up."user_id" = $2
    `, [battleId, winnerId]);
    
    for (const pokemon of winnerPokemonResult.rows) {
      const newExp = pokemon.exp + experienceGain;
      const expToNextLevel = pokemon.level * 100; // Simple leveling formula
      
      if (newExp >= expToNextLevel) {
        // Level up
        await pool.query(
          'UPDATE "User_Pokemons" SET "level" = "level" + 1, "exp" = $1 WHERE "user_pokemon_id" = $2',
          [newExp - expToNextLevel, pokemon.user_pokemon_id]
        );
      } else {
        // Just add experience
        await pool.query(
          'UPDATE "User_Pokemons" SET "exp" = $1 WHERE "user_pokemon_id" = $2',
          [newExp, pokemon.user_pokemon_id]
        );
      }
    }
    
    res.json({ 
      message: 'Battle ended successfully',
      experienceGain,
      coinsGained: winnerCoins,
      isWinner: true
    });
    
  } catch (error) {
    console.error('End battle error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Random battle matching
export const randomBattle = async (req, res) => {
  try {
    const { selectedPokemon } = req.body;
    
    // Find a random waiting battle
    const randomBattleResult = await pool.query(`
      SELECT "battle_id", "battle_code", "user1"
      FROM "Battle"
      WHERE "status" = 'waiting' AND "is_random" = true AND "user1" != $1
      ORDER BY RANDOM()
      LIMIT 1
    `, [req.user.userId]);
    
    if (randomBattleResult.rows.length === 0) {
      // Create a new random battle
      const battleCode = uuidv4().slice(0, 6);
      const result = await pool.query(`
        INSERT INTO "Battle" ("user1", "battle_code", "is_random", "status")
        VALUES ($1, $2, true, 'waiting')
        RETURNING "battle_id", "battle_code"
      `, [req.user.userId, battleCode]);
      
      // Store selected Pokemon
      for (const pokemonId of selectedPokemon) {
        await pool.query(
          'INSERT INTO "Battle_Pokemons" ("battle_id", "pokemon_used") VALUES ($1, $2)',
          [result.rows[0].battle_id, pokemonId]
        );
      }
      
      res.json({ 
        battleId: result.rows[0].battle_id,
        battleCode: result.rows[0].battle_code,
        status: 'waiting'
      });
    } else {
      // Join existing random battle
      const battle = randomBattleResult.rows[0];
      
      // Check if battle already has a second player
      if (battle.user2) {
        return res.status(400).json({ error: 'Battle is already full' });
      }
      
      // Verify user owns all selected Pokemon
      for (const pokemonId of selectedPokemon) {
        const ownerCheck = await pool.query(
          'SELECT "user_id" FROM "User_Pokemons" WHERE "user_pokemon_id" = $1',
          [pokemonId]
        );
        
        if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].user_id !== req.user.userId) {
          return res.status(403).json({ error: 'Invalid Pokemon selection' });
        }
      }
      
      // Join the battle
      await pool.query(
        'UPDATE "Battle" SET "user2" = $1, "status" = $2 WHERE "battle_id" = $3',
        [req.user.userId, 'active', battle.battle_id]
      );
      
      // Store selected Pokemon for user2
      for (const pokemonId of selectedPokemon) {
        await pool.query(
          'INSERT INTO "Battle_Pokemons" ("battle_id", "pokemon_used") VALUES ($1, $2)',
          [battle.battle_id, pokemonId]
        );
      }
      
      res.json({ 
        battleId: battle.battle_id,
        battleCode: battle.battle_code,
        status: 'active'
      });
    }
    
  } catch (error) {
    console.error('Random battle error:', error);
    res.status(500).json({ error: error.message });
  }
};
