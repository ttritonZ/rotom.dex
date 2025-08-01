import pool from '../db.js';

// Helper: convert empty strings, NaN, null, undefined, or 'NaN' string to null
const toNull = (val) => {
  if (val === '' || val === null || val === undefined) return null;
  if (typeof val === 'number' && isNaN(val)) return null;
  if (typeof val === 'string' && val.toLowerCase() === 'nan') return null;
  return val;
};

// Type validation helpers
const isNumeric = (value) => !isNaN(value) && value !== '';

// Helper to ensure array fields are always arrays
function toArrayOrNull(val) {
  if (val === null || val === undefined) return null;
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return [val];
  return null;
}

/*--------------------------- Pokémon ------------------------------*/

export const getDropdownData = async (req, res) => {
  try {
    const [types, abilities, regions, moves] = await Promise.all([
      pool.query('SELECT type_id, type_name FROM "Type" ORDER BY type_id'),
      pool.query('SELECT ability_id, ability_name FROM "Ability" ORDER BY ability_id'),
      pool.query('SELECT region_id, region_name FROM "Region" ORDER BY region_id'),
      pool.query('SELECT move_id, move_name FROM "Move" ORDER BY move_id')
    ]);
    res.json({
      types: types.rows,
      abilities: abilities.rows,
      regions: regions.rows,
      moves: moves.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dropdown data' });
  }
};


// Insert Pokémon
export const addPokemon = async (req, res) => {
  try {
    const raw = req.body;

    // Convert and normalize input
    const form = {
      sp_id: toNull(raw.sp_id),
      n_dex: toNull(parseInt(raw.n_dex)),
      pokemon_name: toNull(raw.pokemon_name),
      generation: toNull(parseInt(raw.generation)),
      region: toNull(parseInt(raw.region)),
      category: toNull(raw.category),
      height: toNull(parseFloat(raw.height)),
      weight: toNull(parseFloat(raw.weight)),
      catch_rate: toNull(parseInt(raw.catch_rate)),
      base_experience: toNull(parseInt(raw.base_experience)),
      hp: toNull(parseInt(raw.hp)),
      attack: toNull(parseInt(raw.attack)),
      defence: toNull(parseInt(raw.defence)),
      sp_attack: toNull(parseInt(raw.sp_attack)),
      sp_defence: toNull(parseInt(raw.sp_defence)),
      speed: toNull(parseInt(raw.speed)),
      description: toNull(raw.description),
      pokedex_entry: toArrayOrNull(raw.pokedex_entry),
      is_mega: Boolean(raw.is_mega),
      is_gigantamax: Boolean(raw.is_gigantamax),
      is_legendary: Boolean(raw.is_legendary),
      is_mythical: Boolean(raw.is_mythical),
      is_fossil: Boolean(raw.is_fossil),
      is_regional_variant: Boolean(raw.is_regional_variant),
      is_forme_change: Boolean(raw.is_forme_change),
      forme_name: toNull(raw.forme_name),
      is_paradox: Boolean(raw.is_paradox),
      is_ancient: Boolean(raw.is_ancient),
      is_future: Boolean(raw.is_future),
      is_default: Boolean(raw.is_default),
      price: toNull(parseInt(raw.price)),
      type_1: toNull(parseInt(raw.type_1)),
      type_2: toNull(parseInt(raw.type_2)),
      ability_1: toNull(parseInt(raw.ability_1)),
      ability_2: toNull(parseInt(raw.ability_2)),
      ability_hidden: toNull(parseInt(raw.ability_hidden)),
      pokemon_base_name: toNull(raw.pokemon_base_name),
      total: toNull(parseInt(raw.total)),
      is_ultrabeast: Boolean(raw.is_ultrabeast),
      //moves: Array.isArray(raw.moves) ? raw.moves : [],
    };

    // Mandatory checks
    const requiredFields = ['sp_id', 'n_dex', 'pokemon_name', 'generation', 'region', 'category', 'type_1', 'ability_1', 'pokemon_base_name', 'total'];
    for (const field of requiredFields) {
      if (form[field] === undefined || form[field] === null || form[field] === '') {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    const params = [
      form.sp_id, form.n_dex, form.pokemon_name, form.generation, form.region, form.category,
      form.height, form.weight, form.catch_rate, form.base_experience,
      form.hp, form.attack, form.defence, form.sp_attack, form.sp_defence, form.speed,
      form.description, form.pokedex_entry,
      form.is_mega, form.is_gigantamax, form.is_legendary, form.is_mythical,
      form.is_fossil, form.is_regional_variant, form.is_forme_change,
      form.forme_name, form.is_paradox, form.is_ancient, form.is_future, form.is_default, form.price,
      form.type_1, form.type_2, form.ability_1, form.ability_2, form.ability_hidden,
      form.pokemon_base_name, form.total, form.is_ultrabeast
    ];
    
    console.log('Form object:', form);
    console.log('Database params:', params);

    await pool.query(`
      INSERT INTO "Pokemon" (
        sp_id, n_dex, pokemon_name, generation, region, category,
        height, weight, catch_rate, base_experience, hp, attack, defence, sp_attack, sp_defence, speed,
        description, pokedex_entry,
        is_mega, is_gigantamax, is_legendary, is_mythical, is_fossil, is_regional_variant, is_forme_change,
        forme_name, is_paradox, is_ancient, is_future, is_default, price, type_1, type_2,
        ability_1, ability_2, ability_hidden, pokemon_base_name, total, is_ultrabeast
      ) VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
        $17,$18,
        $19,$20,$21,$22,$23,$24,$25,
        $26,$27,$28,$29,$30,$31,$32,$33,
        $34,$35,$36,$37,$38,$39
      )`,
      params
    );

    // if (form.moves.length > 0) {
    //   const values = form.moves.map((_, i) => `($1, $${i + 2})`).join(',');
    //   const params = [form.sp_id, ...form.moves];
    //   await pool.query(`INSERT INTO "Pokemon_Move" (sp_id, move_id) VALUES ${values}`, params);
    // }

    res.json({ message: 'Pokémon inserted successfully' });

  } catch (err) {
    console.error('Error in addPokemon:', err);
    res.status(500).json({ error: 'Database error inserting Pokémon' });
  }
};


// Edit Pokémon
export const editPokemon = async (req, res) => {
  try {
  const { sp_id } = req.params;
    const raw = req.body;
    
    console.log('EditPokemon - Received sp_id:', sp_id);
    console.log('EditPokemon - Received raw body:', raw);

    // Convert and normalize input (same as addPokemon)
    const form = {
      sp_id: toNull(raw.sp_id),
      n_dex: toNull(parseInt(raw.n_dex)),
      pokemon_name: toNull(raw.pokemon_name),
      generation: toNull(parseInt(raw.generation)),
      region: toNull(parseInt(raw.region)),
      category: toNull(raw.category),
      height: toNull(parseFloat(raw.height)),
      weight: toNull(parseFloat(raw.weight)),
      catch_rate: toNull(parseInt(raw.catch_rate)),
      base_experience: toNull(parseInt(raw.base_experience)),
      hp: toNull(parseInt(raw.hp)),
      attack: toNull(parseInt(raw.attack)),
      defence: toNull(parseInt(raw.defence)),
      sp_attack: toNull(parseInt(raw.sp_attack)),
      sp_defence: toNull(parseInt(raw.sp_defence)),
      speed: toNull(parseInt(raw.speed)),
      description: toNull(raw.description),
      pokedex_entry: toArrayOrNull(raw.pokedex_entry),
      is_mega: Boolean(raw.is_mega),
      is_gigantamax: Boolean(raw.is_gigantamax),
      is_legendary: Boolean(raw.is_legendary),
      is_mythical: Boolean(raw.is_mythical),
      is_fossil: Boolean(raw.is_fossil),
      is_regional_variant: Boolean(raw.is_regional_variant),
      is_forme_change: Boolean(raw.is_forme_change),
      forme_name: toNull(raw.forme_name),
      is_paradox: Boolean(raw.is_paradox),
      is_ancient: Boolean(raw.is_ancient),
      is_future: Boolean(raw.is_future),
      is_default: Boolean(raw.is_default),
      price: toNull(parseInt(raw.price)),
      type_1: toNull(parseInt(raw.type_1)),
      type_2: toNull(parseInt(raw.type_2)),
      ability_1: toNull(parseInt(raw.ability_1)),
      ability_2: toNull(parseInt(raw.ability_2)),
      ability_hidden: toNull(parseInt(raw.ability_hidden)),
      pokemon_base_name: toNull(raw.pokemon_base_name),
      total: toNull(parseInt(raw.total)),
      is_ultrabeast: Boolean(raw.is_ultrabeast)
    };

    // Mandatory checks
    const requiredFields = ['sp_id', 'n_dex', 'pokemon_name', 'generation', 'region', 'category', 'type_1', 'ability_1', 'pokemon_base_name', 'total'];
    for (const field of requiredFields) {
      if (form[field] === undefined || form[field] === null || form[field] === '') {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    const params = [
      form.n_dex, form.pokemon_name, form.generation, form.region, form.category,
      form.height, form.weight, form.catch_rate, form.base_experience,
      form.hp, form.attack, form.defence, form.sp_attack, form.sp_defence, form.speed,
      form.description, form.pokedex_entry,
      form.is_mega, form.is_gigantamax, form.is_legendary, form.is_mythical,
      form.is_fossil, form.is_regional_variant, form.is_forme_change,
      form.forme_name, form.is_paradox, form.is_ancient, form.is_future, form.is_default, form.price,
      form.type_1, form.type_2, form.ability_1, form.ability_2, form.ability_hidden,
      form.pokemon_base_name, form.total, form.is_ultrabeast, form.sp_id
    ];

    console.log('EditPokemon - Processed form:', form);
    console.log('EditPokemon - Query params:', params);
    
    // First check if the Pokémon exists
    const checkResult = await pool.query('SELECT sp_id FROM "Pokemon" WHERE sp_id = $1', [form.sp_id]);
    console.log('EditPokemon - Pokémon exists check:', checkResult.rowCount, 'rows found');
    
    if (checkResult.rowCount === 0) {
      return res.status(404).json({ error: 'Pokémon not found' });
    }
    
    const result = await pool.query(`
    UPDATE "Pokemon"
    SET n_dex = $1, pokemon_name = $2, generation = $3, region = $4, category = $5,
        height = $6, weight = $7, catch_rate = $8, base_experience = $9, hp = $10, attack = $11, defence = $12, sp_attack = $13,
          sp_defence = $14, speed = $15, description = $16, pokedex_entry = $17, is_mega = $18, is_gigantamax = $19, is_legendary = $20, is_mythical = $21,
          is_fossil = $22, is_regional_variant = $23, is_forme_change = $24, forme_name = $25, is_paradox = $26,
          is_ancient = $27, is_future = $28, is_default = $29, price = $30, type_1 = $31, type_2 = $32,
          ability_1 = $33, ability_2 = $34, ability_hidden = $35, pokemon_base_name = $36, total = $37, is_ultrabeast = $38
      WHERE sp_id = $39
    `, params);
    
    console.log('EditPokemon - Update result:', result.rowCount, 'rows affected');

  res.json({ message: 'Pokémon updated successfully' });

  } catch (err) {
    console.error('Error in editPokemon:', err);
    res.status(500).json({ error: 'Database error updating Pokémon' });
  }
};

// Delete Pokémon
export const deletePokemon = async (req, res) => {
  const { sp_id } = req.params;
  await pool.query(`DELETE FROM "Pokemon" WHERE sp_id = $1`, [sp_id]);
  res.json({ message: 'Pokémon deleted' });
};

/*--------------------------- Character ------------------------------*/

// Insert Character
export const addCharacter = async (req, res) => {
  try {
  const { character_name, character_region, trainer_class, character_image, character_description, preferred_type } = req.body;

  if (!character_name) {
    return res.status(400).json({ error: 'Character name is required' });
  }

  if (character_region && !isNumeric(character_region)) {
    return res.status(400).json({ error: 'Region must be a number or empty' });
  }

    // Convert trainer_class to array format for PostgreSQL
    let trainerClassArray = toArrayOrNull(trainer_class);

  await pool.query(`
    INSERT INTO "Character" (character_name, character_region, trainer_class, character_image, character_description, preferred_type)
    VALUES ($1, $2, $3, $4, $5, $6)
    `, [character_name, toNull(character_region), trainerClassArray, toNull(character_image), toNull(character_description), toNull(preferred_type)]);

  res.json({ message: 'Character added successfully' });
  } catch (err) {
    console.error('Error in addCharacter:', err);
    res.status(500).json({ error: 'Database error inserting character' });
  }
};

// Edit Character
export const editCharacter = async (req, res) => {
  try {
  const { character_id } = req.params;
  const { character_name, character_region, trainer_class, character_image, character_description, preferred_type } = req.body;
    
    console.log('EditCharacter - Received character_id:', character_id);
    console.log('EditCharacter - Received body:', req.body);

  if (!character_name) {
    return res.status(400).json({ error: 'Character name is required' });
  }

  if (character_region && !isNumeric(character_region)) {
    return res.status(400).json({ error: 'Region must be a number or empty' });
  }

    // Convert trainer_class to array format for PostgreSQL
    let trainerClassArray = toArrayOrNull(trainer_class);
    
    console.log('EditCharacter - Processed trainer_class:', trainerClassArray);

    const result = await pool.query(`
    UPDATE "Character"
    SET character_name = $1, character_region = $2, trainer_class = $3, character_image = $4, character_description = $5, preferred_type = $6
    WHERE character_id = $7
    `, [character_name, toNull(character_region), trainerClassArray, toNull(character_image), toNull(character_description), toNull(preferred_type), character_id]);
    
    console.log('EditCharacter - Update result:', result.rowCount, 'rows affected');

  res.json({ message: 'Character updated successfully' });
  } catch (err) {
    console.error('Error in editCharacter:', err);
    res.status(500).json({ error: 'Database error updating character' });
  }
};

// Delete Character
export const deleteCharacter = async (req, res) => {
  const { character_id } = req.params;
  await pool.query(`DELETE FROM "Character" WHERE character_id = $1`, [character_id]);
  res.json({ message: 'Character deleted' });
};

/*--------------------------- Item ------------------------------*/

// Insert Item
export const addItem = async (req, res) => {
  try {
    const { item_name, item_description, item_price, item_category } = req.body;

  if (!item_name) {
    return res.status(400).json({ error: 'Item name is required' });
  }

  if (item_price && !isNumeric(item_price)) {
    return res.status(400).json({ error: 'Price must be a number or empty' });
  }

  await pool.query(`
      INSERT INTO "Item" (item_name, item_description, item_price, item_category)
    VALUES ($1, $2, $3, $4)
    `, [item_name, toNull(item_description), toNull(item_price), toNull(item_category)]);

  res.json({ message: 'Item added successfully' });
  } catch (err) {
    console.error('Error in addItem:', err);
    res.status(500).json({ error: 'Database error inserting item' });
  }
};

// Edit Item
export const editItem = async (req, res) => {
  try {
  const { item_id } = req.params;
    const { item_name, item_description, item_price, item_category } = req.body;

  if (!item_name) {
    return res.status(400).json({ error: 'Item name is required' });
  }

  if (item_price && !isNumeric(item_price)) {
    return res.status(400).json({ error: 'Price must be a number or empty' });
  }

  await pool.query(`
    UPDATE "Item"
      SET item_name = $1, item_description = $2, item_price = $3, item_category = $4
    WHERE item_id = $5
    `, [item_name, toNull(item_description), toNull(item_price), toNull(item_category), item_id]);

  res.json({ message: 'Item updated successfully' });
  } catch (err) {
    console.error('Error in editItem:', err);
    res.status(500).json({ error: 'Database error updating item' });
  }
};

// Delete Item
export const deleteItem = async (req, res) => {
  const { item_id } = req.params;
  await pool.query(`DELETE FROM "Item" WHERE item_id = $1`, [item_id]);
  res.json({ message: 'Item deleted' });
};

// Get all Pokémon for admin
export const getAllPokemon = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Pokemon" ORDER BY "n_dex" ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching all Pokémon:', err);
    res.status(500).json({ error: 'Failed to fetch Pokémon' });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT user_id, username, email, is_admin FROM public."User" ORDER BY user_id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Toggle user admin status
export const toggleUserAdmin = async (req, res) => {
  try {
    const { user_id } = req.params;
    // Toggle is_admin for the user
    const result = await pool.query(
      'UPDATE public."User" SET is_admin = NOT is_admin WHERE user_id = $1 RETURNING is_admin',
      [user_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user_id, is_admin: result.rows[0].is_admin });
  } catch (error) {
    res.status(500).json({ error });
  }
};
