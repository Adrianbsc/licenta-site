"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DoctorLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("doctor");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/doctor-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(payload.error ?? "Nu am putut autentifica doctorul.");
        return;
      }

      router.push("/doctor");
      router.refresh();
    } catch {
      setMessage("Serverul nu răspunde acum. Încearcă din nou.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7fbfa] text-[#17322e]">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[.92fr_1.08fr] lg:px-10">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#248176]">
            Acces doctor
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-6xl">
            Login pentru agendă și cereri.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#647a75]">
            Intră cu userul dedicat pentru a administra programările, cererile
            pacienților și asistentul doctorului.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className="rounded-full border border-[#b7ded7] bg-white px-5 py-3 text-sm font-black text-[#248176] transition hover:border-[#62b6a7]"
              href="/"
            >
              Site public
            </Link>
            <Link
              className="rounded-full border border-[#b7ded7] bg-white px-5 py-3 text-sm font-black text-[#248176] transition hover:border-[#62b6a7]"
              href="/#review-uri"
            >
              Review-uri
            </Link>
          </div>
        </div>

        <form
          className="rounded-lg border border-[#d8eee9] bg-white p-5 shadow-[0_18px_60px_rgba(42,112,103,.12)] sm:p-7"
          onSubmit={login}
        >
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
            Credentiale
          </p>
          <h2 className="mt-2 text-2xl font-black">Doctor</h2>

          <label className="mt-6 grid gap-2 text-sm font-black">
            User
            <input
              className="rounded-lg border border-[#cde7e1] px-4 py-3 font-medium outline-none transition focus:border-[#62b6a7]"
              onChange={(event) => setUsername(event.target.value)}
              value={username}
            />
          </label>

          <label className="mt-4 grid gap-2 text-sm font-black">
            Parola
            <input
              className="rounded-lg border border-[#cde7e1] px-4 py-3 font-medium outline-none transition focus:border-[#62b6a7]"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>

          <button
            className="mt-6 w-full rounded-full bg-[#62b6a7] px-5 py-4 text-sm font-black text-white transition hover:bg-[#4aa495] disabled:opacity-50"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Se verifică..." : "Intră în dashboard"}
          </button>

          {message ? (
            <p className="mt-4 rounded-lg bg-[#fff3cf] p-3 text-sm font-bold text-[#8a6511]">
              {message}
            </p>
          ) : null}

          <p className="mt-5 text-xs leading-5 text-[#647a75]">
            Demo local: user doctor, parola doctor1. Acceptă și varianta cu
            spațiu, dacă a fost notată ca doctor 1.
          </p>
        </form>
      </section>
    </main>
  );
}
