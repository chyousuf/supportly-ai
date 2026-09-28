<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->renderable(function (Throwable $e, $request) {
            if ($request->wantsJson() || $request->is('api/*')) {
                if ($e instanceof ValidationException) {
                    return response()->json([
                        'message' => $e->getMessage(),
                        'errors' => $e->errors(),
                    ], 422);
                }
                
                if ($e instanceof AuthenticationException) {
                    return response()->json([
                        'message' => 'Unauthenticated.'
                    ], 401);
                }
                
                return response()->json([
                    'message' => $e->getMessage()
                ], method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500);
            }
        });
    }
}
