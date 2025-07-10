import pool from '../db.js';

// Get all items with optional search by name and category
export const getItems = async (req, res) => {
  const { q, category } = req.query;
  let query = `SELECT * FROM "Item" WHERE 1=1`;
  const params = [];

  // name search
  if (q) {
    params.push(`%${q}%`);
    query += ` AND LOWER(item_name) LIKE LOWER($${params.length})`;
  }

  // category filter — assuming category stored in item_description, or better: a dedicated column if exists
  if (category) {
    params.push(`%${category}%`);
    query += ` AND LOWER(item_description) LIKE LOWER($${params.length})`;
  }

  query += ` ORDER BY item_name ASC`;
  const result = await pool.query(query, params);

  res.json(result.rows);
};

// Single item by ID
export const getItemById = async (req, res) => {
  const { item_id } = req.params;
  const result = await pool.query(`SELECT * FROM "Item" WHERE item_id = $1`, [item_id]);
  res.json(result.rows[0]);
};
