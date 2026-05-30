"use client";

import { useState } from "react";

type AppointmentRequestFormProps = {
  services: string[];
};

const initialForm = {
  patient: "",
  phone: "",
  service: "Implanturi dentare",
  preferredDate: "",
  message: "",
};

export default function AppointmentRequestForm({
  services,
}: AppointmentRequestFormProps) {
  const [form, setForm] = useState({
    ...initialForm,
    service: services[0] ?? initialForm.service,
  });
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/appointment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(payload.error ?? "Nu am putut trimite cererea.");
        return;
      }

      setForm({ ...initialForm, service: services[0] ?? initialForm.service });
      setMessage("Cererea a fost trimisă. Doctorul o vede în panou.");
    } catch {
      setMessage("Nu pot trimite acum. Verifică dacă serverul rulează.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className="rounded-lg border border-[#d8eee9] bg-white p-5 shadow-[0_14px_40px_rgba(42,112,103,.08)] sm:p-6"
      onSubmit={submitRequest}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-black">
          Nume
          <input
            className="rounded-lg border border-[#cde7e1] px-4 py-3 font-medium outline-none transition focus:border-[#62b6a7]"
            onChange={(event) =>
              setForm((current) => ({ ...current, patient: event.target.value }))
            }
            required
            value={form.patient}
          />
        </label>
        <label className="grid gap-2 text-sm font-black">
          Telefon
          <input
            className="rounded-lg border border-[#cde7e1] px-4 py-3 font-medium outline-none transition focus:border-[#62b6a7]"
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
            required
            value={form.phone}
          />
        </label>
        <label className="grid gap-2 text-sm font-black">
          Serviciu
          <select
            className="rounded-lg border border-[#cde7e1] px-4 py-3 font-medium outline-none transition focus:border-[#62b6a7]"
            onChange={(event) =>
              setForm((current) => ({ ...current, service: event.target.value }))
            }
            value={form.service}
          >
            {services.slice(0, 5).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-black">
          Data preferată
          <input
            className="rounded-lg border border-[#cde7e1] px-4 py-3 font-medium outline-none transition focus:border-[#62b6a7]"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                preferredDate: event.target.value,
              }))
            }
            type="date"
            value={form.preferredDate}
          />
        </label>
      </div>
      <label className="mt-4 grid gap-2 text-sm font-black">
        Mesaj
        <textarea
          className="min-h-28 rounded-lg border border-[#cde7e1] px-4 py-3 font-medium outline-none transition focus:border-[#62b6a7]"
          onChange={(event) =>
            setForm((current) => ({ ...current, message: event.target.value }))
          }
          placeholder="Durere, control, estetică, copil, urgență..."
          value={form.message}
        />
      </label>
      <button
        className="mt-5 w-full rounded-full bg-[#62b6a7] px-5 py-4 text-sm font-black text-white transition hover:bg-[#4aa495] disabled:opacity-50"
        disabled={isSaving}
        type="submit"
      >
        {isSaving ? "Se trimite..." : "Trimite cererea"}
      </button>
      {message ? (
        <p className="mt-4 rounded-lg bg-[#eef8f5] p-3 text-sm font-bold text-[#248176]">
          {message}
        </p>
      ) : null}
    </form>
  );
}
