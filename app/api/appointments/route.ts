import {
  cancelAppointment,
  createAppointment,
  listAppointments,
  updateAppointmentStatus,
  type AppointmentInput,
} from "@/app/lib/clinic-db";
import { getAuthenticatedStaff, hasPermission } from "@/app/lib/doctor-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getAuthenticatedStaff();

  if (!currentUser) {
    return Response.json({ error: "Neautorizat." }, { status: 401 });
  }

  return Response.json({ appointments: await listAppointments() });
}

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedStaff();

  if (!currentUser) {
    return Response.json({ error: "Neautorizat." }, { status: 401 });
  }

  if (!hasPermission(currentUser, "manageAppointments")) {
    return Response.json(
      { error: "Nu ai permisiune pentru programări." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as Partial<AppointmentInput>;

  if (!body.patient?.trim() || !body.time || !body.treatment?.trim()) {
    return Response.json(
      { error: "Completează pacientul, ora și tratamentul." },
      { status: 400 },
    );
  }

  const appointment = await createAppointment({
    patient: body.patient,
    phone: body.phone,
    email: body.email,
    date: body.date,
    time: body.time,
    duration: body.duration,
    treatment: body.treatment,
    room: body.room,
    status: body.status,
    notes: body.notes,
  });

  return Response.json({ appointment }, { status: 201 });
}

export async function PATCH(request: Request) {
  const currentUser = await getAuthenticatedStaff();

  if (!currentUser) {
    return Response.json({ error: "Neautorizat." }, { status: 401 });
  }

  if (!hasPermission(currentUser, "manageAppointments")) {
    return Response.json(
      { error: "Nu ai permisiune pentru programări." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as { id?: string; action?: string };

  if (!body.id || !["cancel", "restore"].includes(body.action ?? "")) {
    return Response.json(
      { error: "Trimite id-ul programării și acțiunea cancel sau restore." },
      { status: 400 },
    );
  }

  const appointment =
    body.action === "cancel"
      ? await cancelAppointment(body.id)
      : await updateAppointmentStatus(body.id, "Confirmată");

  if (!appointment) {
    return Response.json(
      { error: "Programarea nu a fost găsită." },
      { status: 404 },
    );
  }

  return Response.json({ appointment });
}
