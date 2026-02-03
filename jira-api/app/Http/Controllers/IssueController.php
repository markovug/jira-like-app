<?php

namespace App\Http\Controllers;

use App\Models\Issue;
use App\Models\Project;
use Illuminate\Http\Request;

class IssueController extends Controller
{
    public function index(Project $project)
    {
        return response()->json(
          $project->issues()
            ->with([
              'creator:id,name,email',
              'assignee:id,name,email',
            ])
            ->orderBy('id','desc')
            ->get()
        );
    }

    public function store(Request $request, Project $project)
    {
        $data = $request->validate([
            'summary' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['nullable', 'in:task,bug,story'],
            'status' => ['nullable', 'in:todo,in_progress,done'],
            'priority' => ['nullable', 'in:low,medium,high'],
        ]);

        $nextNumber = Issue::where('project_id', $project->id)->count() + 1;
        $issueKey = $project->key . '-' . $nextNumber;

        $issue = Issue::create([
            'project_id' => $project->id,
            'key' => $issueKey,
            'summary' => $data['summary'],
            'description' => $data['description'] ?? null,
            'type' => $data['type'] ?? 'task',
            'status' => $data['status'] ?? 'todo',
            'priority' => $data['priority'] ?? 'medium',
            'created_by' => $request->user()->id,
            'assignee_id' => null,
        ]);

        return response()->json($issue, 201);
    }

    public function update(Request $request, Project $project, Issue $issue)
    {
        $issue = $project->issues()->whereKey($issue->getKey())->firstOrFail();

        $data = $request->validate([
            'status' => ['sometimes', 'in:todo,in_progress,done'],
            'summary' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'type' => ['sometimes', 'in:task,bug,story'],
            'priority' => ['sometimes', 'in:low,medium,high'],
            'assignee_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $issue->update($data);

        return response()->json($issue);
    }

    public function show(Project $project, Issue $issue)
    {
        $issue = $project->issues()
            ->with([
              'creator:id,name,email',
              'assignee:id,name,email',
            ])
            ->whereKey($issue->getKey())
            ->firstOrFail();
    
        return response()->json($issue);
    }


}
