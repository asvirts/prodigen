import { cn } from "@/lib/utils"

export interface HourEntry {
  id: string
  project: string
  date: string
  duration: string | number
  user_id?: string
  created_at?: string
}

export interface HourEntryWrapperProps {
  entry: HourEntry
}

export function HourEntryWrapper({ entry }: HourEntryWrapperProps) {
  // Format duration based on type
  const formattedDuration =
    typeof entry.duration === "string"
      ? entry.duration
      : `${Number(entry.duration).toFixed(1)} hours`

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{entry.project}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(entry.date).toLocaleDateString()}
        </p>
      </div>
      <div className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
        {formattedDuration}
      </div>
    </div>
  )
}
