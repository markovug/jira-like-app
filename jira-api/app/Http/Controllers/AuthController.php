<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($data)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        // da promijeni session id nakon login-a
        $request->session()->regenerate();

        return response()->json(['message' => 'ok']);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        // da invalidira session i token nakon logouta
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'ok']);
    }
}
