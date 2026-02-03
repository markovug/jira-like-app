<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Illuminate\Foundation\Configuration\Exceptions;
use Throwable;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminOnly::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // 1) Za API vraćaj JSON umjesto HTML
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });
    
        // 2) 422 - validacija
        $exceptions->render(function (ValidationException $e, Request $request) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        });
    
        // 3) 401 - nije ulogiran
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        });
    
        // 4) 403 - nema pravo
        $exceptions->render(function (AuthorizationException $e, Request $request) {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        });
    
        // 5) 404/405/429 i ostale HTTP greške
        $exceptions->render(function (HttpExceptionInterface $e, Request $request) {
            $status = $e->getStatusCode();
        
            $msg = $e->getMessage();
            if ($msg === '') {
                $msg = match ($status) {
                    404 => 'Not found',
                    405 => 'Method not allowed',
                    429 => 'Too many requests',
                    default => 'Request error',
                };
            }
        
            return response()->json(['message' => $msg], $status);
        });
    
        // 6) 500 fallback
        $exceptions->render(function (Throwable $e, Request $request) {
            $payload = ['message' => 'Server error'];
        
            if (config('app.debug')) {
                $payload['debug'] = [
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                ];
            }
        
            return response()->json($payload, 500);
        });
    })->create();
