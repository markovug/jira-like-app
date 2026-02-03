<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Auth;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::get('/whoami', function () {
    return response()->json([
        'auth_check' => Auth::check(),
        'user' => Auth::user(),
    ]);
});
