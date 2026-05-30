import {
  createDoctorSession,
  validateDoctorCredentials,
} from "@/app/lib/doctor-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    password?: string;
  };

  if (
    !body.username ||
    !body.password ||
    !validateDoctorCredentials(body.username, body.password)
  ) {
    return Response.json(
      { error: "User sau parolă greșită." },
      { status: 401 },
    );
  }

  await createDoctorSession();

  return Response.json({ ok: true });
}
