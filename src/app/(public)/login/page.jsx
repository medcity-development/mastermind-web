import LoginPage from "./components/LoginPage";
import { getPostLoginRedirectPath } from "@/lib/auth/postLoginRedirect";

export const metadata = {
  title:
    "Login | MasterMind Academy",

  description:
    "Login to your MasterMind Academy account and continue your learning journey.",
};

export default async function Page({ searchParams }) {
  const query = await searchParams;
  const redirectTo = getPostLoginRedirectPath(query?.redirect);

  return <LoginPage redirectTo={redirectTo} />;
}