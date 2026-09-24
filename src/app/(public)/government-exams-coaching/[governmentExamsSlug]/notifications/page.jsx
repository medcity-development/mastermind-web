import {
  notFound,
} from "next/navigation";

import {
  getGovernmentExamConfig,
} from "@/lib/governmentExamConfig";

import NotificationsHero from "./components/NotificationsHero";
import NotificationsList from "./components/NotificationsList";

export async function generateMetadata({
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
    return {};
  }

  const pageUrl =
    `/government-exams-coaching/${governmentExamsSlug}/notifications`;

  return {
    title:
      `${config.name} Notifications 2026 | MasterMind Academy`,

    description:
      `Check the latest ${config.name} notifications, important dates, application deadlines and official updates.`,

    alternates: {
      canonical:
        pageUrl,
    },

    openGraph: {
      title:
        `${config.name} Notifications 2026 | MasterMind Academy`,

      description:
        `Latest ${config.name} notifications and official exam updates.`,

      url:
        pageUrl,

      type:
        "website",
    },
  };
}

export default async function NotificationsPage({
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

  const {
    cid,
    name,
    shortName,
  } = config;

  return (
    <main className="min-h-screen bg-[#f5f9ff]">
      <div
        className="
          mx-auto
          w-full
          max-w-[1450px]
          px-4
          py-6
          sm:px-6
          lg:px-8
          lg:py-8
        "
      >
        <NotificationsHero
          examName={name}
          shortName={shortName}
        />

        <NotificationsList
          cid={cid}
          examName={name}
        />
      </div>
    </main>
  );
}