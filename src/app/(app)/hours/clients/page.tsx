"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createClient, getClients, type Client } from "@/lib/hours-client"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [newClient, setNewClient] = useState({
    name: "",
    contact_email: "",
    contact_phone: "",
    billing_rate: "",
    billing_currency: "USD"
  })
  const { toast } = useToast()

  // Load clients on mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientData = await getClients()
        setClients(clientData)
      } catch (error) {
        console.error("Error loading clients:", error)
        toast({
          title: "Error",
          description: "Failed to load clients. Please try again.",
          variant: "destructive"
        })
      }
    }
    loadClients()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClient.name) {
      toast({
        title: "Error",
        description: "Client name is required.",
        variant: "destructive"
      })
      return
    }

    try {
      const client = await createClient({
        ...newClient,
        billing_rate: newClient.billing_rate
          ? parseFloat(newClient.billing_rate)
          : undefined
      })
      setClients([...clients, client])
      setIsOpen(false)
      setNewClient({
        name: "",
        contact_email: "",
        contact_phone: "",
        billing_rate: "",
        billing_currency: "USD"
      })
      toast({
        title: "Success",
        description: "Client created successfully."
      })
    } catch (error) {
      console.error("Error creating client:", error)
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Add Client</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Add a new client to track hours and billing
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name *</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  placeholder="Enter client name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.contact_email}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      contact_email: e.target.value
                    })
                  }
                  placeholder="contact@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  value={newClient.contact_phone}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      contact_phone: e.target.value
                    })
                  }
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate">Billing Rate</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={newClient.billing_rate}
                    onChange={(e) =>
                      setNewClient({
                        ...newClient,
                        billing_rate: e.target.value
                      })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={newClient.billing_currency}
                    onValueChange={(value) =>
                      setNewClient({ ...newClient, billing_currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Create Client
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardHeader>
              <CardTitle>{client.name}</CardTitle>
              <CardDescription>
                Added on {new Date(client.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {client.contact_email && (
                  <p className="text-sm">Email: {client.contact_email}</p>
                )}
                {client.contact_phone && (
                  <p className="text-sm">Phone: {client.contact_phone}</p>
                )}
                {client.billing_rate && (
                  <p className="text-sm">
                    Rate: {client.billing_rate} {client.billing_currency}/hour
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
