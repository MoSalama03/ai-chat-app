import { useTheme } from "../../context/themeContext";
import {FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle() {
  const {theme, toggleTheme} = useTheme();

  return (
    <button
    onClick={toggleTheme}
      className="p-2 rounded-full outline-none"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <FiMoon className="w-5 h-5 text-gray-700" />
      ) : (
        <FiSun className="w-5 h-5 text-yellow-300" />
      )}
    </button>
)}