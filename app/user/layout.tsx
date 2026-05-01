import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.role as "admin" | "user"} name={session.name} email={session.email} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
