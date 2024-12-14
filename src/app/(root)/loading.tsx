"use client"

import { Icons } from "@/components/ui/icons"

export default function RootLoading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="relative">
        <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
        <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-primary/20" />
      </div>
    </div>
  )
}
