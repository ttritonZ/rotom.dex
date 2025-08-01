import pool from '../db.js';

// Initialize default items if none exist
const initializeDefaultItems = async () => {
  try {
    const itemCount = await pool.query('SELECT COUNT(*) FROM "Item"');
    if (parseInt(itemCount.rows[0].count) === 0) {
      const defaultItems = [
        { name: 'Potion', price: 200, description: 'Restores 20 HP' },
        { name: 'Super Potion', price: 700, description: 'Restores 50 HP' },
        { name: 'Hyper Potion', price: 1200, description: 'Restores 200 HP' },
        { name: 'Max Potion', price: 2500, description: 'Fully restores HP' },
        { name: 'Revive', price: 1500, description: 'Revives a fainted Pokemon' },
        { name: 'Max Revive', price: 4000, description: 'Fully revives a Pokemon' },
        { name: 'Ether', price: 1200, description: 'Restores 10 PP' },
        { name: 'Max Ether', price: 2000, description: 'Fully restores PP' },
        { name: 'Elixir', price: 3000, description: 'Restores 10 PP for all moves' },
        { name: 'Max Elixir', price: 4500, description: 'Fully restores PP for all moves' }
      ];

      for (const item of defaultItems) {
        await pool.query(
          'INSERT INTO "Item" ("item_name", "item_price", "item_description") VALUES ($1, $2, $3)',
          [item.name, item.price, item.description]
        );
      }
      console.log('Default items initialized');
    }
  } catch (error) {
    console.error('Error initializing default items:', error);
  }
};

// Give starting money to users who don't have any
const giveStartingMoney = async (userId) => {
  try {
    const user = await pool.query('SELECT "money_amount" FROM "User" WHERE "user_id" = $1', [userId]);
    if (user.rows[0] && user.rows[0].money_amount === 0) {
      await pool.query('UPDATE "User" SET "money_amount" = 5000 WHERE "user_id" = $1', [userId]);
      console.log(`Gave starting money to user ${userId}`);
    }
  } catch (error) {
    console.error('Error giving starting money:', error);
  }
};

// Call initialization on module load
initializeDefaultItems();

export const getPokemonList = async (req, res) => {
  try {
    const { type, generation, search, sort } = req.query;
    
    let query = `
      SELECT p.*, t1."type_name" as type1_name, t2."type_name" as type2_name,
             COALESCE(p."price", 
               CASE 
                 WHEN p."is_legendary" = true THEN 5000
                 WHEN p."is_mythical" = true THEN 10000
                 WHEN p."total" >= 600 THEN 2000
                 WHEN p."total" >= 500 THEN 1500
                 ELSE 1000
               END
             ) as price
      FROM "Pokemon" p
      JOIN "Type" t1 ON p."type_1" = t1."type_id"
      LEFT JOIN "Type" t2 ON p."type_2" = t2."type_id"
      WHERE p."is_default" = true
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (type && type !== 'all') {
      paramCount++;
      query += ` AND (t1."type_name" = $${paramCount} OR t2."type_name" = $${paramCount})`;
      params.push(type);
    }
    
    if (generation && generation !== 'all') {
      paramCount++;
      query += ` AND p."generation" = $${paramCount}`;
      params.push(parseInt(generation));
    }
    
    if (search) {
      paramCount++;
      query += ` AND LOWER(p."pokemon_name") LIKE LOWER($${paramCount})`;
      params.push(`%${search}%`);
    }
    
    // Add sorting
    switch (sort) {
      case 'price_low':
        query += ' ORDER BY price ASC';
        break;
      case 'price_high':
        query += ' ORDER BY price DESC';
        break;
      case 'stats':
        query += ' ORDER BY p."total" DESC';
        break;
      default:
        query += ' ORDER BY p."pokemon_name" ASC';
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Shop Pokemon error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getItemList = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = `SELECT "item_id", "item_name", "item_price" FROM "Item"`;
    const params = [];
    
    if (search) {
      query += ` WHERE LOWER("item_name") LIKE LOWER($1)`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY "item_name" ASC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Shop Items error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getUserMoney = async (req, res) => {
  try {
    // Give starting money if user doesn't have any
    await giveStartingMoney(req.user.userId);
    
    const result = await pool.query(`SELECT "money_amount" FROM "User" WHERE "user_id" = $1`, [req.user.userId]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user money error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const buyProduct = async (req, res) => {
  const { type, id } = req.body;
  const userId = req.user.userId;

  try {
    await pool.query('BEGIN');

    const user = await pool.query(`SELECT "money_amount" FROM "User" WHERE "user_id" = $1 FOR UPDATE`, [userId]);
    const money = user.rows[0].money_amount;

    let price, name;
    if (type === 'pokemon') {
      const result = await pool.query(`
        SELECT 
          COALESCE(p."price", 
            CASE 
              WHEN p."is_legendary" = true THEN 5000
              WHEN p."is_mythical" = true THEN 10000
              WHEN p."total" >= 600 THEN 2000
              WHEN p."total" >= 500 THEN 1500
              ELSE 1000
            END
          ) as price, 
          p."pokemon_name" 
        FROM "Pokemon" p 
        WHERE p."sp_id" = $1
      `, [id]);
      if (result.rowCount === 0) throw new Error('Invalid Pokémon');
      price = result.rows[0].price;
      name = result.rows[0].pokemon_name;
    } else if (type === 'item') {
      const result = await pool.query(`SELECT "item_price", "item_name" FROM "Item" WHERE "item_id" = $1`, [id]);
      if (result.rowCount === 0) throw new Error('Invalid item');
      price = result.rows[0].item_price;
      name = result.rows[0].item_name;
    } else {
      throw new Error('Invalid type');
    }

    if (money < price) throw new Error('Insufficient funds');

    await pool.query(`UPDATE "User" SET "money_amount" = "money_amount" - $1 WHERE "user_id" = $2`, [price, userId]);

    if (type === 'pokemon') {
      await pool.query(
        `INSERT INTO "User_Pokemons" ("user_id", "sp_id", "level", "nickname") VALUES ($1, $2, 1, $3)`,
        [userId, id, name]
      );
    } else {
      await pool.query(
        `INSERT INTO "User_Items" ("user_id", "item_id", "quantity") VALUES ($1, $2, 1)
         ON CONFLICT ("user_id", "item_id") DO UPDATE SET "quantity" = "User_Items"."quantity" + 1`,
        [userId, id]
      );
    }

    await pool.query('COMMIT');
    res.json({ success: true, message: `${type} bought!` });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Buy product error:', err);
    res.status(400).json({ error: err.message });
  }
};
