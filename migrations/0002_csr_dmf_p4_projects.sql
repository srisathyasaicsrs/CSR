-- Refresh featured projects with BC Welfare CSR / DMF / P4 works (as of 27.08.2026)
DELETE FROM projects;

INSERT INTO projects (title, mandal, sector, budget, sponsor, status, progress_pct, milestones) VALUES
  ('BC Hostel CSR Amenities & Repairs (42 hostels)', 'District-wide', 'Education', '₹39.86 Lakhs', 'CSR Fund Stream', 'In Progress', 100, 'Fans, lights, CCTV, TVs, RO, painting, bathrooms'),
  ('DMF Hostel Civil & Facility Works (34 hostels)', 'District-wide', 'Drains', '₹3.95 Crores', 'District Mineral Foundation', 'In Progress', 85, 'Sheds, cloth-wash, toilets, electrification'),
  ('P4 Hostel Amenity Support (5 hostels)', 'District-wide', 'Education', '₹2.05 Lakhs', 'P4 Programme', 'In Progress', 100, 'TVs, purifiers, geysers, electrical repairs'),
  ('Penukonda Skill Development & EV Training Center', 'Penukonda', 'Education', '₹1.20 Crores', 'KIA Motors India', 'In Progress', 45, 'Lab fit-out; trainer onboarding'),
  ('Puttaparthi Super-Specialty Tele-Medicine Clinic', 'Puttaparthi', 'Health', '₹85 Lakhs', 'Available for Sponsorship', 'Proposed', 0, 'Site survey pending'),
  ('Hindupur Industrial Park Underground Drainage & Sewage', 'Hindupur', 'Drains', '₹2.50 Crores', 'Available for Sponsorship', 'Proposed', 0, 'DPR under review'),
  ('Dharmavaram Weaver Colony Smart Digital Schools', 'Dharmavaram', 'Education', '₹45 Lakhs', 'Available for Sponsorship', 'Proposed', 0, 'School list locked'),
  ('Kadiri Rural Drinking Water & RO Purification Units', 'Kadiri', 'Drains', '₹60 Lakhs', 'Available for Sponsorship', 'Proposed', 0, 'Habitation mapping');
