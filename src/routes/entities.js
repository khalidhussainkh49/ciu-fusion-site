const express = require('express');
const router = express.Router();
const { runAsync, getAsync, allAsync } = require('../db');
const { authenticateToken, requireClearance, logAuditAction } = require('../middleware/auth');

// GET /api/entities - list entities with search and filter
router.get('/', authenticateToken, async (req, res) => {
  try {
    let sql = 'SELECT * FROM entity_profiles WHERE 1=1';
    const params = [];

    if (req.query.search) {
      sql += ' AND (name LIKE ? OR tin_rc LIKE ? OR phone LIKE ? OR email LIKE ?)';
      const term = `%${req.query.search}%`;
      params.push(term, term, term, term);
    }

    if (req.query.type) {
      sql += ' AND type = ?';
      params.push(req.query.type);
    }

    if (req.query.watchlist) {
      sql += ' AND watchlist_status = ?';
      params.push(req.query.watchlist);
    }

    sql += ' ORDER BY risk_score DESC';
    const entities = await allAsync(sql, params);
    res.json({ entities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/entities/:id - details and link analysis
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const entity = await getAsync('SELECT * FROM entity_profiles WHERE id = ?', [req.params.id]);
    if (!entity) {
      return res.status(404).json({ error: 'Entity profile not found' });
    }

    // Linkage analysis: find entities sharing phone, email, directors, or linked agents
    const sharedPhone = entity.phone ? await allAsync('SELECT id, name, type, risk_score FROM entity_profiles WHERE phone = ? AND id != ?', [entity.phone, entity.id]) : [];
    const sharedEmail = entity.email ? await allAsync('SELECT id, name, type, risk_score FROM entity_profiles WHERE email = ? AND id != ?', [entity.email, entity.id]) : [];

    // Find linked cargo
    const linkedCargo = await allAsync('SELECT * FROM cargo_profiles WHERE importer_name LIKE ? OR agent_name LIKE ?', [`%${entity.name}%`, `%${entity.name}%`]);

    await logAuditAction(req, 'VIEW_ENTITY_PROFILE', 'Entity Profiling', { entity_id: entity.id, name: entity.name });

    res.json({
      entity,
      linkages: {
        shared_phone: sharedPhone,
        shared_email: sharedEmail,
        linked_cargo: linkedCargo
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/entities - Create entity profile
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, type, tin_rc, phone, email, address, directors, risk_score, watchlist_status, linked_agents, notes } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: 'Entity name and type are required' });
    }

    const count = await getAsync('SELECT COUNT(*) as count FROM entity_profiles');
    const entityCode = `ENT-${1000 + count.count + 1}`;

    const result = await runAsync(
      `INSERT INTO entity_profiles (entity_code, name, type, tin_rc, phone, email, address, directors, risk_score, watchlist_status, linked_agents, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [entityCode, name, type, tin_rc || null, phone || null, email || null, address || null, directors || null, risk_score || 0, watchlist_status || 'Inactive', linked_agents || null, notes || null]
    );

    await logAuditAction(req, 'CREATE_ENTITY_PROFILE', 'Entity Profiling', { entity_id: result.lastID, entity_code: entityCode });

    res.status(201).json({ message: 'Entity profile created successfully', entity_id: result.lastID, entity_code: entityCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/entities/:id/watchlist - Add or update watchlist status
router.post('/:id/watchlist', authenticateToken, requireClearance(2), async (req, res) => {
  try {
    const { watchlist_status, risk_score, notes } = req.body;
    if (!watchlist_status || !['Active', 'Inactive', 'Under Review'].includes(watchlist_status)) {
      return res.status(400).json({ error: 'Invalid watchlist status. Must be Active, Inactive, or Under Review' });
    }

    await runAsync(
      'UPDATE entity_profiles SET watchlist_status = ?, risk_score = COALESCE(?, risk_score), notes = COALESCE(?, notes) WHERE id = ?',
      [watchlist_status, risk_score || null, notes || null, req.params.id]
    );

    await logAuditAction(req, 'UPDATE_WATCHLIST', 'Entity Profiling', { entity_id: req.params.id, watchlist_status, risk_score });

    res.json({ message: `Entity watchlist status updated to ${watchlist_status}`, entity_id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
