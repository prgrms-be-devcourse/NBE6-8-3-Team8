import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 border-2 border-gray-300",
        className
      )}
      {...props}
    />
  )
}

function SkeletonCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-4 border-gray-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] bg-white rounded-xl overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="border-b-4 border-gray-300 bg-gray-100 p-6">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t-4 border-gray-300 bg-gray-100 p-4">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  )
}

function SkeletonText({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="space-y-2">
      <Skeleton className={cn("h-4 w-full", className)} {...props} />
      <Skeleton className={cn("h-4 w-4/5", className)} {...props} />
      <Skeleton className={cn("h-4 w-3/5", className)} {...props} />
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonText }