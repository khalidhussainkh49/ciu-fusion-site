# NIGERIA CUSTOMS SERVICE | CUSTOMS INTELLIGENCE MANAGEMENT AND FUSION SUITE

**Restricted / Official Use Only**

## BUSINESS REQUIREMENTS DOCUMENT

**For:** Customs Intelligence Unit, Nigeria Customs Service
**Document Type:** Business Requirements Document
**Classification:** Restricted / Official Use Only
**Version:** 1.0
**Prepared For:** Customs Intelligence Unit, Nigeria Customs Service
**Prepared By:** ICT–Modernization Department
**Date:** 17 June 2026

---

## Table of Contents
1. Executive Summary
2. Background
3. Vision Statement
4. Objectives
5. Scope
6. Key Stakeholders
7. Existing Applications to Be Accommodated
8. Proposed Application Categories
9. High-Level System Concept
10. Core Functional Requirements
11. Portal Modules
12. Workflows
13. Process Flow
14. Activity Diagrams
15. Proposed Mockups
16. Pictorial Mockups
17. Data Requirements
18. Non-Functional Requirements
19. Use Case Notation
20. Principal Actors and Responsibilities
21. User Roles
22. Recommended Implementation Phases
23. Key Risks and Mitigation
24. Success Criteria
25. Conclusion

---

## Approval Page
This page records formal business, technical, security and executive approval for the Customs Intelligence Management and Fusion Suite.

| Document Attribute | Description |
| :--- | :--- |
| **Document Title** | Customs Intelligence Management and Fusion Suite BRD |
| **Prepared For** | Customs Intelligence Unit, Nigeria Customs Service |
| **Prepared By** | ICT–Modernization Department |
| **Document Type** | Business Requirements Document |
| **Classification** | Restricted / Official Use Only |
| **Version** | 1.0 |
| **Project Sponsor** | [Insert Name/Office] |
| **Business Owner** | Customs Intelligence Unit |
| **Technical Owner** | ICT–Modernization Department |
| **Security Owner** | Cybersecurity Unit |
| **Implementation Partner** | [Insert where applicable] |

### Approvals Sign-off
| S/N | Name | Designation | Role | Signature | Date |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | Comptroller-General of Customs | Executive Sponsor | Executive Sponsor | | |
| 2 | DCG ICT–Modernization | Technical Sponsor | Technical Sponsor | | |
| 3 | DCG Enforcement/Investigation/Inspection | Business Sponsor | Business Sponsor | | |
| 4 | ACG ICT–Modernization | Technical Oversight | Technical Oversight | | |
| 5 | Head, Customs Intelligence Unit | Business Owner | Business Owner | | |
| 6 | Head, Cybersecurity Unit | Security Oversight | Security Oversight | | |
| 7 | Project Manager | Project Coordination | Project Coordination | | |

---

## Document Control

### Document History
| Version | Date | Author | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| 0.1 | ICT–Modernization | Initial BRD draft | Draft |
| 0.2 | CIU / ICT Review Team | Business review updates | Draft |
| 0.3 | Cybersecurity Unit | Security and access control inputs | Draft |
| 1.0 | Project Steering Committee | Approved version | Approved |

### Distribution List
| S/N | Recipient | Office/Unit | Purpose |
| :-: | :--- | :--- | :--- |
| 1 | Comptroller-General of Customs | NCS Headquarters | Executive approval |
| 2 | DCG ICT–Modernization | ICT–Modernization | Technical supervision |
| 3 | DCG Enforcement/Investigation/Inspection | Enforcement Directorate | Business alignment |
| 4 | ACG ICT–Modernization | ICT–Modernization | Implementation oversight |
| 5 | Comptroller CIU | Customs Intelligence Unit | Business ownership |
| 6 | Head, Cybersecurity Unit | ICT–Modernization | Security governance |
| 7 | Project Manager | ICT–Modernization | Project delivery |
| 8 | Relevant Area Commands | NCS Commands | Operational input |

---

## Acronyms and Definitions
| Acronym | Meaning |
| :--- | :--- |
| **BRD** | Business Requirements Document |
| **CIU** | Customs Intelligence Unit |
| **NCS** | Nigeria Customs Service |
| **ICT-MOD** | Information and Communication Technology–Modernization |
| **PAAR** | Pre-Arrival Assessment Report |
| **SGD** | Single Goods Declaration |
| **UCMS** | Unified Customs Management System |
| **SIGMAT** | Interconnected System for the Management of Goods in Transit |
| **SIEM** | Security Information and Event Management |
| **SOC** | Security Operations Centre |
| **GIS** | Geographic Information System |
| **NII** | Non-Intrusive Inspection |
| **RBAC** | Role-Based Access Control |
| **MFA** | Multi-Factor Authentication |
| **KPI** | Key Performance Indicator |
| **AI** | Artificial Intelligence |
| **ML** | Machine Learning |
| **API** | Application Programming Interface |
| **OSINT** | Open-Source Intelligence |

---

## 1. Executive Summary
The Nigeria Customs Service requires a modern, secure and intelligence-led digital platform to support the Customs Intelligence Unit in intelligence collection, analysis, case management, operational coordination, cargo profiling, geospatial monitoring, cyber-intelligence, inter-agency collaboration and executive decision-making.

The proposed solution, known as the **Customs Intelligence Management and Fusion Suite**, will consolidate ten major intelligence applications into a single enterprise platform. The system will provide a unified operational picture of persons, companies, cargo, containers, routes, vessels, border movements, cyber threats, intelligence reports, cases, seizures, investigations, enforcement actions and command-level performance.

The platform will improve revenue protection, anti-smuggling operations, cargo risk profiling, border intelligence, investigation management, intelligence dissemination, inter-agency coordination, cyber-enabled fraud detection, executive visibility, institutional memory and data-driven decision-making.

The suite shall be hosted securely within the NCS-approved infrastructure environment, integrated with existing Customs applications, and designed with strong access control, audit logging, encryption, data classification, workflow approvals and intelligence handling restrictions.

### Integrated Applications & Business Purpose
| Integrated Application | Business Purpose |
| :--- | :--- |
| **Intelligence Fusion Centre Portal** | Central operational intelligence dashboard and briefing environment |
| **Suspect Trader and Company Profiling Portal** | Profiles persons, companies, agents, importers, exporters and syndicates |
| **Cargo Profiling and Selectivity Intelligence Portal** | Supports cargo targeting and risk-based examination |
| **Field Intelligence Reporting Portal** | Standardizes national field intelligence reporting |
| **Smuggling Route and Geospatial Intelligence Portal** | Maps routes, hotspots, seizures and vulnerable border points |
| **Investigation and Case Management Portal** | Digitizes investigation lifecycle and evidence handling |
| **Cyber-Intelligence and Digital Threat Portal** | Links cyber threats to Customs operational intelligence |
| **Inter-Agency Intelligence Collaboration Portal** | Supports controlled intelligence sharing with approved agencies |
| **KPI and Command Ranking Portal** | Measures CIU performance, impact and command productivity |
| **AI-Powered Customs Intelligence Prediction Portal** | Supports predictive risk scoring, anomaly detection and automated brief generation |

---

## 2. Background
The Customs Intelligence Unit plays a critical role in supporting enforcement, revenue protection, trade security, border management, anti-smuggling operations and national economic security responsibilities of the Nigeria Customs Service.

Current intelligence operations may be affected by fragmented reporting channels, manual records, inconsistent case tracking, limited integration with core Customs systems, weak institutional memory and limited analytical capability for predictive risk assessment.

Intelligence information may currently exist in paper reports, emails, messaging applications, spreadsheets, separate ICT systems, field observations, command-level files, seizure records, cyber alerts and external agency correspondence. This creates delays, duplication, weak accountability and incomplete national visibility.

The proposed suite will modernize CIU operations by establishing a central platform for intelligence collection, validation, analysis, profiling, dissemination, investigation, collaboration, monitoring and reporting.

---

## 3. Vision Statement
To establish a secure, intelligent, data-driven and nationally integrated Customs Intelligence Management and Fusion Suite that enables the Customs Intelligence Unit to collect, analyse, act on and disseminate actionable intelligence for revenue protection, border security, anti-smuggling operations, compliance enforcement and national economic security.

---

## 4. Objectives
* Provide a centralized platform for intelligence collection, processing, analysis, dissemination and archiving.
* Digitize field intelligence reporting across commands, border stations, seaports, airports, terminals and patrol areas.
* Develop a national database of suspect persons, companies, importers, exporters, agents, transporters, vessels, containers, warehouses and other entities of intelligence interest.
* Support cargo profiling and selectivity through integration with PAAR, Form M, SGD, manifest, B’Odogwu/UCMS, SIGMAT, scanner/NII systems and other Customs platforms.
* Improve investigation and case management from intelligence initiation to case closure.
* Enable geospatial mapping of smuggling routes, illegal crossing points, border vulnerabilities, seizure hotspots and patrol intelligence.
* Integrate cyber-intelligence for fake Customs platforms, leaked credentials, phishing attempts, online syndicates and cyber-enabled revenue fraud.
* Strengthen inter-agency collaboration through controlled and auditable intelligence exchange.
* Provide executive dashboards, command ranking, KPI reporting and intelligence performance measurement.
* Use AI and analytics for anomaly detection, predictive risk scoring, pattern recognition and automated intelligence brief generation.

---

## 5. Scope

### 5.1 In-Scope
* User authentication and role-based access control
* National intelligence fusion dashboard
* Field intelligence reporting and approval workflow
* Entity profiling and watchlist management
* Cargo profiling and selectivity intelligence
* Geospatial intelligence and smuggling route mapping
* Investigation and case management
* Cyber-intelligence and digital threat management
* Inter-agency collaboration and intelligence requests
* KPI dashboards and command ranking
* AI-based risk prediction and anomaly detection
* Report generation, notifications, audit logs and administration console

### 5.2 Out-of-Scope
* Replacement of B’Odogwu/UCMS, PAAR, SIGMAT or scanner systems
* Uncontrolled public-facing complaint portal
* Unapproved external agency access
* Full prosecution case management outside Customs authority
* Unapproved surveillance or monitoring activities outside lawful Customs intelligence mandate

### 5.3 Future Scope
* Mobile field application for CIU officers
* Offline reporting mode for border areas with poor connectivity
* Advanced image analysis of concealment patterns
* Voice-to-text intelligence capture
* Expanded integration with authorized government databases
* Advanced AI-driven syndicate detection

---

## 6. Key Stakeholders
| Stakeholder | Role / Interest |
| :--- | :--- |
| **Comptroller-General of Customs** | Executive sponsorship and strategic direction |
| **DCG ICT–Modernization** | Technology sponsorship and implementation oversight |
| **DCG Enforcement/Investigation/Inspection** | Operational ownership and enforcement alignment |
| **ACG ICT–Modernization** | Technical supervision |
| **Customs Intelligence Unit** | Primary business owner and end user |
| **Cybersecurity Unit** | Cyber threat intelligence, platform security, monitoring and access control |
| **Risk Management Unit** | Cargo risk indicators and selectivity support |
| **Enforcement Units** | Operational response to actionable intelligence |
| **Area Commands** | Field intelligence generation and implementation |
| **Valuation Unit** | Undervaluation intelligence support |
| **Tariff and Trade Unit** | HS code, classification and trade compliance intelligence |
| **Legal Unit** | Evidence handling and prosecution support |
| **ICT Software Unit** | Development, integration and support |
| **ICT Infrastructure Unit** | Hosting, server, network and availability support |
| **SOC/SIEM Team** | Security monitoring and incident correlation |
| **Inter-Agency Partners** | Controlled intelligence collaboration |

---

## 7. Existing Applications to Be Accommodated
| Application / Data Source | Purpose of Integration |
| :--- | :--- |
| **B’Odogwu / UCMS** | Declaration, cargo, trader, release and enforcement data |
| **PAAR System** | Pre-arrival risk and valuation intelligence |
| **Form M** | Import documentation and trade records |
| **SGD** | Declaration and assessment data |
| **Manifest System** | Vessel, cargo, container and shipping details |
| **SIGMAT** | Transit goods monitoring and cross-border intelligence |
| **e-CDF** | Currency declaration intelligence |
| **AEO Platform** | Trusted trader and compliance records |
| **Advance Ruling System** | Classification and origin decision intelligence |
| **TRS** | Time release and cargo movement analysis |
| **Scanner/NII Systems** | Container inspection and concealment intelligence |
| **SIEM/SOC Tools** | Cybersecurity alerts, suspicious logins and credential compromise |
| **HR/User Management System** | Officer identity, command posting and role validation |
| **MIS Portal** | Internal user and command information |
| **Email/SMS Gateway** | Notifications and alerts |
| **GIS/Map Services** | Geospatial mapping and hotspot visualization |
| **External Agency Systems** | Controlled information exchange where approved |

---

## 8. Proposed Application Categories
| Category | Description | Modules Covered |
| :--- | :--- | :--- |
| **Intelligence Operations** | Collection, validation, analysis and dissemination of intelligence | Fusion Centre, Field Reporting, Dissemination |
| **Entity Intelligence** | Profiling of persons, companies, agents and syndicates | Trader/Company Profiling |
| **Cargo Intelligence** | Risk profiling of consignments, containers, declarations and selectivity indicators | Cargo Profiling and Selectivity |
| **Border Intelligence** | Smuggling route monitoring, hotspot mapping and patrol intelligence | Geospatial Intelligence |
| **Investigation Management** | Case files, evidence, workflow, tasks and closure reports | Case Management |
| **Cyber-Intelligence** | Digital threat intelligence, fake platforms, leaked credentials and online fraud | Cyber-Intelligence Portal |
| **Collaboration** | Inter-agency sharing and joint operation coordination | Inter-Agency Portal |
| **Performance Management** | KPIs, command ranking, officer productivity and reporting | KPI Dashboard |
| **Predictive Intelligence** | AI/ML risk prediction, anomaly detection and pattern recognition | AI Prediction Engine |
| **Administration and Security** | User management, audit trail, access control and governance | Admin Console |

---

## 9. High-Level System Concept
The system shall function as a centralized, secure intelligence-fusion platform where CIU officers and approved stakeholders can submit, analyse, enrich, approve, disseminate, investigate and report intelligence. It will operate across data collection, integration, intelligence processing, operational action and management reporting layers.

### 9.1 Operational Layers
| Layer | Purpose |
| :--- | :--- |
| **Data Collection Layer** | Captures field reports, cargo alerts, cyber alerts, agency inputs, GIS records and case files |
| **Integration Layer** | Connects Customs systems, external agency systems, GIS services and SOC/SIEM tools |
| **Intelligence Processing Layer** | Handles validation, enrichment, risk scoring, entity linking and pattern detection |
| **Operational Action Layer** | Issues alerts, referrals, hold recommendations, tasks and investigation actions |
| **Management and Reporting Layer** | Provides dashboards, KPIs, command rankings and executive briefs |

---

## 10. Core Functional Requirements
| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-001** | User Authentication | Authenticate users using approved NCS credentials and enforce secure login. | High |
| **FR-002** | Multi-Factor Authentication | Enforce MFA for privileged users and sensitive intelligence modules. | High |
| **FR-003** | Role-Based Access Control | Restrict access based on role, command, clearance and need-to-know. | High |
| **FR-004** | Intelligence Classification | Classify intelligence as Restricted, Confidential, Secret or Need-to-Know. | High |
| **FR-005** | Audit Logging | Log login, view, edit, approve, download, export, delete and share actions. | High |
| **FR-006** | Dashboard Personalization | Provide dashboards based on user role and operational responsibility. | High |
| **FR-007** | Advanced Search | Search by company, person, TIN, RC number, container, vessel, HS code, route, case number and report ID. | High |
| **FR-008** | Document Upload | Support upload of documents, images, videos, scanned evidence and intelligence attachments. | High |
| **FR-009** | Intelligence Validation | Allow supervisors and HQ analysts to validate submitted intelligence. | High |
| **FR-010** | Intelligence Enrichment | Link reports with cargo, entity, route, case and cyber records. | High |
| **FR-011** | Controlled Dissemination | Disseminate approved intelligence based on classification and authorization. | High |
| **FR-012** | Entity Profile Creation | Create profiles for persons, companies, agents, importers, exporters, transporters and syndicates. | High |
| **FR-013** | Entity Linkage | Link entities through phone numbers, email, addresses, directors, agents, cargo and cases. | High |
| **FR-014** | Risk Scoring | Assign risk scores to entities, cargo, routes and cases. | High |
| **FR-015** | Watchlist Management | Create, review, approve, suspend and remove watchlist entries. | High |
| **FR-016** | Cargo Risk Profile | Display PAAR, Form M, SGD, manifest, container, vessel, route and commodity risk details. | High |
| **FR-017** | Risk Indicator Engine | Trigger risk indicators based on defined business rules. | High |
| **FR-018** | Selectivity Recommendation | Recommend intelligence hold, examination focus, red lane referral or post-clearance review. | High |
| **FR-019** | Field Report Submission | Allow officers to submit structured intelligence reports. | High |
| **FR-020** | Source Grading | Capture source reliability, information credibility and confidence level. | High |
| **FR-021** | Geospatial Mapping | Display smuggling routes, hotspots, seizures and patrol coverage on GIS maps. | High |
| **FR-022** | Case Creation | Convert approved intelligence into investigation cases. | High |
| **FR-023** | Evidence Register | Maintain digital evidence register and chain-of-custody records. | High |
| **FR-024** | Task Management | Assign investigation tasks, deadlines, reminders and escalations. | High |
| **FR-025** | Cyber Alert Intake | Capture fake websites, fake auction portals, phishing emails, leaked credentials and impersonation attempts. | High |
| **FR-026** | Cyber Indicator Validation | Route cyber-related intelligence to Cybersecurity Unit for technical validation. | High |
| **FR-027** | Agency Intelligence Requests | Create, approve, route and respond to inter-agency requests for intelligence. | Medium |
| **FR-028** | KPI Dashboard | Show intelligence reports, cases, seizures, revenue impact and command ranking. | High |
| **FR-029** | AI Risk Prediction | Predict high-risk entities, cargo, routes and transactions. | Medium |
| **FR-030** | Automated Brief Generation | Generate draft intelligence briefs for analyst review. | Medium |

---

## 11. Portal Modules

### 11.1 Intelligence Fusion Centre Portal
Provides the central national intelligence picture, active alerts, active cases, high-risk cargo, high-risk entities, cyber alerts, geospatial threats and management briefing tools.
* National intelligence dashboard
* Command-specific dashboards
* Active alerts and cases
* High-risk cargo and watchlist hits
* Daily, weekly and monthly intelligence briefs
* Approval and dissemination queues

### 11.2 Suspect Trader and Company Profiling Portal
Maintains detailed profiles of persons, companies, agents, importers, exporters, transporters, warehouses, vessels and syndicates.
* Company and person profiles
* Director and associate mapping
* Phone, email and address reuse detection
* Risk scoring and watchlist status
* Linked cases, cargo, seizures and intelligence notes

### 11.3 Cargo Profiling and Selectivity Intelligence Portal
Supports intelligence-driven cargo targeting, cargo hold recommendations, examination guidance and selectivity enhancement.
* Cargo profile view
* Container and vessel watchlists
* PAAR/Form M/SGD/manifest comparison
* HS code, route and value anomaly flags
* Examination intelligence note
* Red lane and post-clearance review recommendations

### 11.4 Field Intelligence Reporting Portal
Enables officers at commands, borders, patrol bases, airports and seaports to submit structured intelligence reports.
* Field report form
* Source grading
* Geo-tagged location capture
* Attachment upload
* Supervisor review and HQ escalation
* Sensitive source protection

### 11.5 Smuggling Route and Geospatial Intelligence Portal
Maps smuggling routes, illegal crossing points, border vulnerabilities, seizure locations and operational hotspots.
* Interactive GIS map
* Hotspot heatmap
* Route classification
* Commodity-specific route analysis
* Patrol coverage and command jurisdiction layer

### 11.6 Investigation and Case Management Portal
Manages CIU investigation cases from intelligence initiation to closure.
* Case creation and assignment
* Evidence register and chain of custody
* Investigation tasks and deadlines
* Case notes and linked entities
* Legal referral and closure report

### 11.7 Cyber-Intelligence and Digital Threat Portal
Integrates cyber threat intelligence into CIU operations.
* Fake Customs website record
* Phishing and leaked credential alerts
* Digital indicator management
* Digital evidence upload
* Joint CIU-Cybersecurity workflow

### 11.8 Inter-Agency Intelligence Collaboration Portal
Provides controlled and auditable collaboration with approved government agencies.
* Agency user access
* Request for intelligence workflow
* Joint operation record
* Controlled document sharing
* Agency communication log

### 11.9 Intelligence KPI and Command Ranking Portal
Measures CIU productivity, quality, impact and command-level performance.
* Command ranking
* Officer productivity
* Reports leading to seizures
* Revenue recovery impact
* Monthly report generator

### 11.10 AI-Powered Customs Intelligence Prediction Portal
Uses analytics and AI to support risk prediction, anomaly detection and intelligence automation.
* Predictive risk scoring
* Anomaly detection
* Syndicate pattern detection
* Natural language intelligence search
* Automated brief drafting

---

## 12. Workflows

### 12.1 Field Intelligence Reporting Workflow
1. Officer logs into the portal
2. Officer selects Submit Intelligence Report
3. Officer completes structured report form
4. Officer assigns category and classification
5. Officer uploads supporting evidence
6. Report is submitted to command supervisor
7. Supervisor approves, rejects, returns or escalates
8. HQ analyst validates and enriches report
9. Report becomes alert, case, watchlist entry or cargo risk note
10. Approved intelligence is disseminated and outcome recorded

### 12.2 Cargo Profiling Workflow
1. System receives cargo/declaration data
2. Risk indicator engine evaluates cargo
3. Suspicious cargo is flagged
4. CIU analyst reviews cargo profile
5. Analyst links cargo to intelligence records
6. Supervisor approves action
7. System issues examination note or alert
8. Operational outcome is recorded

### 12.3 Entity Watchlist Workflow
1. Officer identifies suspicious entity
2. Officer creates or updates entity profile
3. Officer recommends watchlist inclusion
4. Supervisor reviews recommendation
5. HQ CIU approves or rejects
6. Approved entity is added to watchlist
7. System triggers alerts on future activity
8. Watchlist is periodically reviewed

### 12.4 Investigation Case Workflow
1. Intelligence report is reviewed
2. Supervisor converts report to case
3. Case number is generated
4. Case is assigned to officer
5. Evidence and documents are collected
6. Tasks are assigned and monitored
7. Case is referred where required
8. Outcome is recorded
9. Closure report is submitted
10. Case is closed or archived

### 12.5 Cyber-Intelligence Workflow
1. Cyber-related threat is recorded
2. Threat is categorized and indicators captured
3. Cybersecurity validates technical indicators
4. CIU assesses operational impact
5. Joint intelligence note is prepared
6. Alert is disseminated
7. Mitigation outcome is recorded

### 12.6 Inter-Agency Collaboration Workflow
1. Authorized user creates request
2. Request is reviewed and approved
3. Request is routed to relevant agency
4. Agency responds through portal
5. CIU reviews response
6. Joint action may be created
7. Outcome and audit trail are preserved

---

## 13. Process Flow
* **Overall Intelligence Lifecycle Process Flow:** Collection -> Validation & Enrichment -> Analysis & Profiling -> Action & Dissemination -> Outcome & Archiving.
* **Cargo Profiling and Selectivity Process Flow:** Data Ingestion -> Risk Engine Evaluation -> Analyst Review -> Dissemination / Hold Recommendation -> Enforcement Action & Outcome Feedback.
* **Investigation and Case Management Process Flow:** Case Initiation -> Task & Evidence Register -> Investigation & Findings -> Referral / Prosecution -> Closure & Archiving.

---

## 14. Activity Diagrams

### 14.1 Activity Diagram: Field Intelligence Submission
| Step | Activity | Responsible Actor | Output |
| :-: | :--- | :--- | :--- |
| 1 | Log into portal | CIU Field Officer | Authenticated session |
| 2 | Complete report form | CIU Field Officer | Draft intelligence report |
| 3 | Attach evidence and classify report | CIU Field Officer | Complete submission |
| 4 | Review report | CIU Supervisor | Approved, returned or escalated report |
| 5 | Validate and enrich | CIU Analyst | Validated intelligence |
| 6 | Disseminate / create case / watchlist | CIU Supervisor / HQ | Operational action |

### 14.2 Activity Diagram: Watchlist Creation
| Step | Activity | Responsible Actor | Output |
| :-: | :--- | :--- | :--- |
| 1 | Identify suspicious entity | CIU Officer | Entity recommendation |
| 2 | Create or update entity profile | CIU Analyst | Updated profile |
| 3 | Recommend watchlist inclusion | CIU Analyst / Supervisor | Watchlist request |
| 4 | Review and approve | HQ CIU | Approved watchlist entry |
| 5 | Enable automated alerts | System | Watchlist monitoring active |

---

## 15. Proposed Mockups

### 15.1 Login Page Mockup
```text
+------------------------------------------------------+
| NIGERIA CUSTOMS SERVICE                              |
| CUSTOMS INTELLIGENCE MANAGEMENT SUITE                |
+------------------------------------------------------+
| Username: [____________________________]             |
| Password: [____________________________]             |
| MFA Code: [____________________________]             |
|                                                      |
| [ Login ]                                            |
| Classification: Restricted / Official Use Only       |
+------------------------------------------------------+
```

### 15.2 Intelligence Report Form Mockup
```text
+--------------------------------------------------------------+
| Submit Intelligence Report                                   |
+--------------------------------------------------------------+
| Report Category: [Dropdown] Command/Location: [Dropdown]     |
| Source Reliability: [A/B/C/D/E]                              |
| Information Credibility: [1/2/3/4/5]                         |
| Classification: [Restricted/Confidential/Secret]             |
| Subject/Entity: [Text] Commodity: [Text]                     |
| Route/Location: [Text/GIS]                                   |
| Intelligence Details: [Large Text Box]                       |
| Recommended Action: [Text]                                   |
| Attach Evidence: [Upload]                                    |
| [Save Draft] [Submit for Review]                             |
+--------------------------------------------------------------+
```

### 15.3 Case Management Page Mockup
```text
+---------------------------------------------------------------+
| Case File: CIU/INV/2026/00045                                 |
+---------------------------------------------------------------+
| Case Title: Suspected False Declaration of Pharmaceuticals    |
| Status: Active Investigation | Assigned Officer: [Name]        |
+---------------------------------------------------------------+
| Tabs: Overview | Evidence | Tasks | Notes | Linked Entities   |
+---------------------------------------------------------------+
| Evidence Register: ID | Type | Custodian | Date | Status       |
| Tasks: Task | Assigned To | Due Date | Status                 |
| [Add Evidence] [Assign Task] [Refer to Legal] [Close Case]    |
+---------------------------------------------------------------+
```

---

## 16. Pictorial Mockups
* Executive Dashboard Overview
* Entity Profiling Interface
* Geospatial Intelligence Map View

---

## 17. Data Requirements

### 17.1 Master Data
| Data Category | Description |
| :--- | :--- |
| **User Data** | Officers, roles, commands, units and access levels |
| **Command Data** | Area commands, formations, border posts, ports and airports |
| **Entity Data** | Companies, persons, agents, importers, exporters, transporters and syndicates |
| **Cargo Data** | PAAR, Form M, SGD, manifest, container, vessel, HS code and commodity |
| **Route Data** | Ports, border routes, transit routes and smuggling corridors |
| **Case Data** | Cases, tasks, evidence, notes, legal referrals and closure reports |
| **Cyber Data** | Domains, URLs, IP addresses, email addresses, leaked credentials and screenshots |
| **Agency Data** | Partner agencies, authorized users, requests and responses |
| **KPI Data** | Reports, cases, outcomes, seizures, revenue impact and timeliness |

### 17.2 Key Data Fields
| Record Type | Mandatory / Key Fields |
| :--- | :--- |
| **Intelligence Report** | Report ID, title, category, command, location, date/time, source reliability, credibility, classification, description, recommended action, approval status |
| **Entity Profile** | Entity ID, name, type, RC/TIN where applicable, phone, email, address, directors, linked agents, linked cargo, risk score, watchlist status |
| **Cargo Profile** | PAAR number, Form M, SGD, manifest, container, vessel, importer, agent, commodity, HS code, value, origin, route, risk indicators |
| **Case File** | Case number, title, category, originating report, assigned officer, supervisor, status, linked entities, evidence, tasks, outcome, closure report |
| **Cyber Indicator** | Indicator type, URL/domain/IP/email/phone, screenshot, source, validation status, linked entity/case, mitigation outcome |

### 17.3 Data Retention
| Data Type | Retention Requirement |
| :--- | :--- |
| **Intelligence Reports** | As defined by NCS record retention policy |
| **Case Files** | Long-term retention subject to legal and operational requirements |
| **Audit Logs** | Minimum retention period to be defined by ICT/security policy |
| **Cyber Indicators** | Retained for threat intelligence and correlation |
| **Watchlist Records** | Periodic review required |
| **Agency Exchange Records** | Retained for compliance and accountability |

---

## 18. Non-Functional Requirements
| Category | Requirement |
| :--- | :--- |
| **Security** | MFA, RBAC, encryption, audit logging, session timeout, account lockout, report watermarking and SIEM monitoring |
| **Performance** | Fast dashboard loading, optimized search, concurrent command-level usage and scalable storage |
| **Availability** | Reliable access across commands, backup, disaster recovery and defined maintenance windows |
| **Usability** | Simple forms, dashboards with charts/maps, contextual help and responsive interface |
| **Compliance** | Alignment with NCS ICT, cybersecurity, data protection, evidence handling and official information policies |
| **Scalability** | Ability to add more commands, agencies, modules, data sources and analytics models |
| **Interoperability** | API-first architecture for integration with Customs and approved external systems |
| **Maintainability** | Modular design, documented codebase, configurable workflows and administrative console |

---

## 19. Use Case Notation

### 19.1 Actors and Symbols
| Term | Meaning |
| :--- | :--- |
| **Actor** | A user or external system interacting with the application |
| **Use Case** | A function or business activity performed by an actor |
| **Association** | Relationship between an actor and a use case |
| **Include** | Mandatory sub-function required by a use case |
| **Extend** | Optional or conditional function extending another use case |
| **System Boundary** | Defines what belongs inside the proposed system |

### 19.2 Use Case Catalogue
| ID | Use Case | Primary Actor | Description |
| :--- | :--- | :--- | :--- |
| **UC-001** | Login to Portal | All Users | User accesses system using approved credentials |
| **UC-002** | Submit Intelligence Report | CIU Field Officer | Officer submits structured report |
| **UC-003** | Review Intelligence Report | CIU Supervisor | Supervisor reviews submitted report |
| **UC-004** | Enrich Intelligence | CIU Analyst | Analyst links report with entities, cargo, routes, cases and cyber data |
| **UC-005** | Create Entity Profile | CIU Analyst | Analyst creates person/company profile |
| **UC-006** | Add Entity to Watchlist | CIU Supervisor / HQ | Authorized user adds entity to watchlist |
| **UC-007** | View Cargo Risk Profile | CIU Analyst | Analyst reviews high-risk cargo |
| **UC-008** | Issue Examination Note | CIU Supervisor | Supervisor issues cargo examination note |
| **UC-009** | Create Investigation Case | CIU Supervisor | Supervisor converts intelligence into case |
| **UC-010** | Manage Case Evidence | Investigation Officer | Officer uploads and manages evidence |
| **UC-011** | Submit Cyber Threat Alert | Cybersecurity Officer / CIU | User submits cyber-related intelligence |
| **UC-012** | Validate Cyber Indicator | Cybersecurity Officer | Cybersecurity validates digital indicators |
| **UC-013** | Create Inter-Agency Request | Authorized CIU Officer | Officer requests information from partner agency |
| **UC-014** | View Geospatial Hotspots | CIU Analyst / Supervisor | User views map of routes and hotspots |
| **UC-015** | Generate Intelligence Report | CIU Analyst / HQ | User generates approved intelligence report |
| **UC-016** | View Executive Dashboard | Senior Management | Management views national intelligence picture |
| **UC-017** | Run AI Risk Analysis | CIU Analyst | Analyst runs predictive risk or anomaly analysis |
| **UC-018** | Manage Users and Roles | System Administrator | Admin manages access and permissions |

---

## 20. Principal Actors and Responsibilities
| Actor | Responsibilities |
| :--- | :--- |
| **Comptroller-General of Customs** | Provides executive approval, policy direction and strategic oversight |
| **DCG ICT–Modernization** | Sponsors technical implementation and modernization alignment |
| **DCG Enforcement/Investigation/Inspection** | Ensures operational alignment with enforcement and intelligence objectives |
| **ACG ICT–Modernization** | Supervises technical planning, development and deployment |
| **Head of CIU** | Owns business requirements, workflows and intelligence governance |
| **CIU HQ Analyst** | Reviews, analyses, links intelligence and prepares reports |
| **CIU Command Supervisor** | Reviews command-level reports and escalates intelligence |
| **CIU Field Officer** | Collects and submits field intelligence |
| **Investigation Officer** | Manages assigned cases, evidence and case updates |
| **Enforcement Officer** | Acts on approved intelligence and records outcomes |
| **Cybersecurity Officer** | Validates cyber threats and supports cyber-enabled fraud investigations |
| **Risk Management Officer** | Supports risk indicators and cargo targeting |
| **Legal Officer** | Reviews cases requiring legal action |
| **Agency Liaison Officer** | Manages approved inter-agency communication |
| **System Administrator** | Manages configuration, users, roles and system settings |
| **SOC/SIEM Officer** | Monitors security events and suspicious system activity |
| **Project Manager** | Coordinates delivery, testing, deployment and reporting |

---

## 21. User Roles
| Role | Main Access Rights |
| :--- | :--- |
| **Super Administrator** | Full system configuration, technical settings and platform administration |
| **Security Administrator** | Security settings, audit logs, access monitoring and incident review |
| **CIU National Administrator** | CIU configuration, national data oversight and user assignment |
| **Head of CIU** | Executive CIU dashboard, approvals and strategic reports |
| **CIU HQ Supervisor** | Approve reports, assign cases and approve dissemination |
| **CIU HQ Analyst** | Analyse intelligence, create profiles, enrich records and generate reports |
| **CIU Command Supervisor** | Review command submissions and approve command intelligence |
| **CIU Field Officer** | Submit reports, view assigned tasks and update assigned intelligence |
| **Investigation Officer** | Manage assigned cases and evidence |
| **Enforcement Officer** | View approved alerts and submit action outcomes |
| **Cybersecurity Officer** | Manage cyber-intelligence records and validate cyber indicators |
| **Risk Management Officer** | View cargo risk intelligence and recommend selectivity actions |
| **Legal Officer** | View referred cases and provide legal input |
| **Agency User** | Access only approved shared intelligence and assigned requests |
| **Senior Management Viewer** | View executive dashboards and approved strategic reports |
| **Auditor** | View audit logs, activity history and compliance reports |

### 21.1 Clearance Levels
| Level | Description |
| :--- | :--- |
| **Level 1** | Basic CIU operational access |
| **Level 2** | Command-level supervisory access |
| **Level 3** | HQ analyst access |
| **Level 4** | National CIU management access |
| **Level 5** | Executive and restricted intelligence access |
| **System Level** | Technical administration access |

---

## 22. Recommended Implementation Phases
| Phase | Modules | Expected Outcome |
| :--- | :--- | :--- |
| **Phase 1: Foundation and Core CIU Operations** | User management, RBAC, Fusion Dashboard, Field Reporting, Entity Profiling, Case Management | Establish secure national CIU operating platform |
| **Phase 2: Operational Intelligence Expansion** | Cargo Profiling, Geospatial Intelligence, Watchlist Engine, Report Generator | Improve cargo targeting and border intelligence |
| **Phase 3: Collaboration and Cyber-Intelligence** | Cyber-Intelligence Portal, Inter-Agency Portal, SIEM/SOC integration, NII integration | Strengthen cross-unit and inter-agency intelligence operations |
| **Phase 4: AI and Predictive Intelligence** | AI risk prediction, anomaly detection, natural language search, automated brief generator | Enable predictive and proactive intelligence-led Customs operations |

---

## 23. Key Risks and Mitigation
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Unauthorized access to sensitive intelligence** | High | MFA, RBAC, audit logs, clearance levels and periodic access reviews |
| **Poor data quality** | High | Mandatory fields, validation rules, supervisor review and analyst enrichment |
| **User resistance** | Medium | Training, phased deployment, command champions and management support |
| **Weak integration with existing systems** | High | API-first architecture, integration testing and phased onboarding |
| **Over-classification of reports** | Medium | Clear classification policy and user training |
| **Misuse of intelligence records** | High | Audit trail, user monitoring and disciplinary escalation |
| **Poor connectivity at border locations** | Medium | Responsive design and future offline mode |
| **Duplicate entity records** | Medium | Entity matching, deduplication rules and profile review workflow |
| **Excessive false positive alerts** | Medium | Rule tuning, feedback loop and analyst validation |
| **Poor case closure discipline** | Medium | Mandatory closure workflow and management dashboard |

---

## 24. Success Criteria
* CIU officers can submit structured intelligence reports from commands.
* HQ CIU can view national intelligence activities in real time.
* Suspicious persons and companies can be profiled and linked to cargo, cases and routes.
* High-risk cargo can be flagged using intelligence and system-based indicators.
* Investigation cases can be created, assigned, tracked and closed digitally.
* Smuggling routes and hotspots can be visualized on a map.
* Cyber-related Customs fraud can be reported and jointly reviewed with Cybersecurity Unit.
* Approved intelligence can be shared securely with relevant agencies.
* Management can view command performance and intelligence KPIs.
* The system maintains complete audit trails for accountability.
* Monthly intelligence reports can be generated from the platform.
* The platform improves intelligence-led enforcement and revenue protection.

---

## 25. Conclusion
The Customs Intelligence Management and Fusion Suite will provide the Nigeria Customs Service with a secure, integrated and intelligence-led platform for modern Customs intelligence operations.

By consolidating field reporting, entity profiling, cargo risk analysis, geospatial intelligence, case management, cyber-intelligence, inter-agency collaboration, KPI reporting and AI-powered prediction into one suite, the Customs Intelligence Unit will be better positioned to detect threats, prevent revenue leakage, support enforcement, protect national security and strengthen Customs modernization.

The proposed suite is not merely a reporting portal. It is a national intelligence fusion platform designed to transform CIU operations from fragmented manual processes into a coordinated, data-driven and accountable intelligence ecosystem.
