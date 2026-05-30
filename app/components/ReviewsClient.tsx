"use client";

import { useMemo, useState } from "react";
import type { Review } from "../lib/clinic-db";

type ReviewsClientProps = {
  initialReviews: Review[];
  compact?: boolean;
};

const emptyReview = {
  name: "",
  rating: 5,
  treatment: "",
  text: "",
};

export default function ReviewsClient({
  compact = false,
  initialReviews,
}: ReviewsClientProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [form, setForm] = useState(emptyReview);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const average = useMemo(() => {
    if (reviews.length === 0) {
      return "0.0";
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const visibleReviews = compact ? reviews.slice(0, 4) : reviews;

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as {
        review?: Review;
        error?: string;
      };

      if (!response.ok || !payload.review) {
        setMessage(payload.error ?? "Nu am putut salva recenzia.");
        return;
      }

      setReviews((current) => [payload.review!, ...current]);
      setForm(emptyReview);
      setMessage("Recenzia a fost publicată. Mulțumim!");
    } catch {
      setMessage("Nu pot salva acum. Verifică dacă serverul rulează.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,390px)_1fr]">
      <aside
        className={
          compact
            ? "h-fit rounded-lg border border-[#d8eee9] bg-white p-5 shadow-[0_14px_40px_rgba(42,112,103,.08)]"
            : "h-fit rounded-lg border border-[#d8eee9] bg-white p-5 shadow-[0_14px_40px_rgba(42,112,103,.08)] lg:sticky lg:top-6"
        }
      >
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#248176]">
          Adaugă recenzie
        </p>
        <h2 className="mt-2 text-2xl font-black">Experiența ta contează.</h2>
        <form className="mt-5 grid gap-4" onSubmit={submitReview}>
          <label className="grid gap-2 text-sm font-black">
            Nume
            <input
              className="rounded-lg border border-[#cde7e1] px-4 py-3 font-medium outline-none transition focus:border-[#62b6a7]"
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
              value={form.name}
            />
          </label>
          <label className="grid gap-2 text-sm font-black">
            Notă
            <select
              className="rounded-lg border border-[#cde7e1] px-4 py-3 font-medium outline-none transition focus:border-[#62b6a7]"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  rating: Number(event.target.value),
                }))
              }
              value={form.rating}
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating}/5
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-black">
            Tratament
            <input
              className="rounded-lg border border-[#cde7e1] px-4 py-3 font-medium outline-none transition focus:border-[#62b6a7]"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  treatment: event.target.value,
                }))
              }
              placeholder="Igienizare, consultație, urgență..."
              value={form.treatment}
            />
          </label>
          <label className="grid gap-2 text-sm font-black">
            Recenzie
            <textarea
              className="min-h-32 rounded-lg border border-[#cde7e1] px-4 py-3 font-medium outline-none transition focus:border-[#62b6a7]"
              onChange={(event) =>
                setForm((current) => ({ ...current, text: event.target.value }))
              }
              required
              value={form.text}
            />
          </label>
          <button
            className="rounded-full bg-[#62b6a7] px-5 py-4 text-sm font-black text-white transition hover:bg-[#4aa495] disabled:opacity-50"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Se publică..." : "Publică recenzia"}
          </button>
        </form>
        {message ? (
          <p className="mt-4 rounded-lg bg-[#eef8f5] p-3 text-sm font-bold text-[#248176]">
            {message}
          </p>
        ) : null}
      </aside>

      <section className="grid gap-4">
        <div
          className={
            compact
              ? "grid gap-4 rounded-lg border border-[#d8eee9] bg-white p-5 shadow-sm sm:grid-cols-2"
              : "grid gap-4 rounded-lg border border-[#d8eee9] bg-white p-5 shadow-sm sm:grid-cols-3"
          }
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d948f]">
              Notă medie
            </p>
            <p className="mt-2 text-4xl font-black text-[#248176]">{average}/5</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d948f]">
              Recenzii
            </p>
            <p className="mt-2 text-4xl font-black text-[#248176]">
              {reviews.length}
            </p>
          </div>
          {!compact ? (
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7d948f]">
                Status
              </p>
              <p className="mt-3 text-sm font-black text-[#17322e]">
                Publicare instant în baza de date
              </p>
            </div>
          ) : null}
        </div>

        {visibleReviews.map((review) => (
          <article
            className={
              compact
                ? "rounded-lg border border-[#d8eee9] bg-white p-5"
                : "rounded-lg border border-[#d8eee9] bg-white p-5 shadow-[0_12px_36px_rgba(42,112,103,.08)]"
            }
            key={review.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#248176]">
                  {review.treatment}
                </p>
                <h3 className="mt-2 text-xl font-black">{review.name}</h3>
              </div>
              <span className="rounded-full bg-[#fff3cf] px-3 py-2 text-xs font-black text-[#8a6511]">
                {review.rating}/5
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#314d48]">
              &quot;{review.text}&quot;
            </p>
          </article>
        ))}

        {compact && reviews.length > visibleReviews.length ? (
          <p className="text-sm font-bold text-[#647a75]">
            Sunt afișate ultimele {visibleReviews.length} recenzii.
          </p>
        ) : null}
      </section>
    </div>
  );
}
