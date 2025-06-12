<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApiTokenIsValid
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->bearerToken()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. No token provided.'
            ], 401);
        }

        return $next($request);
    }
} 