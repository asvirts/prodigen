import { Client, HourEntry } from "@/app/api/hours/route"

export async function getClients() {
  const response = await fetch("/api/clients")
  if (!response.ok) {
    throw new Error("Failed to fetch clients")
  }
  return response.json() as Promise<Client[]>
}

export async function createClient(client: Omit<Client, "id" | "created_at">) {
  const response = await fetch("/api/clients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(client)
  })

  if (!response.ok) {
    throw new Error("Failed to create client")
  }
  return response.json() as Promise<Client>
}

export async function getHourEntries({
  clientId,
  taskId,
  startDate,
  endDate
}: {
  clientId?: string
  taskId?: string
  startDate?: string
  endDate?: string
} = {}) {
  const params = new URLSearchParams()
  if (clientId) params.append("clientId", clientId)
  if (taskId) params.append("taskId", taskId)
  if (startDate) params.append("startDate", startDate)
  if (endDate) params.append("endDate", endDate)

  const response = await fetch(`/api/hours?${params}`)
  if (!response.ok) {
    throw new Error("Failed to fetch hour entries")
  }
  return response.json() as Promise<HourEntry[]>
}
