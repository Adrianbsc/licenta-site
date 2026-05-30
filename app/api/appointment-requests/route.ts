import {
  createAppointmentRequest,
  type AppointmentRequestInput,
} from "@/app/lib/clinic-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AppointmentRequestInput>;

  if (!body.patient?.trim() || !body.phone?.trim()) {
    return Response.json(
      { error: "Completează numele și telefonul." },
      { status: 400 },
    );
  }

  const appointmentRequest = await createAppointmentRequest({
    patient: body.patient,
    phone: body.phone,
    service: body.service,
    preferredDate: body.preferredDate,
    message: body.message,
  });

  return Response.json({ appointmentRequest }, { status: 201 });
}
