import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-video rounded-xl" />
        ))}
      </div>
      <Skeleton className="min-h-[50vh] rounded-xl" />
    </div>
  )
} 