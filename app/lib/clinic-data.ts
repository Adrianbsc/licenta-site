export const clinic = {
  name: "Cata Stoma",
  city: "Timisoara",
  area: "Take Ionescu - Piata Badea Cartan",
  phone: "0724 123 123",
  email: "contact@catastoma.ro",
  address: "Str. Simion Barnutiu 18, Timisoara",
  hours: "Luni - Vineri, 09:00 - 19:00",
};

export const services = [
  {
    name: "Consultatie completa",
    price: "de la 180 lei",
    detail:
      "Examinare, fotografii intraorale si un plan de tratament explicat pe pasi.",
  },
  {
    name: "Igienizare profesionala",
    price: "de la 250 lei",
    detail:
      "Detartraj ultrasonic, periaj si air-flow, cu recomandari simple pentru acasa.",
  },
  {
    name: "Obturatii fizionomice",
    price: "de la 300 lei",
    detail:
      "Restaurari care pastreaza cat mai mult din dintele natural si arata discret.",
  },
  {
    name: "Albire dentara",
    price: "la consult",
    detail:
      "Albire controlata, potrivita dupa verificarea smaltului si a gingiilor.",
  },
  {
    name: "Endodontie",
    price: "la consult",
    detail:
      "Tratament de canal cu izolare si verificare atenta a simptomelor.",
  },
  {
    name: "Protetica",
    price: "la consult",
    detail:
      "Coroane si lucrari gandite pentru functionalitate, nu doar pentru poza finala.",
  },
];

export const serviceTariffs = [
  {
    category: "Consultatii",
    items: [
      {
        service: "Consultatie initiala",
        detail: "Evaluare, fotografii si plan de tratament",
        duration: "45 min",
        price: "180 lei",
      },
      {
        service: "Control periodic",
        detail: "Verificare igiena, gingii si restaurari existente",
        duration: "25 min",
        price: "120 lei",
      },
    ],
  },
  {
    category: "Preventie",
    items: [
      {
        service: "Igienizare completa",
        detail: "Detartraj, periaj profesional si air-flow",
        duration: "60 min",
        price: "250 lei",
      },
      {
        service: "Profilaxie copil",
        detail: "Control bland, periaj si recomandari pentru parinti",
        duration: "30 min",
        price: "160 lei",
      },
    ],
  },
  {
    category: "Estetica",
    items: [
      {
        service: "Albire dentara",
        detail: "Albire controlata dupa evaluarea smaltului",
        duration: "75 min",
        price: "de la 650 lei",
      },
      {
        service: "Fatete ceramice",
        detail: "Plan estetic personalizat si mock-up",
        duration: "plan etapizat",
        price: "la consult",
      },
    ],
  },
  {
    category: "Tratamente",
    items: [
      {
        service: "Obturatie fizionomica",
        detail: "Restaurare discreta, adaptata culorii dintelui",
        duration: "45-60 min",
        price: "de la 300 lei",
      },
      {
        service: "Tratament endodontic",
        detail: "Tratament de canal cu izolare si verificare",
        duration: "60-90 min",
        price: "la consult",
      },
    ],
  },
];

export const signatureTreatments = [
  "Implanturi dentare",
  "Estetica dentara",
  "Aparate dentare",
  "Fatete ceramice",
  "Profilaxie",
  "Pedodontie",
  "Coroane zirconiu",
  "Urgente dentare",
];

export const caseStudies = [
  {
    title: "Reconstructie zambet lateral",
    type: "coroane ceramice si igienizare",
    result: "masticatie stabila si culoare uniforma",
  },
  {
    title: "Fatete pentru incisivi",
    type: "estetica minim invaziva",
    result: "forma naturala, fara efect de zambet artificial",
  },
  {
    title: "Plan implant premolar",
    type: "implant si coroana pe zirconiu",
    result: "integrare functionala in 3 etape",
  },
];

export const testimonials = [
  {
    name: "Andreea, 32",
    text: "Mi-a placut ca nu am simtit presiune sa aleg cel mai scump tratament. Am primit variante si timp sa decid.",
  },
  {
    name: "Mihai, 46",
    text: "Programarea a fost respectata, iar explicatiile au fost clare. Exact asta cautam la un cabinet stomatologic.",
  },
  {
    name: "Elena, 29",
    text: "Am venit pentru o urgenta si am ramas pentru planul complet. Atmosfera e calma, nu de clinica aglomerata.",
  },
];

export const doctors = [
  {
    name: "Dr. Catalin Rusu",
    role: "medic stomatolog",
    focus: "stomatologie generala si estetica",
  },
  {
    name: "Dr. Irina Pavel",
    role: "medic colaborator",
    focus: "endodontie si tratamente de urgenta",
  },
];

export const appointmentRequests = [
  {
    id: "REQ-1048",
    patient: "Mara Popescu",
    phone: "0732 445 801",
    reason: "Durere la molar, sensibilitate la rece",
    preferredDate: "23 mai, dimineata",
    status: "Noua",
    urgency: "Ridicata",
  },
  {
    id: "REQ-1049",
    patient: "Tudor Matei",
    phone: "0741 220 119",
    reason: "Consultatie pentru aparat dentar",
    preferredDate: "24 mai, dupa 16:00",
    status: "De sunat",
    urgency: "Normala",
  },
  {
    id: "REQ-1050",
    patient: "Ana Moraru",
    phone: "0728 771 335",
    reason: "Igienizare si control",
    preferredDate: "25 mai",
    status: "Confirmare trimisa",
    urgency: "Scazuta",
  },
];

export const appointments = [
  {
    id: "APT-221",
    patient: "Mara Popescu",
    time: "09:00",
    duration: "45 min",
    treatment: "Consultatie urgenta",
    room: "Cabinet 1",
    status: "Confirmata",
  },
  {
    id: "APT-222",
    patient: "Radu Dima",
    time: "10:15",
    duration: "60 min",
    treatment: "Obturatie compozit",
    room: "Cabinet 1",
    status: "Confirmata",
  },
  {
    id: "APT-223",
    patient: "Ioana Toma",
    time: "12:00",
    duration: "30 min",
    treatment: "Control post-tratament",
    room: "Cabinet 2",
    status: "In asteptare",
  },
  {
    id: "APT-224",
    patient: "Dan Sava",
    time: "16:30",
    duration: "75 min",
    treatment: "Igienizare profesionala",
    room: "Cabinet 1",
    status: "Confirmata",
  },
];

export const botReminders = [
  {
    time: "08:40",
    title: "Pregateste cabinetul pentru Mara Popescu",
    detail: "Programare la 09:00, consultatie urgenta. Verifica fisa si istoricul de sensibilitate.",
  },
  {
    time: "09:55",
    title: "Suna pacientul urmator daca intarzie prima programare",
    detail: "Radu Dima intra la 10:15. Botul poate trimite SMS automat dupa conectarea bazei de date.",
  },
  {
    time: "15:45",
    title: "Confirma igienizarea de la 16:30",
    detail: "Dan Sava are recomandare pentru control parodontal. Pregateste observatia in fisa.",
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
    note: "Preferinta pentru explicatii inainte de anestezie.",
  },
  {
    id: "P-017",
    name: "Radu Dima",
    age: 41,
    phone: "0740 112 902",
    lastVisit: "18 mai 2026",
    nextVisit: "23 mai 2026",
    tags: ["obturatie", "control 6 luni"],
    note: "Radiografie recenta in dosar.",
  },
  {
    id: "P-052",
    name: "Ioana Toma",
    age: 28,
    phone: "0755 931 400",
    lastVisit: "8 mai 2026",
    nextVisit: "23 mai 2026",
    tags: ["post-tratament"],
    note: "Urmareste evolutia sensibilitatii.",
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
  { day: "Luni", date: "18", slots: ["09:30", "13:00"] },
  { day: "Marti", date: "19", slots: ["11:00"] },
  { day: "Miercuri", date: "20", slots: ["10:00", "15:30", "17:00"] },
  { day: "Joi", date: "21", slots: ["12:30"] },
  { day: "Vineri", date: "22", slots: ["09:00", "10:15", "12:00", "16:30"] },
  { day: "Sambata", date: "23", slots: ["10:00", "11:30"] },
];

export const databaseTables = [
  {
    name: "patients",
    rows: patients.length,
    fields: ["id", "name", "age", "phone", "lastVisit", "nextVisit", "note"],
    purpose: "Profil pacient, date de contact si istoric sumar.",
  },
  {
    name: "appointment_requests",
    rows: appointmentRequests.length,
    fields: ["id", "patient", "phone", "reason", "preferredDate", "status"],
    purpose: "Cererile venite din formularul public.",
  },
  {
    name: "appointments",
    rows: appointments.length,
    fields: ["id", "patientId", "time", "duration", "treatment", "status"],
    purpose: "Programarile confirmate din calendarul medicului.",
  },
  {
    name: "treatment_notes",
    rows: 8,
    fields: ["id", "patientId", "doctorId", "date", "diagnosis", "plan"],
    purpose: "Note medicale interne si planuri de tratament.",
  },
  {
    name: "bot_notifications",
    rows: botReminders.length,
    fields: ["id", "doctorId", "appointmentId", "sendAt", "channel", "status"],
    purpose: "Alerte pentru doctor si mesaje automate catre pacienti.",
  },
  {
    name: "chat_messages",
    rows: 14,
    fields: ["id", "sessionId", "role", "message", "createdAt"],
    purpose: "Istoric conversatii intre pacient, doctor si botul AI.",
  },
];
