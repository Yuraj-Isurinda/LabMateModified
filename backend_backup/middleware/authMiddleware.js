const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        throw new Error('Authentication required');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Check if user has required role
      if (roles.length && !roles.includes(decoded.role)) {
        throw new Error('Insufficient permissions');
      }

      next();
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  };
};

module.exports = authMiddleware;