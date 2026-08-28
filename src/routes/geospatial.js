const express = require('express');
const router = express.Router();
const { query, allAsync } = require('../db');
const { authenticateToken, logAuditAction } = require('../middleware/auth');

router.get('/routes', authenticateToken, async (req, res) => {
  try {
    const routes = await allAsync('SELECT * FROM geospatial_routes ORDER BY seizure_count DESC');
    res.json({ routes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/hotspots', authenticateToken, async (req, res) => {
  try {
    const hotspots = await allAsync('SELECT id, route_name, origin_location, destination_location, risk_level, seizure_count, latitude, longitude FROM geospatial_routes WHERE risk_level IN (\'High\', \'Critical\')');
    res.json({ hotspots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/routes', authenticateToken, async (req, res) => {
  try {
    const { route_name, origin_location, destination_location, risk_level, seizure_count, vulnerability_notes, latitude, longitude } = req.body;
    if (!route_name || !origin_location || !destination_location || !risk_level) {
      return res.status(400).json({ error: 'Missing route parameters' });
    }

    const result = await query(
      `INSERT INTO geospatial_routes (route_name, origin_location, destination_location, risk_level, seizure_count, vulnerability_notes, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [route_name, origin_location, destination_location, risk_level, seizure_count || 0, vulnerability_notes || null, latitude || null, longitude || null]
    );

    const newId = result.rows[0].id;
    await logAuditAction(req, 'CREATE_GEOSPATIAL_ROUTE', 'Geospatial Intelligence', { route_id: newId, route_name });

    res.status(201).json({ message: 'Geospatial smuggling route added successfully', route_id: newId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
