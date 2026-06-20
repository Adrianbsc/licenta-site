"use client";

import { useEffect, useMemo, useState } from "react";
import ClinicBot from "./ClinicBot";

type Appointment = {
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

type AppointmentRequest = {
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

type StaffPermission =
  | "manageAppointments"
  | "manageRequests"
  | "viewPatients"
  | "manageUsers";

type StaffRole = "doctor" | "assistant";

type StaffUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: StaffRole;
  permissions: StaffPermission[];
  active: boolean;
  createdAt: string;
};

type OutboundEmail = {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  status: string;
  relatedId: string;
  createdAt: string;
};

type DashboardData = {
  appointments: Appointment[];
  appointmentRequests: AppointmentRequest[];
  patients: Patient[];
  calendarWeek: CalendarDay[];
  currentUser: StaffUser;
  staffUsers: StaffUser[];
  outboundEmails: OutboundEmail[];
};

const today = new Date().toISOString().slice(0, 10);

const emptyAppointmentForm = {
  patient: "",
  phone: "",
  email: "",
  date: today,
  time: "",
  duration: "45 min",
  treatment: "",
  room: "Cabinet 1",
  notes: "",
};

const emptyStaffForm = {
  name: "",
  username: "",
  email: "",
  password: "",
  role: "assistant" as StaffRole,
};

const fieldClass =
  "rounded-lg border border-[#cde7e1] bg-white/92 px-4 py-3 font-medium outline-none focus:border-[#2d8d7f]";

const permissionLabels: Record<StaffPermission, string> = {
  manageAppointments: "Programări",
  manageRequests: "Cereri",
  viewPatients: "Pacienți",
  manageUsers: "Conturi",
};

const permissions = Object.keys(permissionLabels) as StaffPermission[];

function isCancelled(status: string) {
  return ["Anulata", "Anulată"].includes(status);
}

function isOpenRequest(status: string) {
  return !["Acceptată", "Refuzată", "Programată"].includes(status);
}

function sortAppointments(items: Appointment[]) {
  return [...items].sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
  );
}

function calendarDateValue(day: CalendarDay) {
  return `2026-06-${day.date.padStart(2, "0")}`;
}

function requestStatusStyle(status: string) {
  if (status === "Programată") {
    return "bg-[#e8f7f3] text-[#176f65] ring-[#62b6a7]";
  }

  if (status === "Acceptată") {
    return "bg-[#e8f7f3] text-[#176f65] ring-[#9ed9ce]";
  }

  if (status === "Refuzată") {
    return "bg-[#fff1f1] text-[#a33b3b] ring-[#f1c7c7]";
  }

  if (status === "Văzută") {
    return "bg-[#eef7fb] text-[#296f8f] ring-[#c7e4f1]";
  }

  return "bg-white text-[#248176] ring-[#d8eee9]";
}

export default function DoctorDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [appointmentForm, setAppointmentForm] = useState(emptyAppointmentForm);
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [message, setMessage] = useState("");
  const [isSavingAppointment, setIsSavingAppointment] = useState(false);
  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const [appointmentActionId, setAppointmentActionId] = useState("");
  const [requestActionId, setRequestActionId] = useState("");
  const [staffActionId, setStaffActionId] = useState("");
  const [selectedSchedulingRequestId, setSelectedSchedulingRequestId] =
    useState("");
  const [isSchedulingPopupOpen, setIsSchedulingPopupOpen] = useState(false);

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

  const can = (permission: StaffPermission) =>
    Boolean(data?.currentUser.permissions.includes(permission));

  const activeAppointments = useMemo(
    () => (data?.appointments ?? []).filter((item) => !isCancelled(item.status)),
    [data?.appointments],
  );

  const openRequests = useMemo(
    () =>
      (data?.appointmentRequests ?? []).filter((request) =>
        isOpenRequest(request.status),
      ),
    [data?.appointmentRequests],
  );
  const urgentRequests = useMemo(
    () =>
      (data?.appointmentRequests ?? []).filter((request) =>
        ["Ridicata", "Ridicată"].includes(request.urgency),
      ),
    [data?.appointmentRequests],
  );
  const occupiedSlots = useMemo(
    () =>
      new Set(
        activeAppointments.map(
          (appointment) => `${appointment.date}|${appointment.time}`,
        ),
      ),
    [activeAppointments],
  );
  const availableSlots = useMemo(
    () =>
      (data?.calendarWeek ?? []).reduce(
        (sum, day) =>
          sum +
          day.slots.filter(
            (slot) => !occupiedSlots.has(`${calendarDateValue(day)}|${slot}`),
          ).length,
        0,
      ),
    [data?.calendarWeek, occupiedSlots],
  );

  const nextActiveAppointmentId = activeAppointments[0]?.id;
  const selectedSchedulingRequest = useMemo(
    () =>
      data?.appointmentRequests.find(
        (request) => request.id === selectedSchedulingRequestId,
      ) ?? null,
    [data?.appointmentRequests, selectedSchedulingRequestId],
  );

  const stats = [
    ["Azi", activeAppointments.length.toString(), "programări active"],
    ["Inbox", openRequests.length.toString(), "cereri de verificat"],
    ["Echipă", (data?.staffUsers.length ?? 0).toString(), "conturi interne"],
    ["Email", (data?.outboundEmails.length ?? 0).toString(), "statusuri trimise"],
  ];
  const quickUtilities = [
    [
      "Următorul pacient",
      activeAppointments[0]
        ? `${activeAppointments[0].time} • ${activeAppointments[0].patient}`
        : "Agenda liberă",
      activeAppointments[0]?.treatment ?? "Nu există programări active.",
    ],
    [
      "Cereri urgente",
      urgentRequests.length.toString(),
      urgentRequests[0]?.patient ?? "Nu există urgențe marcate.",
    ],
    [
      "Sloturi libere",
      availableSlots.toString(),
      "Selectabile în calendarul de programare.",
    ],
    [
      "Rată confirmare",
      data?.appointmentRequests.length
        ? `${Math.round(
            ((data.appointmentRequests.length - openRequests.length) /
              data.appointmentRequests.length) *
              100,
          )}%`
        : "0%",
      "Cererile acceptate/refuzate ies din inboxul activ.",
    ],
  ];

  function updateAppointmentForm(name: string, value: string) {
    setAppointmentForm((current) => ({ ...current, [name]: value }));
  }

  function isSlotOccupied(day: CalendarDay, slot: string) {
    return occupiedSlots.has(`${calendarDateValue(day)}|${slot}`);
  }

  function getDayAvailability(day: CalendarDay) {
    const occupied = day.slots.filter((slot) => isSlotOccupied(day, slot)).length;

    return {
      occupied,
      free: day.slots.length - occupied,
      total: day.slots.length,
    };
  }

  async function addAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (occupiedSlots.has(`${appointmentForm.date}|${appointmentForm.time}`)) {
      setMessage("Intervalul ales este deja ocupat. Selectează o oră liberă.");
      return;
    }

    setIsSavingAppointment(true);
    setMessage("");

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentForm),
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

      let scheduledRequest: AppointmentRequest | undefined;
      let scheduledEmail: OutboundEmail | undefined;

      if (selectedSchedulingRequestId) {
        const requestResponse = await fetch("/api/appointment-requests", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedSchedulingRequestId,
            action: "schedule",
          }),
        });
        const requestPayload = (await requestResponse.json()) as {
          request?: AppointmentRequest;
          email?: OutboundEmail;
          error?: string;
        };

        if (requestResponse.ok && requestPayload.request) {
          scheduledRequest = requestPayload.request;
          scheduledEmail = requestPayload.email;
        }
      }

      setData((current) =>
        current
          ? {
              ...current,
              appointments: sortAppointments([
                ...current.appointments,
                payload.appointment!,
              ]),
              appointmentRequests: scheduledRequest
                ? current.appointmentRequests.map((request) =>
                    request.id === scheduledRequest.id ? scheduledRequest : request,
                  )
                : current.appointmentRequests,
              outboundEmails: scheduledEmail
                ? [scheduledEmail, ...current.outboundEmails].slice(0, 8)
                : current.outboundEmails,
            }
          : current,
      );
      setAppointmentForm(emptyAppointmentForm);
      setSelectedSchedulingRequestId("");
      setIsSchedulingPopupOpen(false);
      setMessage(
        scheduledRequest
          ? "Programarea a fost creată, iar cererea a fost bifată ca programată."
          : "Programarea a fost creată în sistem.",
      );
    } catch {
      setMessage("Nu pot salva acum. Verifică dacă serverul rulează.");
    } finally {
      setIsSavingAppointment(false);
    }
  }

  async function updateAppointmentStatus(id: string, action: "cancel" | "restore") {
    setAppointmentActionId(`${id}-${action}`);
    setMessage("");

    try {
      const response = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
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
        setMessage(payload.error ?? "Nu am putut modifica programarea.");
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
      setMessage(
        action === "cancel"
          ? "Programarea a fost anulată."
          : "Programarea a fost restabilită.",
      );
    } catch {
      setMessage("Nu pot modifica acum. Verifică dacă serverul rulează.");
    } finally {
      setAppointmentActionId("");
    }
  }

  async function updateRequestStatus(
    id: string,
    action: "accept" | "seen" | "reject" | "schedule",
  ) {
    setRequestActionId(`${id}-${action}`);
    setMessage("");

    try {
      const response = await fetch("/api/appointment-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      if (response.status === 401) {
        window.location.assign("/login-doctor");
        return;
      }

      const payload = (await response.json()) as {
        request?: AppointmentRequest;
        email?: OutboundEmail;
        error?: string;
      };

      if (!response.ok || !payload.request) {
        setMessage(payload.error ?? "Nu am putut modifica cererea.");
        return;
      }

      setData((current) =>
        current
          ? {
              ...current,
              appointmentRequests: current.appointmentRequests.map((request) =>
                request.id === id ? payload.request! : request,
              ),
              outboundEmails: payload.email
                ? [payload.email, ...current.outboundEmails].slice(0, 8)
                : current.outboundEmails,
            }
          : current,
      );
      setMessage(
        payload.email
          ? `${payload.request.status}. Email: ${payload.email.status}.`
          : `${payload.request.status}.`,
      );
    } catch {
      setMessage("Nu pot modifica cererea acum. Verifică dacă serverul rulează.");
    } finally {
      setRequestActionId("");
    }
  }

  function fillAppointmentFromRequest(request: AppointmentRequest) {
    setSelectedSchedulingRequestId(request.id);
    setIsSchedulingPopupOpen(true);
    setAppointmentForm({
      ...emptyAppointmentForm,
      patient: request.patient,
      phone: request.phone,
      email: request.email,
      treatment: request.reason.split(":")[0] || request.reason,
      notes: `Creat din cererea ${request.id}. Preferință: ${request.preferredDate}.`,
    });
    setMessage(`Alege o oră din calendar pentru ${request.patient}.`);
  }

  function selectCalendarSlot(day: CalendarDay, slot: string) {
    if (isSlotOccupied(day, slot)) {
      setMessage("Ora selectată este deja ocupată. Alege un interval liber.");
      return;
    }

    updateAppointmentForm("date", calendarDateValue(day));
    updateAppointmentForm("time", slot);
    setMessage(`Interval selectat: ${day.day}, ${slot}. Poți salva programarea.`);
  }

  function renderCalendarPicker(mode: "modal" | "panel") {
    return (
      <div className={mode === "modal" ? "grid gap-3 md:grid-cols-2" : "grid gap-3"}>
        {(data?.calendarWeek ?? []).map((day) => {
          const availability = getDayAvailability(day);

          return (
            <div
              className="rounded-lg border border-[#d8eee9] bg-[#f7fbfa] p-3"
              key={`${mode}-${day.day}-${day.date}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-black">
                    {day.day}, {day.date} iunie
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#647a75]">
                    {availability.free} libere • {availability.occupied} ocupate
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-black ring-1 ${
                    availability.free
                      ? "bg-[#e8f7f3] text-[#176f65] ring-[#9ed9ce]"
                      : "bg-[#fff1f1] text-[#a33b3b] ring-[#f1c7c7]"
                  }`}
                >
                  {availability.free ? "Disponibil" : "Plin"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {day.slots.map((slot) => {
                  const selected =
                    appointmentForm.date === calendarDateValue(day) &&
                    appointmentForm.time === slot;
                  const occupied = isSlotOccupied(day, slot);

                  return (
                    <button
                      className={`rounded-full px-3 py-2 text-xs font-black ring-1 transition disabled:cursor-not-allowed ${
                        selected
                          ? "bg-[#2d8d7f] text-white ring-[#2d8d7f]"
                          : occupied
                            ? "bg-[#fff1f1] text-[#a33b3b] line-through opacity-70 ring-[#f1c7c7]"
                            : "bg-white text-[#17322e] ring-[#d8eee9] hover:bg-[#eef8f5]"
                      }`}
                      disabled={occupied}
                      key={slot}
                      onClick={() => selectCalendarSlot(day, slot)}
                      type="button"
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  async function addStaffUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingStaff(true);
    setMessage("");

    try {
      const defaultPermissions =
        staffForm.role === "doctor" ? permissions : permissions.slice(0, 3);
      const response = await fetch("/api/staff-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...staffForm,
          permissions: defaultPermissions,
        }),
      });
      const payload = (await response.json()) as {
        user?: StaffUser;
        error?: string;
      };

      if (!response.ok || !payload.user) {
        setMessage(payload.error ?? "Nu am putut crea contul.");
        return;
      }

      setData((current) =>
        current
          ? { ...current, staffUsers: [...current.staffUsers, payload.user!] }
          : current,
      );
      setStaffForm(emptyStaffForm);
      setMessage("Contul intern a fost creat.");
    } catch {
      setMessage("Nu pot crea contul acum. Verifică dacă serverul rulează.");
    } finally {
      setIsSavingStaff(false);
    }
  }

  async function updateStaffUser(
    user: StaffUser,
    patch: Partial<Pick<StaffUser, "role" | "permissions" | "active">>,
  ) {
    setStaffActionId(user.id);
    setMessage("");

    try {
      const response = await fetch("/api/staff-users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, ...patch }),
      });
      const payload = (await response.json()) as {
        user?: StaffUser;
        error?: string;
      };

      if (!response.ok || !payload.user) {
        setMessage(payload.error ?? "Nu am putut actualiza contul.");
        return;
      }

      setData((current) =>
        current
          ? {
              ...current,
              staffUsers: current.staffUsers.map((item) =>
                item.id === user.id ? payload.user! : item,
              ),
              currentUser:
                current.currentUser.id === user.id
                  ? payload.user!
                  : current.currentUser,
            }
          : current,
      );
      setMessage("Permisiunile au fost actualizate.");
    } catch {
      setMessage("Nu pot actualiza contul acum.");
    } finally {
      setStaffActionId("");
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
                Panou intern
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-5xl">
                Agenda DentalClinic Timișoara
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#617873]">
                Cereri, programări, profiluri de login și permisiuni într-un
                dashboard simplu de folosit între consultații.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {data?.currentUser ? (
                <div className="rounded-lg border border-white/70 bg-white/80 px-4 py-3 text-sm shadow-sm backdrop-blur">
                  <p className="font-black">{data.currentUser.name}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#248176]">
                    {data.currentUser.role === "doctor" ? "Doctor" : "Asistentă"}
                  </p>
                </div>
              ) : null}
              <button
                className="rounded-full border border-[#b7ded7] bg-white/88 px-5 py-3 text-sm font-black text-[#248176] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[#62b6a7]"
                onClick={logout}
                type="button"
              >
                Logout
              </button>
            </div>
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

          {message ? (
            <p className="rounded-lg bg-white/84 p-3 text-sm font-bold text-[#248176] ring-1 ring-[#cde7e1]">
              {message}
            </p>
          ) : null}
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[1.18fr_.82fr] lg:px-10">
        <div className="grid gap-6">
          <section className="soft-card rounded-lg p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
                  Inbox programări
                </p>
                <h2 className="mt-2 text-2xl font-black">Cereri noi</h2>
              </div>
              <span className="rounded-full bg-[#fff3cf] px-3 py-2 text-xs font-black text-[#8a6511]">
                {openRequests.length} active
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {!data ? (
                <div className="animate-pulse rounded-lg border border-[#d8eee9] bg-[#f7fbfa] p-4">
                  <div className="h-4 w-32 rounded-full bg-[#d8eee9]" />
                  <div className="mt-4 h-3 w-full rounded-full bg-[#e7f3f0]" />
                </div>
              ) : null}
              {data && data.appointmentRequests.length === 0 ? (
                <p className="rounded-lg bg-[#f7fbfa] p-4 text-sm font-bold text-[#617873] ring-1 ring-[#d8eee9]">
                  Nu sunt cereri în inbox.
                </p>
              ) : null}
              {(data?.appointmentRequests ?? []).map((request) => {
                const accepted = ["Acceptată", "Programată"].includes(request.status);

                return (
                <article
                  className={`interactive-card relative rounded-lg border p-4 ${
                    accepted
                      ? "border-[#9ed9ce] bg-[#f2fbf8] shadow-[0_16px_44px_rgba(45,141,127,.12)]"
                      : "border-[#d8eee9] bg-[#f7fbfa]"
                  }`}
                  key={request.id}
                >
                  {accepted ? (
                    <span className="absolute right-3 top-3 rounded-full bg-[#2d8d7f] px-3 py-1 text-xs font-black text-white shadow-sm">
                      {request.status === "Programată" ? "✓ Programată" : "✓ Bifat"}
                    </span>
                  ) : null}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black">{request.patient}</h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-black ring-1 ${requestStatusStyle(
                            request.status,
                          )}`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#647a75]">
                        {request.phone}
                        {request.email ? ` • ${request.email}` : " • fără email"}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#fff3cf] px-2 py-1 text-xs font-black text-[#8a6511]">
                      {request.urgency}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#314d48]">
                    {request.reason}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-[#647a75]">
                    <span>{request.preferredDate}</span>
                    {request.statusNote ? <span>{request.statusNote}</span> : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className="rounded-full bg-[#2d8d7f] px-4 py-2 text-xs font-black text-white transition hover:bg-[#176f65] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={
                        !can("manageRequests") ||
                        requestActionId === `${request.id}-accept`
                      }
                      onClick={() => updateRequestStatus(request.id, "accept")}
                      type="button"
                    >
                      Acceptă
                    </button>
                    <button
                      className="rounded-full border border-[#cde7e1] bg-white px-4 py-2 text-xs font-black text-[#248176] transition hover:bg-[#eef8f5] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={
                        !can("manageRequests") ||
                        requestActionId === `${request.id}-seen`
                      }
                      onClick={() => updateRequestStatus(request.id, "seen")}
                      type="button"
                    >
                      Văzut
                    </button>
                    <button
                      className="rounded-full border border-[#f1c7c7] bg-white px-4 py-2 text-xs font-black text-[#a33b3b] transition hover:bg-[#fff1f1] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={
                        !can("manageRequests") ||
                        requestActionId === `${request.id}-reject`
                      }
                      onClick={() => updateRequestStatus(request.id, "reject")}
                      type="button"
                    >
                      Refuză
                    </button>
                    <button
                      className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                        selectedSchedulingRequestId === request.id
                          ? "border-[#2d8d7f] bg-[#2d8d7f] text-white"
                          : "border-[#b7ded7] bg-white text-[#17322e] hover:bg-[#eef8f5]"
                      }`}
                      onClick={() => fillAppointmentFromRequest(request)}
                      type="button"
                    >
                      Programează
                    </button>
                  </div>
                </article>
                );
              })}
            </div>

          </section>

          <section className="soft-card rounded-lg p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
                  Calendar intern
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Programări confirmate
                </h2>
              </div>
              <span className="rounded-full bg-[#eef8f5] px-3 py-2 text-xs font-black text-[#248176]">
                anulare / restabilire
              </span>
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
              {(data?.appointments ?? []).map((appointment) => {
                const cancelled = isCancelled(appointment.status);

                return (
                  <article
                    className="interactive-card grid gap-4 rounded-lg border border-[#d8eee9] bg-[#f7fbfa] p-4 md:grid-cols-[106px_1fr_130px_auto]"
                    key={appointment.id}
                  >
                    <div className="rounded-lg bg-white p-3 text-center ring-1 ring-[#d8eee9]">
                      <p className="text-2xl font-black text-[#248176]">
                        {appointment.time}
                      </p>
                      <p className="text-xs font-black text-[#647a75]">
                        {appointment.date}
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
                        {appointment.treatment} • {appointment.room}
                      </p>
                      <p className="mt-2 text-xs font-bold text-[#248176]">
                        {appointment.phone || "telefon lipsă"}
                        {appointment.email ? ` • ${appointment.email}` : ""}
                      </p>
                      {appointment.notes ? (
                        <p className="mt-2 text-xs font-bold text-[#647a75]">
                          {appointment.notes}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`h-fit rounded-full px-3 py-2 text-center text-xs font-black ring-1 ${
                        cancelled
                          ? "bg-[#fff1f1] text-[#a33b3b] ring-[#f1c7c7]"
                          : "bg-white text-[#248176] ring-[#cde7e1]"
                      }`}
                    >
                      {appointment.status}
                    </span>
                    <button
                      className={`h-fit rounded-full border px-4 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        cancelled
                          ? "border-[#b7ded7] bg-white text-[#248176] hover:bg-[#eef8f5]"
                          : "border-[#f1c7c7] bg-white text-[#a33b3b] hover:bg-[#fff1f1]"
                      }`}
                      disabled={
                        !can("manageAppointments") ||
                        appointmentActionId ===
                          `${appointment.id}-${cancelled ? "restore" : "cancel"}`
                      }
                      onClick={() =>
                        updateAppointmentStatus(
                          appointment.id,
                          cancelled ? "restore" : "cancel",
                        )
                      }
                      type="button"
                    >
                      {cancelled ? "Restabilește" : "Anulează"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="soft-card rounded-lg p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
                  Creează în sistem
                </p>
                <h2 className="mt-2 text-2xl font-black">Programare nouă</h2>
              </div>
              <button
                className="rounded-full border border-[#b7ded7] bg-white px-4 py-2 text-xs font-black text-[#248176] transition hover:bg-[#eef8f5]"
                onClick={() => setIsSchedulingPopupOpen(true)}
                type="button"
              >
                Alege din calendar
              </button>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={addAppointment}>
                {[
                  ["patient", "Pacient", "Mara Popescu"],
                  ["phone", "Telefon", "07xx xxx xxx"],
                  ["email", "Email", "pacient@email.ro"],
                  ["time", "Ora", "14:30"],
                  ["duration", "Durata", "45 min"],
                  ["treatment", "Tratament", "Consultație"],
                  ["room", "Cabinet", "Cabinet 1"],
                ].map(([name, label, placeholder]) => (
                  <label className="grid gap-2 text-sm font-black" key={name}>
                    {label}
                    <input
                      className={fieldClass}
                      name={name}
                      onChange={(event) =>
                        updateAppointmentForm(name, event.target.value)
                      }
                      placeholder={placeholder}
                      required={
                        name === "patient" ||
                        name === "time" ||
                        name === "treatment"
                      }
                      type={name === "email" ? "email" : "text"}
                      value={appointmentForm[name as keyof typeof appointmentForm]}
                    />
                  </label>
                ))}
                <label className="grid gap-2 text-sm font-black">
                  Data
                  <input
                    className={fieldClass}
                    onChange={(event) =>
                      updateAppointmentForm("date", event.target.value)
                    }
                    type="date"
                    value={appointmentForm.date}
                  />
                </label>
                <label className="grid gap-2 text-sm font-black sm:col-span-2">
                  Note interne
                  <textarea
                    className={`${fieldClass} min-h-24`}
                    onChange={(event) =>
                      updateAppointmentForm("notes", event.target.value)
                    }
                    value={appointmentForm.notes}
                  />
                </label>
                {selectedSchedulingRequest ? (
                  <div className="rounded-lg bg-[#e8f7f3] p-3 text-sm font-bold text-[#176f65] ring-1 ring-[#9ed9ce] sm:col-span-2">
                    Programare din cererea {selectedSchedulingRequest.id}:{" "}
                    {selectedSchedulingRequest.patient}
                  </div>
                ) : null}
                <button
                  className="button-sheen self-end rounded-full bg-[#2d8d7f] px-5 py-4 text-sm font-black text-white shadow-[0_16px_38px_rgba(45,141,127,.2)] transition hover:-translate-y-0.5 hover:bg-[#176f65] disabled:opacity-50"
                  disabled={!can("manageAppointments") || isSavingAppointment}
                  type="submit"
                >
                  {isSavingAppointment ? "Se salvează..." : "Salvează programarea"}
                </button>
              </form>

              <div className="rounded-lg border border-[#d8eee9] bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
                      Disponibilitate live
                    </p>
                    <h3 className="mt-2 text-xl font-black">
                      Calendar lângă formular
                    </h3>
                  </div>
                  <span className="rounded-full bg-[#e8f7f3] px-3 py-2 text-xs font-black text-[#176f65] ring-1 ring-[#9ed9ce]">
                    {availableSlots} libere
                  </span>
                </div>
                <div className="mt-4 max-h-[34rem] overflow-auto pr-1">
                  {renderCalendarPicker("panel")}
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="grid h-fit gap-6 lg:sticky lg:top-6">
          <section className="soft-card rounded-lg p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
              Profilul meu
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {data?.currentUser.name ?? "Se încarcă..."}
            </h2>
            <p className="mt-2 text-sm font-bold text-[#647a75]">
              {data?.currentUser.email || "Email intern necompletat"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(data?.currentUser.permissions ?? []).map((permission) => (
                <span
                  className="rounded-full bg-[#eef8f5] px-3 py-1 text-xs font-black text-[#248176]"
                  key={permission}
                >
                  {permissionLabels[permission]}
                </span>
              ))}
            </div>
          </section>

          <section className="soft-card rounded-lg p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
              Utilitare rapide
            </p>
            <h2 className="mt-2 text-2xl font-black">Controlul zilei</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {quickUtilities.map(([title, value, detail]) => (
                <div
                  className="rounded-lg border border-[#d8eee9] bg-[#f7fbfa] p-3"
                  key={title}
                >
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7d948f]">
                    {title}
                  </p>
                  <p className="mt-2 text-xl font-black text-[#248176]">
                    {value}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#647a75]">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="soft-card rounded-lg p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
                  Profiluri acces
                </p>
                <h2 className="mt-2 text-2xl font-black">Doctori și asistente</h2>
              </div>
              <span className="rounded-full bg-[#e8f7f3] px-3 py-2 text-xs font-black text-[#176f65] ring-1 ring-[#cde7e1]">
                permisiuni
              </span>
            </div>

            <form className="mt-5 grid gap-3" onSubmit={addStaffUser}>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className={fieldClass}
                  onChange={(event) =>
                    setStaffForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Nume profil"
                  required
                  value={staffForm.name}
                />
                <select
                  className={fieldClass}
                  onChange={(event) =>
                    setStaffForm((current) => ({
                      ...current,
                      role: event.target.value as StaffRole,
                    }))
                  }
                  value={staffForm.role}
                >
                  <option value="assistant">Asistentă</option>
                  <option value="doctor">Doctor</option>
                </select>
                <input
                  className={fieldClass}
                  onChange={(event) =>
                    setStaffForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  placeholder="Utilizator"
                  required
                  value={staffForm.username}
                />
                <input
                  className={fieldClass}
                  onChange={(event) =>
                    setStaffForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Parolă"
                  required
                  type="password"
                  value={staffForm.password}
                />
              </div>
              <input
                className={fieldClass}
                onChange={(event) =>
                  setStaffForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="Email intern"
                type="email"
                value={staffForm.email}
              />
              <button
                className="rounded-full bg-[#2d8d7f] px-5 py-3 text-sm font-black text-white transition hover:bg-[#176f65] disabled:opacity-50"
                disabled={!can("manageUsers") || isSavingStaff}
                type="submit"
              >
                {isSavingStaff ? "Se creează..." : "Adaugă profil"}
              </button>
            </form>

            <div className="mt-5 grid gap-3">
              {(data?.staffUsers ?? []).map((user) => (
                <article
                  className="rounded-lg border border-[#d8eee9] bg-[#f7fbfa] p-4"
                  key={user.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black">{user.name}</h3>
                      <p className="mt-1 text-xs font-bold text-[#647a75]">
                        {user.username} •{" "}
                        {user.role === "doctor" ? "Doctor" : "Asistentă"}
                      </p>
                    </div>
                    <button
                      className="rounded-full border border-[#cde7e1] bg-white px-3 py-1 text-xs font-black text-[#248176] disabled:opacity-50"
                      disabled={!can("manageUsers") || staffActionId === user.id}
                      onClick={() =>
                        updateStaffUser(user, { active: !user.active })
                      }
                      type="button"
                    >
                      {user.active ? "Activ" : "Inactiv"}
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {permissions.map((permission) => {
                      const enabled = user.permissions.includes(permission);

                      return (
                        <button
                          className={`rounded-full px-3 py-1 text-xs font-black ring-1 transition disabled:opacity-50 ${
                            enabled
                              ? "bg-[#2d8d7f] text-white ring-[#2d8d7f]"
                              : "bg-white text-[#647a75] ring-[#d8eee9]"
                          }`}
                          disabled={!can("manageUsers") || staffActionId === user.id}
                          key={permission}
                          onClick={() =>
                            updateStaffUser(user, {
                              permissions: enabled
                                ? user.permissions.filter(
                                    (item) => item !== permission,
                                  )
                                : [...user.permissions, permission],
                            })
                          }
                          type="button"
                        >
                          {permissionLabels[permission]}
                        </button>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="soft-card rounded-lg p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
              Email status
            </p>
            <h2 className="mt-2 text-2xl font-black">Emailuri recente</h2>
            <div className="mt-4 grid gap-3">
              {(data?.outboundEmails ?? []).length === 0 ? (
                <p className="rounded-lg bg-[#f7fbfa] p-4 text-sm font-bold text-[#617873] ring-1 ring-[#d8eee9]">
                  Încă nu există răspunsuri trimise.
                </p>
              ) : null}
              {(data?.outboundEmails ?? []).map((email) => (
                <article
                  className="rounded-lg border border-[#d8eee9] bg-[#f7fbfa] p-3"
                  key={email.id}
                >
                  <p className="text-sm font-black">{email.subject}</p>
                  <p className="mt-1 text-xs font-bold text-[#647a75]">
                    {email.recipientName} • {email.recipientEmail || "fără email"}
                  </p>
                  <p className="mt-2 text-xs font-black text-[#248176]">
                    {email.status}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="soft-card rounded-lg p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
                Calendar
              </p>
              <h2 className="mt-2 text-2xl font-black">Săptămână</h2>
              <div className="mt-4 grid gap-2">
                {(data?.calendarWeek ?? []).map((day) => (
                  <div
                    className="rounded-lg bg-[#f7fbfa] p-3 text-sm ring-1 ring-[#d8eee9]"
                    key={day.day}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-black">
                        {day.day}, {day.date}
                      </p>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-[#248176] ring-1 ring-[#d8eee9]">
                        {getDayAvailability(day).free} libere
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {day.slots.map((slot) => (
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-black ${
                            isSlotOccupied(day, slot)
                              ? "bg-[#fff1f1] text-[#a33b3b]"
                              : "bg-white text-[#647a75]"
                          }`}
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
              <div className="mt-4 grid gap-2">
                {(data?.patients ?? []).slice(0, 4).map((patient) => (
                  <article
                    className="rounded-lg bg-[#f7fbfa] p-3 text-sm ring-1 ring-[#d8eee9]"
                    key={patient.id}
                  >
                    <p className="font-black">{patient.name}</p>
                    <p className="mt-1 text-xs font-bold text-[#647a75]">
                      {patient.phone} • {patient.age} ani
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#314d48]">
                      {patient.note}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <ClinicBot mode="doctor" />
        </aside>
      </section>

      {isSchedulingPopupOpen ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-[#102d28]/62 px-4 py-6 backdrop-blur-sm">
          <section className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-lg bg-white p-5 text-[#17322e] shadow-[0_30px_90px_rgba(0,0,0,.28)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
                  Calendar programare
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  {selectedSchedulingRequest
                    ? `Programează ${selectedSchedulingRequest.patient}`
                    : "Alege o oră disponibilă"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#647a75]">
                  Intervalele ocupate sunt blocate. Când alegi o oră, formularul
                  de programare se completează automat.
                </p>
              </div>
              <button
                className="rounded-full bg-[#eef8f5] px-4 py-2 text-sm font-black text-[#248176] transition hover:bg-[#dff3ef]"
                onClick={() => setIsSchedulingPopupOpen(false)}
                type="button"
              >
                Închide
              </button>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
              <aside className="rounded-lg border border-[#d8eee9] bg-[#f7fbfa] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
                  Se actualizează live
                </p>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-lg bg-white p-3 ring-1 ring-[#d8eee9]">
                    <p className="text-xs font-black text-[#647a75]">Pacient</p>
                    <p className="mt-1 font-black">
                      {appointmentForm.patient || "Necompletat"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white p-3 ring-1 ring-[#d8eee9]">
                      <p className="text-xs font-black text-[#647a75]">Data</p>
                      <p className="mt-1 font-black">
                        {appointmentForm.date || "Alege data"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white p-3 ring-1 ring-[#d8eee9]">
                      <p className="text-xs font-black text-[#647a75]">Ora</p>
                      <p className="mt-1 font-black">
                        {appointmentForm.time || "Alege ora"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#e8f7f3] p-3 text-sm font-bold text-[#176f65] ring-1 ring-[#9ed9ce]">
                    {availableSlots} sloturi libere în săptămâna afișată.
                  </div>
                  <button
                    className="rounded-full bg-[#2d8d7f] px-5 py-3 text-sm font-black text-white transition hover:bg-[#176f65]"
                    onClick={() => setIsSchedulingPopupOpen(false)}
                    type="button"
                  >
                    Folosește ora selectată
                  </button>
                </div>
              </aside>

              <div>{renderCalendarPicker("modal")}</div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
