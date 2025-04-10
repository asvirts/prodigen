<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): View
    {
        $tasks = Auth::user()->tasks()
            ->with('project')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('tasks.index', [
            'tasks' => $tasks,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
    {
        $projects = Auth::user()->projects()->orderBy('name')->get();

        return view('tasks.create', [
            'projects' => $projects,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'required|exists:projects,id',
        ]);

        // Ensure the selected project belongs to the user
        $project = Auth::user()->projects()->findOrFail($validated['project_id']);

        Auth::user()->tasks()->create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'project_id' => $project->id, // Use validated project ID
        ]);

        return redirect()->route('tasks.index')->with('success', 'Task created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        // Redirect to edit view, ensuring authorization first.
        if (Auth::id() !== $task->user_id) {
            abort(403);
        }
        return redirect()->route('tasks.edit', $task);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task): View
    {
        // Authorize view
        if (Auth::id() !== $task->user_id) {
            abort(403);
        }

        $projects = Auth::user()->projects()->orderBy('name')->get();

        return view('tasks.edit', [
            'task' => $task,
            'projects' => $projects,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task): RedirectResponse
    {
        // Authorize update
        if (Auth::id() !== $task->user_id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'required|exists:projects,id',
        ]);

        // Ensure the selected project belongs to the user
        $project = Auth::user()->projects()->findOrFail($validated['project_id']);

        $task->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'project_id' => $project->id,
        ]);

        return redirect()->route('tasks.index')->with('success', 'Task updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task): RedirectResponse
    {
        // Authorize delete
        if (Auth::id() !== $task->user_id) {
            abort(403);
        }

        // Consider implications: deleting a task might orphan time entries.
        // Depending on requirements, we might want to prevent deletion if time entries exist,
        // or cascade delete them (already set up in migration if using cascadeOnDelete),
        // or nullify the task_id in time entries.
        // For now, we'll just delete the task.
        $task->delete();

        return redirect()->route('tasks.index')->with('success', 'Task deleted successfully.');
    }
}
