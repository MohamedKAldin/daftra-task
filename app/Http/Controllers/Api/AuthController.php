<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            // Enhanced validation rules
            $request->validate([
                'name' => [
                    'required',
                    'string',
                    'min:2',
                    'max:255',
                    'regex:/^[a-zA-Z\s]+$/' // Only letters and spaces
                ],
                'email' => [
                    'required',
                    'email',
                    'max:255',
                    'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
                    'unique:users,email'
                ],
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'
                ],
                'password_confirmation' => [
                    'required',
                    'string',
                    'same:password'
                ],
            ], [
                'name.required' => 'Name is required',
                'name.min' => 'Name must be at least 2 characters',
                'name.regex' => 'Name can only contain letters and spaces',
                'email.required' => 'Email is required',
                'email.email' => 'Please enter a valid email address',
                'email.unique' => 'This email is already registered',
                'email.regex' => 'Please enter a valid email format',
                'password.required' => 'Password is required',
                'password.min' => 'Password must be at least 8 characters',
                'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                'password_confirmation.required' => 'Password confirmation is required',
                'password_confirmation.same' => 'Password confirmation must match password'
            ]);

            // Sanitize input
            $name = filter_var($request->name, FILTER_SANITIZE_STRING);
            $email = filter_var($request->email, FILTER_SANITIZE_EMAIL);

            // Create user
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($request->password),
            ]);

            // Create token with expiration
            $token = $user->createToken('auth_token', ['*'], now()->addHours(24))->plainTextToken;

            // Log successful registration
            \Log::info('User registered successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'User registered successfully',
                'user' => $user,
                'token' => $token,
                'expires_in' => 86400 // 24 hours in seconds
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Registration failed', [
                'error' => $e->getMessage(),
                'ip' => $request->ip()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred during registration',
                'errors' => [
                    'general' => ['An unexpected error occurred. Please try again.']
                ]
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            // Enhanced validation rules
            $request->validate([
                'email' => [
                    'required',
                    'email',
                    'max:255',
                    'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
                    'exists:users,email'
                ],
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'
                ],
            ], [
                'email.required' => 'Email is required',
                'email.email' => 'Please enter a valid email address',
                'email.exists' => 'No account found with this email',
                'email.regex' => 'Please enter a valid email format',
                'password.required' => 'Password is required',
                'password.min' => 'Password must be at least 8 characters',
                'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            ]);

            // Sanitize input
            $email = filter_var($request->email, FILTER_SANITIZE_EMAIL);
            $password = $request->password;

            // Check for failed login attempts
            $key = 'login_attempts_' . $request->ip();
            $attempts = cache()->get($key, 0);

            if ($attempts >= 5) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Too many login attempts. Please try again later.',
                    'retry_after' => cache()->ttl($key)
                ], 429);
            }

            // Attempt authentication
            if (!Auth::attempt(['email' => $email, 'password' => $password])) {
                // Increment failed attempts
                cache()->put($key, $attempts + 1, now()->addMinutes(30));
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid credentials',
                    'errors' => [
                        'email' => ['The provided credentials are incorrect.'],
                        'password' => ['The provided credentials are incorrect.']
                    ]
                ], 422);
            }

            // Clear failed attempts on successful login
            cache()->forget($key);

            // Get user and create token
            $user = User::where('email', $email)->firstOrFail();
            
            // Revoke existing tokens
            $user->tokens()->delete();
            
            // Create new token with expiration
            $token = $user->createToken('auth_token', ['*'], now()->addHours(24))->plainTextToken;

            // Log successful login
            \Log::info('User logged in successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Logged in successfully',
                'user' => $user,
                'token' => $token,
                'expires_in' => 86400 // 24 hours in seconds
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred during login',
                'errors' => [
                    'general' => ['An unexpected error occurred. Please try again.']
                ]
            ], 500);
        }
    }

    public function user(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'user' => $request->user()
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ]);
    }
} 