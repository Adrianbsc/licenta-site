import { cookies } from "next/headers";
import {
  authenticateStaffCredentials,
  getStaffUserById,
  type StaffPermission,
  type StaffUser,
} from "./clinic-db";

export const doctorSessionCookie = "doctor_session";

const defaultUsername = "doctor";
const defaultPassword = "doctor1";
const legacySessionValue = "cata-stoma-doctor";

export async function validateDoctorCredentials(username: string, password: string) {
  return Boolean(await authenticateStaffCredentials(username, password));
}

export async function getAuthenticatedStaff() {
  const cookieStore = await cookies();
  const value = cookieStore.get(doctorSessionCookie)?.value;

  if (!value) {
    return null;
  }

  if (value.startsWith("staff:")) {
    const user = await getStaffUserById(value.slice("staff:".length));
    return user?.active ? user : null;
  }

  if (value === legacySessionValue) {
    const configuredUsername = process.env.DOCTOR_USERNAME ?? defaultUsername;
    const configuredPassword = process.env.DOCTOR_PASSWORD ?? defaultPassword;
    return authenticateStaffCredentials(configuredUsername, configuredPassword);
  }

  return null;
}

export async function isDoctorAuthenticated() {
  return Boolean(await getAuthenticatedStaff());
}

export function hasPermission(user: StaffUser | null, permission: StaffPermission) {
  return Boolean(user?.permissions.includes(permission));
}

export async function createDoctorSession(user: StaffUser) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: doctorSessionCookie,
    value: `staff:${user.id}`,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 10,
    path: "/",
  });
}

export async function clearDoctorSession() {
  const cookieStore = await cookies();
  cookieStore.delete(doctorSessionCookie);
}
