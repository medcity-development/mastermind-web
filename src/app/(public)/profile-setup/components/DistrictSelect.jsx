"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

import { DISTRICTS } from "./profileData";

export default function DistrictSelect({
  value,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState(null);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const optionRefs = useRef([]);
  const selectedIndex = DISTRICTS.indexOf(value);
  const activeDistrict = DISTRICTS[activeIndex];

  useEffect(() => {
    if (!open) return undefined;

    function handleOutsideClick(event) {
      if (
        !containerRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    function updateMenuPosition() {
      const bounds = buttonRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const viewportPadding = 8;
      const gap = 6;
      const preferredHeight = 160;
      const spaceBelow =
        window.innerHeight - bounds.bottom - viewportPadding;
      const spaceAbove = bounds.top - viewportPadding;
      const opensAbove = spaceBelow < 170 && spaceAbove > spaceBelow;
      const availableHeight = opensAbove ? spaceAbove : spaceBelow;
      const maxHeight = Math.max(
        96,
        Math.min(preferredHeight, availableHeight)
      );

      setMenuPosition({
        left: bounds.left,
        top: opensAbove
          ? Math.max(
              viewportPadding,
              bounds.top - gap - maxHeight
            )
          : bounds.bottom + gap,
        width: bounds.width,
        maxHeight,
      });
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (open && activeIndex >= 0) {
      optionRefs.current[activeIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [activeIndex, open]);

  function openList() {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setMenuPosition(null);
    setOpen(true);
  }

  function selectDistrict(district) {
    onChange(district);
    setOpen(false);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        openList();
        return;
      }
      setActiveIndex((index) =>
        Math.min(index + 1, DISTRICTS.length - 1)
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openList();
        return;
      }
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Home" && open) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End" && open) {
      event.preventDefault();
      setActiveIndex(DISTRICTS.length - 1);
    } else if (
      (event.key === "Enter" || event.key === " ") &&
      open
    ) {
      event.preventDefault();
      if (activeDistrict) selectDistrict(activeDistrict);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label
        id="district-label"
        className="mb-1.5 block text-[10px] font-semibold text-slate-700 sm:text-[11px] lg:text-[13px]"
      >
        District
        <span className="ml-1 text-red-500">*</span>
      </label>

      <button
        ref={buttonRef}
        id="district-select"
        type="button"
        role="combobox"
        aria-labelledby="district-label"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="district-options"
        aria-activedescendant={
          open && activeDistrict
            ? `district-option-${activeIndex}`
            : undefined
        }
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        className={`flex h-[42px] w-full items-center justify-between rounded-[12px] border bg-white px-3 text-left text-[12px] font-medium shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none transition duration-200 lg:h-[50px] lg:px-4 lg:text-[14px] ${
          open
            ? "border-[#4f6cf7] ring-[3px] ring-[#4f6cf7]/10"
            : "border-slate-200 hover:border-slate-300 focus-visible:border-[#4f6cf7] focus-visible:ring-[3px] focus-visible:ring-[#4f6cf7]/10"
        } ${value ? "text-slate-700" : "text-slate-400"}`}
      >
        <span>{value || "Select district"}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            id="district-options"
            role="listbox"
            aria-labelledby="district-label"
            className="fixed z-[10050] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_35px_rgba(15,23,42,0.2)]"
            style={{
              left: menuPosition.left,
              top: menuPosition.top,
              width: menuPosition.width,
              maxHeight: menuPosition.maxHeight,
              scrollbarWidth: "thin",
              scrollbarColor: "#94a3b8 transparent",
            }}
          >
            {DISTRICTS.map((district, index) => {
              const selected = district === value;
              const active = index === activeIndex;

              return (
                <button
                  key={district}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  id={`district-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectDistrict(district)}
                  className={`flex min-h-9 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[12px] transition-colors lg:text-[13px] ${
                    selected
                      ? "bg-blue-50 font-semibold text-blue-700"
                      : active
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {district}
                  {selected && (
                    <Check
                      size={15}
                      aria-hidden="true"
                      className="text-blue-600"
                    />
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
