"use client";

import { useMemo, useState } from "react";
import {
  appointmentRequests,
  appointments,
  botReminders,
  clinic,
} from "../lib/clinic-data";

type BotMode = "patient" | "doctor";

type Message = {
  role: "user" | "bot";
  text: string;
};

export default function ClinicBot({ mode = "patient" }: { mode?: BotMode }) {
  const isDoctor = mode === "doctor";
  const [open, setOpen] = useState(isDoctor);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(
    () => `${mode}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: isDoctor
        ? "Bună, doctore. Am agenda, cererile noi și observațiile pacienților la îndemână."
        : `Bună, sunt asistentul de cabinet Cata Stoma. Te pot ajuta cu programul, serviciile și cererile de programare în ${clinic.city}.`,
    },
  ]);

  const prompts = useMemo(
    () =>
      isDoctor
        ? [
            ["urmatoarea", "Cine urmează?"],
            ["cereri", "Cereri urgente"],
            ["calendar", "Cum arată ziua?"],
            ["pacienti", "Pacienți cu note"],
          ]
        : [
            ["program", "Program"],
            ["preturi", "Prețuri"],
            ["programare", "Vreau programare"],
            ["urgente", "Urgență"],
          ],
    [isDoctor],
  );

  async function sendMessage(text: string) {
    const cleanText = text.trim();
    if (!cleanText || isLoading) {
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "user", text: cleanText },
      { role: "bot", text: "Verific în baza cabinetului..." },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cleanText, mode, sessionId }),
      });
      const data = (await response.json()) as { answer?: string };
      setMessages((current) => [
        ...current.slice(0, -1),
        {
          role: "bot",
          text:
            data.answer ??
            "Nu am găsit un răspuns clar. Pot salva întrebarea pentru recepție.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current.slice(0, -1),
        {
          role: "bot",
          text: "Nu pot accesa baza de date acum. Încearcă din nou în câteva secunde.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const shellClass = isDoctor
    ? "soft-card rounded-lg p-4"
    : "glass-panel fixed bottom-4 left-4 right-4 z-50 rounded-lg p-4 text-[#17322e] sm:bottom-5 sm:left-auto sm:right-5 sm:w-[min(390px,calc(100vw-32px))]";

  if (!open && !isDoctor) {
    return (
      <button
        aria-label="Deschide asistentul de cabinet"
        className="fixed bottom-4 left-4 z-50 flex max-w-[calc(100vw-32px)] items-center gap-3 rounded-full border border-white/70 bg-white/90 px-4 py-3 text-sm font-black text-[#17322e] shadow-[0_18px_55px_rgba(42,112,103,.22)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#62b6a7] hover:bg-white sm:bottom-5 sm:left-auto sm:right-5"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="pulse-dot flex h-10 w-10 items-center justify-center rounded-full bg-[#2d8d7f] text-xs font-black text-white shadow-sm">
          CS
        </span>
        <span className="hidden sm:inline">Întreabă cabinetul</span>
        <span className="sm:hidden">Cabinet</span>
      </button>
    );
  }

  return (
    <section className={shellClass}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2d8d7f] text-xs font-black text-white shadow-sm">
            CS
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
              {isDoctor ? "Agenda internă" : "Asistent cabinet"}
            </p>
            <h2 className="mt-1 text-xl font-black text-[#17322e]">
              {isDoctor ? "Rezumatul zilei" : "Cata Stoma răspunde"}
            </h2>
          </div>
        </div>
        {!isDoctor ? (
          <button
            className="rounded-full bg-[#eef8f5] px-3 py-1 text-sm font-black text-[#248176] transition hover:bg-[#dff3ef]"
            onClick={() => setOpen(false)}
            type="button"
          >
            închide
          </button>
        ) : null}
      </div>

      {isDoctor ? (
        <div className="mt-4 grid gap-2">
          {botReminders.map((reminder) => (
            <div
              className="rounded-lg bg-[#f4fbf9] p-3 text-sm ring-1 ring-[#d8eee9]"
              key={reminder.title}
            >
              <p className="font-black text-[#17322e]">
                {reminder.time} - {reminder.title}
              </p>
              <p className="mt-1 leading-5 text-[#647a75]">{reminder.detail}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 max-h-72 space-y-2 overflow-auto rounded-lg bg-[#f7fbfa] p-3 ring-1 ring-[#d8eee9]">
        {messages.map((message, index) => (
          <p
            className={
              message.role === "bot"
                ? "rounded-lg bg-white p-3 text-sm leading-6 text-[#314d48] shadow-sm ring-1 ring-[#d8eee9]"
                : "ml-auto w-fit rounded-lg bg-[#62b6a7] px-3 py-2 text-sm font-bold text-white shadow-sm"
            }
            key={`${message.role}-${index}`}
          >
            {message.text}
          </p>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {prompts.map(([key, label]) => (
          <button
            className="rounded-full border border-[#cde7e1] bg-white px-3 py-2 text-xs font-black text-[#248176] transition hover:-translate-y-0.5 hover:border-[#62b6a7] hover:bg-[#eef8f5]"
            key={key}
            onClick={() => sendMessage(label)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <form
        className="mt-3 grid grid-cols-[1fr_auto] gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage(input);
        }}
      >
        <input
          className="min-w-0 rounded-full border border-[#cde7e1] bg-white px-4 py-3 text-sm font-medium text-[#17322e] outline-none placeholder:text-[#8aa29c] focus:border-[#62b6a7]"
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            isDoctor
              ? "Scrie: cine urmează, cereri urgente..."
              : "Scrie întrebarea ta..."
          }
          value={input}
        />
        <button
          className="button-sheen rounded-full bg-[#2d8d7f] px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#176f65] disabled:opacity-55"
          disabled={isLoading}
          type="submit"
        >
          Trimite
        </button>
      </form>

      <p className="mt-3 text-xs leading-5 text-[#647a75]">
        {isDoctor
          ? `${appointments.length} programări și ${appointmentRequests.length} cereri sunt în agenda internă.`
          : "Răspunsurile sunt orientative; confirmarea finală vine telefonic de la cabinet."}
      </p>
    </section>
  );
}
