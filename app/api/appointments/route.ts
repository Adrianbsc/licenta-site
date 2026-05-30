import {
  cancelAppointment,
  createAppointment,
  listAppointments,
  type AppointmentInput,
} from "@/app/lib/clinic-db";
import { isDoctorAuthenticated } from "@/app/lib/doctor-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isDoctorAuthenticated())) {
    return Response.json({ error: "Neautorizat." }, { status: 401 });
  }

  return Response.json({ appointments: await listAppointments() });
}

export async function POST(request: Request) {
  if (!(await isDoctorAuthenticated())) {
    return Response.json({ error: "Neautorizat." }, { status: 401 });
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
    date: body.date,
    time: body.time,
    duration: body.duration,
    treatment: body.treatment,
    room: body.room,
    status: body.status,
  });

  return Response.json({ appointment }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await isDoctorAuthenticated())) {
    return Response.json({ error: "Neautorizat." }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string; action?: string };

  if (!body.id || body.action !== "cancel") {
    return Response.json(
      { error: "Trimite id-ul programării și acțiunea cancel." },
      { status: 400 },
    );
  }

  const appointment = await cancelAppointment(body.id);

  if (!appointment) {
    return Response.json(
      { error: "Programarea nu a fost găsită." },
      { status: 404 },
    );
  }

  return Response.json({ appointment });
}
