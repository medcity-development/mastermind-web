import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import DashboardShell from "../common-components/DashboardShell";

export default async function GovernmentExamDashboardLayout({
  children,
  params,
}) {
  const {
    governmentExamsSlug,
  } = await params;

  const config =
    getGovernmentExamConfig(
      governmentExamsSlug
    );

  if (!config) {
    notFound();
  }

  /*
   * Later get this from authenticated session.
   */
  const user = {
    name: "Student",
  };

  return (
    <DashboardShell
      config={config}
      user={user}
    >
      {children}
    </DashboardShell>
  );
}