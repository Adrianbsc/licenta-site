"use client";

import { useEffect, useMemo, useState } from "react";
import ClinicBot from "./ClinicBot";

type Appointment = {
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

type AppointmentRequest = {
  id: string;
  patient: string;
  phone: string;
  reason: string;
  preferredDate: string;
  status: string;
  urgency: string;
};

type Patient = {
  id: string;
  name: string;
  age: number;
  phone: string;
  nextVisit: string;
  note: string;
  tags: string[];
};

type CalendarDay = {
  day: string;
  date: string;
  slots: string[];
};

type DashboardData = {
  appointments: Appointment[];
  appointmentRequests: AppointmentRequest[];
  patients: Patient[];
  calendarWeek: CalendarDay[];
};

const emptyForm = {
  patient: "",
  phone: "",
  date: "2026-05-22",
  time: "",
  duration: "45 min",
  treatment: "",
  room: "Cabinet 1",
};

const fieldClass =
  "rounded-lg border border-[#cde7e1] bg-white/92 px-4 py-3 font-medium outline-none focus:border-[#2d8d7f]";

export default function DoctorDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/doctor-dashboard", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status === 401) {
          window.location.assign("/login-doctor");
          return null;
        }

        if (!response.ok) {
          throw new Error("Dashboard request failed.");
        }

        return response.json() as Promise<DashboardData>;
      })
      .then((nextData) => {
        if (!controller.signal.aborted && nextData) {
          setData(nextData);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setMessage("Nu pot încărca agenda din baza de date.");
        }
      });

    return () => controller.abort();
  }, []);

  const stats = useMemo(() => {
    const appointments =
      data?.appointments.filter(
        (item) => !["Anulata", "Anulată"].includes(item.status),
      ).length ?? 0;
    const requests =
      data?.appointmentRequests.filter(
        (item) => !["Confirmare trimisa", "Confirmare trimisă"].includes(item.status),
      ).length ?? 0;
    const patients = data?.patients.length ?? 0;

    return [
      ["Azi", appointments.toString(), "programări confirmate"],
      ["Inbox", requests.toString(), "cereri de sunat"],
      ["Pacienți", patients.toString(), "fișe active"],
      ["Ocupare", appointments ? "78%" : "0%", "din ziua curenta"],
    ];
  }, [data]);

  const nextActiveAppointmentId = useMemo(
    () =>
      data?.appointments.find(
        (item) => !["Anulata", "Anulată"].includes(item.status),
      )?.id,
    [data],
  );

  async function addAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.status === 401) {
        window.location.assign("/login-doctor");
        return;
      }

      const payload = (await response.json()) as {
        appointment?: Appointment;
        error?: string;
      };

      if (!response.ok || !payload.appointment) {
        setMessage(payload.error ?? "Nu am putut salva programarea.");
        return;
      }

      setData((current) =>
        current
          ? {
              ...current,
              appointments: [...current.appointments, payload.appointment!].sort(
                (a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
              ),
            }
          : current,
      );
      setForm(emptyForm);
      setMessage("Programarea a fost salvată și asistentul a primit alertă.");
    } catch {
      setMessage("Nu pot salva acum. Verifică dacă serverul rulează.");
    } finally {
      setIsSaving(false);
    }
  }

  async function cancelExistingAppointment(id: string) {
    setCancellingId(id);
    setMessage("");

    try {
      const response = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "cancel" }),
      });

      if (response.status === 401) {
        window.location.assign("/login-doctor");
        return;
      }

      const payload = (await response.json()) as {
        appointment?: Appointment;
        error?: string;
      };

      if (!response.ok || !payload.appointment) {
        setMessage(payload.error ?? "Nu am putut anula programarea.");
        return;
      }

      setData((current) =>
        current
          ? {
              ...current,
              appointments: current.appointments.map((appointment) =>
                appointment.id === id ? payload.appointment! : appointment,
              ),
            }
          : current,
      );
      setMessage("Programarea a fost anulată.");
    } catch {
      setMessage("Nu pot anula acum. Verifică dacă serverul rulează.");
    } finally {
      setCancellingId("");
    }
  }

  async function logout() {
    await fetch("/api/auth/doctor-logout", { method: "POST" });
    window.location.assign("/login-doctor");
  }

  return (
    <>
      <header className="relative overflow-hidden border-b border-[#d8eee9] bg-[#edf8f5] text-[#17322e]">
        <div className="fine-grid absolute inset-0 opacity-70" />
        <div className="absolute right-[-8rem] top-[-10rem] h-80 w-80 rounded-full bg-[#cdeee7] blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-7 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#248176]">
                Dashboard doctor
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-5xl">
                Agenda Cata Stoma
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#617873]">
                Programări, cereri și fișe scurte într-un tablou de lucru ușor
                de scanat între consultații.
              </p>
            </div>
            <button
              className="rounded-full border border-[#b7ded7] bg-white/88 px-5 py-3 text-sm font-black text-[#248176] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[#62b6a7]"
              onClick={logout}
              type="button"
            >
              Logout
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(([label, value, detail]) => (
              <div
                className="soft-card interactive-card rounded-lg p-4"
                key={label}
              >
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7d948f]">
                  {label}
                </p>
                <p className="mt-2 text-4xl font-black text-[#248176]">
                  {value}
                </p>
                <p className="mt-1 text-sm text-[#647a75]">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[1.28fr_.72fr] lg:px-10">
        <div className="grid gap-6">
          <section className="soft-card rounded-lg p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
                  Lista zilei
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Programări confirmate
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {!data
                ? [0, 1, 2].map((item) => (
                    <div
                      className="animate-pulse rounded-lg border border-[#d8eee9] bg-[#f7fbfa] p-4"
                      key={item}
                    >
                      <div className="h-4 w-28 rounded-full bg-[#d8eee9]" />
                      <div className="mt-4 h-3 w-2/3 rounded-full bg-[#e7f3f0]" />
                    </div>
                  ))
                : null}
              {data && data.appointments.length === 0 ? (
                <p className="rounded-lg bg-[#f7fbfa] p-4 text-sm font-bold text-[#617873] ring-1 ring-[#d8eee9]">
                  Nu există programări confirmate pentru intervalul curent.
                </p>
              ) : null}
              {(data?.appointments ?? []).map((appointment) => (
                <article
                  className="interactive-card grid gap-4 rounded-lg border border-[#d8eee9] bg-[#f7fbfa] p-4 md:grid-cols-[96px_1fr_130px_auto]"
                  key={appointment.id}
                >
                  <div className="rounded-lg bg-white p-3 text-center ring-1 ring-[#d8eee9]">
                    <p className="text-2xl font-black text-[#248176]">
                      {appointment.time}
                    </p>
                    <p className="text-xs font-black text-[#647a75]">
                      {appointment.duration}
                    </p>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black">{appointment.patient}</h3>
                      {appointment.id === nextActiveAppointmentId ? (
                        <span className="rounded-full bg-[#fff3cf] px-2 py-1 text-xs font-black text-[#8a6511]">
                          următorul
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-[#647a75]">
                      {appointment.treatment} - {appointment.room}
                    </p>
                    <p className="mt-2 text-xs font-bold text-[#248176]">
                      Reminder intern: notifică medicul înainte de programare.
                    </p>
                  </div>
                  <span className="h-fit rounded-full bg-white px-3 py-2 text-center text-xs font-black text-[#248176] ring-1 ring-[#cde7e1]">
                    {appointment.status}
                  </span>
                  <button
                    className="h-fit rounded-full border border-[#f1c7c7] bg-white px-4 py-2 text-xs font-black text-[#a33b3b] transition hover:bg-[#fff1f1] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={
                      ["Anulata", "Anulată"].includes(appointment.status) ||
                      cancellingId === appointment.id
                    }
                    onClick={() => cancelExistingAppointment(appointment.id)}
                    type="button"
                  >
                    {cancellingId === appointment.id ? "Se anulează" : "Anulează"}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="soft-card rounded-lg p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
              Adaugă manual
            </p>
            <h2 className="mt-2 text-2xl font-black">Programare nouă</h2>
            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={addAppointment}>
              {[
                ["patient", "Pacient", "Mara Popescu"],
                ["phone", "Telefon", "07xx xxx xxx"],
                ["time", "Ora", "14:30"],
                ["duration", "Durata", "45 min"],
                ["treatment", "Tratament", "Consultatie"],
                ["room", "Cabinet", "Cabinet 1"],
              ].map(([name, label, placeholder]) => (
                <label className="grid gap-2 text-sm font-black" key={name}>
                  {label}
                  <input
                    className={fieldClass}
                    name={name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [name]: event.target.value,
                      }))
                    }
                    placeholder={placeholder}
                    required={name === "patient" || name === "time" || name === "treatment"}
                    value={form[name as keyof typeof form]}
                  />
                </label>
              ))}
              <label className="grid gap-2 text-sm font-black">
                Data
                <input
                  className={fieldClass}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, date: event.target.value }))
                  }
                  type="date"
                  value={form.date}
                />
              </label>
              <button
                className="button-sheen self-end rounded-full bg-[#2d8d7f] px-5 py-4 text-sm font-black text-white shadow-[0_16px_38px_rgba(45,141,127,.2)] transition hover:-translate-y-0.5 hover:bg-[#176f65] disabled:opacity-50"
                disabled={isSaving}
                type="submit"
              >
                Salvează programarea
              </button>
            </form>
            {message ? (
              <p className="mt-4 rounded-lg bg-[#eef8f5] p-3 text-sm font-bold text-[#248176]">
                {message}
              </p>
            ) : null}
          </section>

          <section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
            <div className="soft-card rounded-lg p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
                Calendar
              </p>
              <h2 className="mt-2 text-2xl font-black">Săptămâna curentă</h2>
              <div className="mt-5 grid gap-3">
                {(data?.calendarWeek ?? []).map((day) => (
                  <div
                    className="interactive-card rounded-lg border border-[#d8eee9] bg-[#f7fbfa] p-4"
                    key={day.day}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-black">
                        {day.day}, {day.date}
                      </p>
                      <p className="text-xs font-black text-[#647a75]">
                        {day.slots.length} sloturi
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {day.slots.map((slot) => (
                        <span
                          className="rounded-full bg-white px-3 py-2 text-xs font-black text-[#17322e] ring-1 ring-[#d8eee9]"
                          key={slot}
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="soft-card rounded-lg p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
                Pacienți
              </p>
              <h2 className="mt-2 text-2xl font-black">Fișe rapide</h2>
              <div className="mt-5 grid gap-3">
                {(data?.patients ?? []).map((patient) => (
                  <article
                    className="interactive-card rounded-lg border border-[#d8eee9] bg-[#f7fbfa] p-4"
                    key={patient.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black">{patient.name}</h3>
                        <p className="mt-1 text-sm text-[#647a75]">
                          {patient.phone} - {patient.age} ani
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#248176] ring-1 ring-[#d8eee9]">
                        {patient.id}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#314d48]">
                      {patient.note}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {patient.tags.map((tag) => (
                        <span
                          className="rounded-full bg-[#eef8f5] px-3 py-1 text-xs font-black text-[#248176]"
                          key={tag}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="grid h-fit gap-6 lg:sticky lg:top-6">
          <ClinicBot mode="doctor" />

          <section className="soft-card rounded-lg p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
              Inbox programări
            </p>
            <h2 className="mt-2 text-2xl font-black">Cereri noi</h2>
            <div className="mt-5 grid gap-3">
              {!data ? (
                <div className="animate-pulse rounded-lg border border-[#d8eee9] bg-[#f7fbfa] p-4">
                  <div className="h-4 w-32 rounded-full bg-[#d8eee9]" />
                  <div className="mt-4 h-3 w-full rounded-full bg-[#e7f3f0]" />
                </div>
              ) : null}
              {data && data.appointmentRequests.length === 0 ? (
                <p className="rounded-lg bg-[#f7fbfa] p-4 text-sm font-bold text-[#617873] ring-1 ring-[#d8eee9]">
                  Nu sunt cereri noi în inbox.
                </p>
              ) : null}
              {(data?.appointmentRequests ?? []).map((request) => (
                <article
                  className="interactive-card rounded-lg border border-[#d8eee9] bg-[#f7fbfa] p-4"
                  key={request.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{request.patient}</p>
                      <p className="mt-1 text-sm text-[#647a75]">
                        {request.phone}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#fff3cf] px-2 py-1 text-xs font-black text-[#8a6511]">
                      {request.urgency}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#314d48]">
                    {request.reason}
                  </p>
                  <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs font-black text-[#647a75]">
                    <span>{request.preferredDate}</span>
                    <span>{request.status}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </>
  );
}
