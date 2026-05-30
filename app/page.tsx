import Image from "next/image";
import Link from "next/link";
import AppointmentRequestForm from "./components/AppointmentRequestForm";
import ClinicBot from "./components/ClinicBot";
import ReviewsClient from "./components/ReviewsClient";
import {
  caseStudies,
  clinic,
  doctors,
  serviceTariffs,
  services,
  signatureTreatments,
} from "./lib/clinic-data";
import { listReviews } from "./lib/clinic-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const metrics = [
  ["7+", "ani de practică în Timișoara"],
  ["1 medic", "principal, relație directă"],
  ["24h", "răspuns pentru cereri"],
  ["0 grabă", "programări aerisite"],
];

const caseImages = [
  {
    alt: "Pacientă zâmbind după o consultație stomatologică",
    position: "center 42%",
    src: "/cases/smile-reconstruction.png",
  },
  {
    alt: "Consultație estetică dentară cu ghid de nuanțe",
    position: "center 48%",
    src: "/cases/veneers-consultation.png",
  },
  {
    alt: "Planificare de implant dentar cu scanare digitală",
    position: "center 48%",
    src: "/cases/implant-planning.png",
  },
];

export default async function Home() {
  const reviews = await listReviews();

  return (
    <main className="min-h-screen bg-[#f4faf8] text-[#17322e]">
      <section
        className="relative isolate overflow-hidden border-b border-[#d2e8e2] bg-[#eaf7f4]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(247,251,250,.98) 0%, rgba(247,251,250,.9) 50%, rgba(247,251,250,.36) 100%), url('https://upload.wikimedia.org/wikipedia/commons/9/9a/ITS_Dental_Chair.jpg')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
          <Link
            className="rounded-full bg-white/88 px-4 py-2 text-2xl font-black tracking-normal text-[#17322e] shadow-sm ring-1 ring-[#d8eee9] backdrop-blur"
            href="/"
          >
            {clinic.name}
          </Link>
          <nav className="hidden items-center gap-6 rounded-full bg-white/84 px-5 py-3 text-sm font-bold text-[#516964] shadow-[0_12px_36px_rgba(23,50,46,.08)] ring-1 ring-[#d8eee9] backdrop-blur md:flex">
            <a className="transition hover:text-[#248176]" href="#servicii">
              Servicii
            </a>
            <a className="transition hover:text-[#248176]" href="#tarife">
              Tarife
            </a>
            <a className="transition hover:text-[#248176]" href="#cazuri">
              Cazuri
            </a>
            <a className="transition hover:text-[#248176]" href="#review-uri">
              Recenzii
            </a>
            <a className="transition hover:text-[#248176]" href="#echipa">
              Echipa
            </a>
            <Link
              className="rounded-full border border-[#b7ded7] bg-white px-4 py-2 text-[#248176] shadow-sm transition hover:border-[#62b6a7] hover:bg-[#eef8f5]"
              href="/doctor"
            >
              Panou doctor
            </Link>
          </nav>
          <a
            className="rounded-full bg-[#62b6a7] px-5 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(36,129,118,.22)] transition hover:bg-[#4aa495]"
            href="#programare"
          >
            Vreau o programare
          </a>
        </header>

        <div className="mx-auto grid min-h-[calc(100svh-92px)] w-full max-w-7xl items-center gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.04fr_.96fr] lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#248176]">
              Cabinet stomatologic în {clinic.city}
            </p>
            <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-normal text-[#17322e] sm:text-6xl">
              Zâmbete lucrate atent, într-un cabinet calm și luminos.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#516964]">
              Cata Stoma este un cabinet din zona {clinic.area}, pentru pacienți
              care vor explicații clare, planuri realiste și tratamente făcute
              fără grabă. Tratăm problema, dar păstrăm omul în centru.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="rounded-full bg-[#f3c96b] px-6 py-3 text-sm font-black text-[#17322e] shadow-[0_14px_34px_rgba(197,155,55,.24)] transition hover:bg-[#f6d889]"
                href="#programare"
              >
                Hai să ne cunoaștem
              </a>
              <a
                className="rounded-full border border-[#b7ded7] bg-white/80 px-6 py-3 text-sm font-black text-[#248176] shadow-sm transition hover:bg-white"
                href={`tel:${clinic.phone.replaceAll(" ", "")}`}
              >
                {clinic.phone}
              </a>
            </div>
          </div>

          <aside className="max-w-md justify-self-start rounded-lg border border-[#cde7e1] bg-white/94 p-5 text-[#17322e] shadow-[0_24px_80px_rgba(42,112,103,.16)] backdrop-blur lg:justify-self-end">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
              Prima consultație
            </p>
            <h2 className="mt-3 text-3xl font-black">
              Diagnostic, fotografii și plan scris.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#647a75]">
              Pleci cu răspunsuri clare: ce este urgent, ce poate aștepta și ce
              opțiuni se potrivesc realist bugetului tău.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {metrics.map(([value, label]) => (
                <div
                  className="rounded-lg bg-[#eef8f5] p-4 ring-1 ring-[#d8eee9] transition hover:bg-[#e4f5f1]"
                  key={`${value}-${label}`}
                >
                  <p className="text-3xl font-black text-[#248176]">{value}</p>
                  <p className="mt-1 text-xs font-bold leading-5 text-[#647a75]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-[#d8eee9] bg-white px-5 py-4 sm:px-8 lg:px-10">
        <div className="mx-auto grid w-full max-w-7xl gap-3 lg:grid-cols-[180px_1fr] lg:items-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
            Servicii rapide
          </p>
          <div className="flex flex-wrap gap-3">
            {signatureTreatments.map((treatment) => (
              <a
                className="rounded-full border border-[#cde7e1] bg-[#f7fbfa] px-4 py-2 text-sm font-black text-[#314d48] transition hover:border-[#62b6a7] hover:bg-[#eaf7f4] hover:text-[#248176]"
                href="#servicii"
                key={treatment}
              >
                {treatment}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section
        id="servicii"
        className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-10"
      >
        <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
              Ce putem face
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-[#17322e] sm:text-5xl">
              Tratamente clare, cu pași și costuri discutate dinainte.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#647a75]">
              Începem prin a înțelege cauza, apoi alegem varianta potrivită
              pentru timp, confort și buget.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {services.slice(0, 4).map((service) => (
              <article
                className="rounded-lg border border-[#d8eee9] bg-white p-5 shadow-[0_14px_40px_rgba(42,112,103,.08)] transition hover:-translate-y-1 hover:border-[#b7ded7] hover:shadow-[0_20px_54px_rgba(42,112,103,.13)]"
                key={service.name}
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c59b37]">
                  {service.price}
                </p>
                <h3 className="mt-3 text-xl font-black text-[#17322e]">
                  {service.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#647a75]">
                  {service.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="tarife"
        className="border-y border-[#d8eee9] bg-white px-5 py-20 sm:px-8 lg:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
                Servicii și tarife
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-normal text-[#17322e] sm:text-5xl">
                Repere clare pentru fiecare tratament, ușor de comparat.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#647a75]">
              Tarifele sunt orientative. Pentru tratamente complexe, prețul
              final se stabilește după consultație și plan.
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            {serviceTariffs.map((group) => (
              <article
                className="overflow-hidden rounded-lg border border-[#cde7e1] bg-[#f7fbfa] shadow-[0_12px_34px_rgba(23,50,46,.06)]"
                key={group.category}
              >
                <div className="grid gap-3 bg-[#e3f4f0] px-5 py-4 text-[#17322e] md:grid-cols-[220px_1fr_120px_140px_100px] md:items-center">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
                    {group.category}
                  </p>
                  <p className="hidden text-xs font-black uppercase tracking-[0.16em] text-[#7d948f] md:block">
                    Serviciu și detalii
                  </p>
                  <p className="hidden text-xs font-black uppercase tracking-[0.16em] text-[#7d948f] md:block">
                    Durata
                  </p>
                  <p className="hidden text-xs font-black uppercase tracking-[0.16em] text-[#7d948f] md:block">
                    Tarif
                  </p>
                  <p className="hidden text-xs font-black uppercase tracking-[0.16em] text-[#7d948f] md:block">
                    Acțiune
                  </p>
                </div>

                {group.items.map((item) => (
                  <div
                    className="grid gap-3 border-t border-[#d8eee9] bg-white px-5 py-4 transition hover:bg-[#f4fbf9] md:grid-cols-[220px_1fr_120px_140px_100px] md:items-center"
                    key={item.service}
                  >
                    <p className="text-sm font-black text-[#248176]">
                      {group.category}
                    </p>
                    <div>
                      <h3 className="text-lg font-black text-[#17322e]">
                        {item.service}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[#647a75]">
                        {item.detail}
                      </p>
                    </div>
                    <p className="rounded-full bg-[#eef8f5] px-3 py-2 text-sm font-black text-[#248176] md:text-center">
                      {item.duration}
                    </p>
                    <p className="text-xl font-black text-[#17322e]">
                      {item.price}
                    </p>
                    <a
                      className="w-fit rounded-full bg-[#f3c96b] px-4 py-2 text-xs font-black text-[#17322e] transition hover:bg-[#f6d889]"
                      href="#programare"
                    >
                      Alege
                    </a>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="cazuri"
        className="border-y border-[#d8eee9] bg-[#eef7fb] px-5 py-20 sm:px-8 lg:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
                Cazuri și rezultate
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-normal text-[#17322e] sm:text-5xl">
                Fiecare caz are o soluție, dar nu fiecare soluție trebuie să
                arate la fel.
              </h2>
            </div>
            <a
              className="w-fit rounded-full border border-[#b7ded7] bg-white px-5 py-3 text-sm font-black text-[#248176] shadow-sm transition hover:border-[#62b6a7]"
              href="#programare"
            >
              Discută cazul tău
            </a>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {caseStudies.map((study, index) => (
              <article
                className="group overflow-hidden rounded-lg border border-[#cde7e1] bg-white shadow-[0_14px_40px_rgba(42,112,103,.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_54px_rgba(42,112,103,.13)]"
                key={study.title}
              >
                <div className="relative aspect-[16/11] overflow-hidden bg-[#d9efe9]">
                  <Image
                    alt={caseImages[index].alt}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    src={caseImages[index].src}
                    style={{ objectPosition: caseImages[index].position }}
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#248176]">
                    Caz demonstrativ
                  </p>
                  <h3 className="text-xl font-black text-[#17322e]">
                    {study.title}
                  </h3>
                  <p className="mt-2 text-sm font-bold text-[#248176]">
                    {study.type}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-[#647a75]">
                    {study.result}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="echipa"
        className="border-y border-[#d8eee9] bg-white px-5 py-20 sm:px-8 lg:px-10"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[.92fr_1.08fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
              Echipa
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-[#17322e] sm:text-5xl">
              Medici atenți, explicații clare.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#647a75]">
              Cabinet local, comunicare curată și tratamente făcute metodic.
              Fiecare plan este explicat înainte, fără promisiuni exagerate.
            </p>
          </div>
          <div className="grid gap-4">
            {doctors.map((doctor) => (
              <article
                className="rounded-lg border border-[#d8eee9] bg-[#f7fbfa] p-5"
                key={doctor.name}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#17322e]">
                      {doctor.name}
                    </h3>
                    <p className="mt-1 text-sm font-black text-[#248176]">
                      {doctor.role}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-[#647a75] ring-1 ring-[#d8eee9]">
                    Cata Stoma
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#647a75]">
                  {doctor.focus}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="review-uri"
        className="border-b border-[#d8eee9] bg-[#f7fbfa] px-5 py-20 sm:px-8 lg:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
            Ce spun pacienții
          </p>
          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <h2 className="max-w-3xl text-3xl font-black tracking-normal sm:text-5xl">
              Păreri reale, direct pe pagină.
            </h2>
            <p className="max-w-md text-sm leading-6 text-[#647a75]">
              Pacienții pot lăsa o recenzie aici, iar feedback-ul apare imediat
              în listă.
            </p>
          </div>
          <div className="mt-8">
            <ReviewsClient initialReviews={reviews} compact />
          </div>
        </div>
      </section>

      <section
        id="programare"
        className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-20 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:px-10"
      >
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
            Programare
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-normal text-[#17322e] sm:text-5xl">
            Scrie-ne ce te supără și te sunăm pentru confirmare.
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#647a75]">
            {clinic.address}. Program: {clinic.hours}. Pentru întrebări rapide,
            folosește Asistentul Virtual din colțul paginii.
          </p>
        </div>
        <AppointmentRequestForm services={signatureTreatments} />
      </section>

      <footer className="bg-[#17322e] px-5 py-8 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-2xl font-black">{clinic.name}</p>
            <p className="mt-2 text-sm text-white/68">
              {clinic.address} • {clinic.phone} • {clinic.email}
            </p>
          </div>
          <Link
            className="w-fit rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-black transition hover:bg-white/16"
            href="/doctor"
          >
            Panou doctor
          </Link>
        </div>
      </footer>
      <ClinicBot mode="patient" />
    </main>
  );
}
