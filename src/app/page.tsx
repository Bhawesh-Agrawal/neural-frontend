"use client";

import { useTheme } from "next-themes";
import Playground from "@/components/Playground";
import PredictionForm from "@/components/PredicitionForm";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react"; // Optional: Add icons for toggle

export default function Home() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          XGB Profitability Dashboard
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </Button>
      </nav>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 text-center shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Optimize Your Aviation Profits
        </h1>
        <p className="mt-2 text-lg md:text-xl opacity-90">
          Leverage advanced analytics for smarter decisions
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
        <Playground />
        <PredictionForm />
      </main>
    </div>
  );
}
