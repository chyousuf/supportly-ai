<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:businesses',
            'password' => 'required|string|min:8',
            'domain' => 'nullable|string',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $business = Business::create($validated);

        $business->widgetConfig()->create([
            'assistant_name' => 'AI Assistant',
            'brand_color' => '#4f46e5',
            'position' => 'right',
        ]);

        $token = $business->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $business,
            'token' => $token,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $business = Business::where('email', $request->email)->first();

        if (!$business || !Hash::check($request->password, $business->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $token = $business->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $business,
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'domain' => 'sometimes|nullable|string',
            'timezone' => 'sometimes|string',
            'logo_url' => 'sometimes|nullable|url',
        ]);

        $user->update($validated);
        return response()->json($user);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
