<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Conversation;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class WidgetController extends Controller
{
    public function getConfig($businessId)
    {
        $business = Business::with('widgetConfig')->findOrFail($businessId);
        return response()->json($business->widgetConfig);
    }

    public function startConversation(Request $request, $businessId)
    {
        $business = Business::findOrFail($businessId);
        $conversation = $business->conversations()->create([
            'status' => 'ai_active',
            'channel' => 'widget'
        ]);
        return response()->json(['conversation_id' => $conversation->id]);
    }

    public function sendMessage(Request $request, $businessId, $conversationId, AIService $aiService)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000'
        ]);

        $business = Business::findOrFail($businessId);
        $conversation = $business->conversations()->findOrFail($conversationId);

        // Rate limiting check
        $key = 'widget_send_message:' . $conversation->id;
        if (RateLimiter::tooManyAttempts($key, 20)) {
            return response()->json(['message' => 'Too many messages sent. Please try again later.'], 429);
        }
        RateLimiter::hit($key, 60);

        try {
            $conversation->messages()->create([
                'role' => 'customer',
                'content' => $validated['content']
            ]);

            $history = $conversation->messages()->orderBy('created_at', 'asc')->get()->toArray();

            $aiResponse = $aiService->generateResponse($validated['content'], $business->id, $history);

            $assistantMessage = $conversation->messages()->create([
                'role' => 'assistant',
                'content' => $aiResponse['content'] ?? 'An error occurred.',
                'sources' => $aiResponse['sources'] ?? []
            ]);

            if (!empty($aiResponse['needs_handoff'])) {
                // If it needs handoff we can just return the message which already asks for info.
                // Status might be updated later if the user gives info.
            }

            $conversation->touch();
            return response()->json($assistantMessage);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred while generating the response.', 'error' => $e->getMessage()], 500);
        }
    }

    public function requestHandoff(Request $request, $businessId, $conversationId)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email'
        ]);

        $business = Business::findOrFail($businessId);
        $conversation = $business->conversations()->findOrFail($conversationId);

        $conversation->update([
            'customer_name' => $validated['name'],
            'customer_email' => $validated['email'],
            'status' => 'needs_human'
        ]);

        $conversation->messages()->create([
            'role' => 'system',
            'content' => 'Customer requested human handoff.'
        ]);

        return response()->json(['message' => 'Handoff requested']);
    }

    public function submitFeedback(Request $request, $businessId, $conversationId)
    {
        $validated = $request->validate([
            'message_id' => 'required|exists:messages,id',
            'rating' => 'required|in:helpful,unhelpful',
            'comment' => 'nullable|string'
        ]);

        $business = Business::findOrFail($businessId);
        $business->feedback()->create([
            'conversation_id' => $conversationId,
            'message_id' => $validated['message_id'],
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null
        ]);

        return response()->json(['message' => 'Feedback submitted']);
    }
}
