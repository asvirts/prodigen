import { Suspense } from "react"
import { AddTaskForm } from "./_components/add-task-form"
import { TaskContent } from "./_components/task-content"

export default function TasksPage() {
  return (
    <div className="container">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Task Manager</h1>
        <AddTaskForm />

<<<<<<< HEAD
      <Suspense
        fallback={<p className="text-muted-foreground">Loading tasks...</p>}
      >
        <TaskContent />
      </Suspense>
=======
        <h2 className="text-xl font-semibold mt-6 mb-4 border-t pt-6">
          Your Tasks
        </h2>

        {error && <p className="text-red-500">Error loading tasks: {error}</p>}

        {!error && !tasks?.length && <p>No tasks yet. Add your first task!</p>}

        {/* Basic task list display */}
        {tasks && tasks.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <Card key={task.id} className="flex flex-col justify-between">
                <div>
                  <CardHeader>
                    <CardTitle>{task.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {task.description || "No description"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Status: {task.status}
                    </p>
                    {task.due_date && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </div>
                <CardFooter className="pt-4">
                  <TaskCardActions task={task} />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
>>>>>>> e3a6ed6b7d02761e24a0c75f325f6e1225bbe1e6
    </div>
  )
}
