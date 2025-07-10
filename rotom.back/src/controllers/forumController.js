import pool from '../db.js';

// Get all forums
export const getAllForums = async (req, res) => {
  const result = await pool.query(`
    SELECT f.*, u.username FROM "Forum" f
    JOIN "User" u ON f.forum_manager = u.user_id
    ORDER BY forum_id DESC
  `);
  res.json(result.rows);
};

// Create a forum
export const createForum = async (req, res) => {
  const { forum_name, forum_description } = req.body;
  // Get user_id from req.user (set by auth middleware)
  const forum_manager = req.user?.user_id;
  if (!forum_manager) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const result = await pool.query(`
    INSERT INTO "Forum" (forum_name, forum_description, forum_manager)
    VALUES ($1, $2, $3)
    RETURNING forum_id
  `, [forum_name, forum_description, forum_manager]);

  res.status(201).json(result.rows[0]);
};

// Get comments for a forum
export const getForumComments = async (req, res) => {
  const { forum_id } = req.params;
  const result = await pool.query(`
    SELECT c.*, u.username FROM "Forum_Comment" fc
    JOIN "Comment" c ON fc.comment_id = c.comment_id
    JOIN "User" u ON c.commentor = u.user_id
    WHERE fc.forum_id = $1
    ORDER BY c.comment_time ASC
  `, [forum_id]);

  res.json(result.rows);
};

// Add comment
export const addComment = async (req, res) => {
  const { forum_id, comment_text, commentor, reply_to } = req.body;
  const result = await pool.query(`
    INSERT INTO "Comment" (comment_time, comment_text, commentor, reply_to)
    VALUES (now(), $1, $2, $3)
    RETURNING comment_id
  `, [comment_text, commentor, reply_to]);

  await pool.query(`
    INSERT INTO "Forum_Comment" (forum_id, comment_id)
    VALUES ($1, $2)
  `, [forum_id, result.rows[0].comment_id]);

  res.status(201).json({ comment_id: result.rows[0].comment_id });
};

// Delete comment (only forum creator)
export const deleteComment = async (req, res) => {
  const { comment_id, forum_id, user_id } = req.body;
  const forumResult = await pool.query(`SELECT forum_manager FROM "Forum" WHERE forum_id = $1`, [forum_id]);

  if (forumResult.rows[0].forum_manager !== user_id) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  await pool.query(`DELETE FROM "Forum_Comment" WHERE comment_id = $1`, [comment_id]);
  await pool.query(`DELETE FROM "Comment" WHERE comment_id = $1`, [comment_id]);

  res.json({ message: 'Comment deleted' });
};

// Get all forums or search by name
export const searchForums = async (req, res) => {
  const { q } = req.query;

  let result;
  if (q) {
    result = await pool.query(`
      SELECT f.*, u.username FROM "Forum" f
      JOIN "User" u ON f.forum_manager = u.user_id
      WHERE LOWER(forum_name) LIKE LOWER($1)
      ORDER BY forum_id DESC
    `, [`%${q}%`]);
  } else {
    result = await pool.query(`
      SELECT f.*, u.username FROM "Forum" f
      JOIN "User" u ON f.forum_manager = u.user_id
      ORDER BY forum_id DESC
    `);
  }

  res.json(result.rows);
};

