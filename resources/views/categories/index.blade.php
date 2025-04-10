@extends('layouts.app') {{-- Assuming you have a layout file --}}

@section('content')
    <div class="container">
        <h1>Categories</h1>
        <a href="{{ route('categories.create') }}" class="btn btn-primary mb-3">Create New Category</a> {{-- Assuming a route named 'categories.create' exists --}}

        @if (session('success'))
            <div class="alert alert-success">
                {{ session('success') }}
            </div>
        @endif

        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($categories as $category)
                    {{-- Assuming a $categories variable is passed from the controller --}}
                    <tr>
                        <td>{{ $category->id }}</td>
                        <td>{{ $category->name }}</td>
                        <td>
                            <a href="{{ route('categories.show', $category->id) }}" class="btn btn-sm btn-info">View</a>
                            {{-- Assuming a route named 'categories.show' exists --}}
                            <a href="{{ route('categories.edit', $category->id) }}" class="btn btn-sm btn-warning">Edit</a>
                            {{-- Assuming a route named 'categories.edit' exists --}}
                            <form action="{{ route('categories.destroy', $category->id) }}" method="POST"
                                style="display:inline;"> {{-- Assuming a route named 'categories.destroy' exists --}}
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-sm btn-danger"
                                    onclick="return confirm('Are you sure?')">Delete</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="3">No categories found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
@endsection
