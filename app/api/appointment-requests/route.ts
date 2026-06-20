import {
  createAppointmentRequest,
  updateAppointmentRequestStatus,
  type AppointmentRequestInput,
} from "@/app/lib/clinic-db";
import { getAuthenticatedStaff, hasPermission } from "@/app/lib/doctor-auth";

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
    email: body.email,
    service: body.service,
    preferredDate: body.preferredDate,
    message: body.message,
  });

  return Response.json({ appointmentRequest }, { status: 201 });
}

export async function PATCH(request: Request) {
  const currentUser = await getAuthenticatedStaff();

  if (!currentUser) {
    return Response.json({ error: "Neautorizat." }, { status: 401 });
  }

  if (!hasPermission(currentUser, "manageRequests")) {
    return Response.json({ error: "Nu ai permisiune pentru cereri." }, { status: 403 });
  }

  const body = (await request.json()) as {
    id?: string;
    action?: "accept" | "seen" | "reject" | "schedule";
  };
  const statusByAction = {
    accept: "Acceptată",
    seen: "Văzută",
    reject: "Refuzată",
    schedule: "Programată",
  } as const;
  const status = body.action ? statusByAction[body.action] : undefined;

  if (!body.id || !status) {
    return Response.json(
      { error: "Trimite id-ul cererii și acțiunea accept, seen, reject sau schedule." },
      { status: 400 },
    );
  }

  const result = await updateAppointmentRequestStatus(body.id, status);

  if (!result) {
    return Response.json({ error: "Cererea nu a fost găsită." }, { status: 404 });
  }

  return Response.json(result);
}
