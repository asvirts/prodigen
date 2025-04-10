@csrf

{{-- Task Selection --}}
<div class="mb-4">
    <label for="task_id" class="block font-medium text-sm text-gray-700">{{ __('Task') }}</label>
    <select name="task_id" id="task_id"
        class="block mt-1 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
        required>
        <option value="">-- Select Task --</option>
        @foreach ($tasks as $task)
            <option value="{{ $task->id }}"
                {{ old('task_id', $timeEntry->task_id ?? '') == $task->id ? 'selected' : '' }}>
                {{ $task->name }} ({{ $task->project->name ?? 'No Project' }})
            </option>
        @endforeach
    </select>
    @error('task_id')
        <p class="text-sm text-red-600 mt-2">{{ $message }}</p>
    @enderror
</div>

{{-- Date / Time / Duration Inputs --}}
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
    {{-- Start Date --}}
    <div>
        <label for="start_date" class="block font-medium text-sm text-gray-700">{{ __('Date') }}</label>
        <input type="date" name="start_date" id="start_date"
            class="block mt-1 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
            value="{{ old('start_date', isset($timeEntry) ? $timeEntry->start_time->format('Y-m-d') : date('Y-m-d')) }}"
            required>
        @error('start_date')
            <p class="text-sm text-red-600 mt-2">{{ $message }}</p>
        @enderror
    </div>

    {{-- Entry Mode Toggle (Alpine.js) --}}
    <div x-data="{ mode: '{{ old('entry_mode', isset($timeEntry) && $timeEntry->duration && !$timeEntry->end_time ? 'duration' : 'times') }}' }" class="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input type="hidden" name="entry_mode" x-model="mode">

        {{-- Start Time --}}
        <div x-show="mode === 'times'">
            <label for="start_time" class="block font-medium text-sm text-gray-700">{{ __('Start Time') }}</label>
            <input type="time" name="start_time" id="start_time"
                class="block mt-1 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                value="{{ old('start_time', isset($timeEntry) ? $timeEntry->start_time->format('H:i') : '') }}"
                x-bind:required="mode === 'times'">
            @error('start_time')
                <p class="text-sm text-red-600 mt-2">{{ $message }}</p>
            @enderror
        </div>

        {{-- End Time --}}
        <div x-show="mode === 'times'">
            <label for="end_time" class="block font-medium text-sm text-gray-700">{{ __('End Time') }}</label>
            <input type="time" name="end_time" id="end_time"
                class="block mt-1 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                value="{{ old('end_time', isset($timeEntry) && $timeEntry->end_time ? $timeEntry->end_time->format('H:i') : '') }}">
            <p class="text-xs text-gray-500 mt-1">Leave blank to start a timer.</p>
            @error('end_time')
                <p class="text-sm text-red-600 mt-2">{{ $message }}</p>
            @enderror
        </div>

        {{-- Manual Duration --}}
        <div x-show="mode === 'duration'">
            <label for="manual_duration"
                class="block font-medium text-sm text-gray-700">{{ __('Duration (e.g., 1.5h)') }}</label>
            <input type="text" name="manual_duration" id="manual_duration" placeholder="e.g., 1.5h, 45m"
                class="block mt-1 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                value="{{ old('manual_duration', isset($timeEntry) ? ($timeEntry->duration ? $timeEntry->duration / 60.0 . 'h' : '') : '') }}"
                x-bind:required="mode === 'duration'">
            @error('manual_duration')
                <p class="text-sm text-red-600 mt-2">{{ $message }}</p>
            @enderror
        </div>

        {{-- Mode Switch Button --}}
        <div class="flex items-end pb-1">
            <button type="button" @click="mode = (mode === 'times' ? 'duration' : 'times')"
                class="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span x-show="mode === 'times'">Enter Duration Instead</span>
                <span x-show="mode === 'duration'">Enter Start/End Times Instead</span>
            </button>
        </div>
    </div>
</div>

{{-- Notes --}}
<div class="mb-4">
    <label for="notes" class="block font-medium text-sm text-gray-700">{{ __('Notes') }}</label>
    <textarea name="notes" id="notes" rows="3"
        class="block mt-1 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">{{ old('notes', $timeEntry->notes ?? '') }}</textarea>
    @error('notes')
        <p class="text-sm text-red-600 mt-2">{{ $message }}</p>
    @enderror
</div>

{{-- Buttons --}}
<div class="flex items-center justify-end mt-4">
    <a href="{{ route('hours.index') }}"
        class="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-4">
        {{ __('Cancel') }}
    </a>

    <button type="submit"
        class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
        {{ $submitButtonText ?? __('Save Time Entry') }}
    </button>
</div>
