"use client";

import { useMemo, useState } from "react";

type UtilityKey = "durere" | "control" | "estetica" | "aparat";

const utilities: Record<
  UtilityKey,
  {
    title: string;
    detail: string;
    duration: string;
    priority: string;
    steps: string[];
  }
> = {
  durere: {
    title: "Durere sau urgență",
    detail: "Potrivit pentru durere, inflamație, dinte spart sau sensibilitate puternică.",
    duration: "30-45 min",
    priority: "Prioritate ridicată",
    steps: [
      "Notează când a început durerea.",
      "Spune dacă ai luat medicamente.",
      "Atașează în mesaj zona care te supără.",
    ],
  },
  control: {
    title: "Control și igienizare",
    detail: "Pentru verificare periodică, detartraj, air-flow sau recomandări de prevenție.",
    duration: "45-60 min",
    priority: "Programare normală",
    steps: [
      "Alege o zi în care poți ajunge fără grabă.",
      "Menționează tratamentele recente.",
      "Pregătește întrebările pentru medic.",
    ],
  },
  estetica: {
    title: "Estetică dentară",
    detail: "Pentru albire, fațete, reconstrucții sau îmbunătățirea zâmbetului.",
    duration: "60 min",
    priority: "Consultație de plan",
    steps: [
      "Spune ce rezultat îți dorești.",
      "Poți aduce fotografii de referință.",
      "Planul se stabilește după evaluarea smalțului.",
    ],
  },
  aparat: {
    title: "Aparat dentar",
    detail: "Pentru evaluare ortodontică, aliniere dentară și opțiuni de tratament.",
    duration: "45-60 min",
    priority: "Evaluare inițială",
    steps: [
      "Menționează dacă ai mai purtat aparat.",
      "Spune ce te deranjează la mușcătură.",
      "Medicul îți explică următorii pași.",
    ],
  },
};

export default function PatientUtilities() {
  const [selected, setSelected] = useState<UtilityKey>("durere");
  const [hasAnxiety, setHasAnxiety] = useState(false);
  const [needsCall, setNeedsCall] = useState(true);
  const utility = utilities[selected];
  const score = useMemo(() => {
    let value = selected === "durere" ? 85 : selected === "estetica" ? 55 : 45;

    if (hasAnxiety) {
      value += 8;
    }

    if (needsCall) {
      value += 5;
    }

    return Math.min(value, 98);
  }, [hasAnxiety, needsCall, selected]);

  return (
    <section
      id="utilitati"
      className="border-y border-[#d8eee9] bg-white px-5 py-20 sm:px-8 lg:px-10"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
            Utilități pacient
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-normal text-[#17322e] sm:text-5xl">
            Alege problema și vezi ce programare are sens.
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#647a75]">
            Modul rapid pentru orientare: prioritate, durată estimată și pași
            simpli înainte să trimiți cererea.
          </p>
        </div>

        <div className="soft-card rounded-lg p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(utilities) as UtilityKey[]).map((key) => (
              <button
                className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 ${
                  selected === key
                    ? "border-[#2d8d7f] bg-[#e8f7f3] shadow-[0_16px_40px_rgba(45,141,127,.12)]"
                    : "border-[#d8eee9] bg-[#f7fbfa]"
                }`}
                key={key}
                onClick={() => setSelected(key)}
                type="button"
              >
                <p className="font-black text-[#17322e]">{utilities[key].title}</p>
                <p className="mt-2 text-sm leading-6 text-[#647a75]">
                  {utilities[key].detail}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 rounded-lg bg-[#f7fbfa] p-4 ring-1 ring-[#d8eee9] md:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
                Recomandare
              </p>
              <h3 className="mt-2 text-2xl font-black">{utility.title}</h3>
              <div className="mt-4 grid gap-2 text-sm font-bold text-[#314d48]">
                <label className="flex items-center gap-2">
                  <input
                    checked={hasAnxiety}
                    onChange={(event) => setHasAnxiety(event.target.checked)}
                    type="checkbox"
                  />
                  Am emoții la dentist
                </label>
                <label className="flex items-center gap-2">
                  <input
                    checked={needsCall}
                    onChange={(event) => setNeedsCall(event.target.checked)}
                    type="checkbox"
                  />
                  Vreau confirmare telefonică
                </label>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-white p-3 ring-1 ring-[#d8eee9]">
                  <p className="text-xs font-black text-[#647a75]">Prioritate</p>
                  <p className="mt-1 text-sm font-black text-[#248176]">
                    {utility.priority}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3 ring-1 ring-[#d8eee9]">
                  <p className="text-xs font-black text-[#647a75]">Durată</p>
                  <p className="mt-1 text-sm font-black text-[#248176]">
                    {utility.duration}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3 ring-1 ring-[#d8eee9]">
                  <p className="text-xs font-black text-[#647a75]">Potrivire</p>
                  <p className="mt-1 text-sm font-black text-[#248176]">
                    {score}%
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-white p-4 ring-1 ring-[#d8eee9]">
                <p className="text-sm font-black text-[#17322e]">
                  Înainte de consultație
                </p>
                <div className="mt-3 grid gap-2">
                  {utility.steps.map((step, index) => (
                    <p
                      className="text-sm leading-6 text-[#647a75]"
                      key={step}
                    >
                      <span className="mr-2 font-black text-[#248176]">
                        {index + 1}.
                      </span>
                      {step}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
