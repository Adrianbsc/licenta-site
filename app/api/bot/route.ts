import { addChatMessage, answerBotQuestion } from "@/app/lib/clinic-db";
import { isDoctorAuthenticated } from "@/app/lib/doctor-auth";

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

  if (mode === "doctor" && !(await isDoctorAuthenticated())) {
    return Response.json(
      { answer: "Autentifica-te ca doctor pentru acces la agenda." },
      { status: 401 },
    );
  }

  if (!message) {
    return Response.json(
      { answer: "Scrie o întrebare și îți răspund din baza cabinetului." },
      { status: 400 },
    );
  }

  await addChatMessage(sessionId, mode, "user", message);
  const answer = await answerBotQuestion(message, mode);
  await addChatMessage(sessionId, mode, "bot", answer);

  return Response.json({ answer });
}
