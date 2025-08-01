import "dotenv/config"; // Load environment variables from .env file
import express from "express";
import cors from "cors";
import path from "path";
import fileUpload from "express-fileupload";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});



const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));



app.use("/uploads/characters", express.static(path.join(__dirname, "src/uploads/characters")));
app.use("/uploads/gif", express.static(path.join(__dirname, "src/uploads/gif")));
app.use("/uploads/pokemons", express.static(path.join(__dirname, "src/uploads/pokemons")));
app.use("/uploads/items", express.static(path.join(__dirname, "src/uploads/items")));
app.use("/uploads/profiles", express.static(path.join(__dirname, "src/uploads/profiles")));

// DB pool
import pool from "./db.js";

// Register file upload and auth routes BEFORE body parsers
import authRoutes from "./routes/authRoutes.js";
app.use("/api/auth", authRoutes);

// Middleware
app.use(fileUpload());

// Register other routes after body parsers
import pokemonRoutes from "./routes/pokemonRoutes.js";
import characterRoutes from "./routes/characterRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import shopRoutes from './routes/shopRoutes.js';
import battleRoutes from "./routes/battleRoutes.js";

app.use("/api/pokemon", pokemonRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/forums", forumRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/shop', shopRoutes);
app.use("/api/battle", battleRoutes);

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, 'super_secret_key');
    socket.userId = decoded.userId;
    socket.username = decoded.username;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Battle rooms storage
const battleRooms = new Map();
const userSockets = new Map();

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`User ${socket.username} (${socket.userId}) connected`);
  userSockets.set(socket.userId, socket.id);

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);

  // Test socket connection
  socket.on('test', (data) => {
    console.log('Test event received from user:', socket.username, 'Data:', data);
    socket.emit('test_response', { message: 'Hello from backend!', user: socket.username });
  });

  // Debug battle room status
  socket.on('debug_battle_room', (data) => {
    const { battleId } = data;
    const numericBattleId = parseInt(battleId);
    const room = battleRooms.get(numericBattleId);
    
    if (room) {
      console.log('Debug battle room status:', {
        battleId: numericBattleId,
        status: room.status,
        user1: room.user1,
        user2: room.user2,
        connectedUsers: room.connectedUsers ? Array.from(room.connectedUsers) : [],
        connectedUsersCount: room.connectedUsers ? room.connectedUsers.size : 0
      });
      socket.emit('debug_battle_room_response', {
        battleId: numericBattleId,
        status: room.status,
        user1: room.user1,
        user2: room.user2,
        connectedUsers: room.connectedUsers ? Array.from(room.connectedUsers) : [],
        connectedUsersCount: room.connectedUsers ? room.connectedUsers.size : 0
      });
    } else {
      console.log('Debug battle room not found:', numericBattleId);
      socket.emit('debug_battle_room_response', { error: 'Battle room not found' });
    }
  });

  // Handle battle creation
  socket.on('create_battle', async (data) => {
    console.log('Received create_battle event from user:', socket.username, 'Data:', data);
    try {
      const { selectedPokemon, isRandom } = data;
      const battleCode = uuidv4();
      console.log('Generated battle code:', battleCode);
      
      // Create battle in database
      console.log('Creating battle in database with:', { userId: socket.userId, battleCode, isRandom });
      const result = await pool.query(`
        INSERT INTO "Battle" ("user1", "battle_code", "is_random", "status")
        VALUES ($1, $2, $3, 'waiting')
        RETURNING "battle_id", "battle_code"
      `, [socket.userId, battleCode, isRandom]);

      console.log('Database result:', result.rows[0]);
      const battleId = result.rows[0].battle_id;

      // Store selected Pokemon
      for (const pokemonId of selectedPokemon) {
        await pool.query(
          'INSERT INTO "Battle_Pokemons" ("battle_id", "pokemon_used") VALUES ($1, $2)',
          [battleId, pokemonId]
        );
      }

      // Create battle room
      const battleRoom = {
        battleId,
        battleCode,
        user1: socket.userId,
        user1Name: socket.username,
        user2: null,
        user2Name: null,
        status: 'waiting',
        isRandom,
        user1Pokemon: selectedPokemon,
        user2Pokemon: [],
        currentTurn: null,
        battleLog: []
      };

      battleRooms.set(battleId, battleRoom);
      socket.join(`battle_${battleId}`);

      console.log('Created battle room:', battleRoom);
      console.log('Total battle rooms:', battleRooms.size);

      console.log('Emitting battle_created event with:', { battleId, battleCode });
      socket.emit('battle_created', { battleId, battleCode });
      
      if (isRandom) {
        // Look for existing random battle
        for (const [roomId, room] of battleRooms) {
          if (room.isRandom && room.status === 'waiting' && room.user1 !== socket.userId) {
            // Join existing random battle
            await joinBattleRoom(socket, roomId, selectedPokemon);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error creating battle:', error);
      socket.emit('error', { message: error.message });
    }
  });

  // Handle joining battle
  socket.on('join_battle', async (data) => {
    try {
      const { battleCode, selectedPokemon } = data;
      
      // Find battle by code
      for (const [battleId, room] of battleRooms) {
        if (room.battleCode === battleCode && room.status === 'waiting') {
          await joinBattleRoom(socket, battleId, selectedPokemon);
          break;
        }
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Handle joining battle arena
  socket.on('join_battle_arena', async (data) => {
    try {
      const { battleId } = data;
      const numericBattleId = parseInt(battleId);
      console.log('Join battle arena event received:', { battleId, numericBattleId, userId: socket.userId, username: socket.username });
      
      // Check if battle exists in database
      const battleResult = await pool.query(
        'SELECT * FROM "Battle" WHERE "battle_id" = $1',
        [numericBattleId]
      );
      
      console.log('Database battle result for join_battle_arena:', battleResult.rows);
      
      if (battleResult.rows.length === 0) {
        console.log('Battle not found in database for join_battle_arena');
        socket.emit('error', { message: 'Battle not found in database' });
        return;
      }
      
      const battle = battleResult.rows[0];
      console.log('Battle found in database for join_battle_arena:', battle);
      console.log('Battle status from database:', battle.status);
      console.log('Battle user1 from database:', battle.user1);
      console.log('Battle user2 from database:', battle.user2);
      
      // Check if user is part of this battle
      console.log('Checking user participation for join_battle_arena:', { userId: socket.userId, user1: battle.user1, user2: battle.user2 });
      if (battle.user1 !== socket.userId && battle.user2 !== socket.userId) {
        console.log('User not part of this battle for join_battle_arena');
        socket.emit('error', { message: 'You are not part of this battle' });
        return;
      }
      
      // Get or create battle room
      let room = battleRooms.get(numericBattleId);
      console.log('Existing room for join_battle_arena:', room);
      
      if (!room) {
        console.log('Battle room not found for join_battle_arena, creating new room');
        // Create battle room from database data
        room = {
          battleId: numericBattleId,
          battleCode: battle.battle_code,
          user1: battle.user1,
          user1Name: battle.user1_name || 'Player 1',
          user2: battle.user2,
          user2Name: battle.user2_name || 'Player 2',
          status: battle.status,
          isRandom: battle.is_random,
          user1Pokemon: [],
          user2Pokemon: [],
          currentTurn: null,
          battleLog: []
        };
        
        console.log('Created room object for join_battle_arena:', room);
        
        // Get Pokemon data for this battle
        const pokemonResult = await pool.query(`
          SELECT bp.*, up.user_id, up.sp_id, up.nickname, up.level, p.pokemon_name
          FROM "Battle_Pokemons" bp
          JOIN "User_Pokemons" up ON bp.pokemon_used = up.user_pokemon_id
          JOIN "Pokemon" p ON up.sp_id = p.sp_id
          WHERE bp.battle_id = $1
        `, [numericBattleId]);
        
        console.log('Pokemon result from database for join_battle_arena:', pokemonResult.rows);
        
        for (const pokemon of pokemonResult.rows) {
          if (pokemon.user_id === battle.user1) {
            room.user1Pokemon.push(pokemon.pokemon_used);
          } else if (pokemon.user_id === battle.user2) {
            room.user2Pokemon.push(pokemon.pokemon_used);
          }
        }
        
        console.log('Room after adding Pokemon for join_battle_arena:', room);
        
        battleRooms.set(numericBattleId, room);
        console.log('Created battle room from database for join_battle_arena:', room);
        console.log('Total battle rooms after creation for join_battle_arena:', battleRooms.size);
      }
      
      // Join the battle room
      socket.join(`battle_${numericBattleId}`);
      console.log('Joined battle room:', `battle_${numericBattleId}`);
      
      // Track connected users in the room
      if (!room.connectedUsers) {
        room.connectedUsers = new Set();
      }
      room.connectedUsers.add(socket.userId);
      console.log('Connected users in room:', Array.from(room.connectedUsers));
      console.log('Total connected users:', room.connectedUsers.size);
      
      // If battle is active and both players are present, emit battle_started
      if (room.status === 'active' && room.user1 && room.user2 && room.connectedUsers.size >= 2) {
        console.log('Battle is active and both users connected, emitting battle_started event');
        console.log('Room details for battle_started:', {
          status: room.status,
          user1: room.user1,
          user2: room.user2,
          user1Name: room.user1Name,
          user2Name: room.user2Name,
          user1Pokemon: room.user1Pokemon,
          user2Pokemon: room.user2Pokemon,
          connectedUsers: Array.from(room.connectedUsers)
        });
        io.to(`battle_${numericBattleId}`).emit('battle_started', {
          battleId: numericBattleId,
          user1: { id: room.user1, name: room.user1Name, pokemon: room.user1Pokemon },
          user2: { id: room.user2, name: room.user2Name, pokemon: room.user2Pokemon },
          currentTurn: room.currentTurn || room.user1, // Default to user1 if not set
          isUser1Turn: (room.currentTurn || room.user1) === room.user1,
          firstTurn: room.currentTurn || room.user1
        });
      } else {
        console.log('Battle not ready for battle_started event:', {
          status: room.status,
          user1: room.user1,
          user2: room.user2,
          user1Name: room.user1Name,
          user2Name: room.user2Name,
          connectedUsers: room.connectedUsers ? Array.from(room.connectedUsers) : [],
          connectedUsersCount: room.connectedUsers ? room.connectedUsers.size : 0
        });
      }
      
      socket.emit('battle_arena_joined', {
        battleId: numericBattleId,
        room: room
      });
      
    } catch (error) {
      console.error('Error joining battle arena:', error);
      socket.emit('error', { message: error.message });
    }
  });

  // Handle battle moves
  socket.on('use_move', async (data) => {
    try {
      const { battleId, moveId, targetPokemon } = data;
      // Convert battleId to number if it's a string
      const numericBattleId = parseInt(battleId);
      let room = battleRooms.get(numericBattleId);
      
      if (!room) {
        console.log('Battle room not found for use_move, creating from database');
        // Check if battle exists in database
        const battleResult = await pool.query(
          'SELECT * FROM "Battle" WHERE "battle_id" = $1',
          [numericBattleId]
        );
        
        if (battleResult.rows.length === 0) {
          socket.emit('error', { message: 'Battle not found in database' });
          return;
        }
        
        const battle = battleResult.rows[0];
        
        // Check if user is part of this battle
        if (battle.user1 !== socket.userId && battle.user2 !== socket.userId) {
          socket.emit('error', { message: 'You are not part of this battle' });
          return;
        }
        
        // Create battle room from database data
        room = {
          battleId: numericBattleId,
          battleCode: battle.battle_code,
          user1: battle.user1,
          user1Name: battle.user1_name || 'Player 1',
          user2: battle.user2,
          user2Name: battle.user2_name || 'Player 2',
          status: battle.status,
          isRandom: battle.is_random,
          user1Pokemon: [],
          user2Pokemon: [],
          currentTurn: null,
          battleLog: []
        };
        
        // Get Pokemon data for this battle
        const pokemonResult = await pool.query(`
          SELECT bp.*, up.user_id, up.sp_id, up.nickname, up.level, p.pokemon_name
          FROM "Battle_Pokemons" bp
          JOIN "User_Pokemons" up ON bp.pokemon_used = up.user_pokemon_id
          JOIN "Pokemon" p ON up.sp_id = p.sp_id
          WHERE bp.battle_id = $1
        `, [numericBattleId]);
        
        for (const pokemon of pokemonResult.rows) {
          if (pokemon.user_id === battle.user1) {
            room.user1Pokemon.push(pokemon.pokemon_used);
          } else if (pokemon.user_id === battle.user2) {
            room.user2Pokemon.push(pokemon.pokemon_used);
          }
        }
        
        battleRooms.set(numericBattleId, room);
        console.log('Created battle room from database for use_move:', room);
      }
      
      if (!room || room.status !== 'active') {
        socket.emit('error', { message: 'Invalid battle state' });
        return;
      }

      // Process move and update battle state
      const moveResult = await processMove(numericBattleId, socket.userId, moveId, targetPokemon);
      
      // Broadcast move result to all players in the battle
      io.to(`battle_${numericBattleId}`).emit('move_result', moveResult);
      
      // Check if battle is over
      if (moveResult.battleEnded) {
        await endBattle(numericBattleId, moveResult.winner);
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Handle Pokemon switching
  socket.on('switch_pokemon', async (data) => {
    try {
      const { battleId, pokemonId } = data;
      // Convert battleId to number if it's a string
      const numericBattleId = parseInt(battleId);
      console.log('Switch pokemon event received:', { battleId, numericBattleId, pokemonId, userId: socket.userId, username: socket.username });
      console.log('Available battle rooms:', Array.from(battleRooms.keys()));
      
      let room = battleRooms.get(numericBattleId);
      console.log('Found battle room:', room);
      
      if (!room) {
        console.log('Battle room not found, creating from database');
        // Check if battle exists in database
        const battleResult = await pool.query(
          'SELECT * FROM "Battle" WHERE "battle_id" = $1',
          [numericBattleId]
        );
        
        console.log('Database battle result:', battleResult.rows);
        
        if (battleResult.rows.length === 0) {
          console.log('Battle not found in database');
          socket.emit('error', { message: 'Battle not found in database' });
          return;
        }
        
        const battle = battleResult.rows[0];
        console.log('Battle from database:', battle);
        console.log('Battle status from database for switch_pokemon:', battle.status);
        console.log('Battle user1 from database for switch_pokemon:', battle.user1);
        console.log('Battle user2 from database for switch_pokemon:', battle.user2);
        
        // Check if user is part of this battle
        console.log('Checking user participation:', { userId: socket.userId, user1: battle.user1, user2: battle.user2 });
        if (battle.user1 !== socket.userId && battle.user2 !== socket.userId) {
          console.log('User not part of this battle');
          socket.emit('error', { message: 'You are not part of this battle' });
          return;
        }
        
        // Create battle room from database data
        room = {
          battleId: numericBattleId,
          battleCode: battle.battle_code,
          user1: battle.user1,
          user1Name: battle.user1_name || 'Player 1',
          user2: battle.user2,
          user2Name: battle.user2_name || 'Player 2',
          status: battle.status,
          isRandom: battle.is_random,
          user1Pokemon: [],
          user2Pokemon: [],
          currentTurn: null,
          battleLog: []
        };
        
        console.log('Created room object:', room);
        
        // Get Pokemon data for this battle
        const pokemonResult = await pool.query(`
          SELECT bp.*, up.user_id, up.sp_id, up.nickname, up.level, p.pokemon_name
          FROM "Battle_Pokemons" bp
          JOIN "User_Pokemons" up ON bp.pokemon_used = up.user_pokemon_id
          JOIN "Pokemon" p ON up.sp_id = p.sp_id
          WHERE bp.battle_id = $1
        `, [numericBattleId]);
        
        console.log('Pokemon result from database:', pokemonResult.rows);
        
        for (const pokemon of pokemonResult.rows) {
          if (pokemon.user_id === battle.user1) {
            room.user1Pokemon.push(pokemon.pokemon_used);
          } else if (pokemon.user_id === battle.user2) {
            room.user2Pokemon.push(pokemon.pokemon_used);
          }
        }
        
        console.log('Room after adding Pokemon:', room);
        
        battleRooms.set(numericBattleId, room);
        console.log('Created battle room from database:', room);
        console.log('Total battle rooms after creation:', battleRooms.size);
      }

      console.log('Room status:', room.status);
      console.log('Room users:', { user1: room.user1, user2: room.user2, currentUser: socket.userId });
      console.log('User can select Pokemon in this battle status:', room.status === 'active' || room.status === 'waiting');

      // Update active Pokemon
      const isUser1 = socket.userId === room.user1;
      if (isUser1) {
        room.user1ActivePokemon = pokemonId;
        console.log('Updated user1 active Pokemon:', pokemonId);
      } else {
        room.user2ActivePokemon = pokemonId;
        console.log('Updated user2 active Pokemon:', pokemonId);
      }

      // Broadcast switch to all players
      io.to(`battle_${numericBattleId}`).emit('pokemon_switched', {
        userId: socket.userId,
        pokemonId,
        username: socket.username
      });

      // Emit success event to the player who switched
      socket.emit('pokemon_switch_success', {
        pokemonId,
        message: 'Pokemon switch successful'
      });

      console.log('Pokemon switch broadcasted. Room state:', {
        user1ActivePokemon: room.user1ActivePokemon,
        user2ActivePokemon: room.user2ActivePokemon,
        status: room.status
      });

      // Check if both players have selected Pokemon and start battle
      if (room.user1ActivePokemon && room.user2ActivePokemon && (room.status === 'active' || room.status === 'waiting')) {
        console.log('Both players have selected Pokemon, starting battle');
        // Both players have selected Pokemon, battle can begin
        io.to(`battle_${numericBattleId}`).emit('battle_ready', {
          battleId: numericBattleId,
          currentTurn: room.currentTurn,
          user1ActivePokemon: room.user1ActivePokemon,
          user2ActivePokemon: room.user2ActivePokemon
        });
      } else {
        console.log('Not ready for battle yet:', {
          user1ActivePokemon: room.user1ActivePokemon,
          user2ActivePokemon: room.user2ActivePokemon,
          status: room.status,
          user1: room.user1,
          user2: room.user2,
          currentUser: socket.userId
        });
        
        // If only one player has selected, wait for the other
        if (room.user1ActivePokemon && !room.user2ActivePokemon) {
          console.log('Waiting for user2 to select Pokemon');
        } else if (!room.user1ActivePokemon && room.user2ActivePokemon) {
          console.log('Waiting for user1 to select Pokemon');
        } else if (!room.user1ActivePokemon && !room.user2ActivePokemon) {
          console.log('Both players need to select Pokemon');
        } else if (room.status !== 'active' && room.status !== 'waiting') {
          console.log('Battle status is not active or waiting:', room.status);
        }
      }
    } catch (error) {
      console.error('Error in switch_pokemon:', error);
      socket.emit('error', { message: error.message });
    }
  });

  // Handle battle room check
  socket.on('check_battle_room', (data) => {
    const { battleId } = data;
    // Convert battleId to number if it's a string
    const numericBattleId = parseInt(battleId);
    console.log('Checking battle room for battleId:', battleId, 'numericBattleId:', numericBattleId);
    const room = battleRooms.get(numericBattleId);
    console.log('Battle room exists:', !!room);
    if (room) {
      console.log('Room details:', room);
    }
    socket.emit('battle_room_check', { 
      exists: !!room,
      room: room ? {
        status: room.status,
        user1: room.user1,
        user2: room.user2,
        user1Name: room.user1Name,
        user2Name: room.user2Name
      } : null
    });
  });

  // Handle forfeit battle
  socket.on('forfeit_battle', async (data) => {
    try {
      const { battleId, forfeiterId, forfeiterName } = data;
      const numericBattleId = parseInt(battleId);
      console.log('Forfeit battle requested by user:', forfeiterName, 'for battleId:', battleId);
      
      const room = battleRooms.get(numericBattleId);
      if (!room) {
        console.log('Battle room not found for forfeit');
        socket.emit('error', { message: 'Battle not found' });
        return;
      }

      // Determine the winner (the other player)
      const winnerId = room.user1 === forfeiterId ? room.user2 : room.user1;
      const winnerName = room.user1 === forfeiterId ? room.user2Name : room.user1Name;

      console.log('Forfeit details:', {
        forfeiter: forfeiterId,
        forfeiterName: forfeiterName,
        winner: winnerId,
        winnerName: winnerName,
        room: room,
        user1: room.user1,
        user2: room.user2,
        user1Name: room.user1Name,
        user2Name: room.user2Name
      });

      // Validate that we have a valid winner
      if (!winnerId) {
        console.error('No valid winner found! Room data:', room);
        socket.emit('error', { message: 'Could not determine winner' });
        return;
      }

      // End the battle
      await endBattle(numericBattleId, winnerId);

      // Remove the battle room
      battleRooms.delete(numericBattleId);

      // Notify all players in the battle room
      const battleEndedData = {
        winnerId: winnerId,
        winnerName: winnerName,
        forfeiterName: forfeiterName,
        reason: 'forfeit'
      };
      
      console.log('Emitting battle_ended with data:', battleEndedData);
      console.log('Sending to room:', `battle_${numericBattleId}`);
      
      // Send to the battle room
      io.to(`battle_${numericBattleId}`).emit('battle_ended', battleEndedData);
      
      // Also send directly to both players to ensure they receive it
      if (room.user1) {
        const user1Socket = userSockets.get(room.user1);
        if (user1Socket) {
          console.log('Sending battle_ended directly to user1:', room.user1);
          io.to(user1Socket).emit('battle_ended', battleEndedData);
        }
      }
      
      if (room.user2) {
        const user2Socket = userSockets.get(room.user2);
        if (user2Socket) {
          console.log('Sending battle_ended directly to user2:', room.user2);
          io.to(user2Socket).emit('battle_ended', battleEndedData);
        }
      }

      console.log('Battle forfeited successfully');
    } catch (error) {
      console.error('Error in forfeit_battle:', error);
      socket.emit('error', { message: error.message });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${socket.username} (${socket.userId}) disconnected`);
    userSockets.delete(socket.userId);
    
    // Remove user from all battle rooms they were in
    for (const [battleId, room] of battleRooms.entries()) {
      if (room.connectedUsers && room.connectedUsers.has(socket.userId)) {
        room.connectedUsers.delete(socket.userId);
        console.log(`Removed user ${socket.userId} from battle room ${battleId}`);
        console.log('Remaining connected users:', Array.from(room.connectedUsers));
        
        // If no users left in room, remove the room
        if (room.connectedUsers.size === 0) {
          battleRooms.delete(battleId);
          console.log(`Removed empty battle room ${battleId}`);
        }
      }
    }
  });
});

// Helper function to join battle room
async function joinBattleRoom(socket, battleId, selectedPokemon) {
  console.log('joinBattleRoom called with:', { battleId, selectedPokemon, userId: socket.userId, username: socket.username });
  
  const room = battleRooms.get(battleId);
  console.log('Existing room:', room);
  
  if (!room || room.status !== 'waiting') {
    console.log('Room not available:', { room: room?.status, expectedStatus: 'waiting' });
    socket.emit('error', { message: 'Battle not available' });
    return;
  }

  if (room.user1 === socket.userId) {
    console.log('User trying to join their own battle');
    socket.emit('error', { message: 'Cannot join your own battle' });
    return;
  }

  // Update room
  room.user2 = socket.userId;
  room.user2Name = socket.username;
  room.user2Pokemon = selectedPokemon;
  room.status = 'active';
  
  console.log('Updated room:', room);
  
  // Randomly determine who goes first (coin toss)
  room.currentTurn = Math.random() < 0.5 ? room.user1 : room.user2;
  console.log('Current turn set to:', room.currentTurn);

  // Store selected Pokemon in database
  for (const pokemonId of selectedPokemon) {
    await pool.query(
      'INSERT INTO "Battle_Pokemons" ("battle_id", "pokemon_used") VALUES ($1, $2)',
      [battleId, pokemonId]
    );
  }

  // Update database
  await pool.query(
    'UPDATE "Battle" SET "user2" = $1, "status" = $2 WHERE "battle_id" = $3',
    [socket.userId, 'active', battleId]
  );

  socket.join(`battle_${battleId}`);

  // Notify the joining player
  socket.emit('battle_joined', {
    battleId,
    battleCode: room.battleCode,
    message: 'Successfully joined the battle!'
  });

  console.log('Emitting battle_started event with:', {
    battleId,
    user1: { id: room.user1, name: room.user1Name, pokemon: room.user1Pokemon },
    user2: { id: room.user2, name: room.user2Name, pokemon: room.user2Pokemon },
    currentTurn: room.currentTurn,
    isUser1Turn: room.currentTurn === room.user1,
    firstTurn: room.currentTurn
  });

  // Notify both players that battle has started
  io.to(`battle_${battleId}`).emit('battle_started', {
    battleId,
    user1: { id: room.user1, name: room.user1Name, pokemon: room.user1Pokemon },
    user2: { id: room.user2, name: room.user2Name, pokemon: room.user2Pokemon },
    currentTurn: room.currentTurn,
    isUser1Turn: room.currentTurn === room.user1,
    firstTurn: room.currentTurn
  });
}

// Helper function to process moves
async function processMove(battleId, userId, moveId, targetPokemon) {
  console.log('=== processMove called ===');
  console.log('Input parameters:', { battleId, userId, moveId, targetPokemon });
  
  const room = battleRooms.get(battleId);
  console.log('Battle room:', room);
  
  // Get move details
  const moveResult = await pool.query('SELECT * FROM "Move" WHERE "move_id" = $1', [moveId]);
  const move = moveResult.rows[0];
  console.log('Move details:', move);

  // Get Pokemon stats
  const attackerResult = await pool.query(`
    SELECT up."level", p.* FROM "User_Pokemons" up
    JOIN "Pokemon" p ON up."sp_id" = p."sp_id"
    WHERE up."user_pokemon_id" = $1
  `, [targetPokemon.attacker]);

  const defenderResult = await pool.query(`
    SELECT up."level", p.* FROM "User_Pokemons" up
    JOIN "Pokemon" p ON up."sp_id" = p."sp_id"
    WHERE up."user_pokemon_id" = $1
  `, [targetPokemon.defender]);

  const attacker = attackerResult.rows[0];
  const defender = defenderResult.rows[0];
  
  console.log('Attacker Pokemon:', {
    id: targetPokemon.attacker,
    name: attacker.pokemon_name,
    level: attacker.level,
    attack: attacker.attack,
    sp_attack: attacker.sp_attack
  });
  
  console.log('Defender Pokemon:', {
    id: targetPokemon.defender,
    name: defender.pokemon_name,
    level: defender.level,
    defence: defender.defence,
    sp_defence: defender.sp_defence
  });

  // Calculate damage
  const level = attacker.level;
  const power = move.power || 0;
  const A = move.category === 'Physical' ? attacker.attack : attacker.sp_attack;
  const D = move.category === 'Physical' ? defender.defence : defender.sp_defence;

  // Get type effectiveness
  const type1Result = await pool.query(
    'SELECT "eff_value" FROM "Type_Efficiency" WHERE "attacking_type" = $1 AND "defending_type" = $2',
    [move.type_id, defender.type_1]
  );
  const type2Result = await pool.query(
    'SELECT "eff_value" FROM "Type_Efficiency" WHERE "attacking_type" = $1 AND "defending_type" = $2',
    [move.type_id, defender.type_2 || defender.type_1]
  );

  const type1 = type1Result.rows.length > 0 ? type1Result.rows[0].eff_value : 1.0;
  const type2 = type2Result.rows.length > 0 ? type2Result.rows[0].eff_value : 1.0;

  const damage = Math.floor(((((((((2 * level) / 5) + 2) * power * A) / D) / 50) + 2) * type1 * type2));
  
  console.log('Damage calculation:', {
    level,
    power,
    category: move.category,
    attackStat: A,
    defenseStat: D,
    moveName: move.move_name,
    type1Effectiveness: type1,
    type2Effectiveness: type2,
    finalDamage: damage
  });

  // Record the turn
  await pool.query(`
    INSERT INTO "Battle_Turn" ("battle_id", "attacker_id", "defender_id", "attacker_pokemon", "defender_pokemon", "move_id", "damage")
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [battleId, userId, targetPokemon.defenderUserId, targetPokemon.attacker, targetPokemon.defender, moveId, damage]);

  // Update turn
  room.currentTurn = room.currentTurn === room.user1 ? room.user2 : room.user1;

  const result = {
    moveName: move.move_name,
    damage,
    attacker: targetPokemon.attacker,
    defender: targetPokemon.defender,
    currentTurn: room.currentTurn,
    isUser1Turn: room.currentTurn === room.user1,
    battleEnded: false,
    nextTurn: room.currentTurn
  };
  
  console.log('=== processMove result ===');
  console.log('Returning result:', result);
  console.log('Attacker ID in result:', result.attacker);
  console.log('Defender ID in result:', result.defender);
  console.log('Target Pokemon attacker:', targetPokemon.attacker);
  console.log('Target Pokemon defender:', targetPokemon.defender);
  console.log('User ID:', userId);
  console.log('Battle room user1:', room.user1);
  console.log('Battle room user2:', room.user2);
  
  return result;
}

// Helper function to end battle
async function endBattle(battleId, winnerId) {
  const room = battleRooms.get(battleId);
  if (!room) return;

  const loserId = winnerId === room.user1 ? room.user2 : room.user1;

  // Update database
  await pool.query(
    'UPDATE "Battle" SET "winner" = $1, "loser" = $2, "status" = $3 WHERE "battle_id" = $4',
    [winnerId, loserId, 'finished', battleId]
  );

  // Give winner money
  await pool.query(
    'UPDATE "User" SET "money_amount" = "money_amount" + 150 WHERE "user_id" = $1',
    [winnerId]
  );

  // Distribute experience
  const pokemonResult = await pool.query(`
    SELECT bp."pokemon_used", up."user_id"
    FROM "Battle_Pokemons" bp
    JOIN "User_Pokemons" up ON bp."pokemon_used" = up."user_pokemon_id"
    WHERE bp."battle_id" = $1
  `, [battleId]);

  for (const pokemon of pokemonResult.rows) {
    const expGain = pokemon.user_id === winnerId ? 75 : 25;
    await pool.query(
      'UPDATE "User_Pokemons" SET "exp" = "exp" + $1 WHERE "user_pokemon_id" = $2',
      [expGain, pokemon.pokemon_used]
    );
  }

  // Notify players
  io.to(`battle_${battleId}`).emit('battle_ended', {
    winnerId,
    loserId,
    winnerName: winnerId === room.user1 ? room.user1Name : room.user2Name
  });

  // Clean up room
  battleRooms.delete(battleId);
}

// Default route
app.get("/", (req, res) => {
  res.send("rotom.dex API is running.");
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query('SELECT 1 as test');
    res.json({ success: true, message: 'Database connection working', data: result.rows[0] });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


