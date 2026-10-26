"use client";
import { createContext, useContext } from "react";
export const PackageAccessContext = createContext(false);
export function usePackageAccess() {
  return useContext(PackageAccessContext);
}
