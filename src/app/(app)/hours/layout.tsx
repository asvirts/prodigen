import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function HoursLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hours</h1>
          <p className="text-muted-foreground">
            Track and manage your time across projects and clients
          </p>
        </div>
      </div>
      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList>
          <Link href="/hours">
            <TabsTrigger value="entries">Time Entries</TabsTrigger>
          </Link>
          <Link href="/hours/clients">
            <TabsTrigger value="clients">Clients</TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
      {children}
    </div>
  )
}
