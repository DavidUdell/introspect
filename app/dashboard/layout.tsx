import type React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { BrainCircuit, Settings, User } from "lucide-react"

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
            <BrainCircuit className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-bold">Introspect</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/settings">
              <Settings className="h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100" />
            </Link>
            <Link href="/dashboard/profile">
              <User className="h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100" />
            </Link>
          </div>
        </div>
        <div className="container px-4 pb-2">
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid grid-cols-5 h-9">
              <TabsTrigger value="projects" asChild>
                <Link href="/dashboard">Projects</Link>
              </TabsTrigger>
              <TabsTrigger value="hypotheses" asChild>
                <Link href="/dashboard/hypotheses">Hypotheses</Link>
              </TabsTrigger>
              <TabsTrigger value="readings" asChild>
                <Link href="/dashboard/readings">Readings</Link>
              </TabsTrigger>
              <TabsTrigger value="results" asChild>
                <Link href="/dashboard/results">Results</Link>
              </TabsTrigger>
              <TabsTrigger value="overview" asChild>
                <Link href="/dashboard/overview">Overview</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
