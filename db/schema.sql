PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  phone TEXT NOT NULL,
  last_visit TEXT NOT NULL,
  next_visit TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  note TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS appointment_requests (
  id TEXT PRIMARY KEY,
  patient TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  reason TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  status TEXT NOT NULL,
  urgency TEXT NOT NULL,
  status_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  duration TEXT NOT NULL,
  treatment TEXT NOT NULL,
  room TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS staff_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  permissions_json TEXT NOT NULL DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outbound_emails (
  id TEXT PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL,
  related_type TEXT NOT NULL,
  related_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  treatment TEXT NOT NULL,
  text TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_tariffs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  service TEXT NOT NULL,
  detail TEXT NOT NULL,
  duration TEXT NOT NULL,
  price TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS treatment_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  visit_date TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  plan TEXT NOT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS bot_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id TEXT NOT NULL,
  appointment_id TEXT,
  send_at TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  role TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_date_time
ON appointments(date, time);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session
ON chat_messages(session_id, created_at);
