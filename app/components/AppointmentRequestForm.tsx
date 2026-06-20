"use client";

import { useState } from "react";

type AppointmentRequestFormProps = {
  services: string[];
};

const initialForm = {
  patient: "",
  phone: "",
  email: "",
  service: "Implanturi dentare",
  preferredDate: "",
  message: "",
};

const fieldClass =
  "rounded-lg border border-[#cde7e1] bg-white/92 px-4 py-3 font-medium outline-none focus:border-[#2d8d7f]";

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
      className="soft-card interactive-card rounded-lg p-5 sm:p-6"
      onSubmit={submitRequest}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
            Cerere rapidă
          </p>
          <h3 className="mt-2 text-2xl font-black text-[#17322e]">
            Spune-ne pe scurt ce ai nevoie.
          </h3>
        </div>
        <span className="rounded-full bg-[#e8f7f3] px-3 py-2 text-xs font-black text-[#176f65] ring-1 ring-[#cde7e1]">
          răspuns în 24h
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-black">
          Nume
          <input
            className={fieldClass}
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
            className={fieldClass}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
            required
            value={form.phone}
          />
        </label>
        <label className="grid gap-2 text-sm font-black">
          Email pentru răspuns
          <input
            className={fieldClass}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="nume@email.ro"
            type="email"
            value={form.email}
          />
        </label>
        <label className="grid gap-2 text-sm font-black">
          Serviciu
          <select
            className={fieldClass}
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
            className={fieldClass}
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
          className={`${fieldClass} min-h-28`}
          onChange={(event) =>
            setForm((current) => ({ ...current, message: event.target.value }))
          }
          placeholder="Durere, control, estetică, copil, urgență..."
          value={form.message}
        />
      </label>
      <button
        className="button-sheen mt-5 w-full rounded-full bg-[#2d8d7f] px-5 py-4 text-sm font-black text-white shadow-[0_16px_38px_rgba(45,141,127,.22)] transition hover:-translate-y-0.5 hover:bg-[#176f65] disabled:opacity-50"
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
