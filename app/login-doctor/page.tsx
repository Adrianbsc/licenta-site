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
    <main className="relative min-h-screen overflow-hidden bg-[#eef8f5] text-[#17322e]">
      <div className="fine-grid absolute inset-0 opacity-70" />
      <div className="absolute left-[-12rem] top-[-12rem] h-96 w-96 rounded-full bg-[#cdeee7] blur-3xl" />
      <div className="absolute bottom-[-10rem] right-[-8rem] h-96 w-96 rounded-full bg-[#f3d88a] opacity-60 blur-3xl" />

      <section className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-10">
        <div className="reveal-up">
          <Link
            className="inline-flex rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-black text-[#176f65] shadow-sm backdrop-blur hover:-translate-y-0.5 hover:bg-white"
            href="/"
          >
            DentalClinic Timișoara
          </Link>
          <p className="mt-10 text-sm font-black uppercase tracking-[0.2em] text-[#248176]">
            Acces doctor
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black leading-[1.02] tracking-normal sm:text-6xl">
            Agenda cabinetului, într-un loc liniștit.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[#617873]">
            Autentificare pentru programări, cereri noi și fișe rapide. Interfața
            este gândită pentru ritmul unei zile de cabinet, nu pentru zgomot.
          </p>
          <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-2">
            {["Sesiune securizată", "Date verificate pe server"].map((item) => (
              <div
                className="rounded-lg border border-white/70 bg-white/70 p-4 text-sm font-black text-[#314d48] shadow-sm backdrop-blur"
                key={item}
              >
                <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-[#2d8d7f]" />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className="rounded-full border border-[#b7ded7] bg-white px-5 py-3 text-sm font-black text-[#248176] shadow-sm transition hover:-translate-y-0.5 hover:border-[#62b6a7]"
              href="/"
            >
              Site public
            </Link>
            <Link
              className="rounded-full border border-[#b7ded7] bg-white px-5 py-3 text-sm font-black text-[#248176] shadow-sm transition hover:-translate-y-0.5 hover:border-[#62b6a7]"
              href="/#programare"
            >
              Cereri pacienți
            </Link>
          </div>
        </div>

        <form
          className="glass-panel reveal-up rounded-lg p-5 sm:p-7"
          onSubmit={login}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
                Autentificare
              </p>
              <h2 className="mt-2 text-3xl font-black">Intrare doctor</h2>
            </div>
            <span className="rounded-full bg-[#e8f7f3] px-3 py-2 text-xs font-black text-[#176f65] ring-1 ring-[#cde7e1]">
              privat
            </span>
          </div>

          <label className="mt-7 grid gap-2 text-sm font-black">
            Utilizator
            <input
              autoComplete="username"
              className="rounded-lg border border-[#cde7e1] bg-white/92 px-4 py-3 font-medium outline-none focus:border-[#2d8d7f]"
              onChange={(event) => setUsername(event.target.value)}
              value={username}
            />
          </label>

          <label className="mt-4 grid gap-2 text-sm font-black">
            Parolă
            <input
              autoComplete="current-password"
              className="rounded-lg border border-[#cde7e1] bg-white/92 px-4 py-3 font-medium outline-none focus:border-[#2d8d7f]"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>

          <button
            className="button-sheen mt-6 w-full rounded-full bg-[#2d8d7f] px-5 py-4 text-sm font-black text-white shadow-[0_16px_38px_rgba(45,141,127,.26)] transition hover:-translate-y-0.5 hover:bg-[#176f65] disabled:opacity-50"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Se verifică..." : "Deschide dashboard"}
          </button>

          {message ? (
            <p
              aria-live="polite"
              className="mt-4 rounded-lg bg-[#fff3cf] p-3 text-sm font-bold text-[#8a6511]"
            >
              {message}
            </p>
          ) : null}

          <p className="mt-5 text-xs leading-5 text-[#617873]">
            Conexiunea se validează în backend, iar sesiunea este păstrată prin
            cookie securizat pentru accesul la panoul intern.
          </p>
        </form>
      </section>
    </main>
  );
}
