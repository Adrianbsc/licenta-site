import { cookies } from "next/headers";

export const doctorSessionCookie = "doctor_session";

const sessionValue = "cata-stoma-doctor";
const defaultUsername = "doctor";
const defaultPassword = "doctor1";

export function validateDoctorCredentials(username: string, password: string) {
  const configuredUsername = process.env.DOCTOR_USERNAME ?? defaultUsername;
  const configuredPassword = process.env.DOCTOR_PASSWORD ?? defaultPassword;
  const acceptedPasswords = new Set([configuredPassword]);

  if (configuredPassword === defaultPassword) {
    acceptedPasswords.add("doctor 1");
  }

  return (
    username.trim() === configuredUsername &&
    acceptedPasswords.has(password.trim())
  );
}

export async function isDoctorAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(doctorSessionCookie)?.value === sessionValue;
}

export async function createDoctorSession() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: doctorSessionCookie,
    value: sessionValue,
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
