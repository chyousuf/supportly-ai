<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SettingsController extends Controller
{
    public function getWidgetConfig(Request $request)
    {
        return response()->json($request->user()->widgetConfig);
    }

    public function updateWidgetConfig(Request $request)
    {
        $validated = $request->validate([
            'assistant_name' => 'sometimes|string',
            'welcome_message' => 'sometimes|nullable|string',
            'brand_color' => 'sometimes|string',
            'position' => 'sometimes|in:left,right',
            'logo_url' => 'sometimes|nullable|url',
            'suggested_questions' => 'sometimes|array',
            'business_hours' => 'sometimes|array',
        ]);

        $config = $request->user()->widgetConfig;
        if ($config) {
            $config->update($validated);
        } else {
            $request->user()->widgetConfig()->create($validated);
            $config = $request->user()->widgetConfig;
        }

        return response()->json($config);
    }

    public function getTeam(Request $request)
    {
        return response()->json($request->user()->teamMembers);
    }

    public function addTeamMember(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:team_members',
            'role' => 'required|in:admin,agent',
            'password' => 'required|string|min:8',
        ]);
        
        $validated['password'] = Hash::make($validated['password']);
        $member = $request->user()->teamMembers()->create($validated);
        
        return response()->json($member, 201);
    }

    public function removeTeamMember(Request $request, $id)
    {
        $request->user()->teamMembers()->findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
