import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeModule, setActiveModule] = useState('fusion');
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('ncs_user') || 'null'));
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('ncs_token') || null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Auth Modal State
  const [username, setUsername] = useState('cgc_admin');
  const [password, setPassword] = useState('Password123!');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [userIdForMfa, setUserIdForMfa] = useState(null);
  const [loginError, setLoginError] = useState('');

  // Module Data States
  const [fusionData, setFusionData] = useState(null);
  const [entitiesData, setEntitiesData] = useState([]);
  const [cargoData, setCargoData] = useState([]);
  const [reportsData, setReportsData] = useState([]);
  const [geospatialData, setGeospatialData] = useState([]);
  const [casesData, setCasesData] = useState([]);
  const [cyberData, setCyberData] = useState([]);
  const [interagencyData, setInteragencyData] = useState([]);
  const [kpiData, setKpiData] = useState([]);

  // AI Predictor State
  const [aiImporter, setAiImporter] = useState('Globo Import Ltd');
  const [aiOrigin, setAiOrigin] = useState('China');
  const [aiHs, setAiHs] = useState('8429.52.00');
  const [aiValue, setAiVal] = useState(50000000);
  const [aiResult, setAiResult] = useState(null);

  // Report Submission Form State
  const [rptTitle, setRptTitle] = useState('');
  const [rptCategory, setRptCategory] = useState('Anti-Smuggling');
  const [rptCommand, setRptCommand] = useState('Apapa Area Command');
  const [rptLocation, setRptLocation] = useState('');
  const [rptSource, setRptSource] = useState('B - Usually Reliable');
  const [rptCredibility, setRptCredibility] = useState('2 - Probably True');
  const [rptClassification, setRptClassification] = useState('Confidential');
  const [rptDetails, setRptDetails] = useState('');

  // Cyber Report Form State
  const [cybType, setCybType] = useState('Domain/URL');
  const [cybCategory, setCybCategory] = useState('Impersonation Website');
  const [cybValue, setCybValue] = useState('');

  // Interagency Form State
  const [iarReq, setIarReq] = useState('NCS Customs Intelligence Unit');
  const [iarTarget, setIarTarget] = useState('EFCC (Financial Crimes)');
  const [iarSubject, setIarSubject] = useState('');
  const [iarDetails, setIarDetails] = useState('');

  useEffect(() => {
    fetchModuleData(activeModule);
  }, [activeModule, authToken]);

  const apiFetch = async (url, options = {}) => {
    options.headers = options.headers || {};
    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API Request Failed');
    return data;
  };

  const fetchModuleData = async (mod) => {
    try {
      if (mod === 'fusion') {
        const data = await apiFetch('/api/fusion/overview');
        setFusionData(data);
      } else if (mod === 'entities') {
        const data = await apiFetch('/api/entities');
        setEntitiesData(data.entities);
      } else if (mod === 'cargo') {
        const data = await apiFetch('/api/cargo/profile');
        setCargoData(data.cargo);
      } else if (mod === 'reports') {
        const data = await apiFetch('/api/reports');
        setReportsData(data.reports);
      } else if (mod === 'geospatial') {
        const data = await apiFetch('/api/geospatial/routes');
        setGeospatialData(data.routes);
      } else if (mod === 'cases') {
        const data = await apiFetch('/api/cases');
        setCasesData(data.cases);
      } else if (mod === 'cyber') {
        const data = await apiFetch('/api/cyber/indicators');
        setCyberData(data.indicators);
      } else if (mod === 'interagency') {
        const data = await apiFetch('/api/interagency/requests');
        setInteragencyData(data.requests);
      } else if (mod === 'kpi') {
        const data = await apiFetch('/api/kpi/commands');
        setKpiData(data.rankings);
      }
    } catch (err) {
      console.error(`Error loading ${mod}:`, err);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      if (!mfaRequired) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        if (data.mfa_required) {
          setMfaRequired(true);
          setUserIdForMfa(data.user_id);
        } else {
          saveAuth(data.token, data.user);
        }
      } else {
        const res = await fetch('/api/auth/mfa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userIdForMfa, mfa_code: mfaCode })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'MFA verification failed');
        saveAuth(data.token, data.user);
      }
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const saveAuth = (token, user) => {
    setAuthToken(token);
    setCurrentUser(user);
    localStorage.setItem('ncs_token', token);
    localStorage.setItem('ncs_user', JSON.stringify(user));
    setShowLoginModal(false);
    setMfaRequired(false);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: rptTitle,
          category: rptCategory,
          command: rptCommand,
          location: rptLocation,
          source_reliability: rptSource,
          information_credibility: rptCredibility,
          classification: rptClassification,
          details: rptDetails
        })
      });
      alert('Intelligence Report Submitted Successfully!');
      setRptTitle('');
      setRptDetails('');
      fetchModuleData('reports');
    } catch (err) {
      alert('Error submitting report: ' + err.message);
    }
  };

  const handleRunAiPredictor = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/api/ai/predict-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          importer_name: aiImporter,
          origin_country: aiOrigin,
          hs_code: aiHs,
          declared_value: parseFloat(aiValue)
        })
      });
      setAiResult(data);
    } catch (err) {
      alert('AI Predictor Error: ' + err.message);
    }
  };

  return (
    <div>
      <div className="banner-restricted">RESTRICTED // OFFICIAL USE ONLY - NIGERIA CUSTOMS SERVICE INTELLIGENCE FUSION SUITE (REACT)</div>

      <header className="app-header">
        <div className="header-brand">
          <div className="ncs-logo">NCS</div>
          <div>
            <h1>CUSTOMS INTELLIGENCE MANAGEMENT & FUSION SUITE</h1>
            <div className="subtitle">Customs Intelligence Unit (CIU) | ICT-Modernization Department</div>
          </div>
        </div>
        <div className="user-status-bar">
          {currentUser ? (
            <span>
              Officer: <strong>{currentUser.full_name}</strong> ({currentUser.role}) <span className="badge-clearance">Clearance Level {currentUser.clearance_level}</span>
            </span>
          ) : (
            <span>Mode: Restricted Guest View</span>
          )}
          {!currentUser ? (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowLoginModal(true)}>Login</button>
          ) : (
            <button className="btn btn-outline btn-sm" onClick={() => {
              setCurrentUser(null);
              setAuthToken(null);
              localStorage.removeItem('ncs_token');
              localStorage.removeItem('ncs_user');
            }}>Logout</button>
          )}
        </div>
      </header>

      <div className="app-container">
        <nav className="sidebar">
          <div className="nav-section-title">PORTAL MODULES</div>
          {[
            { id: 'fusion', label: '1. Fusion Centre' },
            { id: 'entities', label: '2. Trader & Entity Profiling' },
            { id: 'cargo', label: '3. Cargo Risk Profiling' },
            { id: 'reports', label: '4. Field Intelligence' },
            { id: 'geospatial', label: '5. Geospatial Intelligence' },
            { id: 'cases', label: '6. Case Management' },
            { id: 'cyber', label: '7. Cyber-Intelligence' },
            { id: 'interagency', label: '8. Inter-Agency Portal' },
            { id: 'kpi', label: '9. KPI & Rankings' },
            { id: 'ai', label: '10. AI Prediction Engine' }
          ].map(mod => (
            <a
              key={mod.id}
              href="#"
              className={`nav-link ${activeModule === mod.id ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveModule(mod.id); }}
            >
              {mod.label}
            </a>
          ))}
        </nav>

        <main className="main-content">
          {/* MODULE 1: FUSION CENTRE */}
          {activeModule === 'fusion' && (
            <div>
              <h2 style={{ marginBottom: '16px', color: 'var(--ncs-dark-green)' }}>MODULE 1: INTELLIGENCE FUSION CENTRE DASHBOARD</h2>
              {fusionData && (
                <div>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="title">Total Field Reports</div>
                      <div className="value">{fusionData.metrics.total_reports}</div>
                    </div>
                    <div className="metric-card warning">
                      <div className="title">Pending Approval</div>
                      <div className="value">{fusionData.metrics.pending_reports}</div>
                    </div>
                    <div className="metric-card">
                      <div className="title">Active Cases</div>
                      <div className="value">{fusionData.metrics.active_cases}</div>
                    </div>
                    <div className="metric-card danger">
                      <div className="title">Watchlist Entities</div>
                      <div className="value">{fusionData.metrics.watchlist_count}</div>
                    </div>
                    <div className="metric-card danger">
                      <div className="title">High-Risk Cargo</div>
                      <div className="value">{fusionData.metrics.high_risk_cargo}</div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <div className="card-title">Recent Priority Intelligence Alerts</div>
                    </div>
                    <div className="table-responsive">
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
                          {fusionData.recent_alerts.map(r => (
                            <tr key={r.id}>
                              <td><strong>{r.report_number}</strong></td>
                              <td>{r.title}</td>
                              <td>{r.category}</td>
                              <td>{r.command}</td>
                              <td><span className="badge badge-yellow">{r.classification}</span></td>
                              <td><span className={`badge ${r.status === 'Approved' ? 'badge-green' : 'badge-yellow'}`}>{r.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODULE 2: TRADER & ENTITY PROFILING */}
          {activeModule === 'entities' && (
            <div>
              <h2>MODULE 2: SUSPECT TRADER & COMPANY PROFILING</h2>
              <div className="card" style={{ marginTop: '16px' }}>
                <div className="card-title" style={{ marginBottom: '12px' }}>National Entity Watchlist & Link Database</div>
                <div className="table-responsive">
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
                      </tr>
                    </thead>
                    <tbody>
                      {entitiesData.map(e => (
                        <tr key={e.id}>
                          <td><strong>{e.entity_code}</strong></td>
                          <td>{e.name}</td>
                          <td>{e.type}</td>
                          <td>{e.tin_rc || 'N/A'}</td>
                          <td>{e.phone || 'N/A'}</td>
                          <td><span className={`badge ${e.risk_score >= 80 ? 'badge-red' : 'badge-yellow'}`}>{e.risk_score} / 100</span></td>
                          <td><span className={`badge ${e.watchlist_status === 'Active' ? 'badge-red' : 'badge-green'}`}>{e.watchlist_status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 3: CARGO RISK PROFILING */}
          {activeModule === 'cargo' && (
            <div>
              <h2>MODULE 3: CARGO PROFILING & SELECTIVITY INTELLIGENCE</h2>
              <div className="card" style={{ marginTop: '16px' }}>
                <div className="card-title" style={{ marginBottom: '12px' }}>Targeted Consignments & Selectivity Recommendations</div>
                <div className="table-responsive">
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
                      {cargoData.map(c => (
                        <tr key={c.id}>
                          <td><strong>{c.paar_number}</strong></td>
                          <td>{c.sgd_number}</td>
                          <td>{c.container_number}</td>
                          <td>{c.importer_name}</td>
                          <td>{c.commodity} ({c.hs_code})</td>
                          <td><strong>{c.risk_score}</strong></td>
                          <td><span className={`badge ${c.selectivity_lane === 'Red' ? 'badge-red' : 'badge-green'}`}>{c.selectivity_lane} Lane</span></td>
                          <td>{c.hold_recommended ? <span className="badge badge-red">100% Physical Exam</span> : <span className="badge badge-green">Standard Clearance</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 4: FIELD INTELLIGENCE */}
          {activeModule === 'reports' && (
            <div>
              <div className="card">
                <div className="card-title">MODULE 4: SUBMIT FIELD INTELLIGENCE REPORT</div>
                <form onSubmit={handleReportSubmit} style={{ marginTop: '16px' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Report Title</label>
                      <input type="text" className="form-control" required value={rptTitle} onChange={e => setRptTitle(e.target.value)} placeholder="e.g. False Value Declaration" />
                    </div>
                    <div className="form-group">
                      <label>Report Category</label>
                      <select className="form-control" value={rptCategory} onChange={e => setRptCategory(e.target.value)}>
                        <option>Anti-Smuggling</option>
                        <option>Revenue Leakage</option>
                        <option>Trade Fraud</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Area Command</label>
                      <input type="text" className="form-control" required value={rptCommand} onChange={e => setRptCommand(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Location / Terminal</label>
                      <input type="text" className="form-control" required value={rptLocation} onChange={e => setRptLocation(e.target.value)} placeholder="e.g. Wharf Gate 3" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Intelligence Details</label>
                    <textarea className="form-control" rows="3" required value={rptDetails} onChange={e => setRptDetails(e.target.value)}></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">Submit Intelligence Report</button>
                </form>
              </div>

              <div className="card">
                <div className="card-title">National Intelligence Submissions Queue</div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Report #</th>
                        <th>Title</th>
                        <th>Submitter</th>
                        <th>Command</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportsData.map(r => (
                        <tr key={r.id}>
                          <td><strong>{r.report_number}</strong></td>
                          <td>{r.title}</td>
                          <td>{r.submitter_name}</td>
                          <td>{r.command}</td>
                          <td><span className={`badge ${r.status === 'Approved' ? 'badge-green' : 'badge-yellow'}`}>{r.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 5: GEOSPATIAL INTELLIGENCE */}
          {activeModule === 'geospatial' && (
            <div>
              <h2>MODULE 5: SMUGGLING ROUTE & GEOSPATIAL INTELLIGENCE PORTAL</h2>
              <div className="card" style={{ backgroundColor: '#0f172a', color: 'white', marginTop: '16px' }}>
                <div className="card-title" style={{ color: 'var(--ncs-gold)' }}>NATIONAL GIS MAP VISUALIZER (REACT)</div>
                <div style={{ height: '180px', border: '2px dashed #334155', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginTop: '12px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ncs-gold)' }}>[ Interactive GIS Map Rendering Engine ]</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px' }}>Mapping Active Border Corridors & Seizure Hotspots</div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Identified Vulnerable Border Routes</div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Route Name</th>
                        <th>Origin</th>
                        <th>Destination</th>
                        <th>Risk Level</th>
                        <th>Seizures</th>
                      </tr>
                    </thead>
                    <tbody>
                      {geospatialData.map(rt => (
                        <tr key={rt.id}>
                          <td><strong>{rt.route_name}</strong></td>
                          <td>{rt.origin_location}</td>
                          <td>{rt.destination_location}</td>
                          <td><span className={`badge ${rt.risk_level === 'Critical' ? 'badge-red' : 'badge-yellow'}`}>{rt.risk_level}</span></td>
                          <td><strong>{rt.seizure_count} Seizures</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 6: CASE MANAGEMENT */}
          {activeModule === 'cases' && (
            <div>
              <h2>MODULE 6: INVESTIGATION & CASE MANAGEMENT PORTAL</h2>
              <div className="card" style={{ marginTop: '16px' }}>
                <div className="card-title">Active Investigation Files</div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Case #</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Assigned Officer</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {casesData.map(cs => (
                        <tr key={cs.id}>
                          <td><strong>{cs.case_number}</strong></td>
                          <td>{cs.title}</td>
                          <td>{cs.category}</td>
                          <td>{cs.assigned_officer_name || 'Unassigned'}</td>
                          <td><span className="badge badge-yellow">{cs.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 7: CYBER-INTELLIGENCE */}
          {activeModule === 'cyber' && (
            <div>
              <h2>MODULE 7: CYBER-INTELLIGENCE & DIGITAL THREAT PORTAL</h2>
              <div className="card" style={{ marginTop: '16px' }}>
                <div className="card-title">Digital Threat Indicators Register</div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Indicator Value</th>
                        <th>Category</th>
                        <th>Validation Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cyberData.map(cy => (
                        <tr key={cy.id}>
                          <td><strong>{cy.indicator_code}</strong></td>
                          <td>{cy.indicator_type}</td>
                          <td><code>{cy.indicator_value}</code></td>
                          <td>{cy.threat_category}</td>
                          <td><span className="badge badge-yellow">{cy.validation_status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 8: INTER-AGENCY PORTAL */}
          {activeModule === 'interagency' && (
            <div>
              <h2>MODULE 8: INTER-AGENCY COLLABORATION PORTAL</h2>
              <div className="card" style={{ marginTop: '16px' }}>
                <div className="card-title">Active Request Log</div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Target Agency</th>
                        <th>Subject</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interagencyData.map(rq => (
                        <tr key={rq.id}>
                          <td><strong>{rq.request_code}</strong></td>
                          <td>{rq.target_agency}</td>
                          <td>{rq.subject}</td>
                          <td><span className="badge badge-yellow">{rq.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 9: KPI RANKINGS */}
          {activeModule === 'kpi' && (
            <div>
              <h2>MODULE 9: KPI & COMMAND RANKINGS PORTAL</h2>
              <div className="card" style={{ marginTop: '16px' }}>
                <div className="card-title">Command Productivity Leaderboard</div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Command</th>
                        <th>Total Reports</th>
                        <th>Approved Reports</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kpiData.map(rk => (
                        <tr key={rk.command}>
                          <td><strong>#{rk.rank}</strong></td>
                          <td>{rk.command}</td>
                          <td>{rk.total_reports}</td>
                          <td>{rk.approved_reports}</td>
                          <td><span className="badge badge-green">{rk.productivity_score} / 100</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 10: AI PREDICTION ENGINE */}
          {activeModule === 'ai' && (
            <div>
              <h2>MODULE 10: AI-POWERED INTELLIGENCE PREDICTION PORTAL</h2>
              <div className="card" style={{ marginTop: '16px' }}>
                <div className="card-title">AI Predictive Consignment Risk Scoring Engine</div>
                <form onSubmit={handleRunAiPredictor} style={{ marginTop: '12px' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Importer Name</label>
                      <input type="text" className="form-control" value={aiImporter} onChange={e => setAiImporter(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Country of Origin</label>
                      <select className="form-control" value={aiOrigin} onChange={e => setAiOrigin(e.target.value)}>
                        <option>China</option>
                        <option>Turkey</option>
                        <option>India</option>
                        <option>Germany</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>HS Code</label>
                      <input type="text" className="form-control" value={aiHs} onChange={e => setAiHs(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Declared Value (NGN)</label>
                      <input type="number" className="form-control" value={aiValue} onChange={e => setAiVal(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Run Predictive Risk Analytics</button>
                </form>

                {aiResult && (
                  <div style={{ marginTop: '20px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '6px' }}>
                    <h4>AI Analytics Evaluation:</h4>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ncs-red)', margin: '8px 0' }}>
                      Score: {aiResult.predicted_risk_score} / 100 ({aiResult.risk_category})
                    </div>
                    <div><strong>Recommendation:</strong> <span className="badge badge-red">{aiResult.recommendation}</span></div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>NCS CIU Secure Authentication</h3>
              <button className="close-modal" onClick={() => setShowLoginModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label>Username / Service ID</label>
                  <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                {mfaRequired && (
                  <div className="form-group">
                    <label>MFA Code</label>
                    <input type="text" className="form-control" value={mfaCode} onChange={e => setMfaCode(e.target.value)} placeholder="Enter MFA (Dev: 123456)" required />
                  </div>
                )}
                {loginError && <div className="error-alert">{loginError}</div>}
                <button type="submit" className="btn btn-primary btn-block">Authenticate</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
