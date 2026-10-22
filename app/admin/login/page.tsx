import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { isAdminRequest } from "@/lib/auth";

export default async function AdminLoginPage() {
  if (await isAdminRequest()) redirect("/admin");
  return <LoginForm />;
}
