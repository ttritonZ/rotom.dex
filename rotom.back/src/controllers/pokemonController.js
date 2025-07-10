import pool from '../db.js';

export const getPokemonByFilters = async (req, res) => {
  try {
    const {
      types, abilities, region, legendary, mythical, ultrabeast, fossil, paradox,
      mega, gmax, variant, statRanges
    } = req.body;

    let query = `SELECT * FROM "Pokemon" WHERE "is_default" = true`;
    const params = [];
    let count = 1;

    if (types && types.length > 0) {
      query += ` AND ("type_1" = ANY($${count}) OR "type_2" = ANY($${count}))`;
      params.push(types);
      count++;
    }

    if (abilities && abilities.length > 0) {
      query += ` AND ("ability_1" = ANY($${count}) OR "ability_2" = ANY($${count}) OR "ability_hidden" = ANY($${count}))`;
      params.push(abilities);
      count++;
    }

    if (region && region.length > 0) {
      query += ` AND region = ANY($${count})`;
      params.push(region);
      count++;
    }

    if (legendary) {
      query += ` AND "is_legendary" = true`;
    }
    if (mythical) {
      query += ` AND "is_mythical" = true`;
    }
    if (ultrabeast) {
      query += ` AND "is_ultrabeast" = true`;
    }
    if (fossil) {
      query += ` AND "is_fossil" = true`;
    }
    if (paradox) {
      query += ` AND "is_paradox" = true`;
    }
    if (mega) {
      query += ` AND "is_mega" = true`;
    }
    if (gmax) {
      query += ` AND "is_gigantamax" = true`;
    }
    if (variant) {
      query += ` AND "is_regional_variant" = true`;
    }

    if (statRanges) {
      const stats = ['attack', 'defence', 'sp_attack', 'sp_defence', 'speed', 'hp', 'total'];
      stats.forEach(stat => {
        if (statRanges[stat]) {
          query += ` AND ${stat} BETWEEN $${count} AND $${count + 1}`;
          params.push(statRanges[stat].min, statRanges[stat].max);
          count += 2;
        }
      });
    }

    query += ` ORDER BY n_dex ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const getAllTypes = async (req, res) => {
  try {
    const result = await pool.query(`SELECT type_id, type_name FROM "Type" ORDER BY type_id ASC`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getAllTypes:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

export const getAllAbilities = async (req, res) => {
  try {
    const result = await pool.query(`SELECT ability_id, ability_name FROM "Ability" ORDER BY ability_id ASC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getAllRegions = async (req, res) => {
  try {
    const result = await pool.query(`SELECT region_id, region_name FROM "Region" ORDER BY region_id ASC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getPokemonById = async (req, res) => {
  try {
    const { sp_id } = req.params;
    const result = await pool.query(
      `SELECT * FROM "Pokemon" WHERE sp_id = $1`,
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
      `SELECT sp_id, pokemon_name FROM "Pokemon" WHERE n_dex = $1 ORDER BY sp_id ASC`,
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
      `SELECT m.move_name, m.type_id, m.category, m.power, m.accuracy, p.method
       FROM "Pokemon_Move" p
       JOIN "Move" m ON p.move_id = m.move_id
       WHERE p.sp_id = $1`,
      [sp_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getEvolutionChain = async (req, res) => {
  const { sp_id } = req.params;
  try {
    const visited = new Set();
    const chain = [];
    // Traverse backwards to find pre-evolutions (i.e., base forms)
    const getPreEvolutions = async (targetId) => {
      const result = await pool.query(
        `SELECT sp_id, evolves_to, method, level, item_held FROM Evolution WHERE evolves_to = $1`,
        [targetId]
      );
      for (const evo of result.rows) {
        if (!visited.has(evo.sp_id)) {
          visited.add(evo.sp_id);
          await getPreEvolutions(evo.sp_id);
          chain.unshift(evo); // add to start
        }
      }
    };

    // Traverse forward to find post-evolutions (i.e., evolved forms)
    const getPostEvolutions = async (baseId) => {
      const result = await pool.query(
        `SELECT sp_id, evolves_to, method, level, item_held FROM Evolution WHERE sp_id = $1`,
        [baseId]
      );
      for (const evo of result.rows) {
        if (!visited.has(evo.evolves_to)) {
          visited.add(evo.evolves_to);
          chain.push(evo); // add to end
          await getPostEvolutions(evo.evolves_to);
        }
      }
    };

    visited.add(sp_id);
    chain.push({ evolves_to: sp_id }); // Add current Pokémon as center

    await getPreEvolutions(sp_id);
    await getPostEvolutions(sp_id);

    // Fetch all Pokémon involved
    const ids = [
      ...new Set(
        chain.flatMap(({ sp_id, evolves_to }) => [sp_id, evolves_to]).filter(Boolean)
      ),
    ];

    const detailResult = await pool.query(
      `SELECT sp_id, pokemon_name, is_default FROM Pokemon WHERE sp_id = ANY($1::text[])`,
      [ids]
    );
    const nameMap = Object.fromEntries(
      detailResult.rows.map((p) => [p.sp_id, p])
    );

    // Fetch item names for item_held
    const itemIds = chain
      .map((e) => e.item_held)
      .filter((id) => id !== null && id !== undefined);
    let itemMap = {};
    if (itemIds.length > 0) {
      const items = await pool.query(
        `SELECT item_id, item_name FROM Item WHERE item_id = ANY($1::int[])`,
        [itemIds]
      );
      itemMap = Object.fromEntries(items.rows.map((i) => [i.item_id, i.item_name]));
    }

    // Build enriched chain
    const fullChain = [];
    for (let i = 0; i < chain.length; i++) {
      const currentId = chain[i].evolves_to;
      const evoInfo =
        chain[i].method || chain[i].level || chain[i].item_held
          ? {
            method: chain[i].method,
            level: chain[i].level,
            item_name: itemMap[chain[i].item_held] || null,
          }
          : null;

      fullChain.push({
        sp_id: currentId,
        name: nameMap[currentId]?.pokemon_name || currentId,
        evolution_info: evoInfo,
      });
    }

    res.json(fullChain);
  } catch (err) {
    console.error('Evolution chain error:', err);
    res.status(500).json({ error: 'Failed to load evolution chain' });
  }
};


export const getAllDefaultPokemon = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Pokemon" WHERE "is_default" = true ORDER BY n_dex ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getPokemonByName = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await pool.query(
      'SELECT * FROM "Pokemon" WHERE LOWER(pokemon_name) = LOWER($1) AND "is_default" = true',
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
