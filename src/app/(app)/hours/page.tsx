"use client"

import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import {
  createHourEntry,
  getClients,
  getHourEntries,
  updateHourEntry,
  deleteHourEntry,
  type Client,
  type HourEntry
} from "@/lib/hours-client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { PencilIcon, TrashIcon, PlusIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"

export default function HoursPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [duration, setDuration] = useState("")
  const [description, setDescription] = useState("")
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [billable, setBillable] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [hourEntries, setHourEntries] = useState<HourEntry[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<HourEntry | null>(null)
  const { toast } = useToast()

  // Load clients and hour entries on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientData, entriesData] = await Promise.all([
          getClients(),
          getHourEntries()
        ])
        setClients(clientData)
        setHourEntries(entriesData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive"
        })
      }
    }
    loadData()
  }, [toast])

  const resetForm = () => {
    setDate(new Date())
    setDuration("")
    setDescription("")
    setSelectedClient("")
    setBillable(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted with values:", {
      client_id: selectedClient,
      date: date.toISOString().split("T")[0],
      duration: `${duration} hours`,
      description,
      billable
    })

    if (!selectedClient || !duration) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      console.log("Sending data to API...")
      const newEntry = await createHourEntry({
        client_id: selectedClient,
        date: date.toISOString().split("T")[0],
        duration: `${duration} hours`,
        description,
        billable
      })
      console.log("API response:", newEntry)

      setHourEntries([newEntry, ...hourEntries])
      setIsAddDialogOpen(false)
      resetForm()

      toast({
        title: "Success",
        description: "Time entry created successfully."
      })
    } catch (error) {
      console.error("Detailed error info:", error)

      // Check if this is an RLS policy error (status 403)
      const errorMessage =
        error instanceof Error ? error.message : String(error)

      if (
        errorMessage.includes("row-level security") ||
        errorMessage.includes("Permission denied")
      ) {
        toast({
          title: "Security Policy Error",
          description:
            "You need to fix the Supabase RLS policies to create time entries. Go to your Supabase dashboard > Authentication > Policies and add appropriate RLS rules for the p-hours table.",
          variant: "destructive",
          duration: 10000 // Show for 10 seconds
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to create time entry. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  const handleEdit = (entry: HourEntry) => {
    setCurrentEntry(entry)
    setSelectedClient(entry.client_id)
    setDate(new Date(entry.date))
    setDuration(entry.duration.replace(" hours", ""))
    setDescription(entry.description || "")
    setBillable(entry.billable)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentEntry || !selectedClient || !duration) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      const updatedEntry = await updateHourEntry(currentEntry.id, {
        client_id: selectedClient,
        date: date.toISOString().split("T")[0],
        duration: `${duration} hours`,
        description,
        billable
      })

      setHourEntries(
        hourEntries.map((entry) =>
          entry.id === updatedEntry.id ? updatedEntry : entry
        )
      )
      setIsEditDialogOpen(false)
      resetForm()

      toast({
        title: "Success",
        description: "Time entry updated successfully."
      })
    } catch (error) {
      console.error("Error updating time entry:", error)
      toast({
        title: "Error",
        description: "Failed to update time entry. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDelete = (entry: HourEntry) => {
    setCurrentEntry(entry)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!currentEntry) return

    try {
      await deleteHourEntry(currentEntry.id)
      setHourEntries(
        hourEntries.filter((entry) => entry.id !== currentEntry.id)
      )
      setIsDeleteDialogOpen(false)

      toast({
        title: "Success",
        description: "Time entry deleted successfully."
      })
    } catch (error) {
      console.error("Error deleting time entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete time entry. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client ? client.name : "Unknown Client"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Time Entries</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Time Entry</DialogTitle>
              <DialogDescription>
                Record time spent on client projects
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select
                  value={selectedClient}
                  onValueChange={setSelectedClient}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  step="0.25"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Enter hours worked"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you work on?"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="billable"
                  checked={billable}
                  onCheckedChange={setBillable}
                />
                <Label htmlFor="billable">Billable</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Save Entry</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
            <DialogDescription>Update time entry details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-client">Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration (hours)</Label>
              <Input
                id="edit-duration"
                type="number"
                step="0.25"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Enter hours worked"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What did you work on?"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-billable"
                checked={billable}
                onCheckedChange={setBillable}
              />
              <Label htmlFor="edit-billable">Billable</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Update Entry</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              time entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Entries Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Billable</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hourEntries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No time entries found. Click 'Add Entry' to create your
                    first entry.
                  </TableCell>
                </TableRow>
              ) : (
                hourEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>{getClientName(entry.client_id)}</TableCell>
                    <TableCell>{entry.duration}</TableCell>
                    <TableCell>{entry.description || "—"}</TableCell>
                    <TableCell>{entry.billable ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(entry)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
