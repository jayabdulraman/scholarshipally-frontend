'use client'

/* eslint-disable @next/next/no-img-element */
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCard() {
  return (
    <div className="flex flex-row space-x-2 p-2">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
    </div>
  )
}
