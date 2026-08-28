const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL || 'postgresql://ncs_admin:ncs_secret_password_2026@localhost:5432/ncs_fusion_db';

const pool = new Pool({
  connectionString
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  return res;
}

async function getAsync(text, params) {
  const res = await pool.query(text, params);
  return res.rows[0];
}

async function allAsync(text, params) {
  const res = await pool.query(text, params);
  return res.rows;
}

async function initDb() {
  // Users & Roles
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(150) NOT NULL,
      service_number VARCHAR(100) UNIQUE NOT NULL,
      role VARCHAR(100) NOT NULL,
      clearance_level INT NOT NULL,
      command VARCHAR(150) NOT NULL,
      mfa_enabled INT DEFAULT 1,
      mfa_secret VARCHAR(50) DEFAULT '123456',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Intelligence Reports
  await query(`
    CREATE TABLE IF NOT EXISTS intelligence_reports (
      id SERIAL PRIMARY KEY,
      report_number VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      command VARCHAR(150) NOT NULL,
      location VARCHAR(200) NOT NULL,
      source_reliability VARCHAR(100) NOT NULL,
      information_credibility VARCHAR(100) NOT NULL,
      classification VARCHAR(50) NOT NULL,
      subject_entity VARCHAR(200),
      commodity VARCHAR(200),
      route_location VARCHAR(200),
      details TEXT NOT NULL,
      recommended_action TEXT,
      attachment_url TEXT,
      status VARCHAR(50) DEFAULT 'Submitted',
      submitted_by INT REFERENCES users(id),
      approved_by INT REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Entity Profiles
  await query(`
    CREATE TABLE IF NOT EXISTS entity_profiles (
      id SERIAL PRIMARY KEY,
      entity_code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      type VARCHAR(100) NOT NULL,
      tin_rc VARCHAR(100),
      phone VARCHAR(50),
      email VARCHAR(100),
      address TEXT,
      directors TEXT,
      risk_score INT DEFAULT 0,
      watchlist_status VARCHAR(50) DEFAULT 'Inactive',
      linked_agents TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Cargo Profiles
  await query(`
    CREATE TABLE IF NOT EXISTS cargo_profiles (
      id SERIAL PRIMARY KEY,
      paar_number VARCHAR(100) UNIQUE NOT NULL,
      form_m VARCHAR(100) NOT NULL,
      sgd_number VARCHAR(100) NOT NULL,
      manifest_number VARCHAR(100) NOT NULL,
      container_number VARCHAR(100) NOT NULL,
      vessel_name VARCHAR(150) NOT NULL,
      importer_name VARCHAR(200) NOT NULL,
      agent_name VARCHAR(200) NOT NULL,
      commodity VARCHAR(200) NOT NULL,
      hs_code VARCHAR(50) NOT NULL,
      declared_value NUMERIC(15, 2) NOT NULL,
      origin_country VARCHAR(100) NOT NULL,
      route VARCHAR(200) NOT NULL,
      risk_score INT DEFAULT 0,
      selectivity_lane VARCHAR(50) DEFAULT 'Green',
      examination_note TEXT,
      hold_recommended INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Case Files
  await query(`
    CREATE TABLE IF NOT EXISTS case_files (
      id SERIAL PRIMARY KEY,
      case_number VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      originating_report_id INT REFERENCES intelligence_reports(id),
      assigned_officer_id INT REFERENCES users(id),
      supervisor_id INT REFERENCES users(id),
      status VARCHAR(50) DEFAULT 'Active',
      outcome TEXT,
      closure_report TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Evidence Register
  await query(`
    CREATE TABLE IF NOT EXISTS case_evidence (
      id SERIAL PRIMARY KEY,
      case_id INT REFERENCES case_files(id),
      item_description TEXT NOT NULL,
      evidence_type VARCHAR(100) NOT NULL,
      custodian VARCHAR(150) NOT NULL,
      date_seized TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) DEFAULT 'Secured'
    )
  `);

  // Case Tasks
  await query(`
    CREATE TABLE IF NOT EXISTS case_tasks (
      id SERIAL PRIMARY KEY,
      case_id INT REFERENCES case_files(id),
      task_title VARCHAR(255) NOT NULL,
      assigned_to INT REFERENCES users(id),
      due_date VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending'
    )
  `);

  // Cyber Indicators
  await query(`
    CREATE TABLE IF NOT EXISTS cyber_indicators (
      id SERIAL PRIMARY KEY,
      indicator_code VARCHAR(100) UNIQUE NOT NULL,
      indicator_type VARCHAR(100) NOT NULL,
      indicator_value VARCHAR(255) NOT NULL,
      threat_category VARCHAR(100) NOT NULL,
      validation_status VARCHAR(50) DEFAULT 'Pending Review',
      mitigation_outcome TEXT,
      reported_by INT REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Inter-Agency Requests
  await query(`
    CREATE TABLE IF NOT EXISTS agency_requests (
      id SERIAL PRIMARY KEY,
      request_code VARCHAR(100) UNIQUE NOT NULL,
      requesting_agency VARCHAR(150) NOT NULL,
      target_agency VARCHAR(150) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      details TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending Approval',
      response_summary TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Geospatial Routes
  await query(`
    CREATE TABLE IF NOT EXISTS geospatial_routes (
      id SERIAL PRIMARY KEY,
      route_name VARCHAR(150) NOT NULL,
      origin_location VARCHAR(150) NOT NULL,
      destination_location VARCHAR(150) NOT NULL,
      risk_level VARCHAR(50) NOT NULL,
      seizure_count INT DEFAULT 0,
      vulnerability_notes TEXT,
      latitude NUMERIC(10, 6),
      longitude NUMERIC(10, 6),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Audit Logs
  await query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INT,
      username VARCHAR(100),
      action VARCHAR(100) NOT NULL,
      module VARCHAR(100) NOT NULL,
      details TEXT,
      ip_address VARCHAR(50) DEFAULT '127.0.0.1',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default users if empty
  const userCount = await getAsync('SELECT COUNT(*) as count FROM users');
  if (parseInt(userCount.count, 10) === 0) {
    const defaultPassword = await bcrypt.hash('Password123!', 10);
    const usersToSeed = [
      { username: 'cgc_admin', name: 'Comptroller-General', service: 'NCS/CGC/001', role: 'Head of CIU', clearance: 5, command: 'HQ Abuja' },
      { username: 'hq_analyst', name: 'Amina Bello (HQ Analyst)', service: 'NCS/CIU/102', role: 'CIU HQ Analyst', clearance: 3, command: 'HQ Abuja' },
      { username: 'cmd_sup', name: 'Kabiru Ibrahim (Command Sup)', service: 'NCS/CIU/205', role: 'CIU Command Supervisor', clearance: 2, command: 'Apapa Area Command' },
      { username: 'field_officer', name: 'Sunday Chukwu (Field Officer)', service: 'NCS/CIU/309', role: 'CIU Field Officer', clearance: 1, command: 'Seme Border Command' },
      { username: 'cyber_officer', name: 'Fatima Umar (Cyber Unit)', service: 'NCS/CYBER/044', role: 'Cybersecurity Officer', clearance: 3, command: 'HQ Abuja' }
    ];

    for (const u of usersToSeed) {
      await query(
        'INSERT INTO users (username, password_hash, full_name, service_number, role, clearance_level, command) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [u.username, defaultPassword, u.name, u.service, u.role, u.clearance, u.command]
      );
    }
  }

  // Seed initial sample data if empty
  const reportCount = await getAsync('SELECT COUNT(*) as count FROM intelligence_reports');
  if (parseInt(reportCount.count, 10) === 0) {
    await query(`
      INSERT INTO intelligence_reports
      (report_number, title, category, command, location, source_reliability, information_credibility, classification, subject_entity, commodity, route_location, details, recommended_action, status, submitted_by)
      VALUES
      ('CIU/RPT/2026/001', 'Suspected Undervaluation of Heavy Machinery', 'Revenue Leakage', 'Apapa Area Command', 'Port Terminal B', 'B - Usually Reliable', '2 - Probably True', 'Confidential', 'Globo Import Ltd', 'Excavators', 'Hamburg - Lagos', 'Intelligence indicates misdeclaration of unit values on 5 containers.', 'Flag for Red Lane physical examination', 'Approved', 4)
    `);
  }

  const entityCount = await getAsync('SELECT COUNT(*) as count FROM entity_profiles');
  if (parseInt(entityCount.count, 10) === 0) {
    await query(`
      INSERT INTO entity_profiles (entity_code, name, type, tin_rc, phone, email, address, directors, risk_score, watchlist_status, linked_agents)
      VALUES ('ENT-9021', 'Globo Import Ltd', 'Company', 'RC-8849201', '+2348030001122', 'info@globoimport.ng', '12 Commercial Rd, Apapa', 'John Doe, Usman Ali', 85, 'Active', 'Swift Logistics Ltd')
    `);
  }

  const cargoCount = await getAsync('SELECT COUNT(*) as count FROM cargo_profiles');
  if (parseInt(cargoCount.count, 10) === 0) {
    await query(`
      INSERT INTO cargo_profiles (paar_number, form_m, sgd_number, manifest_number, container_number, vessel_name, importer_name, agent_name, commodity, hs_code, declared_value, origin_country, route, risk_score, selectivity_lane, examination_note, hold_recommended)
      VALUES ('PAAR-2026-88392', 'M-994820', 'SGD-AP-2026-0091', 'MNF-88402', 'MSKU9930214', 'MV OCEAN STAR', 'Globo Import Ltd', 'Swift Logistics Ltd', 'Excavators & Spare Parts', '8429.52.00', 45000000.00, 'China', 'Ningbo - Apapa', 88, 'Red', 'Conduct 100% physical examination for undervaluation and unmanifested goods.', 1)
    `);
  }

  const routeCount = await getAsync('SELECT COUNT(*) as count FROM geospatial_routes');
  if (parseInt(routeCount.count, 10) === 0) {
    await query(`
      INSERT INTO geospatial_routes (route_name, origin_location, destination_location, risk_level, seizure_count, vulnerability_notes, latitude, longitude)
      VALUES
      ('Seme Unapproved Bush Corridor', 'Seme Border', 'Badagry', 'Critical', 14, 'Frequent night movements of smuggled foreign rice and petroleum products.', 6.3833, 2.7167),
      ('Jibia Illegal Crossing Track', 'Jibia', 'Katsina Central', 'High', 9, 'Uncontrolled dirt paths utilized by motorcycle syndicates.', 13.0833, 7.2167)
    `);
  }
}

module.exports = {
  pool,
  query,
  getAsync,
  allAsync,
  initDb
};
