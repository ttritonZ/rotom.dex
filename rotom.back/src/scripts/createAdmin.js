import pool from '../db.js';
import bcrypt from 'bcrypt';

// Function to create an admin user
export const createAdminUser = async (username, email, password, firstName, lastName = '', country = '') => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO "User" ("email", "username", "first_name", "last_name", "password", "country", "reg_date", "is_admin", "is_active")
       VALUES ($1, $2, $3, $4, $5, $6, now(), true, true) RETURNING "user_id", "username", "is_admin"`,
      [email, username, firstName, lastName, hashedPassword, country]
    );

    console.log('Admin user created successfully:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

// Function to check all users and their admin status
export const checkUsers = async () => {
  try {
    const result = await pool.query(
      `SELECT "user_id", "username", "email", "is_admin", "is_active", "reg_date" FROM "User" ORDER BY "user_id"`
    );
    
    console.log('All users:');
    result.rows.forEach(user => {
      console.log(`ID: ${user.user_id}, Username: ${user.username}, Email: ${user.email}, Admin: ${user.is_admin}, Active: ${user.is_active}`);
    });
    
    return result.rows;
  } catch (error) {
    console.error('Error checking users:', error);
    throw error;
  }
};

// Function to make an existing user an admin
export const makeUserAdmin = async (userId) => {
  try {
    const result = await pool.query(
      `UPDATE "User" SET "is_admin" = true WHERE "user_id" = $1 RETURNING "user_id", "username", "is_admin"`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      console.log('User not found');
      return null;
    }
    
    console.log('User made admin successfully:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Error making user admin:', error);
    throw error;
  }
};

// If this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      checkUsers().then(() => process.exit(0));
      break;
    case 'create':
      const [,,, username, email, password, firstName] = process.argv;
      if (!username || !email || !password || !firstName) {
        console.log('Usage: node createAdmin.js create <username> <email> <password> <firstName>');
        process.exit(1);
      }
      createAdminUser(username, email, password, firstName).then(() => process.exit(0));
      break;
    case 'make-admin':
      const userId = process.argv[3];
      if (!userId) {
        console.log('Usage: node createAdmin.js make-admin <userId>');
        process.exit(1);
      }
      makeUserAdmin(userId).then(() => process.exit(0));
      break;
    default:
      console.log('Usage:');
      console.log('  node createAdmin.js check                    - Check all users');
      console.log('  node createAdmin.js create <username> <email> <password> <firstName> - Create admin user');
      console.log('  node createAdmin.js make-admin <userId>      - Make existing user admin');
      process.exit(1);
  }
} 