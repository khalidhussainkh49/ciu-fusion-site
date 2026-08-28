const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/fusion_suite.db');

// Ensure directory exists if needed
const fs = require('fs');
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDb() {
  await runAsync('PRAGMA foreign_keys = ON');

  // Users & Roles
  await runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      service_number TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      clearance_level INTEGER NOT NULL,
      command TEXT NOT NULL,
      mfa_enabled INTEGER DEFAULT 1,
      mfa_secret TEXT DEFAULT '123456',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Intelligence Reports
  await runAsync(`
    CREATE TABLE IF NOT EXISTS intelligence_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_number TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      command TEXT NOT NULL,
      location TEXT NOT NULL,
      source_reliability TEXT NOT NULL,
      information_credibility TEXT NOT NULL,
      classification TEXT NOT NULL,
      subject_entity TEXT,
      commodity TEXT,
      route_location TEXT,
      details TEXT NOT NULL,
      recommended_action TEXT,
      attachment_url TEXT,
      status TEXT DEFAULT 'Submitted',
      submitted_by INTEGER NOT NULL,
      approved_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (submitted_by) REFERENCES users(id)
    )
  `);

  // Entity Profiles & Watchlists
  await runAsync(`
    CREATE TABLE IF NOT EXISTS entity_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      tin_rc TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      directors TEXT,
      risk_score INTEGER DEFAULT 0,
      watchlist_status TEXT DEFAULT 'Inactive',
      linked_agents TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Cargo Profiles & Selectivity Indicators
  await runAsync(`
    CREATE TABLE IF NOT EXISTS cargo_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paar_number TEXT UNIQUE NOT NULL,
      form_m TEXT NOT NULL,
      sgd_number TEXT NOT NULL,
      manifest_number TEXT NOT NULL,
      container_number TEXT NOT NULL,
      vessel_name TEXT NOT NULL,
      importer_name TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      commodity TEXT NOT NULL,
      hs_code TEXT NOT NULL,
      declared_value REAL NOT NULL,
      origin_country TEXT NOT NULL,
      route TEXT NOT NULL,
      risk_score INTEGER DEFAULT 0,
      selectivity_lane TEXT DEFAULT 'Green',
      examination_note TEXT,
      hold_recommended INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Investigation & Case Management
  await runAsync(`
    CREATE TABLE IF NOT EXISTS case_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_number TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      originating_report_id INTEGER,
      assigned_officer_id INTEGER,
      supervisor_id INTEGER,
      status TEXT DEFAULT 'Active',
      outcome TEXT,
      closure_report TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (originating_report_id) REFERENCES intelligence_reports(id),
      FOREIGN KEY (assigned_officer_id) REFERENCES users(id)
    )
  `);

  // Evidence Register
  await runAsync(`
    CREATE TABLE IF NOT EXISTS case_evidence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      item_description TEXT NOT NULL,
      evidence_type TEXT NOT NULL,
      custodian TEXT NOT NULL,
      date_seized DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'Secured',
      FOREIGN KEY (case_id) REFERENCES case_files(id)
    )
  `);

  // Case Tasks
  await runAsync(`
    CREATE TABLE IF NOT EXISTS case_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      task_title TEXT NOT NULL,
      assigned_to INTEGER NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      FOREIGN KEY (case_id) REFERENCES case_files(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
  `);

  // Cyber Indicators & Threats
  await runAsync(`
    CREATE TABLE IF NOT EXISTS cyber_indicators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      indicator_code TEXT UNIQUE NOT NULL,
      indicator_type TEXT NOT NULL,
      indicator_value TEXT NOT NULL,
      threat_category TEXT NOT NULL,
      validation_status TEXT DEFAULT 'Pending Review',
      mitigation_outcome TEXT,
      reported_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reported_by) REFERENCES users(id)
    )
  `);

  // Inter-Agency Collaboration
  await runAsync(`
    CREATE TABLE IF NOT EXISTS agency_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_code TEXT UNIQUE NOT NULL,
      requesting_agency TEXT NOT NULL,
      target_agency TEXT NOT NULL,
      subject TEXT NOT NULL,
      details TEXT NOT NULL,
      status TEXT DEFAULT 'Pending Approval',
      response_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Smuggling Routes & Geospatial Hotspots
  await runAsync(`
    CREATE TABLE IF NOT EXISTS geospatial_routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      route_name TEXT NOT NULL,
      origin_location TEXT NOT NULL,
      destination_location TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      seizure_count INTEGER DEFAULT 0,
      vulnerability_notes TEXT,
      latitude REAL,
      longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Audit Logs
  await runAsync(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      details TEXT,
      ip_address TEXT DEFAULT '127.0.0.1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default users if empty
  const userCount = await getAsync('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    const defaultPassword = await bcrypt.hash('Password123!', 10);
    const usersToSeed = [
      { username: 'cgc_admin', name: 'Comptroller-General', service: 'NCS/CGC/001', role: 'Head of CIU', clearance: 5, command: 'HQ Abuja' },
      { username: 'hq_analyst', name: 'Amina Bello (HQ Analyst)', service: 'NCS/CIU/102', role: 'CIU HQ Analyst', clearance: 3, command: 'HQ Abuja' },
      { username: 'cmd_sup', name: 'Kabiru Ibrahim (Command Sup)', service: 'NCS/CIU/205', role: 'CIU Command Supervisor', clearance: 2, command: 'Apapa Area Command' },
      { username: 'field_officer', name: 'Sunday Chukwu (Field Officer)', service: 'NCS/CIU/309', role: 'CIU Field Officer', clearance: 1, command: 'Seme Border Command' },
      { username: 'cyber_officer', name: 'Fatima Umar (Cyber Unit)', service: 'NCS/CYBER/044', role: 'Cybersecurity Officer', clearance: 3, command: 'HQ Abuja' }
    ];

    for (const u of usersToSeed) {
      await runAsync(
        'INSERT INTO users (username, password_hash, full_name, service_number, role, clearance_level, command) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [u.username, defaultPassword, u.name, u.service, u.role, u.clearance, u.command]
      );
    }
  }

  // Seed sample initial data
  const reportCount = await getAsync('SELECT COUNT(*) as count FROM intelligence_reports');
  if (reportCount.count === 0) {
    await runAsync(`
      INSERT INTO intelligence_reports
      (report_number, title, category, command, location, source_reliability, information_credibility, classification, subject_entity, commodity, route_location, details, recommended_action, status, submitted_by)
      VALUES
      ('CIU/RPT/2026/001', 'Suspected Undervaluation of Heavy Machinery', 'Revenue Leakage', 'Apapa Area Command', 'Port Terminal B', 'B - Usually Reliable', '2 - Probably True', 'Confidential', 'Globo Import Ltd', 'Excavators', 'Hamburg - Lagos', 'Intelligence indicates misdeclaration of unit values on 5 containers.', 'Flag for Red Lane physical examination', 'Approved', 4)
    `);
  }

  const entityCount = await getAsync('SELECT COUNT(*) as count FROM entity_profiles');
  if (entityCount.count === 0) {
    await runAsync(`
      INSERT INTO entity_profiles (entity_code, name, type, tin_rc, phone, email, address, directors, risk_score, watchlist_status, linked_agents)
      VALUES ('ENT-9021', 'Globo Import Ltd', 'Company', 'RC-8849201', '+2348030001122', 'info@globoimport.ng', '12 Commercial Rd, Apapa', 'John Doe, Usman Ali', 85, 'Active', 'Swift Logistics Ltd')
    `);
  }

  const cargoCount = await getAsync('SELECT COUNT(*) as count FROM cargo_profiles');
  if (cargoCount.count === 0) {
    await runAsync(`
      INSERT INTO cargo_profiles (paar_number, form_m, sgd_number, manifest_number, container_number, vessel_name, importer_name, agent_name, commodity, hs_code, declared_value, origin_country, route, risk_score, selectivity_lane, examination_note, hold_recommended)
      VALUES ('PAAR-2026-88392', 'M-994820', 'SGD-AP-2026-0091', 'MNF-88402', 'MSKU9930214', 'MV OCEAN STAR', 'Globo Import Ltd', 'Swift Logistics Ltd', 'Excavators & Spare Parts', '8429.52.00', 45000000.00, 'China', 'Ningbo - Apapa', 88, 'Red', 'Conduct 100% physical examination for undervaluation and unmanifested goods.', 1)
    `);
  }

  const routeCount = await getAsync('SELECT COUNT(*) as count FROM geospatial_routes');
  if (routeCount.count === 0) {
    await runAsync(`
      INSERT INTO geospatial_routes (route_name, origin_location, destination_location, risk_level, seizure_count, vulnerability_notes, latitude, longitude)
      VALUES
      ('Seme Unapproved Bush Corridor', 'Seme Border', 'Badagry', 'Critical', 14, 'Frequent night movements of smuggled foreign rice and petroleum products.', 6.3833, 2.7167),
      ('Jibia Illegal Crossing Track', 'Jibia', 'Katsina Central', 'High', 9, 'Uncontrolled dirt paths utilized by motorcycle syndicates.', 13.0833, 7.2167)
    `);
  }
}

module.exports = {
  db,
  initDb,
  runAsync,
  getAsync,
  allAsync
};
