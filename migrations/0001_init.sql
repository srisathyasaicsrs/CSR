CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('collector', 'nodal', 'sponsor')),
  display_name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  mandal TEXT,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS proposals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  sector TEXT,
  outlay_amount TEXT,
  location TEXT,
  details TEXT,
  consent_given INTEGER NOT NULL DEFAULT 1,
  nodal_status TEXT NOT NULL DEFAULT 'Submitted',
  sponsor_status TEXT NOT NULL DEFAULT 'Viewed',
  sponsor_user_id TEXT,
  nodal_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS proposals_created_at_idx ON proposals(created_at);
CREATE INDEX IF NOT EXISTS proposals_sponsor_user_id_idx ON proposals(sponsor_user_id);

CREATE TABLE IF NOT EXISTS sponsors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  company TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  sector TEXT,
  mandal TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  mandal TEXT,
  sector TEXT,
  budget TEXT,
  sponsor TEXT,
  status TEXT,
  progress_pct INTEGER DEFAULT 0,
  milestones TEXT
);

INSERT INTO projects (title, mandal, sector, budget, sponsor, status, progress_pct, milestones) VALUES
  ('Penukonda Skill Development & EV Training Center', 'Penukonda', 'Education', '₹1.20 Crores', 'KIA Motors India', 'In Progress', 45, 'Lab fit-out; trainer onboarding'),
  ('Puttaparthi Super-Specialty Tele-Medicine Clinic', 'Puttaparthi', 'Health', '₹85 Lakhs', 'Available for Sponsorship', 'Proposed', 0, 'Site survey pending'),
  ('Hindupur Industrial Park Underground Drainage & Sewage', 'Hindupur', 'Drains', '₹2.50 Crores', 'Available for Sponsorship', 'Proposed', 0, 'DPR under review'),
  ('Dharmavaram Weaver Colony Smart Digital Schools', 'Dharmavaram', 'Education', '₹45 Lakhs', 'Tata Trusts (Under Review)', 'Under Review', 15, 'School list locked'),
  ('Kadiri Rural Drinking Water & RO Purification Units', 'Kadiri', 'Drains', '₹60 Lakhs', 'Available for Sponsorship', 'Proposed', 0, 'Habitation mapping'),
  ('Lepakshi Heritage Corridor Green Plantation & Solar Streetlights', 'Lepakshi', 'Solar', '₹35 Lakhs', 'Available for Sponsorship', 'Proposed', 0, 'Alignment with tourism dept'),
  ('Madakasira Border Health Center & Ambulance Support', 'Madakasira', 'Health', '₹50 Lakhs', 'Available for Sponsorship', 'Proposed', 0, 'MMU specification'),
  ('N.P. Kunta Ultra-Mega Solar Rooftop Micro-Grid', 'N.P. Kunta', 'Solar', '₹1.80 Crores', 'Available for Sponsorship', 'Proposed', 0, 'Load survey');
