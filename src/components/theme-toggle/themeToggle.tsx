import { useState, useEffect } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    setIsMounted(true);
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem("darkMode");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Default to light mode unless explicitly saved as dark or system prefers dark
    setDarkMode(savedTheme === "dark" ||(!savedTheme && systemPrefersDark));
  }, []);

  // Apply dark mode class and save preference
  useEffect(() => {
    if (!isMounted) return;
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode, isMounted]);

   // Prevent rendering until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="w-11 h-6 bg-gray-200 rounded-full" /> // Loading skeleton
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Sun Icon (Light Mode) */}
      <FiSun 
        className={`h-5 w-5 ${!darkMode ? "text-yellow-400" : "text-gray-400"}`} 
        aria-hidden="true"
      />

      {/* Toggle Switch */}
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
          className="sr-only peer"
          aria-label="Toggle dark mode"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-500 transition-colors duration-300">
          {/* Toggle Knob */}
          <div className={`absolute top-0.5 left-[2px] bg-white w-5 h-5 rounded-full transition-transform duration-300 ${darkMode ? "translate-x-5" : ""}`} />
        </div>
      </label>

      {/* Moon Icon (Dark Mode) */}
      <FiMoon 
        className={`h-5 w-5 ${darkMode ? "text-blue-300" : "text-gray-400"}`} 
        aria-hidden="true"
      />
    </div>
  );
}