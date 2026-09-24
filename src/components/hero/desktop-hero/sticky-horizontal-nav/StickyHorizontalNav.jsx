"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  leftMenu,
} from "./data";

import DesktopStickyNav from "./DesktopStickyNav";
import MobileStickyNav from "./MobileStickyNav";

import MainCoursesModal from "@/components/main-course-modal/MainCoursesModal";

export default function StickyHorizontalNav() {
  const pathname =
    usePathname();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    learningHubOpen,
    setLearningHubOpen,
  ] = useState(false);

  const [
    selectedLearningItem,
    setSelectedLearningItem,
  ] = useState(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setLearningHubOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow =
        "";

      return;
    }

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [mobileMenuOpen]);

  function isActiveLink(
    href
  ) {
    if (!href) {
      return false;
    }

    if (
      href.startsWith("#")
    ) {
      return false;
    }

    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(
      href
    );
  }

  function isLearningHubActive(
    item
  ) {
    return item.children?.some(
      (child) => {
        if (!child?.path) {
          return false;
        }

        return pathname.includes(
          `/${child.path}`
        );
      }
    );
  }

  function handleLearningItemClick(
    child
  ) {
    setSelectedLearningItem(
      child
    );

    setLearningHubOpen(false);
    setMobileMenuOpen(false);
  }

  return (
    <>
      <DesktopStickyNav
        leftMenu={leftMenu}
        isActiveLink={
          isActiveLink
        }
        isLearningHubActive={
          isLearningHubActive
        }
        onLearningItemClick={
          handleLearningItemClick
        }
      />

      <MobileStickyNav
        leftMenu={leftMenu}
        mobileMenuOpen={
          mobileMenuOpen
        }
        setMobileMenuOpen={
          setMobileMenuOpen
        }
        learningHubOpen={
          learningHubOpen
        }
        setLearningHubOpen={
          setLearningHubOpen
        }
        onLearningItemClick={
          handleLearningItemClick
        }
      />

      <MainCoursesModal
        open={Boolean(
          selectedLearningItem
        )}
        destinationPath={
          selectedLearningItem?.path ??
          ""
        }
        onClose={() =>
          setSelectedLearningItem(
            null
          )
        }
      />
    </>
  );
}