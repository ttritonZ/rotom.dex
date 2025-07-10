import "dotenv/config"; // Load environment variables from .env file
import express from "express";
import cors from "cors";
import path from "path";
import fileUpload from "express-fileupload";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/public", express.static(path.join(__dirname, "public")));


// DB pool
import pool from "./db.js";

// Register file upload and auth routes BEFORE body parsers
import authRoutes from "./routes/authRoutes.js";
app.use("/api/auth", authRoutes);

// Middleware

app.use(fileUpload());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Register other routes after body parsers
import pokemonRoutes from "./routes/pokemonRoutes.js";
import characterRoutes from "./routes/characterRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

app.use("/api/pokemon", pokemonRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/forums", forumRoutes);
app.use("/api/admin", adminRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Poképedia API is running.");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
