<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index()
    {
        return Project::query()
            ->orderBy('name')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'key'  => ['required', 'string', 'max:20', 'regex:/^[A-Z][A-Z0-9_]*$/'],
            'description' => ['nullable', 'string'],
        ]);

        $data['key'] = strtoupper($data['key']);

        $project = Project::create($data);

        return response()->json($project, 201);
    }

    public function show(Project $project)
    {
        return response()->json($project);
    }
}
