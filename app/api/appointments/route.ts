import {
  createAppointment,
  listAppointments,
  type AppointmentInput,
} from "@/app/lib/clinic-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ appointments: listAppointments() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AppointmentInput>;

  if (!body.patient?.trim() || !body.time || !body.treatment?.trim()) {
    return Response.json(
      { error: "Completeaza pacientul, ora si tratamentul." },
      { status: 400 },
    );
  }

  const appointment = createAppointment({
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
