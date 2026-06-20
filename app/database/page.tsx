import Link from "next/link";
import {
  appointmentRequests,
  appointments,
  databaseTables,
  patients,
} from "../lib/clinic-data";

const dbPlan = [
  "Formularul public creează o cerere în appointment_requests.",
  "Doctorul confirmă cererea și se creează o înregistrare în appointments.",
  "Pacientul are profil în patients, cu istoric și observații.",
  "După consultație se adaugă nota în treatment_notes.",
  "Recenziile pacienților sunt publicate în reviews.",
  "Asistentul de cabinet citește calendarul și creează alerte în bot_notifications.",
  "Conversațiile rămân în chat_messages pentru continuitate.",
];

export default function DatabasePage() {
  return (
    <main className="min-h-screen bg-[#f3faf7] text-[#151a18]">
      <header className="relative overflow-hidden border-b border-[#d8eee9] bg-[#17322e] text-white">
        <div className="fine-grid absolute inset-0 opacity-20" />
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#a8e1d7]">
                Database blueprint
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-5xl">
                Datele care tin cabinetul ordonat
              </h1>
            </div>
            <nav className="flex flex-wrap gap-3 text-sm font-black">
              <Link
                className="rounded-full border border-white/20 px-4 py-2"
                href="/"
              >
                Site public
              </Link>
              <Link
                className="rounded-full bg-white px-4 py-2 text-[#17322e]"
                href="/doctor"
              >
                Panou doctor
              </Link>
            </nav>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-white/68">
            Datele folosesc MongoDB când există MONGODB_URI în environment. Dacă
            lipsește parola sau URL-ul complet al clusterului, aplicația rămâne
            funcțională pe SQLite local: schema este în db/schema.sql, iar
            fisierul bazei este data/cata-stoma.sqlite.
          </p>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10">
        <div className="grid gap-4">
          {databaseTables.map((table) => (
            <article
              className="soft-card interactive-card rounded-lg p-5"
              key={table.name}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-mono text-xl font-black">{table.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#66756f]">
                    {table.purpose}
                  </p>
                </div>
                <span className="rounded-full bg-[#eef8f5] px-3 py-1 text-xs font-black text-[#176f65]">
                  {table.rows} rânduri
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {table.fields.map((field) => (
                  <span
                    className="rounded-full bg-[#eef3f0] px-3 py-1 font-mono text-xs font-bold text-[#2d7a74]"
                    key={field}
                  >
                    {field}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <aside className="grid h-fit gap-6 lg:sticky lg:top-6">
          <section className="soft-card rounded-lg p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2d7a74]">
              Flux recomandat
            </p>
            <h2 className="mt-2 text-2xl font-black">Cum circulă datele</h2>
            <p className="mt-2 text-sm leading-6 text-[#66756f]">
              Asistentul de cabinet citește aceleași tabele ca panoul doctorului.
              Când adaugi manual o programare, API-ul salvează în baza activă și
              creează automat o alertă internă.
            </p>
            <div className="mt-5 grid gap-3">
              {dbPlan.map((step, index) => (
                <div
                  className="grid grid-cols-[38px_1fr] items-start gap-3 rounded-lg bg-[#f7fbfa] p-3"
                  key={step}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#17322e] text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm font-bold leading-6 text-[#3c4541]">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#17322e] bg-[#17322e] p-5 text-white shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a8e1d7]">
              Snapshot intern
            </p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-lg bg-white/[.08] p-4">
                <p className="font-black">Pacienți</p>
                <p className="mt-1 text-sm leading-6 text-white/68">
                  {patients.map((patient) => patient.name).join(", ")}
                </p>
              </div>
              <div className="rounded-lg bg-white/[.08] p-4">
                <p className="font-black">Programări</p>
                <p className="mt-1 text-sm leading-6 text-white/68">
                  {appointments
                    .map(
                      (appointment) =>
                        `${appointment.time} - ${appointment.patient}`,
                    )
                    .join(" | ")}
                </p>
              </div>
              <div className="rounded-lg bg-white/[.08] p-4">
                <p className="font-black">Cereri</p>
                <p className="mt-1 text-sm leading-6 text-white/68">
                  {appointmentRequests
                    .map((request) => `${request.id} - ${request.patient}`)
                    .join(" | ")}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
