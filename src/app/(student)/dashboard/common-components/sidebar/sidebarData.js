import {
    BarChart3,
    Bell,
    BookMarked,
    BookOpen,
    FileQuestion,
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
  
    const publicBasePath =
      config.basePath ||
      `/government-exams-coaching/${config.slug}`;
  
    const mainItems = [
      {
        label: "Dashboard",
        icon: Home,
        href: dashboardPath,
      },
      {
        label: "My Courses",
        icon: BookOpen,
        href: `${dashboardPath}/my-courses`,
      },
      {
        label: "Live Classes",
        icon: PlayCircle,
        href: `${dashboardPath}/live-classes`,
      },
      {
        label: "Mock Tests",
        icon: Trophy,
        href: `${publicBasePath}/mock-tests`,
      },
      {
        label: "Previous Questions",
        icon: FileQuestion,
        href: `${publicBasePath}/previous-questions`,
      },
      {
        label: "Study Materials",
        icon: LibraryBig,
        href: `${publicBasePath}/study-materials`,
      },
    ];
  
    const accountItems = [
    //   {
    //     label: "Bookmarks",
    //     icon: BookMarked,
    //     href: `${dashboardPath}/bookmarks`,
    //   },
    //   {
    //     label: "Performance",
    //     icon: BarChart3,
    //     href: `${dashboardPath}/performance`,
    //   },
    //   {
    //     label: "Notifications",
    //     icon: Bell,
    //     href: `${publicBasePath}/notifications`,
    //     badge: 3,
    //   },
      {
        label: "Profile",
        icon: UserRound,
        href: `${dashboardPath}/profile`,
      },
    //   {
    //     label: "Settings",
    //     icon: Settings,
    //     href: `${dashboardPath}/settings`,
    //   },
    ];
  
    return {
      dashboardPath,
      mainItems,
      accountItems,
    };
  }