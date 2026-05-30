import { getDoctorDashboard } from "@/app/lib/clinic-db";
import { isDoctorAuthenticated } from "@/app/lib/doctor-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isDoctorAuthenticated())) {
    return Response.json({ error: "Neautorizat." }, { status: 401 });
  }

  return Response.json(await getDoctorDashboard());
}
