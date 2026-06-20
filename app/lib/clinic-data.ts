export const clinic = {
  name: "DentalClinic Timișoara",
  city: "Timișoara",
  area: "Take Ionescu - Piața Badea Cârțan",
  phone: "0732743277",
  email: "contact@dentalclinic-timisoara.ro",
  address: "Str. Simion Bărnuțiu 18, Timișoara",
  hours: "Luni - Vineri, 09:00 - 19:00",
};

export const services = [
  {
    name: "Consultație completă",
    price: "de la 180 lei",
    detail:
      "Examinare, fotografii intraorale și un plan de tratament explicat pe pași.",
  },
  {
    name: "Igienizare profesională",
    price: "de la 250 lei",
    detail:
      "Detartraj ultrasonic, periaj și air-flow, cu recomandări simple pentru acasă.",
  },
  {
    name: "Obturații fizionomice",
    price: "de la 300 lei",
    detail:
      "Restaurări care păstrează cât mai mult din dintele natural și arată discret.",
  },
  {
    name: "Albire dentară",
    price: "la consult",
    detail:
      "Albire controlată, potrivită după verificarea smalțului și a gingiilor.",
  },
  {
    name: "Endodontie",
    price: "la consult",
    detail:
      "Tratament de canal cu izolare și verificare atentă a simptomelor.",
  },
  {
    name: "Protetica",
    price: "la consult",
    detail:
      "Coroane și lucrări gândite pentru funcționalitate, nu doar pentru poza finală.",
  },
];

export const serviceTariffs = [
  {
    category: "Consultații",
    items: [
      {
        service: "Consultație inițială",
        detail: "Evaluare, fotografii și plan de tratament",
        duration: "45 min",
        price: "180 lei",
      },
      {
        service: "Control periodic",
        detail: "Verificare igienă, gingii și restaurări existente",
        duration: "25 min",
        price: "120 lei",
      },
    ],
  },
  {
    category: "Prevenție",
    items: [
      {
        service: "Igienizare completă",
        detail: "Detartraj, periaj profesional și air-flow",
        duration: "60 min",
        price: "250 lei",
      },
      {
        service: "Profilaxie copil",
        detail: "Control blând, periaj și recomandări pentru părinți",
        duration: "30 min",
        price: "160 lei",
      },
    ],
  },
  {
    category: "Estetică",
    items: [
      {
        service: "Albire dentară",
        detail: "Albire controlată după evaluarea smalțului",
        duration: "75 min",
        price: "de la 650 lei",
      },
      {
        service: "Fațete ceramice",
        detail: "Plan estetic personalizat și mock-up",
        duration: "plan etapizat",
        price: "la consult",
      },
    ],
  },
  {
    category: "Tratamente",
    items: [
      {
        service: "Obturație fizionomică",
        detail: "Restaurare discretă, adaptată culorii dintelui",
        duration: "45-60 min",
        price: "de la 300 lei",
      },
      {
        service: "Tratament endodontic",
        detail: "Tratament de canal cu izolare și verificare",
        duration: "60-90 min",
        price: "la consult",
      },
    ],
  },
];

export const signatureTreatments = [
  "Implanturi dentare",
  "Estetică dentară",
  "Aparate dentare",
  "Fațete ceramice",
  "Profilaxie",
  "Pedodontie",
  "Coroane zirconiu",
  "Urgențe dentare",
];

export const caseStudies = [
  {
    title: "Reconstrucție de zâmbet",
    type: "coroane ceramice și igienizare",
    result: "masticație stabilă și culoare uniformă",
  },
  {
    title: "Fațete pentru incisivi",
    type: "estetică minim invazivă",
    result: "formă naturală, fără efect de zâmbet artificial",
  },
  {
    title: "Plan implant premolar",
    type: "implant și coroană pe zirconiu",
    result: "integrare funcțională în 3 etape",
  },
];

export const testimonials = [
  {
    name: "Andreea, 32",
    text: "Mi-a plăcut că nu am simțit presiune să aleg cel mai scump tratament. Am primit variante și timp să decid.",
  },
  {
    name: "Mihai, 46",
    text: "Programarea a fost respectată, iar explicațiile au fost clare. Exact asta căutam la un cabinet stomatologic.",
  },
  {
    name: "Elena, 29",
    text: "Am venit pentru o urgență și am rămas pentru planul complet. Atmosfera e calmă, nu de clinică aglomerată.",
  },
];

export const doctors = [
  {
    name: "Dr. Catalin Rusu",
    role: "medic stomatolog",
    focus: "stomatologie generală și estetică",
  },
  {
    name: "Dr. Irina Pavel",
    role: "medic colaborator",
    focus: "endodonție și tratamente de urgență",
  },
];

export const appointmentRequests = [
  {
    id: "REQ-1048",
    patient: "Mara Popescu",
    phone: "0732 445 801",
    email: "mara.popescu@example.com",
    reason: "Durere la molar, sensibilitate la rece",
    preferredDate: "23 mai, dimineața",
    status: "Nouă",
    urgency: "Ridicată",
  },
  {
    id: "REQ-1049",
    patient: "Tudor Matei",
    phone: "0741 220 119",
    email: "tudor.matei@example.com",
    reason: "Consultație pentru aparat dentar",
    preferredDate: "24 mai, după 16:00",
    status: "De sunat",
    urgency: "Normală",
  },
  {
    id: "REQ-1050",
    patient: "Ana Moraru",
    phone: "0728 771 335",
    email: "ana.moraru@example.com",
    reason: "Igienizare și control",
    preferredDate: "25 mai",
    status: "Confirmare trimisă",
    urgency: "Scăzută",
  },
];

export const appointments = [
  {
    id: "APT-221",
    patient: "Mara Popescu",
    time: "09:00",
    duration: "45 min",
    treatment: "Consultație urgentă",
    room: "Cabinet 1",
    status: "Confirmată",
  },
  {
    id: "APT-222",
    patient: "Radu Dima",
    time: "10:15",
    duration: "60 min",
    treatment: "Obturatie compozit",
    room: "Cabinet 1",
    status: "Confirmată",
  },
  {
    id: "APT-223",
    patient: "Ioana Toma",
    time: "12:00",
    duration: "30 min",
    treatment: "Control post-tratament",
    room: "Cabinet 2",
    status: "În așteptare",
  },
  {
    id: "APT-224",
    patient: "Dan Sava",
    time: "16:30",
    duration: "75 min",
    treatment: "Igienizare profesională",
    room: "Cabinet 1",
    status: "Confirmată",
  },
];

export const botReminders = [
  {
    time: "08:40",
    title: "Pregătește cabinetul pentru Mara Popescu",
    detail: "Programare la 09:00, consultație urgentă. Verifică fișa și istoricul de sensibilitate.",
  },
  {
    time: "09:55",
    title: "Sună pacientul următor dacă întârzie prima programare",
    detail: "Radu Dima intră la 10:15. Asistentul poate trimite SMS automat după conectarea bazei de date.",
  },
  {
    time: "15:45",
    title: "Confirmă igienizarea de la 16:30",
    detail: "Dan Sava are recomandare pentru control parodontal. Pregătește observația în fișă.",
  },
];

export const patients = [
  {
    id: "P-031",
    name: "Mara Popescu",
    age: 34,
    phone: "0732 445 801",
    lastVisit: "12 apr 2026",
    nextVisit: "23 mai 2026",
    tags: ["sensibilitate", "anxietate"],
    note: "Preferință pentru explicații înainte de anestezie.",
  },
  {
    id: "P-017",
    name: "Radu Dima",
    age: 41,
    phone: "0740 112 902",
    lastVisit: "18 mai 2026",
    nextVisit: "23 mai 2026",
    tags: ["obturatie", "control 6 luni"],
    note: "Radiografie recentă în dosar.",
  },
  {
    id: "P-052",
    name: "Ioana Toma",
    age: 28,
    phone: "0755 931 400",
    lastVisit: "8 mai 2026",
    nextVisit: "23 mai 2026",
    tags: ["post-tratament"],
    note: "Urmărește evoluția sensibilității.",
  },
  {
    id: "P-009",
    name: "Dan Sava",
    age: 50,
    phone: "0729 330 118",
    lastVisit: "2 feb 2026",
    nextVisit: "23 mai 2026",
    tags: ["igienizare", "fumator"],
    note: "Recomandat control parodontal.",
  },
];

export const calendarWeek = [
  { day: "Luni", date: "22", slots: ["09:30", "13:00"] },
  { day: "Marți", date: "23", slots: ["11:00"] },
  { day: "Miercuri", date: "24", slots: ["10:00", "15:30", "17:00"] },
  { day: "Joi", date: "25", slots: ["12:30"] },
  { day: "Vineri", date: "26", slots: ["09:00", "10:15", "12:00", "16:30"] },
  { day: "Sâmbătă", date: "27", slots: ["10:00", "11:30"] },
];

export const databaseTables = [
  {
    name: "patients",
    rows: patients.length,
    fields: ["id", "name", "age", "phone", "lastVisit", "nextVisit", "note"],
    purpose: "Profil pacient, date de contact și istoric sumar.",
  },
  {
    name: "appointment_requests",
    rows: appointmentRequests.length,
    fields: ["id", "patient", "phone", "email", "reason", "preferredDate", "status"],
    purpose: "Cererile venite din formularul public.",
  },
  {
    name: "appointments",
    rows: appointments.length,
    fields: ["id", "patientId", "time", "duration", "treatment", "status"],
    purpose: "Programările confirmate din calendarul medicului.",
  },
  {
    name: "reviews",
    rows: testimonials.length,
    fields: ["id", "name", "rating", "treatment", "text", "status"],
    purpose: "Recenziile publice salvate din pagina principală.",
  },
  {
    name: "treatment_notes",
    rows: 8,
    fields: ["id", "patientId", "doctorId", "date", "diagnosis", "plan"],
    purpose: "Note medicale interne și planuri de tratament.",
  },
  {
    name: "bot_notifications",
    rows: botReminders.length,
    fields: ["id", "doctorId", "appointmentId", "sendAt", "channel", "status"],
    purpose: "Alerte pentru doctor și mesaje automate către pacienți.",
  },
  {
    name: "chat_messages",
    rows: 14,
    fields: ["id", "sessionId", "role", "message", "createdAt"],
    purpose: "Istoric conversații între pacient, doctor și asistentul de cabinet.",
  },
];
