import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, 'super_secret_key');
    console.log('authenticateJWT - decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('authenticateJWT - token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const isAdmin = async (req, res, next) => {
  const user = req.user; // assuming req.user is set after JWT/session auth
  
  console.log('isAdmin middleware - user:', user);
  console.log('isAdmin middleware - user.is_admin:', user?.is_admin);

  if (!user || !user.is_admin) {
    console.log('isAdmin middleware - Access denied for user:', user?.username || 'unknown');
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  
  console.log('isAdmin middleware - Access granted for user:', user.username);
  next();
};
