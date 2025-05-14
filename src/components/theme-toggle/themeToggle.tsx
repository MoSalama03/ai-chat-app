import { useTheme } from "../../context/themeContext"
import {FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle() {
  const { theme, toggleTheme, isMounted } = useTheme();

  if (!isMounted) return (
    <div className="w-10 h-6 bg-gray-200 rounded-full"></div>
  )

  return (
    <label className="flex items-center cursor-pointer gap-2">
      <FiSun className={`w-4 h-4 ${theme === 'light' ? 'text-yellow-500' : 'text-gray-400'}`} />
      
      <div className="relative">
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={theme === 'dark'}
          onChange={toggleTheme}
        />
        <div className={`block w-10 h-6 rounded-full transition-colors ${
          theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
        }`}></div>
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
          theme === 'dark' ? 'translate-x-4' : ''
        }`}></div>
      </div>
      
      <FiMoon className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-400'}`} />
    </label>
  )
}