@csrf

<div class="mb-4">
    <label for="name" class="block font-medium text-sm text-gray-700">{{ __('Task Name') }}</label>
    <input type="text" name="name" id="name"
        class="block mt-1 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
        value="{{ old('name', $task->name ?? '') }}" required autofocus>
    @error('name')
        <p class="text-sm text-red-600 mt-2">{{ $message }}</p>
    @enderror
</div>

<div class="mb-4">
    <label for="project_id" class="block font-medium text-sm text-gray-700">{{ __('Project') }}</label>
    <select name="project_id" id="project_id"
        class="block mt-1 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
        required>
        <option value="">-- Select Project --</option>
        @foreach ($projects as $project)
            <option value="{{ $project->id }}"
                {{ old('project_id', $task->project_id ?? '') == $project->id ? 'selected' : '' }}>
                {{ $project->name }} ({{ $project->client->name ?? 'Internal' }})
            </option>
        @endforeach
    </select>
    @error('project_id')
        <p class="text-sm text-red-600 mt-2">{{ $message }}</p>
    @enderror
</div>

<div class="mb-4">
    <label for="description" class="block font-medium text-sm text-gray-700">{{ __('Description') }}</label>
    <textarea name="description" id="description" rows="4"
        class="block mt-1 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">{{ old('description', $task->description ?? '') }}</textarea>
    @error('description')
        <p class="text-sm text-red-600 mt-2">{{ $message }}</p>
    @enderror
</div>

<div class="flex items-center justify-end mt-4">
    <a href="{{ route('tasks.index') }}"
        class="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-4">
        {{ __('Cancel') }}
    </a>

    <button type="submit"
        class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
        {{ $submitButtonText ?? __('Save Task') }}
    </button>
</div>
