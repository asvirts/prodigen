export type Client = {
  id: string
  name: string
  contact_email?: string
  contact_phone?: string
  billing_rate?: number
  billing_currency?: string
  created_at: string
}

export type HourEntry = {
  id: string
  client_id: string
  task_id?: string
  date: string
  duration: string
  description?: string
  billable: boolean
  created_at: string
  updated_at: string
}

export async function getClients() {
  const response = await fetch("/api/clients")
  if (!response.ok) {
    throw new Error("Failed to fetch clients")
  }
  return response.json() as Promise<Client[]>
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
    console.error("Error response from GET /api/hours:", {
      status: response.status,
      statusText: response.statusText
    })

    try {
      const errorData = await response.json()
      console.error("Error details:", errorData)

      // Handle authentication errors specially
      if (response.status === 401) {
        throw new Error(
          "Authentication required: Please sign in to view time entries"
        )
      }

      // Handle RLS policy errors
      if (response.status === 403 && errorData.code === "42501") {
        throw new Error(
          `Row Level Security Policy Error: ${
            errorData.details || "You can only access your own entries"
          }`
        )
      }

      throw new Error(
        `Failed to fetch hour entries: ${
          errorData.error || response.statusText
        }${errorData.details ? ` (${errorData.details})` : ""}`
      )
    } catch (jsonError) {
      if (response.status === 401) {
        throw new Error(
          "Authentication required: Please sign in to view time entries"
        )
      }
      throw new Error(`Failed to fetch hour entries: ${response.statusText}`)
    }
  }
  return response.json() as Promise<HourEntry[]>
}

export async function createHourEntry(
  entry: Omit<HourEntry, "id" | "created_at" | "updated_at">
) {
  const response = await fetch("/api/hours", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(entry)
  })

  if (!response.ok) {
    console.error("Error response from /api/hours:", {
      status: response.status,
      statusText: response.statusText
    })

    try {
      const errorData = await response.json()
      console.error("Error details:", errorData)

      // Handle authentication errors specially
      if (response.status === 401) {
        throw new Error(
          "Authentication required: Please sign in to create time entries"
        )
      }

      // Handle RLS policy errors
      if (response.status === 403 && errorData.code === "42501") {
        throw new Error(
          `Row Level Security Policy Error: ${
            errorData.details || "You can only access your own entries"
          }`
        )
      }

      throw new Error(
        `Failed to create hour entry: ${
          errorData.error || response.statusText
        }${errorData.details ? ` (${errorData.details})` : ""}`
      )
    } catch (jsonError) {
      if (response.status === 401) {
        throw new Error(
          "Authentication required: Please sign in to create time entries"
        )
      }
      throw new Error(`Failed to create hour entry: ${response.statusText}`)
    }
  }

  return response.json() as Promise<HourEntry>
}

export async function updateHourEntry(
  id: string,
  entry: Partial<Omit<HourEntry, "id" | "created_at" | "updated_at">>
) {
  const response = await fetch(`/api/hours?id=${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(entry)
  })

  if (!response.ok) {
    throw new Error("Failed to update hour entry")
  }
  return response.json() as Promise<HourEntry>
}

export async function deleteHourEntry(id: string) {
  const response = await fetch(`/api/hours?id=${id}`, {
    method: "DELETE"
  })

  if (!response.ok) {
    throw new Error("Failed to delete hour entry")
  }
  return response.json()
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
