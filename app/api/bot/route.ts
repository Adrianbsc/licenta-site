import { addChatMessage, answerBotQuestion } from "@/app/lib/clinic-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message?: string;
    mode?: "patient" | "doctor";
    sessionId?: string;
  };

  const message = body.message?.trim();
  const mode = body.mode ?? "patient";
  const sessionId = body.sessionId ?? "anonymous";

  if (!message) {
    return Response.json(
      { answer: "Scrie o intrebare si iti raspund din baza cabinetului." },
      { status: 400 },
    );
  }

  addChatMessage(sessionId, mode, "user", message);
  const answer = answerBotQuestion(message, mode);
  addChatMessage(sessionId, mode, "bot", answer);

  return Response.json({ answer });
}
