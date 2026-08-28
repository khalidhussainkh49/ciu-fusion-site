const express = require('express');
const router = express.Router();
const { query, getAsync, allAsync } = require('../db');
const { authenticateToken, requireClearance, logAuditAction } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    let sql = 'SELECT * FROM entity_profiles WHERE 1=1';
    const params = [];
    let idx = 1;

    if (req.query.search) {
      sql += ` AND (name ILIKE $${idx} OR tin_rc ILIKE $${idx} OR phone ILIKE $${idx} OR email ILIKE $${idx})`;
      params.push(`%${req.query.search}%`);
      idx++;
    }

    if (req.query.type) {
      sql += ` AND type = $${idx++}`;
      params.push(req.query.type);
    }

    if (req.query.watchlist) {
      sql += ` AND watchlist_status = $${idx++}`;
      params.push(req.query.watchlist);
    }

    sql += ' ORDER BY risk_score DESC';
    const entities = await allAsync(sql, params);
    res.json({ entities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const entity = await getAsync('SELECT * FROM entity_profiles WHERE id = $1', [req.params.id]);
    if (!entity) {
      return res.status(404).json({ error: 'Entity profile not found' });
    }

    const sharedPhone = entity.phone ? await allAsync('SELECT id, name, type, risk_score FROM entity_profiles WHERE phone = $1 AND id != $2', [entity.phone, entity.id]) : [];
    const sharedEmail = entity.email ? await allAsync('SELECT id, name, type, risk_score FROM entity_profiles WHERE email = $1 AND id != $2', [entity.email, entity.id]) : [];

    const linkedCargo = await allAsync('SELECT * FROM cargo_profiles WHERE importer_name ILIKE $1 OR agent_name ILIKE $2', [`%${entity.name}%`, `%${entity.name}%`]);

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

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, type, tin_rc, phone, email, address, directors, risk_score, watchlist_status, linked_agents, notes } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: 'Entity name and type are required' });
    }

    const count = await getAsync('SELECT COUNT(*) as count FROM entity_profiles');
    const entityCode = `ENT-${1000 + parseInt(count.count, 10) + 1}`;

    const result = await query(
      `INSERT INTO entity_profiles (entity_code, name, type, tin_rc, phone, email, address, directors, risk_score, watchlist_status, linked_agents, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [entityCode, name, type, tin_rc || null, phone || null, email || null, address || null, directors || null, risk_score || 0, watchlist_status || 'Inactive', linked_agents || null, notes || null]
    );

    const newId = result.rows[0].id;
    await logAuditAction(req, 'CREATE_ENTITY_PROFILE', 'Entity Profiling', { entity_id: newId, entity_code: entityCode });

    res.status(201).json({ message: 'Entity profile created successfully', entity_id: newId, entity_code: entityCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/watchlist', authenticateToken, requireClearance(2), async (req, res) => {
  try {
    const { watchlist_status, risk_score, notes } = req.body;
    if (!watchlist_status || !['Active', 'Inactive', 'Under Review'].includes(watchlist_status)) {
      return res.status(400).json({ error: 'Invalid watchlist status. Must be Active, Inactive, or Under Review' });
    }

    await query(
      'UPDATE entity_profiles SET watchlist_status = $1, risk_score = COALESCE($2, risk_score), notes = COALESCE($3, notes) WHERE id = $4',
      [watchlist_status, risk_score || null, notes || null, req.params.id]
    );

    await logAuditAction(req, 'UPDATE_WATCHLIST', 'Entity Profiling', { entity_id: req.params.id, watchlist_status, risk_score });

    res.json({ message: `Entity watchlist status updated to ${watchlist_status}`, entity_id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
