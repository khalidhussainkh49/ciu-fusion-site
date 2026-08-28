const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDb } = require('./db');

const authRoutes = require('./routes/auth');
const fusionRoutes = require('./routes/fusion');
const reportsRoutes = require('./routes/reports');
const entitiesRoutes = require('./routes/entities');
const cargoRoutes = require('./routes/cargo');
const geospatialRoutes = require('./routes/geospatial');
const casesRoutes = require('./routes/cases');
const cyberRoutes = require('./routes/cyber');
const interagencyRoutes = require('./routes/interagency');
const kpiRoutes = require('./routes/kpi');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/fusion', fusionRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/entities', entitiesRoutes);
app.use('/api/cargo', cargoRoutes);
app.use('/api/geospatial', geospatialRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/cyber', cyberRoutes);
app.use('/api/interagency', interagencyRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/ai', aiRoutes);

// Catch-all route to serve SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize database and start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`=================================================================`);
    console.log(`NCS CUSTOMS INTELLIGENCE MANAGEMENT & FUSION SUITE ACTIVE`);
    console.log(`Running on http://localhost:${PORT}`);
    console.log(`Classification: RESTRICTED // OFFICIAL USE ONLY`);
    console.log(`=================================================================`);
  });
}).catch(err => {
  console.error('Database Initialization Failure:', err);
});

module.exports = app;
