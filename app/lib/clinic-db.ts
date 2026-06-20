import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";
import {
  appointmentRequests,
  appointments,
  botReminders,
  calendarWeek,
  clinic,
  patients,
  serviceTariffs,
  testimonials,
} from "./clinic-data";
import { getMongoDb, shouldUseMongo } from "./mongodb";

type DbPatient = {
  id: string;
  name: string;
  age: number;
  phone: string;
  last_visit: string;
  next_visit: string;
  tags_json: string;
  note: string;
};

export type Appointment = {
  id: string;
  patient: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  duration: string;
  treatment: string;
  room: string;
  status: string;
  notes: string;
};

export type AppointmentRequest = {
  id: string;
  patient: string;
  phone: string;
  email: string;
  reason: string;
  preferredDate: string;
  status: string;
  urgency: string;
  statusNote: string;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  phone: string;
  lastVisit: string;
  nextVisit: string;
  tags: string[];
  note: string;
};

export type Review = {
  id: string;
  name: string;
  rating: number;
  treatment: string;
  text: string;
  status: string;
  createdAt: string;
};

export type AppointmentInput = {
  patient: string;
  phone?: string;
  email?: string;
  date?: string;
  time: string;
  duration?: string;
  treatment: string;
  room?: string;
  status?: string;
  notes?: string;
};

export type AppointmentRequestInput = {
  patient: string;
  phone: string;
  email?: string;
  service?: string;
  preferredDate?: string;
  message?: string;
};

export type ReviewInput = {
  name: string;
  rating: number;
  treatment?: string;
  text: string;
};

export type StaffPermission =
  | "manageAppointments"
  | "manageRequests"
  | "viewPatients"
  | "manageUsers";

export type StaffRole = "doctor" | "assistant";

export type StaffUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: StaffRole;
  permissions: StaffPermission[];
  active: boolean;
  createdAt: string;
};

type DbStaffUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: StaffRole;
  password_hash: string;
  permissions_json: string;
  active: number;
  created_at: string;
};

export type StaffUserInput = {
  name: string;
  username: string;
  email?: string;
  role: StaffRole;
  password: string;
  permissions?: StaffPermission[];
};

export type OutboundEmail = {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  status: string;
  relatedType: string;
  relatedId: string;
  createdAt: string;
};

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "cata-stoma.sqlite");
const schemaPath = path.join(process.cwd(), "db", "schema.sql");

let database: DatabaseSync | null = null;
let mongoSeeded = false;

const defaultDoctorUsername = process.env.DOCTOR_USERNAME ?? "doctor";
const defaultDoctorPassword = process.env.DOCTOR_PASSWORD ?? "doctor1";
const allPermissions: StaffPermission[] = [
  "manageAppointments",
  "manageRequests",
  "viewPatients",
  "manageUsers",
];
const assistantPermissions: StaffPermission[] = [
  "manageAppointments",
  "manageRequests",
  "viewPatients",
];

function passwordMatches(password: string, hash: string) {
  const cleanPassword = password.trim();

  return (
    bcrypt.compareSync(cleanPassword, hash) ||
    (defaultDoctorPassword === "doctor1" &&
      cleanPassword === "doctor 1" &&
      bcrypt.compareSync("doctor1", hash))
  );
}

function getDefaultPermissions(role: StaffRole) {
  return role === "doctor" ? allPermissions : assistantPermissions;
}

function getDb() {
  if (!database) {
    fs.mkdirSync(dataDir, { recursive: true });
    database = new DatabaseSync(dbPath);
    database.exec("PRAGMA journal_mode = WAL;");
    database.exec("PRAGMA foreign_keys = ON;");
    database.exec(fs.readFileSync(schemaPath, "utf8"));
    ensureSqliteSchema(database);
    seedSqliteDatabase(database);
  }

  return database;
}

function countRows(db: DatabaseSync, table: string) {
  return (db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as {
    count: number;
  }).count;
}

function createId(prefix: string) {
  const time = Date.now().toString().slice(-6);
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${prefix}-${time}${suffix}`;
}

function hasColumn(db: DatabaseSync, table: string, column: string) {
  return (
    db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]
  ).some((item) => item.name === column);
}

function ensureSqliteSchema(db: DatabaseSync) {
  const migrations = [
    ["appointment_requests", "email", "ALTER TABLE appointment_requests ADD COLUMN email TEXT NOT NULL DEFAULT ''"],
    [
      "appointment_requests",
      "status_note",
      "ALTER TABLE appointment_requests ADD COLUMN status_note TEXT NOT NULL DEFAULT ''",
    ],
    ["appointments", "email", "ALTER TABLE appointments ADD COLUMN email TEXT NOT NULL DEFAULT ''"],
    ["appointments", "notes", "ALTER TABLE appointments ADD COLUMN notes TEXT NOT NULL DEFAULT ''"],
  ] as const;

  for (const [table, column, statement] of migrations) {
    if (!hasColumn(db, table, column)) {
      db.exec(statement);
    }
  }
}

function getUrgency(input: AppointmentRequestInput) {
  const haystack = `${input.service ?? ""} ${input.message ?? ""}`.toLowerCase();
  return haystack.includes("urgent") || haystack.includes("durere")
    ? "Ridicată"
    : "Normală";
}

function getReason(input: AppointmentRequestInput) {
  const service = input.service?.trim() || "Programare";
  const message = input.message?.trim();

  return message ? `${service}: ${message}` : service;
}

function toPlain<T extends object>(item: T) {
  return { ...item };
}

function sanitizePermissions(
  permissions: unknown,
  role: StaffRole,
): StaffPermission[] {
  const allowed = new Set(allPermissions);
  const source = Array.isArray(permissions) ? permissions : getDefaultPermissions(role);
  const clean = source.filter(
    (permission): permission is StaffPermission =>
      typeof permission === "string" && allowed.has(permission as StaffPermission),
  );

  return clean.length > 0 ? Array.from(new Set(clean)) : getDefaultPermissions(role);
}

function toStaffUser(user: DbStaffUser): StaffUser {
  let permissions: unknown = [];

  try {
    permissions = JSON.parse(user.permissions_json);
  } catch {
    permissions = [];
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    permissions: sanitizePermissions(permissions, user.role),
    active: Boolean(user.active),
    createdAt: user.created_at,
  };
}

function toOutboundEmail(item: {
  id: string;
  recipient_email?: string;
  recipientEmail?: string;
  recipient_name?: string;
  recipientName?: string;
  subject: string;
  body: string;
  status: string;
  related_type?: string;
  relatedType?: string;
  related_id?: string;
  relatedId?: string;
  created_at?: string;
  createdAt?: string;
}): OutboundEmail {
  return {
    id: item.id,
    recipientEmail: item.recipientEmail ?? item.recipient_email ?? "",
    recipientName: item.recipientName ?? item.recipient_name ?? "",
    subject: item.subject,
    body: item.body,
    status: item.status,
    relatedType: item.relatedType ?? item.related_type ?? "",
    relatedId: item.relatedId ?? item.related_id ?? "",
    createdAt: item.createdAt ?? item.created_at ?? "",
  };
}

function createEmailBody(
  status: "Acceptată" | "Văzută" | "Refuzată" | "Programată",
  request: AppointmentRequest,
) {
  if (status === "Programată") {
    return `Bună, ${request.patient}. Cererea ta pentru ${request.reason} a fost programată. Te contactăm dacă mai trebuie ajustat intervalul.`;
  }

  if (status === "Acceptată") {
    return `Bună, ${request.patient}. Cererea ta pentru ${request.reason} a fost acceptată. Te contactăm pentru confirmarea intervalului ${request.preferredDate}.`;
  }

  if (status === "Refuzată") {
    return `Bună, ${request.patient}. Cererea ta pentru ${request.reason} a fost refuzată momentan. Te rugăm să ne contactezi telefonic pentru o variantă potrivită.`;
  }

  return `Bună, ${request.patient}. Cererea ta pentru ${request.reason} a fost văzută de echipa cabinetului. Revenim cu un răspuns.`;
}

function seedSqliteDatabase(db: DatabaseSync) {
  if (countRows(db, "patients") === 0) {
    const insertPatient = db.prepare(
      `INSERT INTO patients
      (id, name, age, phone, last_visit, next_visit, tags_json, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    for (const patient of patients) {
      insertPatient.run(
        patient.id,
        patient.name,
        patient.age,
        patient.phone,
        patient.lastVisit,
        patient.nextVisit,
        JSON.stringify(patient.tags),
        patient.note,
      );
    }
  }

  if (countRows(db, "appointment_requests") === 0) {
    const insertRequest = db.prepare(
      `INSERT INTO appointment_requests
      (id, patient, phone, email, reason, preferred_date, status, urgency, status_note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    for (const request of appointmentRequests) {
      insertRequest.run(
        request.id,
        request.patient,
        request.phone,
        request.email ?? "",
        request.reason,
        request.preferredDate,
        request.status,
        request.urgency,
        "",
      );
    }
  }

  if (countRows(db, "appointments") === 0) {
    const insertAppointment = db.prepare(
      `INSERT INTO appointments
      (id, patient, phone, email, date, time, duration, treatment, room, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    for (const appointment of appointments) {
      const patient = patients.find((item) => item.name === appointment.patient);
      insertAppointment.run(
        appointment.id,
        appointment.patient,
        patient?.phone ?? "",
        "",
        "2026-05-22",
        appointment.time,
        appointment.duration,
        appointment.treatment,
        appointment.room,
        appointment.status,
        "",
      );
    }
  }

  if (countRows(db, "staff_users") === 0) {
    db.prepare(
      `INSERT INTO staff_users
      (id, name, username, email, role, password_hash, permissions_json, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      "staff-doctor-principal",
      "Dr. Cătălin Rusu",
      defaultDoctorUsername,
      "doctor@dentalclinic-timisoara.ro",
      "doctor",
      bcrypt.hashSync(defaultDoctorPassword, 10),
      JSON.stringify(allPermissions),
      1,
    );
  }

  if (countRows(db, "reviews") === 0) {
    const insertReview = db.prepare(
      `INSERT INTO reviews
      (id, name, rating, treatment, text, status)
      VALUES (?, ?, ?, ?, ?, ?)`,
    );

    testimonials.forEach((review, index) => {
      insertReview.run(
        `REV-${index + 101}`,
        review.name,
        5,
        "Experiență pacient",
        review.text,
        "Publicat",
      );
    });
  }

  if (countRows(db, "service_tariffs") === 0) {
    const insertTariff = db.prepare(
      `INSERT INTO service_tariffs
      (category, service, detail, duration, price)
      VALUES (?, ?, ?, ?, ?)`,
    );

    for (const group of serviceTariffs) {
      for (const item of group.items) {
        insertTariff.run(
          group.category,
          item.service,
          item.detail,
          item.duration,
          item.price,
        );
      }
    }
  }

  if (countRows(db, "bot_notifications") === 0) {
    const insertNotification = db.prepare(
      `INSERT INTO bot_notifications
      (doctor_id, appointment_id, send_at, channel, status, title, detail)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );

    for (const reminder of botReminders) {
      insertNotification.run(
        "doctor-catalin",
        null,
        reminder.time,
        "dashboard",
        "pending",
        reminder.title,
        reminder.detail,
      );
    }
  }
}

async function seedMongoDatabase() {
  if (mongoSeeded || !shouldUseMongo()) {
    return;
  }

  const mongoDb = await getMongoDb();

  if ((await mongoDb.collection("patients").countDocuments()) === 0) {
    await mongoDb.collection("patients").insertMany(patients);
  }

  if ((await mongoDb.collection("appointment_requests").countDocuments()) === 0) {
    await mongoDb.collection("appointment_requests").insertMany(appointmentRequests);
  }

  if ((await mongoDb.collection("appointments").countDocuments()) === 0) {
    await mongoDb.collection("appointments").insertMany(
      appointments.map((appointment) => {
        const patient = patients.find((item) => item.name === appointment.patient);
        return {
          ...appointment,
          phone: patient?.phone ?? "",
          email: "",
          date: "2026-05-22",
          notes: "",
        };
      }),
    );
  }

  if ((await mongoDb.collection("staff_users").countDocuments()) === 0) {
    await mongoDb.collection("staff_users").insertOne({
      id: "staff-doctor-principal",
      name: "Dr. Cătălin Rusu",
      username: defaultDoctorUsername,
      email: "doctor@dentalclinic-timisoara.ro",
      role: "doctor",
      passwordHash: bcrypt.hashSync(defaultDoctorPassword, 10),
      permissions: allPermissions,
      active: true,
      createdAt: new Date().toISOString(),
    });
  }

  if ((await mongoDb.collection("reviews").countDocuments()) === 0) {
    await mongoDb.collection("reviews").insertMany(
      testimonials.map((review, index) => ({
        id: `REV-${index + 101}`,
        name: review.name,
        rating: 5,
        treatment: "Experiență pacient",
        text: review.text,
        status: "Publicat",
        createdAt: new Date().toISOString(),
      })),
    );
  }

  if ((await mongoDb.collection("bot_notifications").countDocuments()) === 0) {
    await mongoDb.collection("bot_notifications").insertMany(
      botReminders.map((reminder, index) => ({
        id: `NOT-${index + 101}`,
        doctorId: "doctor-catalin",
        appointmentId: null,
        time: reminder.time,
        channel: "dashboard",
        status: "pending",
        title: reminder.title,
        detail: reminder.detail,
      })),
    );
  }

  mongoSeeded = true;
}

async function withStore<T>(
  mongoOperation: () => Promise<T>,
  sqliteOperation: () => T,
) {
  if (shouldUseMongo()) {
    try {
      await seedMongoDatabase();
      return await mongoOperation();
    } catch (error) {
      console.error("MongoDB is unavailable. Falling back to SQLite.", error);
    }
  }

  return sqliteOperation();
}

function listSqlitePatients(): Patient[] {
  return (getDb().prepare("SELECT * FROM patients ORDER BY name").all() as DbPatient[]).map(
    (patient) => ({
      id: patient.id,
      name: patient.name,
      age: patient.age,
      phone: patient.phone,
      lastVisit: patient.last_visit,
      nextVisit: patient.next_visit,
      tags: JSON.parse(patient.tags_json) as string[],
      note: patient.note,
    }),
  );
}

function listSqliteAppointmentRequests() {
  return (getDb()
    .prepare(
      `SELECT id, patient, phone, email, reason, preferred_date AS preferredDate,
      status, urgency, status_note AS statusNote
      FROM appointment_requests ORDER BY created_at DESC`,
    )
    .all() as AppointmentRequest[]).map(toPlain);
}

function listSqliteAppointments() {
  return (getDb()
    .prepare(
      `SELECT id, patient, phone, email, date, time, duration, treatment, room, status, notes
      FROM appointments ORDER BY date, time`,
    )
    .all() as Appointment[]).map(toPlain);
}

function listSqliteNotifications() {
  return (getDb()
    .prepare(
      `SELECT id, send_at AS time, title, detail, status
      FROM bot_notifications ORDER BY send_at`,
    )
    .all() as object[]).map(toPlain);
}

function listSqliteReviews() {
  return (getDb()
    .prepare(
      `SELECT id, name, rating, treatment, text, status, created_at AS createdAt
      FROM reviews ORDER BY created_at DESC`,
    )
    .all() as Review[]).map(toPlain);
}

function createSqliteAppointment(input: AppointmentInput) {
  const appointment: Appointment = {
    id: createId("APT"),
    patient: input.patient.trim(),
    phone: input.phone?.trim() ?? "",
    email: input.email?.trim() ?? "",
    date: input.date || new Date().toISOString().slice(0, 10),
    time: input.time,
    duration: input.duration || "45 min",
    treatment: input.treatment.trim(),
    room: input.room || "Cabinet 1",
    status: input.status || "Confirmată",
    notes: input.notes?.trim() ?? "",
  };

  getDb()
    .prepare(
      `INSERT INTO appointments
      (id, patient, phone, email, date, time, duration, treatment, room, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      appointment.id,
      appointment.patient,
      appointment.phone,
      appointment.email,
      appointment.date,
      appointment.time,
      appointment.duration,
      appointment.treatment,
      appointment.room,
      appointment.status,
      appointment.notes,
    );

  getDb()
    .prepare(
      `INSERT INTO bot_notifications
      (doctor_id, appointment_id, send_at, channel, status, title, detail)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      "doctor-catalin",
      appointment.id,
      appointment.time,
      "dashboard",
      "pending",
      `Programare nouă: ${appointment.patient}`,
      `Asistentul va aminti de ${appointment.treatment} la ${appointment.time}, în ${appointment.room}.`,
    );

  return appointment;
}

function getSqliteAppointment(id: string) {
  const appointment =
    getDb()
      .prepare(
        `SELECT id, patient, phone, email, date, time, duration, treatment, room, status, notes
        FROM appointments WHERE id = ?`,
      )
      .get(id) as Appointment | undefined;

  return appointment ? toPlain(appointment) : null;
}

function updateSqliteAppointmentStatus(id: string, status: string) {
  getDb()
    .prepare("UPDATE appointments SET status = ? WHERE id = ?")
    .run(status, id);

  return getSqliteAppointment(id);
}

function createSqliteAppointmentRequest(input: AppointmentRequestInput) {
  const request: AppointmentRequest = {
    id: createId("REQ"),
    patient: input.patient.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() ?? "",
    reason: getReason(input),
    preferredDate: input.preferredDate || "Cât mai curând",
    status: "Nouă",
    urgency: getUrgency(input),
    statusNote: "",
  };

  getDb()
    .prepare(
      `INSERT INTO appointment_requests
      (id, patient, phone, email, reason, preferred_date, status, urgency, status_note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      request.id,
      request.patient,
      request.phone,
      request.email,
      request.reason,
      request.preferredDate,
      request.status,
      request.urgency,
      request.statusNote,
    );

  return request;
}

function createSqliteReview(input: ReviewInput) {
  const review: Review = {
    id: createId("REV"),
    name: input.name.trim(),
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    treatment: input.treatment?.trim() || "Experiență pacient",
    text: input.text.trim(),
    status: "Publicat",
    createdAt: new Date().toISOString(),
  };

  getDb()
    .prepare(
      `INSERT INTO reviews
      (id, name, rating, treatment, text, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      review.id,
      review.name,
      review.rating,
      review.treatment,
      review.text,
      review.status,
      review.createdAt,
    );

  return review;
}

function listSqliteStaffUsers() {
  return (getDb()
    .prepare(
      `SELECT id, name, username, email, role, password_hash, permissions_json,
      active, created_at FROM staff_users ORDER BY role DESC, name`,
    )
    .all() as DbStaffUser[]).map(toStaffUser);
}

function getSqliteStaffUserById(id: string) {
  const user = getDb()
    .prepare(
      `SELECT id, name, username, email, role, password_hash, permissions_json,
      active, created_at FROM staff_users WHERE id = ?`,
    )
    .get(id) as DbStaffUser | undefined;

  return user ? toStaffUser(user) : null;
}

function getSqliteStaffUserWithPassword(username: string) {
  return getDb()
    .prepare(
      `SELECT id, name, username, email, role, password_hash, permissions_json,
      active, created_at FROM staff_users WHERE username = ?`,
    )
    .get(username.trim()) as DbStaffUser | undefined;
}

function createSqliteStaffUser(input: StaffUserInput) {
  const role = input.role === "doctor" ? "doctor" : "assistant";
  const user: StaffUser = {
    id: createId("USR"),
    name: input.name.trim(),
    username: input.username.trim(),
    email: input.email?.trim() ?? "",
    role,
    permissions: sanitizePermissions(input.permissions, role),
    active: true,
    createdAt: new Date().toISOString(),
  };

  getDb()
    .prepare(
      `INSERT INTO staff_users
      (id, name, username, email, role, password_hash, permissions_json, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      user.id,
      user.name,
      user.username,
      user.email,
      user.role,
      bcrypt.hashSync(input.password, 10),
      JSON.stringify(user.permissions),
      1,
      user.createdAt,
    );

  return user;
}

function updateSqliteStaffUser(
  id: string,
  input: {
    role?: StaffRole;
    permissions?: StaffPermission[];
    active?: boolean;
  },
) {
  const current = getSqliteStaffUserById(id);

  if (!current) {
    return null;
  }

  const role = input.role ?? current.role;
  const permissions = sanitizePermissions(input.permissions ?? current.permissions, role);
  const active = input.active ?? current.active;

  getDb()
    .prepare(
      `UPDATE staff_users
      SET role = ?, permissions_json = ?, active = ?
      WHERE id = ?`,
    )
    .run(role, JSON.stringify(permissions), active ? 1 : 0, id);

  return getSqliteStaffUserById(id);
}

function listSqliteOutboundEmails() {
  return (getDb()
    .prepare(
      `SELECT id, recipient_email, recipient_name, subject, body, status,
      related_type, related_id, created_at
      FROM outbound_emails ORDER BY created_at DESC LIMIT 8`,
    )
    .all() as Parameters<typeof toOutboundEmail>[0][]).map(toOutboundEmail);
}

function createSqliteOutboundEmail(input: {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  relatedType: string;
  relatedId: string;
}) {
  const email: OutboundEmail = {
    id: createId("MAIL"),
    recipientEmail: input.recipientEmail,
    recipientName: input.recipientName,
    subject: input.subject,
    body: input.body,
    status: input.recipientEmail
      ? "Trimis în simulare"
      : "Netrimis - lipsește emailul",
    relatedType: input.relatedType,
    relatedId: input.relatedId,
    createdAt: new Date().toISOString(),
  };

  getDb()
    .prepare(
      `INSERT INTO outbound_emails
      (id, recipient_email, recipient_name, subject, body, status, related_type, related_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      email.id,
      email.recipientEmail,
      email.recipientName,
      email.subject,
      email.body,
      email.status,
      email.relatedType,
      email.relatedId,
      email.createdAt,
    );

  return email;
}

export async function listPatients() {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      return (await mongoDb
        .collection("patients")
        .find({}, { projection: { _id: 0 } })
        .sort({ name: 1 })
        .toArray()) as unknown as Patient[];
    },
    listSqlitePatients,
  );
}

export async function listAppointmentRequests() {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      const requests = (await mongoDb
        .collection("appointment_requests")
        .find({}, { projection: { _id: 0 } })
        .sort({ id: -1 })
        .toArray()) as unknown as AppointmentRequest[];

      return requests.map((request) => ({
        ...request,
        email: request.email ?? "",
        statusNote: request.statusNote ?? "",
      }));
    },
    listSqliteAppointmentRequests,
  );
}

export async function listAppointments() {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      const dashboardAppointments = (await mongoDb
        .collection("appointments")
        .find({}, { projection: { _id: 0 } })
        .sort({ date: 1, time: 1 })
        .toArray()) as unknown as Appointment[];

      return dashboardAppointments.map((appointment) => ({
        ...appointment,
        email: appointment.email ?? "",
        notes: appointment.notes ?? "",
      }));
    },
    listSqliteAppointments,
  );
}

export async function listReviews() {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      return (await mongoDb
        .collection("reviews")
        .find({ status: "Publicat" }, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray()) as unknown as Review[];
    },
    listSqliteReviews,
  );
}

export async function createAppointment(input: AppointmentInput) {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      const appointment: Appointment = {
        id: createId("APT"),
        patient: input.patient.trim(),
        phone: input.phone?.trim() ?? "",
        email: input.email?.trim() ?? "",
        date: input.date || new Date().toISOString().slice(0, 10),
        time: input.time,
        duration: input.duration || "45 min",
        treatment: input.treatment.trim(),
        room: input.room || "Cabinet 1",
        status: input.status || "Confirmată",
        notes: input.notes?.trim() ?? "",
      };

      await mongoDb.collection("appointments").insertOne(appointment);
      await mongoDb.collection("bot_notifications").insertOne({
        id: createId("NOT"),
        doctorId: "doctor-catalin",
        appointmentId: appointment.id,
        time: appointment.time,
        channel: "dashboard",
        status: "pending",
        title: `Programare nouă: ${appointment.patient}`,
        detail: `Asistentul va aminti de ${appointment.treatment} la ${appointment.time}, în ${appointment.room}.`,
      });

      return appointment;
    },
    () => createSqliteAppointment(input),
  );
}

export async function updateAppointmentStatus(id: string, status: string) {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      const appointmentsCollection = mongoDb.collection("appointments");
      const result = await appointmentsCollection.updateOne(
        { id },
        { $set: { status } },
      );

      if (result.matchedCount === 0) {
        return null;
      }

      return (await appointmentsCollection.findOne(
        { id },
        { projection: { _id: 0 } },
      )) as unknown as Appointment | null;
    },
    () => updateSqliteAppointmentStatus(id, status),
  );
}

export async function cancelAppointment(id: string) {
  return updateAppointmentStatus(id, "Anulată");
}

export async function createAppointmentRequest(input: AppointmentRequestInput) {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      const request: AppointmentRequest = {
        id: createId("REQ"),
        patient: input.patient.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim() ?? "",
        reason: getReason(input),
        preferredDate: input.preferredDate || "Cât mai curând",
        status: "Nouă",
        urgency: getUrgency(input),
        statusNote: "",
      };

      await mongoDb.collection("appointment_requests").insertOne(request);
      return request;
    },
    () => createSqliteAppointmentRequest(input),
  );
}

export async function updateAppointmentRequestStatus(
  id: string,
  status: "Acceptată" | "Văzută" | "Refuzată" | "Programată",
) {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      const requestsCollection = mongoDb.collection("appointment_requests");
      const current = (await requestsCollection.findOne(
        { id },
        { projection: { _id: 0 } },
      )) as unknown as AppointmentRequest | null;

      if (!current) {
        return null;
      }

      const statusNote = `Status actualizat: ${status}`;

      await requestsCollection.updateOne(
        { id },
        { $set: { status, statusNote } },
      );

      const request = {
        ...current,
        email: current.email ?? "",
        status,
        statusNote,
      };
      const email = await createOutboundEmail({
        recipientEmail: request.email,
        recipientName: request.patient,
        subject: `Status cerere programare: ${status}`,
        body: createEmailBody(status, request),
        relatedType: "appointment_request",
        relatedId: request.id,
      });

      return { request, email };
    },
    () => {
      const db = getDb();
      const current = db
        .prepare(
          `SELECT id, patient, phone, email, reason, preferred_date AS preferredDate,
          status, urgency, status_note AS statusNote
          FROM appointment_requests WHERE id = ?`,
        )
        .get(id) as AppointmentRequest | undefined;

      if (!current) {
        return null;
      }

      const statusNote = `Status actualizat: ${status}`;

      db.prepare(
        `UPDATE appointment_requests
        SET status = ?, status_note = ?
        WHERE id = ?`,
      ).run(status, statusNote, id);

      const request = { ...current, status, statusNote };
      const email = createSqliteOutboundEmail({
        recipientEmail: request.email,
        recipientName: request.patient,
        subject: `Status cerere programare: ${status}`,
        body: createEmailBody(status, request),
        relatedType: "appointment_request",
        relatedId: request.id,
      });

      return { request, email };
    },
  );
}

export async function createReview(input: ReviewInput) {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      const review: Review = {
        id: createId("REV"),
        name: input.name.trim(),
        rating: Math.min(5, Math.max(1, Math.round(input.rating))),
        treatment: input.treatment?.trim() || "Experiență pacient",
        text: input.text.trim(),
        status: "Publicat",
        createdAt: new Date().toISOString(),
      };

      await mongoDb.collection("reviews").insertOne(review);
      return review;
    },
    () => createSqliteReview(input),
  );
}

export async function listStaffUsers() {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      const users = await mongoDb
        .collection("staff_users")
        .find({}, { projection: { _id: 0, passwordHash: 0 } })
        .sort({ role: -1, name: 1 })
        .toArray();

      return users.map((user) => ({
        id: String(user.id),
        name: String(user.name),
        username: String(user.username),
        email: String(user.email ?? ""),
        role: user.role === "doctor" ? "doctor" : "assistant",
        permissions: sanitizePermissions(user.permissions, user.role as StaffRole),
        active: Boolean(user.active),
        createdAt: String(user.createdAt ?? ""),
      })) as StaffUser[];
    },
    listSqliteStaffUsers,
  );
}

export async function getStaffUserById(id: string) {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      const user = await mongoDb.collection("staff_users").findOne(
        { id },
        { projection: { _id: 0, passwordHash: 0 } },
      );

      if (!user) {
        return null;
      }

      const role = user.role === "doctor" ? "doctor" : "assistant";

      return {
        id: String(user.id),
        name: String(user.name),
        username: String(user.username),
        email: String(user.email ?? ""),
        role,
        permissions: sanitizePermissions(user.permissions, role),
        active: Boolean(user.active),
        createdAt: String(user.createdAt ?? ""),
      } satisfies StaffUser;
    },
    () => getSqliteStaffUserById(id),
  );
}

export async function authenticateStaffCredentials(
  username: string,
  password: string,
) {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      const user = await mongoDb.collection("staff_users").findOne({
        username: username.trim(),
      });

      if (!user || !user.active || !passwordMatches(password, user.passwordHash)) {
        return null;
      }

      const role = user.role === "doctor" ? "doctor" : "assistant";

      return {
        id: String(user.id),
        name: String(user.name),
        username: String(user.username),
        email: String(user.email ?? ""),
        role,
        permissions: sanitizePermissions(user.permissions, role),
        active: true,
        createdAt: String(user.createdAt ?? ""),
      } satisfies StaffUser;
    },
    () => {
      const user = getSqliteStaffUserWithPassword(username);

      if (!user || !user.active || !passwordMatches(password, user.password_hash)) {
        return null;
      }

      return toStaffUser(user);
    },
  );
}

export async function createStaffUser(input: StaffUserInput) {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      const role = input.role === "doctor" ? "doctor" : "assistant";
      const user: StaffUser = {
        id: createId("USR"),
        name: input.name.trim(),
        username: input.username.trim(),
        email: input.email?.trim() ?? "",
        role,
        permissions: sanitizePermissions(input.permissions, role),
        active: true,
        createdAt: new Date().toISOString(),
      };

      await mongoDb.collection("staff_users").insertOne({
        ...user,
        passwordHash: bcrypt.hashSync(input.password, 10),
      });

      return user;
    },
    () => createSqliteStaffUser(input),
  );
}

export async function updateStaffUser(
  id: string,
  input: {
    role?: StaffRole;
    permissions?: StaffPermission[];
    active?: boolean;
  },
) {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      const current = await getStaffUserById(id);

      if (!current) {
        return null;
      }

      const role = input.role ?? current.role;
      const permissions = sanitizePermissions(
        input.permissions ?? current.permissions,
        role,
      );
      const active = input.active ?? current.active;

      await mongoDb.collection("staff_users").updateOne(
        { id },
        {
          $set: {
            role,
            permissions,
            active,
          },
        },
      );

      return {
        ...current,
        role,
        permissions,
        active,
      };
    },
    () => updateSqliteStaffUser(id, input),
  );
}

export async function listOutboundEmails() {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      const emails = await mongoDb
        .collection("outbound_emails")
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .limit(8)
        .toArray();

      return emails.map((email) =>
        toOutboundEmail(email as unknown as Parameters<typeof toOutboundEmail>[0]),
      );
    },
    listSqliteOutboundEmails,
  );
}

export async function createOutboundEmail(input: {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  relatedType: string;
  relatedId: string;
}) {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      const email: OutboundEmail = {
        id: createId("MAIL"),
        recipientEmail: input.recipientEmail,
        recipientName: input.recipientName,
        subject: input.subject,
        body: input.body,
        status: input.recipientEmail
          ? "Trimis în simulare"
          : "Netrimis - lipsește emailul",
        relatedType: input.relatedType,
        relatedId: input.relatedId,
        createdAt: new Date().toISOString(),
      };

      await mongoDb.collection("outbound_emails").insertOne(email);
      return email;
    },
    () => createSqliteOutboundEmail(input),
  );
}

export async function getDoctorDashboard() {
  const [dashboardAppointments, dashboardRequests, dashboardPatients, notifications] =
    await Promise.all([
      listAppointments(),
      listAppointmentRequests(),
      listPatients(),
      withStore(
        async () => {
          const mongoDb = await getMongoDb();
          return mongoDb
            .collection("bot_notifications")
            .find({}, { projection: { _id: 0 } })
            .sort({ time: 1 })
            .toArray();
        },
        listSqliteNotifications,
      ),
    ]);

  return {
    appointments: dashboardAppointments,
    appointmentRequests: dashboardRequests,
    patients: dashboardPatients,
    calendarWeek,
    notifications,
  };
}

export async function addChatMessage(
  sessionId: string,
  mode: string,
  role: "user" | "bot",
  message: string,
) {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      await mongoDb.collection("chat_messages").insertOne({
        sessionId,
        mode,
        role,
        message,
        createdAt: new Date().toISOString(),
      });
    },
    () => {
      getDb()
        .prepare(
          `INSERT INTO chat_messages (session_id, mode, role, message)
          VALUES (?, ?, ?, ?)`,
        )
        .run(sessionId, mode, role, message);
    },
  );
}

export async function answerBotQuestion(
  message: string,
  mode: "patient" | "doctor",
) {
  const normalized = message.toLowerCase();
  const [dashboardAppointments, dashboardRequests, dashboardPatients] =
    await Promise.all([listAppointments(), listAppointmentRequests(), listPatients()]);
  const nextAppointment = dashboardAppointments.find(
    (appointment) => !["Anulata", "Anulată"].includes(appointment.status),
  );

  if (mode === "doctor") {
    const requestCount = dashboardRequests.filter(
      (item) => !["Confirmare trimisa", "Confirmare trimisă"].includes(item.status),
    ).length;

    if (normalized.includes("urm") || normalized.includes("cine")) {
      return nextAppointment
        ? `Următoarea programare este ${nextAppointment.patient} la ${nextAppointment.time}, pentru ${nextAppointment.treatment}, în ${nextAppointment.room}. Telefon: ${nextAppointment.phone || "necompletat"}.`
        : "Nu există programări confirmate în baza de date.";
    }

    if (normalized.includes("cerer") || normalized.includes("urgent")) {
      const urgent = [...dashboardRequests].sort((a, b) => {
        const order = {
          Ridicata: 0,
          Ridicată: 0,
          Normala: 1,
          Normală: 1,
          Scazuta: 2,
          Scăzută: 2,
        };
        return (
          (order[a.urgency as keyof typeof order] ?? 3) -
          (order[b.urgency as keyof typeof order] ?? 3)
        );
      })[0];

      return urgent
        ? `Ai ${requestCount} cereri de verificat. Prioritate: ${urgent.patient}, ${urgent.phone}, motiv: ${urgent.reason}.`
        : "Nu ai cereri noi în inbox.";
    }

    if (normalized.includes("calendar") || normalized.includes("programari")) {
      return dashboardAppointments.length
        ? `Azi ai ${dashboardAppointments.length} programări: ${dashboardAppointments
            .map((item) => `${item.time} ${item.patient} (${item.treatment})`)
            .join("; ")}.`
        : "Calendarul de azi este liber.";
    }

    if (normalized.includes("pacient")) {
      const patient = dashboardPatients[0];

      return patient
        ? `Am verificat fișele. Prima observație importantă: ${patient.name} - ${patient.note}`
        : "Nu există pacienți salvați în baza de date.";
    }

    return `Am verificat baza: ${dashboardAppointments.length} programări, ${requestCount} cereri active și ${dashboardPatients.length} pacienți. Întreabă-mă, de exemplu: „cine urmează?” sau „ce cereri urgente am?”.`;
  }

  if (normalized.includes("program") || normalized.includes("ora")) {
    return "Programul DentalClinic Timișoara este Luni - Vineri, 09:00 - 19:00, în Timișoara, zona Take Ionescu - Piața Badea Cârțan.";
  }

  if (
    normalized.includes("pret") ||
    normalized.includes("tarif") ||
    normalized.includes("cat costa")
  ) {
    const tariffs = serviceTariffs
      .flatMap((group) => group.items)
      .slice(0, 4);

    return `Câteva tarife orientative: ${tariffs
      .map((item) => `${item.service}: ${item.price}`)
      .join("; ")}. Prețul final se confirmă după consultație.`;
  }

  if (normalized.includes("urgent") || normalized.includes("durere")) {
    return `Pentru durere, inflamație sau dinte spart, scrie „urgență” în formular sau sună la ${clinic.phone}. Cererea intră prima în lista doctorului.`;
  }

  if (normalized.includes("programare") || normalized.includes("vreau")) {
    return "Pentru programare, completează formularul de pe pagină cu nume, telefon și data preferată. Recepția confirmă telefonic intervalul.";
  }

  return "Pot să te ajut cu programări, tarife, urgențe și servicii. Scrie-mi pe scurt ce te interesează și îți răspund din datele cabinetului.";
}
