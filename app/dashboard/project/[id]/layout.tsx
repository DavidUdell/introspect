"use client"

import type React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 h-9">
            <TabsTrigger value="overview" asChild>
              <Link href={`/dashboard/project/${useParams().id}/overview`}>Overview</Link>
            </TabsTrigger>
            <TabsTrigger value="hypotheses" asChild>
              <Link href={`/dashboard/project/${useParams().id}/hypotheses`}>Hypotheses</Link>
            </TabsTrigger>
            <TabsTrigger value="readings" asChild>
              <Link href={`/dashboard/project/${useParams().id}/readings`}>Readings</Link>
            </TabsTrigger>
            <TabsTrigger value="results" asChild>
              <Link href={`/dashboard/project/${useParams().id}/results`}>Results</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {children}
    </div>
  )
} 