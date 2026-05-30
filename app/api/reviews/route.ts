import {
  createReview,
  listReviews,
  type ReviewInput,
} from "@/app/lib/clinic-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ reviews: await listReviews() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ReviewInput>;

  if (!body.name?.trim() || !body.text?.trim()) {
    return Response.json(
      { error: "Completează numele și recenzia." },
      { status: 400 },
    );
  }

  const rating = Number(body.rating);

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return Response.json(
      { error: "Nota trebuie să fie între 1 și 5." },
      { status: 400 },
    );
  }

  const review = await createReview({
    name: body.name,
    rating,
    treatment: body.treatment,
    text: body.text,
  });

  return Response.json({ review }, { status: 201 });
}
