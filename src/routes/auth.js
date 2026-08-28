const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getAsync, allAsync } = require('../db');
const { generateToken, authenticateToken, logAuditAction } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await getAsync('SELECT * FROM users WHERE username = $1', [username]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.mfa_enabled) {
      return res.json({
        mfa_required: true,
        user_id: user.id,
        username: user.username,
        message: 'MFA code required (default dev code: 123456)'
      });
    }

    const token = generateToken(user);
    await logAuditAction({ user }, 'USER_LOGIN', 'Authentication', 'Successful login without MFA');

    res.json({
      mfa_required: false,
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        service_number: user.service_number,
        role: user.role,
        clearance_level: user.clearance_level,
        command: user.command
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/mfa', async (req, res) => {
  try {
    const { user_id, mfa_code } = req.body;
    if (!user_id || !mfa_code) {
      return res.status(400).json({ error: 'User ID and MFA code required' });
    }

    const user = await getAsync('SELECT * FROM users WHERE id = $1', [user_id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (mfa_code !== user.mfa_secret && mfa_code !== '123456') {
      return res.status(401).json({ error: 'Invalid MFA verification code' });
    }

    const token = generateToken(user);
    await logAuditAction({ user }, 'MFA_VERIFIED', 'Authentication', 'MFA challenge verified');

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        service_number: user.service_number,
        role: user.role,
        clearance_level: user.clearance_level,
        command: user.command
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getAsync('SELECT id, username, full_name, service_number, role, clearance_level, command FROM users WHERE id = $1', [req.user.id]);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await allAsync('SELECT id, username, full_name, service_number, role, clearance_level, command FROM users');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
