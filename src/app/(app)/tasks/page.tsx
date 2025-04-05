import { Suspense } from "react"
import { AddTaskForm } from "./_components/add-task-form"
import { TaskContent } from "./_components/task-content"

export default function TasksPage() {
  return (
    <div className="container">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Task Manager</h1>
        <AddTaskForm />

        <Suspense
          fallback={<p className="text-muted-foreground">Loading tasks...</p>}
        >
          <TaskContent />
        </Suspense>
      </div>
    </div>
  )
}
