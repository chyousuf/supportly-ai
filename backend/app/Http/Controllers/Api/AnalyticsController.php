<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function overview(Request $request)
    {
        $business = $request->user();
        
        $totalConversations = $business->conversations()->count();
        
        $totalMessages = DB::table('messages')
            ->join('conversations', 'messages.conversation_id', '=', 'conversations.id')
            ->where('conversations.business_id', $business->id)
            ->count();

        $aiAnswered = $business->conversations()
            ->whereNotIn('status', ['needs_human', 'human_active'])
            ->count();

        $humanHandoffs = $business->conversations()
            ->whereIn('status', ['needs_human', 'human_active'])
            ->count();

        $feedback = $business->feedback()->select('rating', DB::raw('count(*) as count'))->groupBy('rating')->pluck('count', 'rating');
        $helpful = $feedback['helpful'] ?? 0;
        $unhelpful = $feedback['unhelpful'] ?? 0;
        $totalF = $helpful + $unhelpful;
        $avgSatisfaction = $totalF > 0 ? ($helpful / $totalF) * 100 : 0;

        $conversationsByDay = $business->conversations()
            ->where('created_at', '>=', now()->subDays(30))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->get();

        $recentConversations = $business->conversations()
            ->with(['messages' => function($q) {
                $q->latest()->limit(1);
            }])
            ->latest('updated_at')
            ->limit(5)
            ->get();

        return response()->json([
            'total_conversations' => $totalConversations,
            'total_messages' => $totalMessages,
            'ai_answered' => $aiAnswered,
            'human_handoffs' => $humanHandoffs,
            'avg_satisfaction' => $avgSatisfaction,
            'conversations_by_day' => $conversationsByDay,
            'recent_conversations' => $recentConversations,
        ]);
    }

    public function topQuestions(Request $request)
    {
        return response()->json([]); // Simplified for this scope
    }

    public function unanswered(Request $request)
    {
        $business = $request->user();
        $unanswered = DB::table('messages')
            ->join('conversations', 'messages.conversation_id', '=', 'conversations.id')
            ->where('conversations.business_id', $business->id)
            ->where('messages.role', 'assistant')
            ->where('messages.content', 'like', "%don't have specific information%")
            ->get();
        return response()->json($unanswered);
    }

    public function feedbackBreakdown(Request $request)
    {
        $business = $request->user();
        $breakdown = $business->feedback()
            ->select('rating', DB::raw('count(*) as count'))
            ->groupBy('rating')
            ->get();
        return response()->json($breakdown);
    }
}
