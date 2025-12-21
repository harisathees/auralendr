<?php

namespace App\Http\Controllers\Api\V1\Admin\Task;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Admin\Task\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::with(['assignee', 'creator'])->latest()->get();
        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'required|exists:users,id',
            'status' => 'required|string|in:pending,in_progress,completed,cancelled',
            'due_date' => 'nullable|date',
        ]);

        $task = Task::create([
            ...$validated,
            'created_by' => Auth::id(),
            'branch_id' => Auth::user()->branch_id,
        ]);

        return response()->json($task->load(['assignee', 'creator']), 201);
    }

    public function show(Task $task)
    {
        return response()->json($task->load(['assignee', 'creator']));
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'sometimes|required|exists:users,id',
            'status' => 'sometimes|required|string|in:pending,in_progress,completed,cancelled',
            'due_date' => 'nullable|date',
        ]);

        $task->update($validated);

        return response()->json($task->load(['assignee', 'creator']));
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(null, 204);
    }

    public function myTasks()
    {
        $tasks = Task::with(['creator'])
            ->where('assigned_to', Auth::id())
            ->latest()
            ->get();
        return response()->json($tasks);
    }

    public function updateStatus(Request $request, Task $task)
    {
        // verify the task is assigned to the current user
        if ($task->assigned_to !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:pending,in_progress,completed,cancelled',
        ]);

        $task->update(['status' => $validated['status']]);

        return response()->json($task->load(['creator']));
    }
}
