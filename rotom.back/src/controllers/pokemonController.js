import pool from '../db.js';

export const getPokemonByFilters = async (req, res) => {
  try {
    const {
      name, types, abilities, region, legendary, mythical, ultrabeast, fossil, paradox,
      mega, gmax, variant, statRanges
    } = req.body;

    let query = `
      SELECT 
        p.*,
        t1.type_name as type1_name,
        t2.type_name as type2_name
      FROM "Pokemon" p
      LEFT JOIN "Type" t1 ON p.type_1 = t1.type_id
      LEFT JOIN "Type" t2 ON p.type_2 = t2.type_id
      WHERE p."is_default" = true
    `;
    const params = [];
    let count = 1;

    if (name && name.trim().length > 0) {
      // Split name into words and match all
      const words = name.trim().split(/\s+/);
      words.forEach(word => {
        query += ` AND p."pokemon_name" ILIKE $${count}`;
        params.push(`%${word}%`);
        count++;
      });
    }

    if (types && types.length > 0) {
      // Get type names from type IDs
      const typeNamesQuery = `SELECT "type_name" FROM "Type" WHERE "type_id" = ANY($${count})`;
      const typeNamesResult = await pool.query(typeNamesQuery, [types]);
      const typeNames = typeNamesResult.rows.map(row => row.type_name);
      
      if (typeNames.length > 0) {
        query += ` AND (t1."type_name" = ANY($${count + 1}) OR t2."type_name" = ANY($${count + 1}))`;
        params.push(typeNames);
        count++;
      }
    }

    if (abilities && abilities.length > 0) {
      query += ` AND ("ability_1" = ANY($${count}) OR "ability_2" = ANY($${count}) OR "ability_hidden" = ANY($${count}))`;
      params.push(abilities);
      count++;
    }

    if (region && region.length > 0) {
      query += ` AND p."region" = ANY($${count})`;
      params.push(region);
      count++;
    }

    if (legendary) {
      query += ` AND p."is_legendary" = true`;
    }
    if (mythical) {
      query += ` AND p."is_mythical" = true`;
    }
    if (ultrabeast) {
      query += ` AND p."is_ultrabeast" = true`;
    }
    if (fossil) {
      query += ` AND p."is_fossil" = true`;
    }
    if (paradox) {
      query += ` AND p."is_paradox" = true`;
    }
    if (mega) {
      query += ` AND p."is_mega" = true`;
    }
    if (gmax) {
      query += ` AND p."is_gigantamax" = true`;
    }
    if (variant) {
      query += ` AND p."is_regional_variant" = true`;
    }

    if (statRanges) {
      const stats = ['attack', 'defence', 'sp_attack', 'sp_defence', 'speed', 'hp', 'total'];
      stats.forEach(stat => {
        if (statRanges[stat]) {
          query += ` AND p."${stat}" BETWEEN $${count} AND $${count + 1}`;
          params.push(statRanges[stat].min, statRanges[stat].max);
          count += 2;
        }
      });
    }

    query += ` ORDER BY p."n_dex" ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const getAllTypes = async (req, res) => {
  try {
    const result = await pool.query(`SELECT "type_id", "type_name" FROM "Type" ORDER BY "type_id" ASC`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getAllTypes:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

export const getAllAbilities = async (req, res) => {
  try {
    const result = await pool.query(`SELECT "ability_id", "ability_name" FROM "Ability" ORDER BY "ability_id" ASC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getAllRegions = async (req, res) => {
  try {
    const result = await pool.query(`SELECT "region_id", "region_name" FROM "Region" ORDER BY "region_id" ASC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getPokemonById = async (req, res) => {
  try {
    const { sp_id } = req.params;
    const result = await pool.query(
      `SELECT p.*, 
              t1."type_name" as type1_name, 
              t2."type_name" as type2_name,
              a1."ability_name" as ability1_name, 
              a1."ability_description" as ability1_description,
              a2."ability_name" as ability2_name, 
              a2."ability_description" as ability2_description,
              ah."ability_name" as ability_hidden_name, 
              ah."ability_description" as ability_hidden_description
       FROM "Pokemon" p
       LEFT JOIN "Type" t1 ON p."type_1" = t1."type_id"
       LEFT JOIN "Type" t2 ON p."type_2" = t2."type_id"
       LEFT JOIN "Ability" a1 ON p."ability_1" = a1."ability_id"
       LEFT JOIN "Ability" a2 ON p."ability_2" = a2."ability_id"
       LEFT JOIN "Ability" ah ON p."ability_hidden" = ah."ability_id"
       WHERE p."sp_id" = $1`,
      [sp_id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getVariantsByNdex = async (req, res) => {
  try {
    const { ndex } = req.params;
    const result = await pool.query(
      `SELECT "sp_id", "pokemon_name" FROM "Pokemon" WHERE "n_dex" = $1 ORDER BY "sp_id" ASC`,
      [ndex]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getPokemonMoves = async (req, res) => {
  try {
    const { sp_id } = req.params;
    const result = await pool.query(
      `SELECT m."move_name", m."type_id", m."category", m."power", m."accuracy", m."pp", p."level", t."type_name"
       FROM "Pokemon_Move" p
       JOIN "Move" m ON p."move_id" = m."move_id"
       LEFT JOIN "Type" t ON m."type_id" = t."type_id"
       WHERE p."sp_id" = $1
       ORDER BY p."level" ASC`,
      [sp_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getPokemonMoves:', error);
    res.status(500).json({ 
      message: 'Error fetching Pokemon moves',
      error: error.message,
      sp_id: sp_id
    });
  }
};

export const getEvolutionChain = async (req, res) => {
  const { sp_id } = req.params;
  const allEvolutionsQuery = `
        SELECT 
          e.sp_id,
          e.evolves_to,
          e.method,
          e.level,
          i.item_name,
          p1.pokemon_name as from_name,
          p1.n_dex as from_ndex,
          p1.primary_type as from_primary_type,
          p1.secondary_type as from_secondary_type,
          t1.type_name as from_primary_type_name,
          t2.type_name as from_secondary_type_name,
          p2.pokemon_name as to_name,
          p2.n_dex as to_ndex,
          p2.primary_type as to_primary_type,
          p2.secondary_type as to_secondary_type,
          t3.type_name as to_primary_type_name,
          t4.type_name as to_secondary_type_name
        FROM evolution e
        LEFT JOIN item i ON e.item_held = i.item_id
        LEFT JOIN pokemon p1 ON e.sp_id = p1.sp_id AND p1.is_default = true
        LEFT JOIN pokemon p2 ON e.evolves_to = p2.sp_id AND p2.is_default = true
        LEFT JOIN type t1 ON p1.type_1 = t1.type_id
        LEFT JOIN type t2 ON p1.type_2 = t2.type_id
        LEFT JOIN type t3 ON p2.type_1 = t3.type_id
        LEFT JOIN type t4 ON p2.type_2 = t4.type_id
      `;
      
      const allEvolutions = await pool.query(allEvolutionsQuery);
      const evolutionMap = new Map();
      const reverseMap = new Map();
      const allPokemonInChain = new Set();
      
      // Build evolution relationships
      allEvolutions.rows.forEach(evo => {
        evolutionMap.set(evo.sp_id, evo);
        reverseMap.set(evo.evolves_to, evo);
        allPokemonInChain.add(evo.sp_id);
        allPokemonInChain.add(evo.evolves_to);
      });
      
      // Find the base Pokemon (no pre-evolution) that's connected to our target
      let basePokemon = null;
      const visited = new Set();
      
      // Start from current Pokemon and traverse backwards to find base
      let current = sp_id;
      while (current && !visited.has(current)) {
        visited.add(current);
        const preEvolution = reverseMap.get(current);
        if (preEvolution) {
          current = preEvolution.sp_id;
        } else {
          basePokemon = current;
          break;
        }
      }
      
      if (!basePokemon) return [];
      
      // Build the complete chain starting from base
      const chain = [];
      const processQueue = [basePokemon];
      const processed = new Set();
      
      while (processQueue.length > 0) {
        const currentStage = [];
        const nextStage = [];
        
        // Process all Pokemon in current stage
        processQueue.forEach(pokemonId => {
          if (!processed.has(pokemonId)) {
            processed.add(pokemonId);
            currentStage.push(pokemonId);
            
            // Find all Pokemon this one evolves into
            allEvolutions.rows.forEach(evo => {
              if (evo.sp_id === pokemonId && !processed.has(evo.evolves_to)) {
                nextStage.push(evo.evolves_to);
              }
            });
          }
        });
        
        if (currentStage.length > 0) {
          // Get detailed Pokemon info for this stage
          const stageData = await Promise.all(
            currentStage.map(async (spId) => {
              const pokemonQuery = `
                SELECT 
                  p.sp_id,
                  p.pokemon_name,
                  p.n_dex,
                  t1.type_name as primary_type,
                  t2.type_name as secondary_type
                FROM pokemon p
                LEFT JOIN type t1 ON p.type_1 = t1.type_id
                LEFT JOIN type t2 ON p.type_2 = t2.type_id
                WHERE p.sp_id = $1 AND p.is_default = true
              `;
              const result = await pool.query(pokemonQuery, [spId]);
              return result.rows[0];
            })
          );
          
          // Get evolution requirements for this stage
          const stageEvolutions = allEvolutions.rows.filter(evo => 
            currentStage.includes(evo.sp_id)
          );
          
          chain.push({
            pokemon: stageData.filter(p => p), // Remove any null results
            evolutions: stageEvolutions
          });
        }
        
        // Move to next stage
        processQueue.length = 0;
        processQueue.push(...nextStage);
        
        // Prevent infinite loops
        if (chain.length > 5) break;
      }
      
      return chain;
    
};


export const getAllDefaultPokemon = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        t1.type_name as type1_name,
        t2.type_name as type2_name
      FROM "Pokemon" p
      LEFT JOIN "Type" t1 ON p.type_1 = t1.type_id
      LEFT JOIN "Type" t2 ON p.type_2 = t2.type_id
      WHERE p."is_default" = true 
      ORDER BY p."n_dex" ASC
    `);
    
    // Debug: Log first few results to check type data
    console.log('First 3 Pokemon with types:', result.rows.slice(0, 3).map(p => ({
      name: p.pokemon_name,
      type1: p.type1_name,
      type2: p.type2_name,
      type_1_id: p.type_1,
      type_2_id: p.type_2
    })));
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getAllDefaultPokemon:', error);
    res.status(500).json({ error });
  }
};

export const getPokemonByName = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await pool.query(
      'SELECT * FROM "Pokemon" WHERE LOWER("pokemon_name") = LOWER($1) AND "is_default" = true',
      [name]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pokémon not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getUserPokemon = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        up.user_pokemon_id,
        up.nickname,
        up.level,
        up.exp,
        p.sp_id,
        p.pokemon_name,
        p.n_dex,
        t1.type_name as primary_type,
        t2.type_name as secondary_type
      FROM "User_Pokemons" up
      JOIN "Pokemon" p ON up.sp_id = p.sp_id
      LEFT JOIN "Type" t1 ON p.type_1 = t1.type_id
      LEFT JOIN "Type" t2 ON p.type_2 = t2.type_id
      WHERE up.user_id = $1
      ORDER BY up.user_pokemon_id ASC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user Pokemon:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updatePokemonNickname = async (req, res) => {
  console.log('=== updatePokemonNickname ===');
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  console.log('Authenticated user:', req.user);
  
  try {
    const { userPokemonId } = req.params;
    const { nickname } = req.body;
    
    // Get user ID from JWT token (support both user_id and userId)
    const userId = req.user.user_id || req.user.userId;
    
    if (!userId) {
      console.error('No user ID found in JWT token');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log(`Updating nickname for Pokemon ${userPokemonId} to '${nickname}' for user ${userId}`);
    
    // First, verify the Pokemon exists and get its current data
    const ownershipCheck = await pool.query(
      `SELECT up.user_id, p.pokemon_name 
       FROM "User_Pokemons" up
       JOIN "Pokemon" p ON up.pokemon_id = p.pokemon_id
       WHERE up.user_pokemon_id = $1`,
      [userPokemonId]
    );
    
    if (ownershipCheck.rows.length === 0) {
      console.error(`Pokemon with ID ${userPokemonId} not found`);
      return res.status(404).json({ error: 'Pokemon not found' });
    }
    
    const pokemonOwnerId = ownershipCheck.rows[0].user_id;
    const pokemonName = ownershipCheck.rows[0].pokemon_name;
    
    console.log(`Pokemon found: ${pokemonName}, Owner ID: ${pokemonOwnerId}, Requesting User ID: ${userId}`);
    
    // Convert both to strings for comparison to avoid type issues
    if (String(pokemonOwnerId) !== String(userId)) {
      console.error(`User ${userId} is not the owner of Pokemon ${userPokemonId}`);
      return res.status(403).json({ error: 'You can only edit your own Pokemon' });
    }
    
    // Update the nickname (set to null if empty string)
    const updateQuery = `
      UPDATE "User_Pokemons" 
      SET nickname = $1 
      WHERE user_pokemon_id = $2 
      RETURNING *`;
      
    console.log('Executing query:', updateQuery, 'with values:', [nickname || null, userPokemonId]);
    
    const result = await pool.query(updateQuery, [nickname || null, userPokemonId]);
    
    if (result.rows.length === 0) {
      throw new Error('Failed to update nickname - no rows returned');
    }
    
    console.log('Nickname updated successfully:', result.rows[0]);
    
    res.json({ 
      success: true,
      message: 'Nickname updated successfully',
      pokemon: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating Pokemon nickname:', {
      error: error.message,
      stack: error.stack,
      params: req.params,
      body: req.body,
      user: req.user
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to update nickname',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
