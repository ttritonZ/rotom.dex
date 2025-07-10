import pool from '../db.js';

// Fetch all characters
export const getAllCharacters = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, r.region_name, t.type_name AS preferred_type_name
      FROM "Character" c
      LEFT JOIN "Region" r ON c.character_region = r.region_id
      LEFT JOIN "Type" t ON c.preferred_type = t.type_id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Fetch unique trainer classes
export const getTrainerClasses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT unnest(trainer_class) as trainer_class FROM "Character"
    `);
    const unique = [...new Set(result.rows.map(r => r.trainer_class))];
    res.json(unique);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Fetch one character details
export const getCharacterDetails = async (req, res) => {
  try {
    const { character_id } = req.params;
    const charRes = await pool.query(`
      SELECT c.*, r.region_name, t.type_name AS preferred_type_name
      FROM "Character" c
      LEFT JOIN "Region" r ON c.character_region = r.region_id
      LEFT JOIN "Type" t ON c.preferred_type = t.type_id
      WHERE character_id = $1
    `, [character_id]);

    const pokemonsRes = await pool.query(`
      SELECT p.sp_id, p.pokemon_name, p.n_dex
      FROM "Character_Pokemons" cp
      JOIN "Pokemon" p ON cp.pokemon_id = p.sp_id
      WHERE cp.character_id = $1
    `, [character_id]);

    res.json({
      character: charRes.rows[0],
      pokemons: pokemonsRes.rows
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};
