import multer from 'multer';
import path from 'path';

// Pokémon GIF Upload (to /public/assets/pokemon/)
export const uploadPokemonGif = multer({
  storage: multer.diskStorage({
    destination: './public/assets/gif/',
    filename: (req, file, cb) => cb(null, `${req.body.sp_id}.gif`)
  }),
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== '.gif') return cb(new Error('Only .gif files allowed!'));
    cb(null, true);
  }
}).single('gif');

// Character image upload (to /public/assets/characters/)
export const uploadPokemonImage = multer({
  storage: multer.diskStorage({
    destination: './public/assets/pokemons/',
    filename: (req, file, cb) => cb(null, file.originalname)
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) return cb(new Error('Images only!'));
    cb(null, true);
  }
}).single('image');

// Character image upload (to /public/assets/characters/)
export const uploadCharacterImage = multer({
  storage: multer.diskStorage({
    destination: './public/assets/characters/',
    filename: (req, file, cb) => cb(null, file.originalname)
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) return cb(new Error('Images only!'));
    cb(null, true);
  }
}).single('image');

// Item image upload (to /public/assets/items/)
export const uploadItemImage = multer({
  storage: multer.diskStorage({
    destination: './public/assets/items/',
    filename: (req, file, cb) => cb(null, file.originalname)
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) return cb(new Error('Images only!'));
    cb(null, true);
  }
}).single('image');

// Generic image upload (destination must be set by the route)
export const uploadImage = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Default to './public/assets/common/' if not set
      cb(null, req.destination || './public/assets/common/');
    },
    filename: (req, file, cb) => cb(null, file.originalname)
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) return cb(new Error('Images only!'));
    cb(null, true);
  }
}).single('image');

