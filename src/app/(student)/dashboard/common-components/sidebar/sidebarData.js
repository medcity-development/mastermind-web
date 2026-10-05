import {
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  FileQuestion,
  History,
  Home,
  LibraryBig,
  PlayCircle,
  Settings,
  Trophy,
  UserRound,
} from "lucide-react";

export function getSidebarItems({
  config,
}) {
  const dashboardPath =
    `/dashboard/${config.slug}`;

  const mainItems = [
    {
      label: "Dashboard",
      icon: Home,
      href: dashboardPath,
    },

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
    },

    // {
    //   label: "Exam Analytics",
    //   icon: BarChart3,
    //   href: `${dashboardPath}/exam-analysis`,
    // },

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
    // {
    //   label: "Bookmarks",
    //   icon: BookMarked,
    //   href: `${dashboardPath}/bookmarks`,
    // },

    // {
    //   label: "Performance",
    //   icon: BarChart3,
    //   href: `${dashboardPath}/performance`,
    // },

    // {
    //   label: "Notifications",
    //   icon: Bell,
    //   href: `${dashboardPath}/notifications`,
    //   badge: 3,
    // },

    {
      label: "Profile",
      icon: UserRound,
      href: `${dashboardPath}/profile`,
    },

    // {
    //   label: "Settings",
    //   icon: Settings,
    //   href: `${dashboardPath}/settings`,
    // },
  ];

  return {
    dashboardPath,
    mainItems,
    accountItems,
  };
}