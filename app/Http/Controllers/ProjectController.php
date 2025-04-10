<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): View
    {
        $projects = Auth::user()->projects()
            ->with('client')
            ->orderBy('name')
            ->paginate(20);

        return view('projects.index', [
            'projects' => $projects,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
    {
        $clients = Auth::user()->clients()->orderBy('name')->get();

        return view('projects.create', [
            'clients' => $clients,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'client_id' => 'nullable|exists:clients,id', // Client is optional
        ]);

        // If client_id is provided, ensure it belongs to the user
        if (!empty($validated['client_id'])) {
            Auth::user()->clients()->findOrFail($validated['client_id']);
        }

        Auth::user()->projects()->create([
            'name' => $validated['name'],
            'client_id' => $validated['client_id'] ?? null,
        ]);

        return redirect()->route('projects.index')->with('success', 'Project created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        // Redirect to edit view, ensuring authorization first.
        if (Auth::id() !== $project->user_id) {
            abort(403);
        }
        return redirect()->route('projects.edit', $project);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project): View
    {
        // Authorize view
        if (Auth::id() !== $project->user_id) {
            abort(403);
        }

        $clients = Auth::user()->clients()->orderBy('name')->get();

        return view('projects.edit', [
            'project' => $project,
            'clients' => $clients,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project): RedirectResponse
    {
        // Authorize update
        if (Auth::id() !== $project->user_id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'client_id' => 'nullable|exists:clients,id',
        ]);

        // If client_id is provided, ensure it belongs to the user
        if (!empty($validated['client_id'])) {
            Auth::user()->clients()->findOrFail($validated['client_id']);
        }

        $project->update([
            'name' => $validated['name'],
            'client_id' => $validated['client_id'] ?? null,
        ]);

        return redirect()->route('projects.index')->with('success', 'Project updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project): RedirectResponse
    {
        // Authorize delete
        if (Auth::id() !== $project->user_id) {
            abort(403);
        }

        // Note: Deleting a project will cascade delete tasks and potentially orphan time entries
        // depending on foreign key constraints (cascadeOnDelete was used for tasks).
        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Project deleted successfully.');
    }
}
