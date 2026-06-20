import {
  getDoctorDashboard,
  listOutboundEmails,
  listStaffUsers,
} from "@/app/lib/clinic-db";
import { getAuthenticatedStaff } from "@/app/lib/doctor-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getAuthenticatedStaff();

  if (!currentUser) {
    return Response.json({ error: "Neautorizat." }, { status: 401 });
  }

  const dashboard = await getDoctorDashboard();

  return Response.json({
    ...dashboard,
    currentUser,
    staffUsers: await listStaffUsers(),
    outboundEmails: await listOutboundEmails(),
  });
}
