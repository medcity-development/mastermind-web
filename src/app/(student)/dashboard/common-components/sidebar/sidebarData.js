import {
  BookMarked,
  BookOpen,
  FileQuestion,
  History,
  CirclePause,
  Home,
  Trophy,
  UserRound,
  MessageSquare,
} from "lucide-react";

export function getSidebarItems({
  config,
  learningTools = [],
}) {
  const dashboardPath =
    `/dashboard/${config.slug}`;

  const dashboardItem = [
    {
      label: "Dashboard",
      icon: Home,
      href: dashboardPath,
    },
  ];

  const learningItems = learningTools.map((tool) => ({
    label: tool.title,
    icon: tool.icon,
    href: tool.href,
  }));

  if (!learningItems.length) {
    learningItems.push(
      {
        label: "Mock Tests",
        icon: Trophy,
        href: `${dashboardPath}/mock-tests`,
      },
      {
        label: "Previous Questions",
        icon: FileQuestion,
        href: `${dashboardPath}/previous-questions`,
      },
      {
        label: "SCERT Tests",
        icon: BookOpen,
        href: `${dashboardPath}/scert-tests`,
      }
    );
  }

  const mainItems = [
    ...dashboardItem,
    ...learningItems,
    {
      label: "Paused Exams",
      description: "Resume your paused exams",
      icon: CirclePause,
      href: `${dashboardPath}/paused-exams`,
    },
    {
      label: "Performance Analysis",
      icon: BookMarked,
      href: `${dashboardPath}/performance-analysis`,
    },
    {
      label: "Exam Attempted",
      icon: History,
      href:
        `${dashboardPath}/exam-attempted`,
    },
  ];

  /*
   * Keep account section as it is.
   * Do not remove this.
   */
  const accountItems = [
    {
      label: "Feedback",
      icon: MessageSquare,
      href: `${dashboardPath}/feedback`,
    },
    {
      label: "Profile",
      icon: UserRound,
      href: `${dashboardPath}/profile`,
    },
  ];

  return {
    dashboardPath,
    mainItems,
    accountItems,
  };
}
