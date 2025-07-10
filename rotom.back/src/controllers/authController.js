import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Registration
export const registerUser = async (req, res) => {
  try {
    const { email, username, first_name, last_name, password, country } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const profileImage = req.file ? req.file.filename : null;
    const result = await pool.query(
      `INSERT INTO "User" (email, username, first_name, last_name, password, country, reg_date, profile_image, is_admin, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, now(), $7, false, true) RETURNING user_id`,
      [email, username, first_name, last_name, hashedPassword, country, profileImage]
    );

    res.status(201).json({ message: 'Registration successful', user_id: result.rows[0].user_id });
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
    const result = await pool.query(
      `SELECT * FROM "User" WHERE username = $1 OR email = $1`,
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
    const token = jwt.sign({ user_id: user.user_id, is_admin: user.is_admin }, 'super_secret_key', { expiresIn: '2h' });
    res.json({ token, username: user.username, user_id: user.user_id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      `SELECT user_id, email, username, first_name, last_name, country, reg_date, last_login, profile_image, money_amount, is_admin FROM "User" WHERE user_id = $1`,
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
      `SELECT user_id, email, username, first_name, last_name, country, reg_date, last_login, profile_image, money_amount, is_admin FROM "User" WHERE user_id = $1`,
      [decoded.user_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Logout endpoint (for JWT, just a dummy endpoint)
export const logoutUser = async (req, res) => {
  res.json({ message: 'Logged out' });
};
