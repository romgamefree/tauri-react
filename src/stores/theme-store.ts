import { useEffect, useState } from "react";

function initialTheme() {
  const saved = localStorage.getItem("theme");
  return saved === "dark" ||
    (saved === null && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

export function useThemeStore() {
  const [dark, setDark] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return { dark, toggleTheme: () => setDark((current) => !current) };
}
