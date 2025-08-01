import pool from '../db.js';

// Get all forums
export const getAllForums = async (req, res) => {
  const result = await pool.query(`
    SELECT f.*, u."username" FROM "Forum" f
    JOIN "User" u ON f."forum_manager" = u."user_id"
    ORDER BY "forum_id" DESC
  `);
  res.json(result.rows);
};

// Create a forum
export const createForum = async (req, res) => {
  try {
    const { forum_name, forum_description } = req.body;
    // Get userId from req.user (set by auth middleware)
    const forum_manager = req.user?.userId;
    
    if (!forum_manager) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }
    
    if (!forum_name || !forum_name.trim()) {
      return res.status(400).json({ message: 'Forum name is required' });
    }
    
    if (!forum_description || !forum_description.trim()) {
      return res.status(400).json({ message: 'Forum description is required' });
    }
    
    const result = await pool.query(`
      INSERT INTO "Forum" ("forum_name", "forum_description", "forum_manager")
      VALUES ($1, $2, $3)
      RETURNING "forum_id"
    `, [forum_name.trim(), forum_description.trim(), forum_manager]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating forum:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get comments for a forum
export const getForumComments = async (req, res) => {
  const { forum_id } = req.params;
  const result = await pool.query(`
    SELECT c."comment_id", c."comment_text", c."commentor", c."reply_to", 
           to_char(c."comment_time", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "comment_time",
           u."username" 
    FROM "Forum_Comment" fc
    JOIN "Comment" c ON fc."comment_id" = c."comment_id"
    JOIN "User" u ON c."commentor" = u."user_id"
    WHERE fc."forum_id" = $1
    ORDER BY c."comment_time" ASC
  `, [forum_id]);

  res.json(result.rows);
};

// Add comment
export const addComment = async (req, res) => {
  try {
    const { forum_id, comment_text, reply_to } = req.body;
    const commentor = req.user?.userId; // Get userId from JWT token (camelCase)
    
    if (!commentor) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }
    
    if (!comment_text || !comment_text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    
    const result = await pool.query(`
      INSERT INTO "Comment" ("comment_time", "comment_text", "commentor", "reply_to")
      VALUES (now(), $1, $2, $3)
      RETURNING "comment_id"
    `, [comment_text.trim(), commentor, reply_to || null]);

    await pool.query(`
      INSERT INTO "Forum_Comment" ("forum_id", "comment_id")
      VALUES ($1, $2)
    `, [forum_id, result.rows[0].comment_id]);



    res.status(201).json({ comment_id: result.rows[0].comment_id });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete comment (only forum creator or comment author)
export const deleteComment = async (req, res) => {
  try {
    const { comment_id, forum_id } = req.body;
    const user_id = req.user?.userId; // Get userId from JWT token (camelCase)
    
    if (!user_id) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }
    
    // Check if user is forum manager or comment author
    const forumResult = await pool.query(`SELECT "forum_manager" FROM "Forum" WHERE "forum_id" = $1`, [forum_id]);
    const commentResult = await pool.query(`SELECT "commentor" FROM "Comment" WHERE "comment_id" = $1`, [comment_id]);
    
    if (!forumResult.rows.length || !commentResult.rows.length) {
      return res.status(404).json({ message: 'Forum or comment not found' });
    }
    
    const isForumManager = forumResult.rows[0].forum_manager === user_id;
    const isCommentAuthor = commentResult.rows[0].commentor === user_id;
    
    if (!isForumManager && !isCommentAuthor) {
      return res.status(403).json({ message: 'Unauthorized - You can only delete your own comments or if you are the forum manager' });
    }

    await pool.query(`DELETE FROM "Forum_Comment" WHERE "comment_id" = $1`, [comment_id]);
    await pool.query(`DELETE FROM "Comment" WHERE "comment_id" = $1`, [comment_id]);



    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all forums or search by name
export const searchForums = async (req, res) => {
  const { q } = req.query;

  let result;
  if (q) {
    result = await pool.query(`
      SELECT f.*, u."username" FROM "Forum" f
      JOIN "User" u ON f."forum_manager" = u."user_id"
      WHERE LOWER("forum_name") LIKE LOWER($1)
      ORDER BY "forum_id" DESC
    `, [`%${q}%`]);
  } else {
    result = await pool.query(`
      SELECT f.*, u."username" FROM "Forum" f
      JOIN "User" u ON f."forum_manager" = u."user_id"
      ORDER BY "forum_id" DESC
    `);
  }

  res.json(result.rows);
};

