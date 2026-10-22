import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { isAdminRequest } from "@/lib/auth";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  if (!(await isAdminRequest())) redirect("/admin/login");
  return children;
}
