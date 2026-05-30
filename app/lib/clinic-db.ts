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
  date: string;
  time: string;
  duration: string;
  treatment: string;
  room: string;
  status: string;
};

export type AppointmentRequest = {
  id: string;
  patient: string;
  phone: string;
  reason: string;
  preferredDate: string;
  status: string;
  urgency: string;
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
  date?: string;
  time: string;
  duration?: string;
  treatment: string;
  room?: string;
  status?: string;
};

export type AppointmentRequestInput = {
  patient: string;
  phone: string;
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

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "cata-stoma.sqlite");
const schemaPath = path.join(process.cwd(), "db", "schema.sql");

let database: DatabaseSync | null = null;
let mongoSeeded = false;

function getDb() {
  if (!database) {
    fs.mkdirSync(dataDir, { recursive: true });
    database = new DatabaseSync(dbPath);
    database.exec("PRAGMA journal_mode = WAL;");
    database.exec("PRAGMA foreign_keys = ON;");
    database.exec(fs.readFileSync(schemaPath, "utf8"));
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

function getUrgency(input: AppointmentRequestInput) {
  const haystack = `${input.service ?? ""} ${input.message ?? ""}`.toLowerCase();
  return haystack.includes("urgent") || haystack.includes("durere")
    ? "Ridicata"
    : "Normala";
}

function getReason(input: AppointmentRequestInput) {
  const service = input.service?.trim() || "Programare";
  const message = input.message?.trim();

  return message ? `${service}: ${message}` : service;
}

function toPlain<T extends object>(item: T) {
  return { ...item };
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
          date: "2026-05-22",
        };
      }),
    );
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
      `SELECT id, patient, phone, reason, preferred_date AS preferredDate,
      status, urgency FROM appointment_requests ORDER BY created_at DESC`,
    )
    .all() as AppointmentRequest[]).map(toPlain);
}

function listSqliteAppointments() {
  return (getDb()
    .prepare(
      `SELECT id, patient, phone, date, time, duration, treatment, room, status
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
    date: input.date || new Date().toISOString().slice(0, 10),
    time: input.time,
    duration: input.duration || "45 min",
    treatment: input.treatment.trim(),
    room: input.room || "Cabinet 1",
    status: input.status || "Confirmată",
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
      `Botul va aminti de ${appointment.treatment} la ${appointment.time}, în ${appointment.room}.`,
    );

  return appointment;
}

function cancelSqliteAppointment(id: string) {
  getDb()
    .prepare("UPDATE appointments SET status = ? WHERE id = ?")
    .run("Anulată", id);

  const appointment =
    getDb()
      .prepare(
        `SELECT id, patient, phone, date, time, duration, treatment, room, status
        FROM appointments WHERE id = ?`,
      )
      .get(id) as Appointment | undefined;

  return appointment ? toPlain(appointment) : null;
}

function createSqliteAppointmentRequest(input: AppointmentRequestInput) {
  const request: AppointmentRequest = {
    id: createId("REQ"),
    patient: input.patient.trim(),
    phone: input.phone.trim(),
    reason: getReason(input),
    preferredDate: input.preferredDate || "Cât mai curând",
    status: "Nouă",
    urgency: getUrgency(input),
  };

  getDb()
    .prepare(
      `INSERT INTO appointment_requests
      (id, patient, phone, reason, preferred_date, status, urgency)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      request.id,
      request.patient,
      request.phone,
      request.reason,
      request.preferredDate,
      request.status,
      request.urgency,
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
      return (await mongoDb
        .collection("appointment_requests")
        .find({}, { projection: { _id: 0 } })
        .sort({ id: -1 })
        .toArray()) as unknown as AppointmentRequest[];
    },
    listSqliteAppointmentRequests,
  );
}

export async function listAppointments() {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      return (await mongoDb
        .collection("appointments")
        .find({}, { projection: { _id: 0 } })
        .sort({ date: 1, time: 1 })
        .toArray()) as unknown as Appointment[];
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
        date: input.date || new Date().toISOString().slice(0, 10),
        time: input.time,
        duration: input.duration || "45 min",
        treatment: input.treatment.trim(),
        room: input.room || "Cabinet 1",
        status: input.status || "Confirmată",
      };

      await mongoDb.collection("appointments").insertOne(appointment);
      await mongoDb.collection("bot_notifications").insertOne({
        id: createId("NOT"),
        doctorId: "doctor-catalin",
        appointmentId: appointment.id,
        time: appointment.time,
        channel: "dashboard",
        status: "pending",
        title: `Programare noua: ${appointment.patient}`,
        detail: `Botul va aminti de ${appointment.treatment} la ${appointment.time}, în ${appointment.room}.`,
      });

      return appointment;
    },
    () => createSqliteAppointment(input),
  );
}

export async function cancelAppointment(id: string) {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      const appointmentsCollection = mongoDb.collection("appointments");
      const result = await appointmentsCollection.updateOne(
        { id },
        { $set: { status: "Anulată" } },
      );

      if (result.matchedCount === 0) {
        return null;
      }

      return (await appointmentsCollection.findOne(
        { id },
        { projection: { _id: 0 } },
      )) as unknown as Appointment | null;
    },
    () => cancelSqliteAppointment(id),
  );
}

export async function createAppointmentRequest(input: AppointmentRequestInput) {
  return withStore(
    async () => {
      const mongoDb = await getMongoDb();
      const request: AppointmentRequest = {
        id: createId("REQ"),
        patient: input.patient.trim(),
        phone: input.phone.trim(),
        reason: getReason(input),
        preferredDate: input.preferredDate || "Cât mai curând",
        status: "Nouă",
        urgency: getUrgency(input),
      };

      await mongoDb.collection("appointment_requests").insertOne(request);
      return request;
    },
    () => createSqliteAppointmentRequest(input),
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
        ? `Azi ai ${dashboardAppointments.length} programari: ${dashboardAppointments
            .map((item) => `${item.time} ${item.patient} (${item.treatment})`)
            .join("; ")}.`
        : "Calendarul de azi este liber.";
    }

    if (normalized.includes("pacient")) {
      const patient = dashboardPatients[0];

      return patient
        ? `Am verificat fisele. Prima observatie importanta: ${patient.name} - ${patient.note}`
        : "Nu există pacienți salvați în baza de date.";
    }

    return `Am verificat baza: ${dashboardAppointments.length} programări, ${requestCount} cereri active și ${dashboardPatients.length} pacienți. Întreabă-mă, de exemplu: „cine urmează?” sau „ce cereri urgente am?”.`;
  }

  if (normalized.includes("program") || normalized.includes("ora")) {
    return "Programul Cata Stoma este Luni - Vineri, 09:00 - 19:00, în Timișoara, zona Take Ionescu - Piața Badea Cârțan.";
  }

  if (
    normalized.includes("pret") ||
    normalized.includes("tarif") ||
    normalized.includes("cat costa")
  ) {
    const tariffs = serviceTariffs
      .flatMap((group) => group.items)
      .slice(0, 4);

    return `Cateva tarife orientative: ${tariffs
      .map((item) => `${item.service}: ${item.price}`)
      .join("; ")}. Prețul final se confirmă după consultație.`;
  }

  if (normalized.includes("urgent") || normalized.includes("durere")) {
    return "Pentru durere, inflamație sau dinte spart, scrie „urgență” în formular sau sună la 0724 123 123. Cererea intră prima în lista doctorului.";
  }

  if (normalized.includes("programare") || normalized.includes("vreau")) {
    return "Pentru programare, completează formularul de pe pagină cu nume, telefon și data preferată. Recepția confirmă telefonic intervalul.";
  }

  return "Pot să te ajut cu programări, tarife, urgențe și servicii. Scrie-mi pe scurt ce te interesează și îți răspund din datele cabinetului.";
}
