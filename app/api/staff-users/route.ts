import {
  createStaffUser,
  listStaffUsers,
  updateStaffUser,
  type StaffPermission,
  type StaffRole,
} from "@/app/lib/clinic-db";
import { getAuthenticatedStaff, hasPermission } from "@/app/lib/doctor-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireUserManager() {
  const currentUser = await getAuthenticatedStaff();

  if (!currentUser) {
    return { error: Response.json({ error: "Neautorizat." }, { status: 401 }) };
  }

  if (!hasPermission(currentUser, "manageUsers")) {
    return {
      error: Response.json(
        { error: "Nu ai permisiune pentru administrarea conturilor." },
        { status: 403 },
      ),
    };
  }

  return { currentUser };
}

export async function GET() {
  const auth = await requireUserManager();

  if (auth.error) {
    return auth.error;
  }

  return Response.json({ staffUsers: await listStaffUsers() });
}

export async function POST(request: Request) {
  const auth = await requireUserManager();

  if (auth.error) {
    return auth.error;
  }

  const body = (await request.json()) as {
    name?: string;
    username?: string;
    email?: string;
    role?: StaffRole;
    password?: string;
    permissions?: StaffPermission[];
  };

  if (!body.name?.trim() || !body.username?.trim() || !body.password?.trim()) {
    return Response.json(
      { error: "Completează numele, utilizatorul și parola." },
      { status: 400 },
    );
  }

  try {
    const user = await createStaffUser({
      name: body.name,
      username: body.username,
      email: body.email,
      role: body.role === "doctor" ? "doctor" : "assistant",
      password: body.password,
      permissions: body.permissions,
    });

    return Response.json({ user }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Nu am putut crea contul. Verifică dacă utilizatorul există deja." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUserManager();

  if (auth.error) {
    return auth.error;
  }

  const body = (await request.json()) as {
    id?: string;
    role?: StaffRole;
    permissions?: StaffPermission[];
    active?: boolean;
  };

  if (!body.id) {
    return Response.json({ error: "Trimite id-ul utilizatorului." }, { status: 400 });
  }

  const user = await updateStaffUser(body.id, {
    role: body.role,
    permissions: body.permissions,
    active: body.active,
  });

  if (!user) {
    return Response.json({ error: "Utilizatorul nu a fost găsit." }, { status: 404 });
  }

  return Response.json({ user });
}
