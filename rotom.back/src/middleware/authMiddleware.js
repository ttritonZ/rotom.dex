import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, 'super_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const isAdmin = async (req, res, next) => {
  const user = req.user; // assuming req.user is set after JWT/session auth

  if (!user || !user.is_admin) {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
};
