import DoctorDashboard from "../components/DoctorDashboard";
import { isDoctorAuthenticated } from "../lib/doctor-auth";
import { redirect } from "next/navigation";

export default async function DoctorPage() {
  if (!(await isDoctorAuthenticated())) {
    redirect("/login-doctor");
  }

  return (
    <main className="min-h-screen bg-[#f7fbfa] text-[#17322e]">
      <DoctorDashboard />
    </main>
  );
}
