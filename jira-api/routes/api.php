<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\IssueController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\UserController;

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{project:key}', [ProjectController::class, 'show']);
    Route::get('/projects/{project:key}/issues', [IssueController::class, 'index']);
    Route::post('/projects/{project:key}/issues', [IssueController::class, 'store']);
    Route::patch('/projects/{project:key}/issues/{issue}', [IssueController::class, 'update'])->scopeBindings();
    Route::get('/projects/{project:key}/issues/{issue}', [IssueController::class, 'show'])->scopeBindings();
    Route::get('/users', [UserController::class, 'index']);
    
    // admin users CRUD
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::patch('/users/{user}', [AdminUserController::class, 'update']);
    });
});
