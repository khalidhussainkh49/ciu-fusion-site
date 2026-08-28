// App Client Module Renderers for Modules 1-5 & 6-10

// MODULE 1: FUSION CENTRE
async function renderFusionModule(container) {
  try {
    const data = await apiFetch('/api/fusion/overview');
    const m = data.metrics;

    container.innerHTML = `
      <h2 style="margin-bottom: 16px; color: var(--ncs-dark-green);">MODULE 1: INTELLIGENCE FUSION CENTRE DASHBOARD</h2>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="title">Total Field Reports</div>
          <div class="value">${m.total_reports}</div>
        </div>
        <div class="metric-card warning">
          <div class="title">Pending Supervisor Approval</div>
          <div class="value">${m.pending_reports}</div>
        </div>
        <div class="metric-card">
          <div class="title">Active Investigation Cases</div>
          <div class="value">${m.active_cases}</div>
        </div>
        <div class="metric-card danger">
          <div class="title">Active Watchlist Entities</div>
          <div class="value">${m.watchlist_count}</div>
        </div>
        <div class="metric-card danger">
          <div class="title">High-Risk Cargo (Red Lane)</div>
          <div class="value">${m.high_risk_cargo}</div>
        </div>
        <div class="metric-card warning">
          <div class="title">Active Cyber Threats</div>
          <div class="value">${m.active_cyber_alerts}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Recent Priority Intelligence Alerts</div>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Report #</th>
                <th>Title</th>
                <th>Category</th>
                <th>Command</th>
                <th>Classification</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.recent_alerts.map(r => `
                <tr>
                  <td><strong>${r.report_number}</strong></td>
                  <td>${r.title}</td>
                  <td>${r.category}</td>
                  <td>${r.command}</td>
                  <td><span class="badge badge-yellow">${r.classification}</span></td>
                  <td><span class="badge ${r.status === 'Approved' ? 'badge-green' : 'badge-yellow'}">${r.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="error-alert">Error loading Fusion Centre: ${err.message}</div>`;
  }
}

// MODULE 2: ENTITY PROFILING
async function renderEntitiesModule(container) {
  try {
    const data = await apiFetch('/api/entities');
    container.innerHTML = `
      <div class="card-header" style="border:none; padding:0; margin-bottom:16px;">
        <h2>MODULE 2: SUSPECT TRADER & COMPANY PROFILING</h2>
        <button class="btn btn-primary" onclick="showCreateEntityModal()">+ Create Entity Profile</button>
      </div>

      <div class="card">
        <div class="card-title" style="margin-bottom: 12px;">National Entity Watchlist & Link Database</div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Entity Name</th>
                <th>Type</th>
                <th>TIN / RC</th>
                <th>Phone</th>
                <th>Risk Score</th>
                <th>Watchlist</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${data.entities.map(e => `
                <tr>
                  <td><strong>${e.entity_code}</strong></td>
                  <td>${e.name}</td>
                  <td>${e.type}</td>
                  <td>${e.tin_rc || 'N/A'}</td>
                  <td>${e.phone || 'N/A'}</td>
                  <td><span class="badge ${e.risk_score >= 80 ? 'badge-red' : 'badge-yellow'}">${e.risk_score} / 100</span></td>
                  <td><span class="badge ${e.watchlist_status === 'Active' ? 'badge-red' : 'badge-green'}">${e.watchlist_status}</span></td>
                  <td><button class="btn btn-sm btn-secondary" onclick="viewEntityDetails(${e.id})">Link Analysis</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="error-alert">Error loading Entity Profiles: ${err.message}</div>`;
  }
}

// MODULE 3: CARGO RISK PROFILING
async function renderCargoModule(container) {
  try {
    const data = await apiFetch('/api/cargo/profile');
    container.innerHTML = `
      <div class="card-header" style="border:none; padding:0; margin-bottom:16px;">
        <h2>MODULE 3: CARGO PROFILING & SELECTIVITY INTELLIGENCE</h2>
        <button class="btn btn-primary" onclick="showIngestCargoModal()">+ Ingest Cargo Declaration</button>
      </div>

      <div class="card">
        <div class="card-title" style="margin-bottom: 12px;">Targeted Consignments & Selectivity Recommendations</div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>PAAR #</th>
                <th>SGD #</th>
                <th>Container</th>
                <th>Importer</th>
                <th>Commodity</th>
                <th>Risk Score</th>
                <th>Selectivity</th>
                <th>Action Recommended</th>
              </tr>
            </thead>
            <tbody>
              ${data.cargo.map(c => `
                <tr>
                  <td><strong>${c.paar_number}</strong></td>
                  <td>${c.sgd_number}</td>
                  <td>${c.container_number}</td>
                  <td>${c.importer_name}</td>
                  <td>${c.commodity} (${c.hs_code})</td>
                  <td><strong>${c.risk_score}</strong></td>
                  <td><span class="badge ${c.selectivity_lane === 'Red' ? 'badge-red' : (c.selectivity_lane === 'Yellow' ? 'badge-yellow' : 'badge-green')}">${c.selectivity_lane} Lane</span></td>
                  <td>${c.hold_recommended ? '<span class="badge badge-red">100% Physical Exam</span>' : '<span class="badge badge-green">Standard Clearance</span>'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="error-alert">Error loading Cargo Profiles: ${err.message}</div>`;
  }
}

// MODULE 4: FIELD INTELLIGENCE REPORTING
async function renderReportsModule(container) {
  try {
    const data = await apiFetch('/api/reports');
    container.innerHTML = `
      <div class="card">
        <div class="card-title">MODULE 4: SUBMIT FIELD INTELLIGENCE REPORT</div>
        <form id="form-submit-report" style="margin-top: 16px;">
          <div class="form-row">
            <div class="form-group">
              <label>Report Title</label>
              <input type="text" id="rpt-title" class="form-control" required placeholder="e.g. Unmanifested Cargo Concealment">
            </div>
            <div class="form-group">
              <label>Report Category</label>
              <select id="rpt-category" class="form-control">
                <option>Anti-Smuggling</option>
                <option>Revenue Leakage</option>
                <option>Trade Fraud</option>
                <option>Border Infiltration</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Area Command</label>
              <input type="text" id="rpt-command" class="form-control" required value="${currentUser ? currentUser.command : 'Apapa Area Command'}">
            </div>
            <div class="form-group">
              <label>Specific Location / Terminal</label>
              <input type="text" id="rpt-location" class="form-control" required placeholder="e.g. Wharf Gate 3 / Seme Corridor">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Source Reliability (A - E)</label>
              <select id="rpt-source" class="form-control">
                <option>A - Completely Reliable</option>
                <option selected>B - Usually Reliable</option>
                <option>C - Fairly Reliable</option>
                <option>D - Not Usually Reliable</option>
                <option>E - Reliability Cannot Be Judged</option>
              </select>
            </div>
            <div class="form-group">
              <label>Information Credibility (1 - 5)</label>
              <select id="rpt-credibility" class="form-control">
                <option>1 - Confirmed by Other Sources</option>
                <option selected>2 - Probably True</option>
                <option>3 - Possibly True</option>
                <option>4 - Doubtful</option>
                <option>5 - Credibility Cannot Be Judged</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Security Classification</label>
            <select id="rpt-classification" class="form-control">
              <option>Restricted</option>
              <option selected>Confidential</option>
              <option>Secret</option>
            </select>
          </div>
          <div class="form-group">
            <label>Intelligence Details & Observations</label>
            <textarea id="rpt-details" class="form-control" rows="4" required placeholder="Provide granular intelligence observations..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Submit Intelligence Report</button>
        </form>
      </div>

      <div class="card">
        <div class="card-title">National Intelligence Submissions Queue</div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Report #</th>
                <th>Title</th>
                <th>Submitter</th>
                <th>Command</th>
                <th>Grading</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.reports.map(r => `
                <tr>
                  <td><strong>${r.report_number}</strong></td>
                  <td>${r.title}</td>
                  <td>${r.submitter_name}</td>
                  <td>${r.command}</td>
                  <td>${r.source_reliability.substring(0,2)} / ${r.information_credibility.substring(0,2)}</td>
                  <td><span class="badge ${r.status === 'Approved' ? 'badge-green' : 'badge-yellow'}">${r.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('form-submit-report').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await apiFetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: document.getElementById('rpt-title').value,
            category: document.getElementById('rpt-category').value,
            command: document.getElementById('rpt-command').value,
            location: document.getElementById('rpt-location').value,
            source_reliability: document.getElementById('rpt-source').value,
            information_credibility: document.getElementById('rpt-credibility').value,
            classification: document.getElementById('rpt-classification').value,
            details: document.getElementById('rpt-details').value
          })
        });
        alert('Intelligence Report Submitted Successfully!');
        renderReportsModule(container);
      } catch (err) {
        alert('Submission Error: ' + err.message);
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="error-alert">Error loading Field Reports: ${err.message}</div>`;
  }
}

// MODULE 5: GEOSPATIAL INTELLIGENCE
async function renderGeospatialModule(container) {
  try {
    const data = await apiFetch('/api/geospatial/routes');
    container.innerHTML = `
      <h2 style="margin-bottom: 16px;">MODULE 5: SMUGGLING ROUTE & GEOSPATIAL INTELLIGENCE PORTAL</h2>

      <div class="card" style="background-color: #0f172a; color: white;">
        <div class="card-title" style="color: var(--ncs-gold);">NATIONAL GIS MAP VISUALIZER (SMUGGLING CORRIDORS)</div>
        <div style="height: 250px; border: 2px dashed #334155; border-radius: 6px; display:flex; align-items:center; justify-content:center; flex-direction:column; margin-top:12px;">
          <div style="font-size: 1.2rem; font-weight:700; color:var(--ncs-gold);">[ Interactive Vector Map Layer Rendering ]</div>
          <div style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px;">Mapping 2 Active High-Risk Border Smuggling Corridors & Seizure Hotspots</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Identified Vulnerable Border Routes & Seizure Density</div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Route Name</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Risk Level</th>
                <th>Recorded Seizures</th>
                <th>Vulnerability & Terrain Notes</th>
              </tr>
            </thead>
            <tbody>
              ${data.routes.map(rt => `
                <tr>
                  <td><strong>${rt.route_name}</strong></td>
                  <td>${rt.origin_location}</td>
                  <td>${rt.destination_location}</td>
                  <td><span class="badge ${rt.risk_level === 'Critical' ? 'badge-red' : 'badge-yellow'}">${rt.risk_level}</span></td>
                  <td><strong>${rt.seizure_count} Seizures</strong></td>
                  <td>${rt.vulnerability_notes}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="error-alert">Error loading Geospatial Routes: ${err.message}</div>`;
  }
}
