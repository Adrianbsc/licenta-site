import Link from "next/link";
import ClinicBot from "./components/ClinicBot";
import {
  caseStudies,
  clinic,
  doctors,
  serviceTariffs,
  services,
  signatureTreatments,
  testimonials,
} from "./lib/clinic-data";

const metrics = [
  ["7+", "ani de practica in Timisoara"],
  ["1 medic", "principal, relatie directa"],
  ["24h", "raspuns pentru cereri"],
  ["0 graba", "programari aerisite"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7fbfa] text-[#17322e]">
      <section
        className="relative isolate overflow-hidden bg-[#eaf7f4]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(247,251,250,.98) 0%, rgba(247,251,250,.92) 48%, rgba(247,251,250,.5) 100%), url('https://upload.wikimedia.org/wikipedia/commons/9/9a/ITS_Dental_Chair.jpg')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
          <Link
            className="rounded-full bg-white/80 px-4 py-2 text-2xl font-black tracking-normal text-[#17322e] shadow-sm ring-1 ring-[#d8eee9]"
            href="/"
          >
            {clinic.name}
          </Link>
          <nav className="hidden items-center gap-7 rounded-full bg-white/76 px-5 py-3 text-sm font-bold text-[#516964] shadow-sm ring-1 ring-[#d8eee9] backdrop-blur md:flex">
            <a className="transition hover:text-[#248176]" href="#servicii">
              Servicii
            </a>
            <a className="transition hover:text-[#248176]" href="#tarife">
              Tarife
            </a>
            <a className="transition hover:text-[#248176]" href="#cazuri">
              Cazuri
            </a>
            <a className="transition hover:text-[#248176]" href="#echipa">
              Echipa
            </a>
            <Link className="transition hover:text-[#248176]" href="/doctor">
              Doctor
            </Link>
          </nav>
          <a
            className="rounded-full bg-[#62b6a7] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#4aa495]"
            href="#programare"
          >
            Vreau o programare
          </a>
        </header>

        <div className="mx-auto grid min-h-[calc(100svh-92px)] w-full max-w-7xl items-center gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.04fr_.96fr] lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#248176]">
              Cabinet stomatologic in {clinic.city}
            </p>
            <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-normal text-[#17322e] sm:text-6xl">
              Zambete lucrate atent, intr-un cabinet calm si luminos.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#516964]">
              Cata Stoma este un cabinet din {clinic.area}, pentru pacienti care
              vor un medic care explica pe inteles, planifica si lucreaza fara
              graba. Tratam problema, dar pastram omul in centru.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="rounded-full bg-[#f3c96b] px-6 py-3 text-sm font-black text-[#17322e] shadow-sm transition hover:bg-[#f6d889]"
                href="#programare"
              >
                Hai sa ne cunoastem
              </a>
              <a
                className="rounded-full border border-[#b7ded7] bg-white/74 px-6 py-3 text-sm font-black text-[#248176] transition hover:bg-white"
                href={`tel:${clinic.phone.replaceAll(" ", "")}`}
              >
                {clinic.phone}
              </a>
            </div>
          </div>

          <aside className="max-w-md justify-self-start rounded-lg border border-[#cde7e1] bg-white/92 p-5 text-[#17322e] shadow-[0_20px_70px_rgba(42,112,103,.14)] backdrop-blur lg:justify-self-end">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
              Prima consultatie
            </p>
            <h2 className="mt-3 text-3xl font-black">
              Diagnostic, fotografii si plan scris.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#647a75]">
              Pleci cu raspunsuri clare: ce e urgent, ce poate astepta si ce
              optiuni ai realist pentru bugetul tau.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {metrics.map(([value, label]) => (
                <div
                  className="rounded-lg bg-[#eef8f5] p-4 ring-1 ring-[#d8eee9]"
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
        className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
              Ce putem face
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-[#17322e] sm:text-5xl">
              Tratamente clare, cu pasi si costuri discutate dinainte.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#647a75]">
              Structura este simpla: intai intelegem cauza, apoi alegem varianta
              corecta pentru timp, confort si buget.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {services.slice(0, 4).map((service) => (
              <article
                className="rounded-lg border border-[#d8eee9] bg-white p-5 shadow-[0_14px_40px_rgba(42,112,103,.08)]"
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
        className="border-y border-[#d8eee9] bg-white px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
                Servicii si tarife
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-normal text-[#17322e] sm:text-5xl">
                Bare curate pentru fiecare tratament, usor de comparat.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#647a75]">
              Tarifele sunt orientative. Pentru tratamente complexe, pretul
              final se stabileste dupa consultatie si plan.
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            {serviceTariffs.map((group) => (
              <article
                className="overflow-hidden rounded-lg border border-[#cde7e1] bg-[#f7fbfa] shadow-sm"
                key={group.category}
              >
                <div className="grid gap-3 bg-[#e3f4f0] px-5 py-4 text-[#17322e] md:grid-cols-[220px_1fr_120px_140px_100px] md:items-center">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
                    {group.category}
                  </p>
                  <p className="hidden text-xs font-black uppercase tracking-[0.16em] text-[#7d948f] md:block">
                    Serviciu si detalii
                  </p>
                  <p className="hidden text-xs font-black uppercase tracking-[0.16em] text-[#7d948f] md:block">
                    Durata
                  </p>
                  <p className="hidden text-xs font-black uppercase tracking-[0.16em] text-[#7d948f] md:block">
                    Tarif
                  </p>
                  <p className="hidden text-xs font-black uppercase tracking-[0.16em] text-[#7d948f] md:block">
                    Actiune
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
        className="border-y border-[#d8eee9] bg-[#eef7fb] px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
                Cazuri si rezultate
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-normal text-[#17322e] sm:text-5xl">
                Fiecare caz are o solutie, dar nu fiecare solutie trebuie sa
                arate la fel.
              </h2>
            </div>
            <a
              className="w-fit rounded-full border border-[#b7ded7] bg-white px-5 py-3 text-sm font-black text-[#248176] shadow-sm transition hover:border-[#62b6a7]"
              href="#programare"
            >
              Discuta cazul tau
            </a>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {caseStudies.map((study) => (
              <article
                className="min-h-72 rounded-lg border border-[#cde7e1] bg-white p-5 shadow-[0_14px_40px_rgba(42,112,103,.08)]"
                key={study.title}
              >
                <div className="flex h-32 items-end rounded-lg bg-[#d9efe9] p-4 text-[#17322e] ring-1 ring-[#c5e4dd]">
                  <p className="text-sm font-black uppercase tracking-[0.18em]">
                    caz real demo
                  </p>
                </div>
                <h3 className="mt-5 text-xl font-black text-[#17322e]">
                  {study.title}
                </h3>
                <p className="mt-2 text-sm font-bold text-[#248176]">
                  {study.type}
                </p>
                <p className="mt-4 text-sm leading-6 text-[#647a75]">
                  {study.result}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="echipa"
        className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-10"
      >
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
            Echipa
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-normal text-[#17322e] sm:text-5xl">
            Medici care iti spun si ce nu trebuie facut.
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#647a75]">
            Am pastrat identitatea simpla: cabinet local, comunicare curata,
            tratamente facute metodic. Fara promisiuni de revista.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {doctors.map((doctor) => (
            <article
              className="rounded-lg border border-[#d8eee9] bg-white p-5 shadow-sm"
              key={doctor.name}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#62b6a7] text-xl font-black text-white">
                {doctor.name.split(" ").slice(-1)[0].slice(0, 1)}
              </div>
              <h3 className="mt-5 text-xl font-black text-[#17322e]">
                {doctor.name}
              </h3>
              <p className="mt-1 text-sm font-black text-[#c59b37]">
                {doctor.role}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#647a75]">
                {doctor.focus}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#d8eee9] bg-white px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
            Ce spun pacientii
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <figure
                className="rounded-lg border border-[#d8eee9] bg-[#f7fbfa] p-5"
                key={item.name}
              >
                <blockquote className="text-sm leading-7 text-[#314d48]">
                  &quot;{item.text}&quot;
                </blockquote>
                <figcaption className="mt-4 text-sm font-black text-[#17322e]">
                  {item.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section
        id="programare"
        className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-16 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:px-10"
      >
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248176]">
            Programare
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-normal text-[#17322e] sm:text-5xl">
            Scrie-ne ce te supara si te sunam pentru confirmare.
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#647a75]">
            {clinic.address}. Program: {clinic.hours}. Pentru intrebari rapide,
            foloseste Asistentul Virtual din coltul paginii.
          </p>
        </div>
        <form className="rounded-lg border border-[#d8eee9] bg-white p-5 shadow-[0_14px_40px_rgba(42,112,103,.08)] sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {["Nume", "Telefon"].map((label) => (
              <label className="grid gap-2 text-sm font-black" key={label}>
                {label}
                <input className="rounded-lg border border-[#cde7e1] px-4 py-3 font-medium outline-none transition focus:border-[#62b6a7]" />
              </label>
            ))}
            <label className="grid gap-2 text-sm font-black">
              Serviciu
              <select className="rounded-lg border border-[#cde7e1] px-4 py-3 font-medium outline-none transition focus:border-[#62b6a7]">
                {signatureTreatments.slice(0, 5).map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black">
              Data preferata
              <input
                className="rounded-lg border border-[#cde7e1] px-4 py-3 font-medium outline-none transition focus:border-[#62b6a7]"
                type="date"
              />
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-black">
            Mesaj
            <textarea
              className="min-h-28 rounded-lg border border-[#cde7e1] px-4 py-3 font-medium outline-none transition focus:border-[#62b6a7]"
              placeholder="Durere, control, estetica, copil, urgenta..."
            />
          </label>
          <button
            className="mt-5 w-full rounded-full bg-[#62b6a7] px-5 py-4 text-sm font-black text-white transition hover:bg-[#4aa495]"
            type="button"
          >
            Trimite cererea
          </button>
        </form>
      </section>

      <footer className="bg-[#17322e] px-5 py-8 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-2xl font-black">{clinic.name}</p>
            <p className="mt-2 text-sm text-white/68">
              {clinic.address} - {clinic.phone} - {clinic.email}
            </p>
          </div>
          <Link
            className="w-fit rounded-full bg-white/12 px-4 py-2 text-sm font-black transition hover:bg-white/18"
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
