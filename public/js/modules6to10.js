// App Client Module Renderers for Modules 6-10

// MODULE 6: CASE MANAGEMENT
async function renderCasesModule(container) {
  try {
    const data = await apiFetch('/api/cases');
    container.innerHTML = `
      <div class="card-header" style="border:none; padding:0; margin-bottom:16px;">
        <h2>MODULE 6: INVESTIGATION & CASE MANAGEMENT PORTAL</h2>
        <button class="btn btn-primary" onclick="showInitiateCaseModal()">+ Initiate Investigation Case</button>
      </div>

      <div class="card">
        <div class="card-title">Active & Closed Investigation Files</div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Case File #</th>
                <th>Title</th>
                <th>Category</th>
                <th>Assigned Officer</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${data.cases.map(cs => `
                <tr>
                  <td><strong>${cs.case_number}</strong></td>
                  <td>${cs.title}</td>
                  <td>${cs.category}</td>
                  <td>${cs.assigned_officer_name || 'Unassigned'}</td>
                  <td><span class="badge ${cs.status === 'Active' ? 'badge-yellow' : 'badge-green'}">${cs.status}</span></td>
                  <td><button class="btn btn-sm btn-secondary" onclick="viewCaseWorkspace(${cs.id})">Case Workspace</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="error-alert">Error loading Case Files: ${err.message}</div>`;
  }
}

// MODULE 7: CYBER-INTELLIGENCE
async function renderCyberModule(container) {
  try {
    const data = await apiFetch('/api/cyber/indicators');
    container.innerHTML = `
      <div class="card-header" style="border:none; padding:0; margin-bottom:16px;">
        <h2>MODULE 7: CYBER-INTELLIGENCE & DIGITAL THREAT PORTAL</h2>
      </div>

      <div class="card">
        <div class="card-title">Report Digital Threat / Fake Platform</div>
        <form id="form-cyber-report" style="margin-top: 12px;">
          <div class="form-row">
            <div class="form-group">
              <label>Indicator Type</label>
              <select id="cyb-type" class="form-control">
                <option>Domain/URL</option>
                <option>IP Address</option>
                <option>Phishing Email</option>
                <option>Leaked Credential</option>
              </select>
            </div>
            <div class="form-group">
              <label>Threat Category</label>
              <select id="cyb-category" class="form-control">
                <option>Impersonation Website</option>
                <option>Fake Auction Portal</option>
                <option>Credential Harvest Phishing</option>
                <option>Cyber Revenue Fraud</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Indicator Value (URL / Email / IP)</label>
            <input type="text" id="cyb-value" class="form-control" placeholder="e.g. https://fake-customs-auction.com" required>
          </div>
          <button type="submit" class="btn btn-primary">Log Threat Indicator</button>
        </form>
      </div>

      <div class="card">
        <div class="card-title">Digital Threat Indicators & Cybersecurity Validation Register</div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Category</th>
                <th>Reporter</th>
                <th>Validation Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.indicators.map(cy => `
                <tr>
                  <td><strong>${cy.indicator_code}</strong></td>
                  <td>${cy.indicator_type}</td>
                  <td><code>${cy.indicator_value}</code></td>
                  <td>${cy.threat_category}</td>
                  <td>${cy.reporter_name || 'Cyber Officer'}</td>
                  <td><span class="badge ${cy.validation_status === 'Mitigated' ? 'badge-green' : 'badge-yellow'}">${cy.validation_status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('form-cyber-report').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await apiFetch('/api/cyber/indicators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            indicator_type: document.getElementById('cyb-type').value,
            threat_category: document.getElementById('cyb-category').value,
            indicator_value: document.getElementById('cyb-value').value
          })
        });
        alert('Digital Threat Indicator Logged!');
        renderCyberModule(container);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="error-alert">Error loading Cyber Indicators: ${err.message}</div>`;
  }
}

// MODULE 8: INTER-AGENCY COLLABORATION
async function renderInteragencyModule(container) {
  try {
    const data = await apiFetch('/api/interagency/requests');
    container.innerHTML = `
      <h2 style="margin-bottom: 16px;">MODULE 8: INTER-AGENCY INTELLIGENCE COLLABORATION PORTAL</h2>

      <div class="card">
        <div class="card-title">Initiate Inter-Agency Intelligence Request</div>
        <form id="form-interagency" style="margin-top: 12px;">
          <div class="form-row">
            <div class="form-group">
              <label>Requesting Unit/Agency</label>
              <input type="text" id="iar-req" class="form-control" value="NCS Customs Intelligence Unit" required>
            </div>
            <div class="form-group">
              <label>Target Partner Agency</label>
              <select id="iar-target" class="form-control">
                <option>EFCC (Financial Crimes)</option>
                <option>NDLEA (Narcotics Enforcement)</option>
                <option>DSS (State Security Services)</option>
                <option>INTERPOL / NPF</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Subject / Matter</label>
            <input type="text" id="iar-subject" class="form-control" placeholder="Subject of request..." required>
          </div>
          <div class="form-group">
            <label>Detailed Request Specification</label>
            <textarea id="iar-details" class="form-control" rows="3" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Transmit Inter-Agency Request</button>
        </form>
      </div>

      <div class="card">
        <div class="card-title">Active Inter-Agency Intelligence Request Log</div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Request Code</th>
                <th>Target Agency</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.requests.map(rq => `
                <tr>
                  <td><strong>${rq.request_code}</strong></td>
                  <td>${rq.target_agency}</td>
                  <td>${rq.subject}</td>
                  <td><span class="badge ${rq.status === 'Approved' ? 'badge-green' : 'badge-yellow'}">${rq.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('form-interagency').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await apiFetch('/api/interagency/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requesting_agency: document.getElementById('iar-req').value,
            target_agency: document.getElementById('iar-target').value,
            subject: document.getElementById('iar-subject').value,
            details: document.getElementById('iar-details').value
          })
        });
        alert('Inter-Agency Intelligence Request Transmitted!');
        renderInteragencyModule(container);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="error-alert">Error loading Inter-Agency Portal: ${err.message}</div>`;
  }
}

// MODULE 9: KPI & COMMAND RANKINGS
async function renderKpiModule(container) {
  try {
    const data = await apiFetch('/api/kpi/commands');
    container.innerHTML = `
      <h2 style="margin-bottom: 16px;">MODULE 9: KPI & COMMAND RANKING PORTAL</h2>

      <div class="card">
        <div class="card-title">Area Command Intelligence Output & Productivity Leaderboard</div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Area Command</th>
                <th>Total Reports</th>
                <th>Approved Reports</th>
                <th>Productivity Score</th>
                <th>Est. Revenue Recovery (NGN)</th>
              </tr>
            </thead>
            <tbody>
              ${data.rankings.map(rk => `
                <tr>
                  <td><strong>#${rk.rank}</strong></td>
                  <td>${rk.command}</td>
                  <td>${rk.total_reports}</td>
                  <td>${rk.approved_reports}</td>
                  <td><span class="badge badge-green">${rk.productivity_score} / 100</span></td>
                  <td><strong>NGN ${rk.est_revenue_recovered_ngn.toLocaleString()}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="error-alert">Error loading KPI Dashboard: ${err.message}</div>`;
  }
}

// MODULE 10: AI PREDICTION ENGINE
async function renderAiModule(container) {
  try {
    container.innerHTML = `
      <h2 style="margin-bottom: 16px;">MODULE 10: AI-POWERED INTELLIGENCE PREDICTION PORTAL</h2>

      <div class="card">
        <div class="card-title">AI Predictive Consignment Risk Scoring Engine</div>
        <form id="form-ai-risk" style="margin-top:12px;">
          <div class="form-row">
            <div class="form-group">
              <label>Importer Name</label>
              <input type="text" id="ai-importer" class="form-control" value="Globo Import Ltd" required>
            </div>
            <div class="form-group">
              <label>Country of Origin</label>
              <select id="ai-origin" class="form-control">
                <option>China</option>
                <option>Turkey</option>
                <option>India</option>
                <option>Germany</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>HS Code</label>
              <input type="text" id="ai-hs" class="form-control" value="8429.52.00" required>
            </div>
            <div class="form-group">
              <label>Declared Value (NGN)</label>
              <input type="number" id="ai-val" class="form-control" value="50000000" required>
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Run Predictive Risk Analytics</button>
        </form>

        <div id="ai-risk-result" style="margin-top:20px;" class="hidden"></div>
      </div>
    `;

    document.getElementById('form-ai-risk').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const resData = await apiFetch('/api/ai/predict-risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            importer_name: document.getElementById('ai-importer').value,
            origin_country: document.getElementById('ai-origin').value,
            hs_code: document.getElementById('ai-hs').value,
            declared_value: parseFloat(document.getElementById('ai-val').value)
          })
        });

        const resDiv = document.getElementById('ai-risk-result');
        resDiv.classList.remove('hidden');
        resDiv.innerHTML = `
          <div style="background-color:#f8fafc; border:1px solid #cbd5e1; padding:16px; border-radius:6px;">
            <h4>AI Risk Evaluation Results:</h4>
            <div style="font-size:1.5rem; font-weight:700; color:var(--ncs-red); margin:8px 0;">
              Score: ${resData.predicted_risk_score} / 100 (${resData.risk_category})
            </div>
            <div><strong>Recommendation:</strong> <span class="badge badge-red">${resData.recommendation}</span></div>
            <h5 style="margin-top:12px;">Contributing Risk Factors:</h5>
            <ul>
              ${resData.contributing_risk_factors.map(f => `<li>${f}</li>`).join('')}
            </ul>
          </div>
        `;
      } catch (err) {
        alert('AI Analytics Error: ' + err.message);
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="error-alert">Error loading AI Prediction Engine: ${err.message}</div>`;
  }
}
