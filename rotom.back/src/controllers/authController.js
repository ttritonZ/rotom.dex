import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Registration
export const registerUser = async (req, res) => {
  try {
    const { email, username, first_name, last_name, password, country } = req.body;
    if (!username || !email || !password || !first_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileImage = req.file ? req.file.filename : null;
    const result = await pool.query(
      `INSERT INTO "User" ("email", "username", "first_name", "last_name", "password", "country", "reg_date", "profile_image", "is_admin")
       VALUES ($1, $2, $3, $4, $5, $6, now(), $7, false) RETURNING "user_id"`,
      [email, username, first_name, last_name, hashedPassword, country, profileImage]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.user_id, username: user.username },
      "super_secret_key",
      { expiresIn: '24h' }
    );

    res.status(201).json({ message: 'Registration successful', token, user_id: result.rows[0].user_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    console.log('Login attempt:', identifier);
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const result = await pool.query(
      `SELECT * FROM "User" WHERE "username" = $1 OR "email" = $1`,
      [identifier]
    );
    console.log('User query result:', result.rows);
    if (result.rows.length === 0) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', valid);
    if (!valid) {
      console.log('Incorrect password');
      return res.status(401).json({ message: 'Incorrect password' });
    }
    await pool.query(
      'UPDATE "User" SET "last_login" = NOW() WHERE "user_id" = $1',
      [user.user_id]
    );
    const token = jwt.sign({ userId: user.user_id, username: user.username, is_admin: user.is_admin }, 'super_secret_key', { expiresIn: '24h' });
    res.json({ token, username: user.username, user_id: user.user_id, isAdmin: user.is_admin });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      `SELECT "user_id", "email", "username", "first_name", "last_name", "country", "reg_date", "last_login", "profile_image", "money_amount", "is_admin" FROM "User" WHERE "user_id" = $1`,
      [user_id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Get current authenticated user (for /api/auth/me)
export const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, 'super_secret_key');
    const result = await pool.query(
      `SELECT "user_id", "email", "username", "first_name", "last_name", "country", "reg_date", "last_login", "profile_image", "money_amount", "is_admin" FROM "User" WHERE "user_id" = $1`,
      [decoded.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    console.log('updateUserProfile called with params:', req.params);
    console.log('updateUserProfile body:', req.body);
    console.log('updateUserProfile file:', req.file);
    
    const { user_id } = req.params;
    const { first_name, last_name, email, country } = req.body;
    
    // Verify user is updating their own profile
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, 'super_secret_key');
    
    if (decoded.userId !== parseInt(user_id)) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    // Check if email is already taken by another user
    if (email) {
      const emailCheck = await pool.query(
        `SELECT "user_id" FROM "User" WHERE "email" = $1 AND "user_id" != $2`,
        [email, user_id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Email is already taken by another user' });
      }
    }

    // Handle profile image upload
    let profileImage = null;
    if (req.file) {
      profileImage = req.file.filename;
      
      // Delete old profile image if it exists
      const oldImageResult = await pool.query(
        `SELECT "profile_image" FROM "User" WHERE "user_id" = $1`,
        [user_id]
      );
      
      if (oldImageResult.rows[0]?.profile_image) {
        const oldImagePath = path.join(process.cwd(), 'uploads', 'profiles', oldImageResult.rows[0].profile_image);
        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (error) {
          console.error('Error deleting old profile image:', error);
        }
      }
    }

    // Update user profile
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (first_name !== undefined) {
      updateFields.push(`"first_name" = $${paramCount}`);
      updateValues.push(first_name);
      paramCount++;
    }

    if (last_name !== undefined) {
      updateFields.push(`"last_name" = $${paramCount}`);
      updateValues.push(last_name);
      paramCount++;
    }

    if (email !== undefined) {
      updateFields.push(`"email" = $${paramCount}`);
      updateValues.push(email);
      paramCount++;
    }

    if (country !== undefined) {
      updateFields.push(`"country" = $${paramCount}`);
      updateValues.push(country);
      paramCount++;
    }

    if (profileImage !== null) {
      updateFields.push(`"profile_image" = $${paramCount}`);
      updateValues.push(profileImage);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateValues.push(user_id);
    const query = `
      UPDATE "User" 
      SET ${updateFields.join(', ')} 
      WHERE "user_id" = $${paramCount}
      RETURNING "user_id", "email", "username", "first_name", "last_name", "country", "reg_date", "last_login", "profile_image", "money_amount", "is_admin"
    `;

    const result = await pool.query(query, updateValues);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('updateUserProfile error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Logout endpoint (for JWT, just a dummy endpoint)
export const logoutUser = async (req, res) => {
  res.json({ message: 'Logged out' });
};

export const getUserPokemon = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(`
      SELECT up.*, p.pokemon_name, p.type_1, p.type_2, p.hp, p.attack, p.defence, 
             p.sp_attack, p.sp_defence, p.speed, t1.type_name as type1_name, 
             t2.type_name as type2_name
      FROM User_Pokemons up
      JOIN Pokemon p ON up.sp_id = p.sp_id
      JOIN Type t1 ON p.type_1 = t1.type_id
      LEFT JOIN Type t2 ON p.type_2 = t2.type_id
      WHERE up.user_id = $1
      ORDER BY up.user_pokemon_id
    `, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserPokemonMoves = async (req, res) => {
  try {
    const { userPokemonId } = req.params;
    const result = await pool.query(`
      SELECT m.*, pm.level as required_level
      FROM User_Pokemons up
      JOIN Pokemon_Move pm ON up.sp_id = pm.sp_id
      JOIN Move m ON pm.move_id = m.move_id
      WHERE up.user_pokemon_id = $1 AND (pm.level IS NULL OR pm.level <= up.level)
      ORDER BY pm.level ASC, m.move_name
    `, [userPokemonId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const setUserPokemonNickname = async (req, res) => {
  try {
    const { userPokemonId } = req.params;
    const { nickname } = req.body;
    await pool.query(
      'UPDATE User_Pokemons SET nickname = $1 WHERE user_pokemon_id = $2',
      [nickname, userPokemonId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};