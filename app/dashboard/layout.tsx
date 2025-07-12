import type React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { BrainCircuit } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <BrainCircuit className="h-6 w-6 text-purple-600" />
              <h1 className="text-xl font-bold">Introspect</h1>
            </Link>
          </div>
        </div>
        <div className="container px-4 pb-2">
          {/* Navigation tabs removed - logo now serves as home navigation */}
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">{children}</main>

      <footer className="border-t py-4 bg-white dark:bg-gray-950">
        <div className="container px-4 text-center text-xs text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Introspect. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
