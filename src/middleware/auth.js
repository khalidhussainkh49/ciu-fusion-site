const jwt = require('jsonwebtoken');
const { runAsync } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'ncs_ciu_fusion_secret_key_2026';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      clearance_level: user.clearance_level,
      command: user.command
    },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireClearance(minLevel) {
  return (req, res, next) => {
    if (!req.user || req.user.clearance_level < minLevel) {
      return res.status(403).json({ error: `Insufficient clearance level. Requires Level ${minLevel}+` });
    }
    next();
  };
}

async function logAuditAction(req, action, module, details) {
  try {
    const userId = req && req.user ? req.user.id : null;
    const username = req && req.user ? req.user.username : 'Anonymous';
    let ip = '127.0.0.1';
    if (req) {
      ip = req.ip || (req.socket && req.socket.remoteAddress) || (req.connection && req.connection.remoteAddress) || '127.0.0.1';
    }

    await runAsync(
      'INSERT INTO audit_logs (user_id, username, action, module, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, username, action, module, typeof details === 'object' ? JSON.stringify(details) : String(details), ip]
    );
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticateToken,
  requireClearance,
  logAuditAction
};
