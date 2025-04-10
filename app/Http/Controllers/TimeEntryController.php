<?php

namespace App\Http\Controllers;

use App\Models\TimeEntry;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Carbon\Carbon;

class TimeEntryController extends Controller
{
    /**
     * Display a dedicated view for listing all time entries (hours).
     */
    public function hoursIndex(): View
    {
        $timeEntries = Auth::user()
            ->timeEntries()
            ->with(['task', 'project', 'client'])
            ->orderBy('start_time', 'desc')
            ->paginate(20);

        return view('hours.index', [
            'timeEntries' => $timeEntries,
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return redirect()->route('hours.index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
    {
        $tasks = Auth::user()->tasks()->orderBy('name')->get();
        // We might also need projects/clients if we want separate dropdowns, 
        // but often selecting a task implies the project/client.
        // Let's start with just tasks.

        return view('hours.create', [
            'tasks' => $tasks,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $entryMode = $request->input('entry_mode', 'times'); // Default to 'times'

        $commonRules = [
            'task_id' => 'required|exists:tasks,id',
            'start_date' => 'required|date_format:Y-m-d',
            'entry_mode' => 'required|in:times,duration',
            'notes' => 'nullable|string',
        ];

        $modeRules = [];
        if ($entryMode === 'times') {
            $modeRules = [
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'nullable|date_format:H:i', // Allow empty for running timers
                // Add 'after:start_time' validation only if end_time is present
                // This needs custom validation logic or a Form Request
            ];
        } else { // duration mode
            $modeRules = [
                'manual_duration' => ['required', 'string', $this->durationFormatRule()],
                 // Add a custom rule or regex for formats like 1.5h, 45m, 2:30
            ];
        }

        $validated = $request->validate(array_merge($commonRules, $modeRules));

        $task = Task::with(['project.client'])->findOrFail($validated['task_id']);
        $startDate = $validated['start_date'];
        $notes = $validated['notes'];

        $startTime = null;
        $endTime = null;
        $duration = null;

        if ($entryMode === 'times') {
            $startTime = Carbon::createFromFormat('Y-m-d H:i', $startDate . ' ' . $validated['start_time']);
            if (!empty($validated['end_time'])) {
                $endTime = Carbon::createFromFormat('Y-m-d H:i', $startDate . ' ' . $validated['end_time']);
                // Handle overnight
                if ($endTime->lessThan($startTime)) {
                    $endTime->addDay();
                }
                $duration = $startTime->diffInMinutes($endTime);
            } else {
                // If end time is empty, it's a running timer (null end time, null duration)
            }
        } else { // duration mode
            $duration = $this->parseDurationToMinutes($validated['manual_duration']);
            // For duration entry, we set start_time to the beginning of the start_date
            // and end_time is left null unless we calculate it based on a default start?
            // Or perhaps we require start_time even for duration entry?
            // Let's assume start_time is the beginning of the day for simplicity for now.
            $startTime = Carbon::createFromFormat('Y-m-d', $startDate)->startOfDay();
            // $endTime = $startTime->copy()->addMinutes($duration); // Option: Calculate end time
        }

        Auth::user()->timeEntries()->create([
            'task_id' => $task->id,
            'project_id' => $task->project_id,
            'client_id' => $task->project->client_id ?? null,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'duration' => $duration,
            'notes' => $notes,
        ]);

        return redirect()->route('hours.index')->with('success', 'Time entry added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(TimeEntry $timeEntry)
    {
        // Typically, for time entries, editing is more common than just viewing.
        // Redirect to edit view, ensuring authorization first.
        if (Auth::id() !== $timeEntry->user_id) {
            abort(403);
        }
        return redirect()->route('time-entries.edit', $timeEntry);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TimeEntry $timeEntry): View
    {
        // Authorize view
        if (Auth::id() !== $timeEntry->user_id) {
            abort(403);
        }

        $tasks = Auth::user()->tasks()->orderBy('name')->get();

        return view('hours.edit', [
            'timeEntry' => $timeEntry,
            'tasks' => $tasks,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TimeEntry $timeEntry): RedirectResponse
    {
        // Authorize update
        if (Auth::id() !== $timeEntry->user_id) {
            abort(403);
        }

        $entryMode = $request->input('entry_mode', 'times');

        $commonRules = [
            'task_id' => 'required|exists:tasks,id',
            'start_date' => 'required|date_format:Y-m-d',
            'entry_mode' => 'required|in:times,duration',
            'notes' => 'nullable|string',
        ];

        $modeRules = [];
        if ($entryMode === 'times') {
            $modeRules = [
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'nullable|date_format:H:i',
            ];
        } else { // duration mode
            $modeRules = [
                'manual_duration' => ['required', 'string', $this->durationFormatRule()],
            ];
        }

        $validated = $request->validate(array_merge($commonRules, $modeRules));

        $task = Task::with(['project.client'])->findOrFail($validated['task_id']);
        $startDate = $validated['start_date'];
        $notes = $validated['notes'];

        $startTime = null;
        $endTime = null;
        $duration = null;

        if ($entryMode === 'times') {
            $startTime = Carbon::createFromFormat('Y-m-d H:i', $startDate . ' ' . $validated['start_time']);
            if (!empty($validated['end_time'])) {
                $endTime = Carbon::createFromFormat('Y-m-d H:i', $startDate . ' ' . $validated['end_time']);
                if ($endTime->lessThan($startTime)) {
                    $endTime->addDay();
                }
                $duration = $startTime->diffInMinutes($endTime);
            } else {
                $endTime = null; // Ensure end time is null if cleared
                $duration = null; // Ensure duration is null if end time cleared
            }
        } else { // duration mode
            $duration = $this->parseDurationToMinutes($validated['manual_duration']);
            $startTime = Carbon::createFromFormat('Y-m-d', $startDate)->startOfDay(); // Or use original start time?
            $endTime = null; // When updating via duration, clear end time?
             // $endTime = $startTime->copy()->addMinutes($duration); // Option: Calculate end time
        }

        $timeEntry->update([
            'task_id' => $task->id,
            'project_id' => $task->project_id,
            'client_id' => $task->project->client_id ?? null,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'duration' => $duration,
            'notes' => $notes,
        ]);

        return redirect()->route('hours.index')->with('success', 'Time entry updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TimeEntry $timeEntry): RedirectResponse
    {
        // Authorize delete
        if (Auth::id() !== $timeEntry->user_id) {
            abort(403);
        }

        $timeEntry->delete();

        return redirect()->route('hours.index')->with('success', 'Time entry deleted successfully.');
    }

    /**
     * Helper to get validation rule for duration format.
     */
    private function durationFormatRule()
    {
        // Regex to match formats like 1h, 1.5h, 45m, 2:30
        return 'regex:/^(\d+(\.\d+)?h)?(\d+m)?(\d+:\d+)?$/i';
    }

    /**
     * Helper to parse duration string (e.g., "1.5h", "45m", "2:30") into minutes.
     * Returns null if parsing fails.
     */
    private function parseDurationToMinutes(?string $durationStr): ?int
    {
        if (empty($durationStr)) {
            return null;
        }

        $totalMinutes = 0;

        // Match H:MM format
        if (preg_match('/^(\d{1,2}):(\d{2})$/', $durationStr, $matches)) {
            $hours = (int)$matches[1];
            $minutes = (int)$matches[2];
            $totalMinutes = ($hours * 60) + $minutes;
        }
        // Match X.Yh and ZZm format combined or separate
        elseif (preg_match('/^(?:(\d+(?:\.\d+)?)h)?(?:(\d+)m)?$/i', $durationStr, $matches)) {
            $hours = !empty($matches[1]) ? (float)$matches[1] : 0;
            $minutes = !empty($matches[2]) ? (int)$matches[2] : 0;
            if ($hours == 0 && $minutes == 0) return null; // Invalid if both are zero or not matched
            $totalMinutes = round(($hours * 60) + $minutes);
        } else {
            return null; // Invalid format
        }

        return $totalMinutes > 0 ? $totalMinutes : null;
    }
}
