"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from "@/lib/utils"

function ThemeToggle({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  const { theme, setTheme } = useTheme();

  return (
    <SwitchPrimitive.Root
      checked={theme === "dark"}
      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      data-slot="switch"
      className={cn(
        // track style
        "peer relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border shadow-lg transition-all outline-none " +
        "bg-gradient-to-r from-emerald-200/80 to-green-200/80 dark:from-emerald-900/80 dark:to-green-900/80 " +
        "hover:from-emerald-300/80 hover:to-green-300/80 dark:hover:from-emerald-800/80 dark:hover:to-green-800/80 " +
        "border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <span
          className={cn(
            "text-xs transition-opacity duration-300",
            theme === "light" ? "opacity-0" : "opacity-40"
          )}
        >
          ☀️
        </span>
        <span
          className={cn(
            "text-xs transition-opacity duration-300",
            theme === "light" ? "opacity-40" : "opacity-0"
          )}
        >
          🌙
        </span>
      </div>

      {/* Thumb */}
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "absolute top-0.5 flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-all duration-300 transform group-hover:scale-110 " +
          "bg-white dark:bg-gray-800",
          theme === "light"
            ? "left-0.5 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-700"
            : "left-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-700 dark:to-gray-800"
        )}
      >
        <span
          className={cn(
            "text-sm transition-all duration-300",
            theme === "light"
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-emerald-600 dark:text-emerald-400"
          )}
        >
          {theme === "light" ? "☀️" : "🌙"}
        </span>
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { ThemeToggle }
