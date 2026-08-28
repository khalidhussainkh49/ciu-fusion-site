const express = require('express');
const router = express.Router();
const { query, getAsync, allAsync } = require('../db');
const { authenticateToken, requireClearance, logAuditAction } = require('../middleware/auth');

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    let sql = 'SELECT * FROM cargo_profiles WHERE 1=1';
    const params = [];
    let idx = 1;

    if (req.query.search) {
      sql += ` AND (paar_number ILIKE $${idx} OR sgd_number ILIKE $${idx} OR container_number ILIKE $${idx} OR importer_name ILIKE $${idx} OR agent_name ILIKE $${idx})`;
      params.push(`%${req.query.search}%`);
      idx++;
    }

    if (req.query.selectivity_lane) {
      sql += ` AND selectivity_lane = $${idx++}`;
      params.push(req.query.selectivity_lane);
    }

    if (req.query.hold_recommended) {
      sql += ` AND hold_recommended = $${idx++}`;
      params.push(req.query.hold_recommended === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY risk_score DESC';
    const cargoList = await allAsync(sql, params);
    res.json({ cargo: cargoList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile/:id', authenticateToken, async (req, res) => {
  try {
    const cargo = await getAsync('SELECT * FROM cargo_profiles WHERE id = $1', [req.params.id]);
    if (!cargo) {
      return res.status(404).json({ error: 'Cargo profile declaration not found' });
    }

    const entityRisk = await getAsync('SELECT * FROM entity_profiles WHERE name ILIKE $1 OR name ILIKE $2', [`%${cargo.importer_name}%`, `%${cargo.agent_name}%`]);

    await logAuditAction(req, 'VIEW_CARGO_PROFILE', 'Cargo Profiling', { cargo_id: cargo.id, paar_number: cargo.paar_number });

    res.json({
      cargo,
      entity_risk_match: entityRisk || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      paar_number, form_m, sgd_number, manifest_number, container_number,
      vessel_name, importer_name, agent_name, commodity, hs_code,
      declared_value, origin_country, route, examination_note
    } = req.body;

    if (!paar_number || !form_m || !sgd_number || !manifest_number || !container_number || !importer_name || !agent_name || !hs_code) {
      return res.status(400).json({ error: 'Missing mandatory cargo profiling details' });
    }

    let risk_score = 10;
    let selectivity_lane = 'Green';
    let hold_recommended = 0;

    if (['China', 'Turkey', 'Dubai', 'India'].includes(origin_country)) risk_score += 25;
    if (hs_code.startsWith('8429') || hs_code.startsWith('9301') || hs_code.startsWith('3004')) risk_score += 30;
    if (declared_value > 20000000) risk_score += 20;

    const entityMatch = await getAsync("SELECT * FROM entity_profiles WHERE (name ILIKE $1 OR name ILIKE $2) AND watchlist_status = 'Active'", [`%${importer_name}%`, `%${agent_name}%`]);
    if (entityMatch) {
      risk_score += 35;
    }

    if (risk_score >= 80) {
      selectivity_lane = 'Red';
      hold_recommended = 1;
    } else if (risk_score >= 50) {
      selectivity_lane = 'Yellow';
    }

    const result = await query(
      `INSERT INTO cargo_profiles
      (paar_number, form_m, sgd_number, manifest_number, container_number, vessel_name, importer_name, agent_name, commodity, hs_code, declared_value, origin_country, route, risk_score, selectivity_lane, examination_note, hold_recommended)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id`,
      [paar_number, form_m, sgd_number, manifest_number, container_number, vessel_name, importer_name, agent_name, commodity, hs_code, declared_value || 0, origin_country || 'Unknown', route || 'Direct', risk_score, selectivity_lane, examination_note || null, hold_recommended]
    );

    const newId = result.rows[0].id;
    await logAuditAction(req, 'CREATE_CARGO_PROFILE', 'Cargo Profiling', { cargo_id: newId, paar_number, risk_score, selectivity_lane });

    res.status(201).json({
      message: 'Cargo profile ingested and evaluated by CIU Risk Engine',
      cargo_id: newId,
      risk_score,
      selectivity_lane,
      hold_recommended: !!hold_recommended
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/hold-recommendation', authenticateToken, requireClearance(2), async (req, res) => {
  try {
    const { cargo_id, examination_note, hold_recommended } = req.body;
    if (!cargo_id) {
      return res.status(400).json({ error: 'Cargo ID required' });
    }

    await query(
      'UPDATE cargo_profiles SET examination_note = $1, hold_recommended = $2, selectivity_lane = $3 WHERE id = $4',
      [examination_note, hold_recommended ? 1 : 0, hold_recommended ? 'Red' : 'Yellow', cargo_id]
    );

    await logAuditAction(req, 'ISSUE_CARGO_HOLD', 'Cargo Profiling', { cargo_id, examination_note, hold_recommended });

    res.json({ message: 'Cargo examination recommendation updated successfully', cargo_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
