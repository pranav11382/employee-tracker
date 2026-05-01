import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" name={session.name} email={session.email} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
