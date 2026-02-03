<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    public function index()
    {
        return response()->json(
            User::query()->select('id','name','email','role','created_at')->orderBy('id','desc')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['required','email','max:255','unique:users,email'],
            'password' => ['required','string','min:6'],
            'role' => ['required','in:admin,user'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            'password' => Hash::make($data['password']),
        ]);

        return response()->json($user->only('id','name','email','role','created_at'), 201);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'role' => ['sometimes','required','in:admin,user'],
            'name' => ['sometimes','required','string','max:255'],
            'password' => ['sometimes','required','string','min:6'],
        ]);

        if (array_key_exists('password', $data)) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json($user->only('id','name','email','role','created_at'));
    }
}
