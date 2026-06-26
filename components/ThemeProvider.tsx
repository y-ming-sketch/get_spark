"use client";

import { useEffect } from "react";
import { useSpark } from "@/lib/store";

/**
 * Applies the `.dark` class on <html> based on the user's stored preference.
 * Listens to system theme changes when set to "system".
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSpark((s) => s.theme);
  const hydrated = useSpark((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    const apply = () => {
      const wantDark =
        theme === "dark" ||
        (theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.toggle("dark", wantDark);
    };
    apply();

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme, hydrated]);

  return <>{children}</>;
}
