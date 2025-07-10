import pool from '../db.js';

// Helper: convert empty strings to null
const toNull = (val) => (val === '' ? null : val);

// Type validation helpers
const isNumeric = (value) => !isNaN(value) && value !== '';

/*--------------------------- Pokémon ------------------------------*/

// Insert Pokémon
export const addPokemon = async (req, res) => {
  try {
    const {
      sp_id, n_dex, pokemon_name, generation, region, category,
      height, weight, catch_rate, base_experience, hp, attack, defence, sp_attack,
      sp_defence, speed, is_mega, is_gigantamax, is_legendary, is_mythical,
      is_fossil, is_regional_variant, is_forme_change, forme_name, is_paradox,
      is_ancient, is_future, is_default, price, type_1, type_2,
      ability_1, ability_2, ability_hidden, pokemon_base_name, total, is_ultrabeast
    } = req.body;

    // Validate required fields
    if (!sp_id || !n_dex || !pokemon_name || !generation || !region || !category ||
        is_mega === undefined || is_gigantamax === undefined || is_legendary === undefined ||
        is_mythical === undefined || is_fossil === undefined || is_regional_variant === undefined ||
        is_forme_change === undefined || is_paradox === undefined || is_default === undefined ||
        !type_1 || !ability_1 || !pokemon_base_name || total === undefined) {
      return res.status(400).json({ error: 'Missing mandatory fields' });
    }

    // Validate numeric fields
    const numericFields = [n_dex, generation, region, height, weight, catch_rate,
      base_experience, hp, attack, defence, sp_attack, sp_defence, speed, price, type_1, type_2,
      ability_1, ability_2, ability_hidden, total];
    if (!numericFields.every(val => val === null || isNumeric(val))) {
      return res.status(400).json({ error: 'Numeric fields must be numbers or empty' });
    }

    await pool.query(`
      INSERT INTO "Pokemon" (
        sp_id, n_dex, pokemon_name, generation, region, category,
        height, weight, catch_rate, base_experience, hp, attack, defence, sp_attack, sp_defence, speed,
        is_mega, is_gigantamax, is_legendary, is_mythical, is_fossil, is_regional_variant, is_forme_change,
        forme_name, is_paradox, is_ancient, is_future, is_default, price, type_1, type_2,
        ability_1, ability_2, ability_hidden, pokemon_base_name, total, is_ultrabeast
      ) VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
        $17,$18,$19,$20,$21,$22,$23,
        $24,$25,$26,$27,$28,$29,$30,$31,
        $32,$33,$34,$35,$36,$37,$38
      )`,
      [
        sp_id, n_dex, pokemon_name, generation, region, category,
        toNull(height), toNull(weight), toNull(catch_rate), toNull(base_experience),
        toNull(hp), toNull(attack), toNull(defence), toNull(sp_attack), toNull(sp_defence), toNull(speed),
        is_mega, is_gigantamax, is_legendary, is_mythical, is_fossil, is_regional_variant, is_forme_change,
        toNull(forme_name), is_paradox, toNull(is_ancient), toNull(is_future), is_default, toNull(price),
        type_1, toNull(type_2), ability_1, toNull(ability_2), toNull(ability_hidden),
        pokemon_base_name, total, toNull(is_ultrabeast)
      ]
    );

    res.json({ message: 'Pokémon inserted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error inserting Pokémon' });
  }
};

// Edit Pokémon
export const editPokemon = async (req, res) => {
  const { sp_id } = req.params;
  const {
    n_dex, pokemon_name, generation, region, category,
    height, weight, catch_rate, base_experience, hp, attack, defence, sp_attack,
    sp_defence, speed, is_mega, is_gigantamax, is_legendary, is_mythical,
    is_fossil, is_regional_variant, is_forme_change, forme_name, is_paradox,
    is_ancient, is_future, is_default, price, type_1, type_2,
    ability_1, ability_2, ability_hidden, pokemon_base_name, total, is_ultrabeast
  } = req.body;

  if (!sp_id || !n_dex || !pokemon_name || !generation || !region || !category ||
      is_mega === undefined || is_gigantamax === undefined || is_legendary === undefined ||
      is_mythical === undefined || is_fossil === undefined || is_regional_variant === undefined ||
      is_forme_change === undefined || is_paradox === undefined || is_default === undefined ||
      !type_1 || !ability_1 || !pokemon_base_name || total === undefined) {
    return res.status(400).json({ error: 'Missing mandatory fields' });
  }

  const numericFields = [n_dex, generation, region, height, weight, catch_rate,
    base_experience, hp, attack, defence, sp_attack, sp_defence, speed, price, type_1, type_2,
    ability_1, ability_2, ability_hidden, total];
  if (!numericFields.every(val => val === null || isNumeric(val))) {
    return res.status(400).json({ error: 'Numeric fields must be numbers or empty' });
  }

  await pool.query(`
    UPDATE "Pokemon"
    SET n_dex = $1, pokemon_name = $2, generation = $3, region = $4, category = $5,
        height = $6, weight = $7, catch_rate = $8, base_experience = $9, hp = $10, attack = $11, defence = $12, sp_attack = $13,
        sp_defence = $14, speed = $15, is_mega = $16, is_gigantamax = $17, is_legendary = $18, is_mythical = $19,
        is_fossil = $20, is_regional_variant = $21, is_forme_change = $22, forme_name = $23, is_paradox = $24,
        is_ancient = $25, is_future = $26, is_default = $27, price = $28, type_1 = $29, type_2 = $30,
        ability_1 = $31, ability_2 = $32, ability_hidden = $33, pokemon_base_name = $34, total = $35, is_ultrabeast = $36
    WHERE sp_id = $37
  `, [
    n_dex, pokemon_name, generation, region, category,
    toNull(height), toNull(weight), toNull(catch_rate), toNull(base_experience),
    toNull(hp), toNull(attack), toNull(defence), toNull(sp_attack), toNull(sp_defence), toNull(speed),
    is_mega, is_gigantamax, is_legendary, is_mythical, is_fossil, is_regional_variant, is_forme_change,
    toNull(forme_name), is_paradox, toNull(is_ancient), toNull(is_future), is_default, toNull(price),
    type_1, toNull(type_2), ability_1, toNull(ability_2), toNull(ability_hidden),
    pokemon_base_name, total, toNull(is_ultrabeast), sp_id
  ]);

  res.json({ message: 'Pokémon updated successfully' });
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
  const { character_name, character_region, trainer_class, character_image, character_description, preferred_type } = req.body;

  if (!character_name) {
    return res.status(400).json({ error: 'Character name is required' });
  }

  if (character_region && !isNumeric(character_region)) {
    return res.status(400).json({ error: 'Region must be a number or empty' });
  }

  await pool.query(`
    INSERT INTO "Character" (character_name, character_region, trainer_class, character_image, character_description, preferred_type)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [character_name, toNull(character_region), toNull(trainer_class), toNull(character_image), toNull(character_description), toNull(preferred_type)]);

  res.json({ message: 'Character added successfully' });
};

// Edit Character
export const editCharacter = async (req, res) => {
  const { character_id } = req.params;
  const { character_name, character_region, trainer_class, character_image, character_description, preferred_type } = req.body;

  if (!character_name) {
    return res.status(400).json({ error: 'Character name is required' });
  }

  if (character_region && !isNumeric(character_region)) {
    return res.status(400).json({ error: 'Region must be a number or empty' });
  }

  await pool.query(`
    UPDATE "Character"
    SET character_name = $1, character_region = $2, trainer_class = $3, character_image = $4, character_description = $5, preferred_type = $6
    WHERE character_id = $7
  `, [character_name, toNull(character_region), toNull(trainer_class), toNull(character_image), toNull(character_description), toNull(preferred_type), character_id]);

  res.json({ message: 'Character updated successfully' });
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
  const { item_name, item_image, item_description, item_price } = req.body;

  if (!item_name) {
    return res.status(400).json({ error: 'Item name is required' });
  }

  if (item_price && !isNumeric(item_price)) {
    return res.status(400).json({ error: 'Price must be a number or empty' });
  }

  await pool.query(`
    INSERT INTO "Item" (item_name, item_image, item_description, item_price)
    VALUES ($1, $2, $3, $4)
  `, [item_name, toNull(item_image), toNull(item_description), toNull(item_price)]);

  res.json({ message: 'Item added successfully' });
};

// Edit Item
export const editItem = async (req, res) => {
  const { item_id } = req.params;
  const { item_name, item_image, item_description, item_price } = req.body;

  if (!item_name) {
    return res.status(400).json({ error: 'Item name is required' });
  }

  if (item_price && !isNumeric(item_price)) {
    return res.status(400).json({ error: 'Price must be a number or empty' });
  }

  await pool.query(`
    UPDATE "Item"
    SET item_name = $1, item_image = $2, item_description = $3, item_price = $4
    WHERE item_id = $5
  `, [item_name, toNull(item_image), toNull(item_description), toNull(item_price), item_id]);

  res.json({ message: 'Item updated successfully' });
};

// Delete Item
export const deleteItem = async (req, res) => {
  const { item_id } = req.params;
  await pool.query(`DELETE FROM "Item" WHERE item_id = $1`, [item_id]);
  res.json({ message: 'Item deleted' });
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
