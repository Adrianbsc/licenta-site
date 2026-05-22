import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  appointmentRequests,
  appointments,
  botReminders,
  calendarWeek,
  patients,
  serviceTariffs,
} from "./clinic-data";

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

export type AppointmentInput = {
  patient: string;
  phone?: string;
  date?: string;
  time: string;
  duration?: string;
  treatment: string;
  room?: string;
  status?: string;
};

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "cata-stoma.sqlite");
const schemaPath = path.join(process.cwd(), "db", "schema.sql");

let database: DatabaseSync | null = null;

function getDb() {
  if (!database) {
    fs.mkdirSync(dataDir, { recursive: true });
    database = new DatabaseSync(dbPath);
    database.exec("PRAGMA journal_mode = WAL;");
    database.exec("PRAGMA foreign_keys = ON;");
    database.exec(fs.readFileSync(schemaPath, "utf8"));
    seedDatabase(database);
  }

  return database;
}

function countRows(db: DatabaseSync, table: string) {
  return (db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as {
    count: number;
  }).count;
}

function seedDatabase(db: DatabaseSync) {
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
      (id, patient, phone, reason, preferred_date, status, urgency)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );

    for (const request of appointmentRequests) {
      insertRequest.run(
        request.id,
        request.patient,
        request.phone,
        request.reason,
        request.preferredDate,
        request.status,
        request.urgency,
      );
    }
  }

  if (countRows(db, "appointments") === 0) {
    const insertAppointment = db.prepare(
      `INSERT INTO appointments
      (id, patient, phone, date, time, duration, treatment, room, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    for (const appointment of appointments) {
      const patient = patients.find((item) => item.name === appointment.patient);
      insertAppointment.run(
        appointment.id,
        appointment.patient,
        patient?.phone ?? "",
        "2026-05-22",
        appointment.time,
        appointment.duration,
        appointment.treatment,
        appointment.room,
        appointment.status,
      );
    }
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

export function listPatients() {
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

export function listAppointmentRequests() {
  return getDb()
    .prepare(
      `SELECT id, patient, phone, reason, preferred_date AS preferredDate,
      status, urgency FROM appointment_requests ORDER BY created_at DESC`,
    )
    .all();
}

export function listAppointments() {
  return getDb()
    .prepare(
      `SELECT id, patient, phone, date, time, duration, treatment, room, status
      FROM appointments ORDER BY date, time`,
    )
    .all();
}

export function createAppointment(input: AppointmentInput) {
  const appointment = {
    id: `APT-${Date.now().toString().slice(-6)}`,
    patient: input.patient.trim(),
    phone: input.phone?.trim() ?? "",
    date: input.date || "2026-05-22",
    time: input.time,
    duration: input.duration || "45 min",
    treatment: input.treatment.trim(),
    room: input.room || "Cabinet 1",
    status: input.status || "Confirmata",
  };

  getDb()
    .prepare(
      `INSERT INTO appointments
      (id, patient, phone, date, time, duration, treatment, room, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      appointment.id,
      appointment.patient,
      appointment.phone,
      appointment.date,
      appointment.time,
      appointment.duration,
      appointment.treatment,
      appointment.room,
      appointment.status,
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
      `Programare noua: ${appointment.patient}`,
      `Botul va aminti de ${appointment.treatment} la ${appointment.time}, in ${appointment.room}.`,
    );

  return appointment;
}

export function getDoctorDashboard() {
  return {
    appointments: listAppointments(),
    appointmentRequests: listAppointmentRequests(),
    patients: listPatients(),
    calendarWeek,
    notifications: getDb()
      .prepare(
        `SELECT id, send_at AS time, title, detail, status
        FROM bot_notifications ORDER BY send_at`,
      )
      .all(),
  };
}

export function addChatMessage(
  sessionId: string,
  mode: string,
  role: "user" | "bot",
  message: string,
) {
  getDb()
    .prepare(
      `INSERT INTO chat_messages (session_id, mode, role, message)
      VALUES (?, ?, ?, ?)`,
    )
    .run(sessionId, mode, role, message);
}

export function answerBotQuestion(message: string, mode: "patient" | "doctor") {
  const db = getDb();
  const normalized = message.toLowerCase();
  const nextAppointment = db
    .prepare(
      `SELECT patient, phone, time, treatment, room
      FROM appointments ORDER BY date, time LIMIT 1`,
    )
    .get() as
    | { patient: string; phone: string; time: string; treatment: string; room: string }
    | undefined;

  if (mode === "doctor") {
    const requestCount = (db
      .prepare(
        "SELECT COUNT(*) AS count FROM appointment_requests WHERE status != ?",
      )
      .get("Confirmare trimisa") as { count: number }).count;

    if (normalized.includes("urm") || normalized.includes("cine")) {
      return nextAppointment
        ? `Urmatoarea programare este ${nextAppointment.patient} la ${nextAppointment.time}, pentru ${nextAppointment.treatment}, in ${nextAppointment.room}. Telefon: ${nextAppointment.phone || "necompletat"}.`
        : "Nu exista programari confirmate in baza de date.";
    }

    if (normalized.includes("cerer") || normalized.includes("urgent")) {
      const urgent = db
        .prepare(
          `SELECT patient, phone, reason FROM appointment_requests
          ORDER BY CASE urgency WHEN 'Ridicata' THEN 0 WHEN 'Normala' THEN 1 ELSE 2 END
          LIMIT 1`,
        )
        .get() as { patient: string; phone: string; reason: string } | undefined;

      return urgent
        ? `Ai ${requestCount} cereri de verificat. Prioritate: ${urgent.patient}, ${urgent.phone}, motiv: ${urgent.reason}.`
        : "Nu ai cereri noi in inbox.";
    }

    if (normalized.includes("calendar") || normalized.includes("programari")) {
      const today = db
        .prepare("SELECT time, patient, treatment FROM appointments ORDER BY time")
        .all() as { time: string; patient: string; treatment: string }[];

      return today.length
        ? `Azi ai ${today.length} programari: ${today
            .map((item) => `${item.time} ${item.patient} (${item.treatment})`)
            .join("; ")}.`
        : "Calendarul de azi este liber.";
    }

    if (normalized.includes("pacient")) {
      const patient = db
        .prepare("SELECT name, note FROM patients ORDER BY next_visit LIMIT 1")
        .get() as { name: string; note: string } | undefined;

      return patient
        ? `Am verificat fisele. Prima observatie importanta: ${patient.name} - ${patient.note}`
        : "Nu exista pacienti salvati in baza de date.";
    }

    return `Am verificat baza SQL: ${listAppointments().length} programari, ${requestCount} cereri active si ${listPatients().length} pacienti. Intreaba-ma, de exemplu: "cine urmeaza?" sau "ce cereri urgente am?".`;
  }

  if (normalized.includes("program") || normalized.includes("ora")) {
    return "Programul Cata Stoma este Luni - Vineri, 09:00 - 19:00, in Timisoara, zona Take Ionescu - Piata Badea Cartan.";
  }

  if (
    normalized.includes("pret") ||
    normalized.includes("tarif") ||
    normalized.includes("cat costa")
  ) {
    const tariffs = db
      .prepare("SELECT service, price FROM service_tariffs LIMIT 4")
      .all() as { service: string; price: string }[];

    return `Cateva tarife orientative: ${tariffs
      .map((item) => `${item.service}: ${item.price}`)
      .join("; ")}. Pretul final se confirma dupa consultatie.`;
  }

  if (normalized.includes("urgent") || normalized.includes("durere")) {
    return "Pentru durere, inflamatie sau dinte spart, scrie 'urgenta' in formular sau suna la 0724 123 123. Cererea intra prima in lista doctorului.";
  }

  if (normalized.includes("programare") || normalized.includes("vreau")) {
    return "Pentru programare, completeaza formularul de pe pagina cu nume, telefon si data preferata. Receptia confirma telefonic intervalul.";
  }

  return "Pot sa te ajut cu programari, tarife, urgente si servicii. Scrie-mi pe scurt ce te intereseaza si iti raspund din datele cabinetului.";
}
