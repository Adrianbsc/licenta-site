import { clearDoctorSession } from "@/app/lib/doctor-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await clearDoctorSession();
  return Response.json({ ok: true });
}
