import pool from '../db.js';

// Fetch all characters
export const getAllCharacters = async (req, res) => {
  try {
    console.log('Fetching characters...');
    
    // First check if Character table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Character'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Character table does not exist');
      return res.status(404).json({ error: 'Character table not found' });
    }
    
    const result = await pool.query(`
      SELECT 
        c.character_id,
        c.character_name,
        c.character_region,
        c.trainer_class,
        c.character_image,
        c.character_description,
        c.preferred_type,
        r.region_name,
        t.type_name AS preferred_type_name
      FROM "Character" c
      LEFT JOIN "Region" r ON c.character_region = r.region_id
      LEFT JOIN "Type" t ON c.preferred_type = t.type_id
      ORDER BY c.character_name
    `);
    
    console.log('Characters fetched:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('Sample character:', result.rows[0]);
    }
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: error.message });
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
    console.error('Error fetching trainer classes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Fetch all regions
export const getRegions = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Region" ORDER BY region_name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ error: error.message });
  }
};

// Fetch all types
export const getTypes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Type" ORDER BY type_name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching types:', error);
    res.status(500).json({ error: error.message });
  }
};

// Fetch one character details
export const getCharacterDetails = async (req, res) => {
  try {
    const { character_id } = req.params;
    const charRes = await pool.query(`
      SELECT 
        c.character_id,
        c.character_name,
        c.character_region,
        c.trainer_class,
        c.character_image,
        c.character_description,
        c.preferred_type,
        r.region_name,
        t.type_name AS preferred_type_name
      FROM "Character" c
      LEFT JOIN "Region" r ON c.character_region = r.region_id
      LEFT JOIN "Type" t ON c.preferred_type = t.type_id
      WHERE character_id = $1
    `, [character_id]);

    if (charRes.rows.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

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
    console.error('Error fetching character details:', error);
    res.status(500).json({ error: error.message });
  }
};
