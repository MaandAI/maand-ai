import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function TherapyChatLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96 mt-2" />
      </div>

      <Card className="h-[calc(100vh-16rem)]">
        <CardHeader className="border-b">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-80 mt-2" />
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
