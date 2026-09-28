<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->conversations()->orderBy('updated_at', 'desc');

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('customer_name', 'like', '%' . $request->search . '%')
                  ->orWhere('customer_email', 'like', '%' . $request->search . '%');
            });
        }
        return response()->json($query->paginate(15));
    }

    public function show(Request $request, $id)
    {
        $conversation = $request->user()->conversations()->with(['messages' => function($q) {
            $q->orderBy('created_at', 'asc');
        }])->findOrFail($id);
        return response()->json($conversation);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:ai_active,needs_human,human_active,closed'
        ]);

        $conversation = $request->user()->conversations()->findOrFail($id);
        $conversation->update(['status' => $validated['status']]);

        if ($validated['status'] === 'human_active') {
            $conversation->messages()->create([
                'role' => 'system',
                'content' => 'Human agent has taken over this conversation.'
            ]);
        }

        return response()->json($conversation);
    }

    public function addMessage(Request $request, $id)
    {
        $validated = $request->validate([
            'content' => 'required|string'
        ]);

        $conversation = $request->user()->conversations()->findOrFail($id);
        $message = $conversation->messages()->create([
            'role' => 'agent',
            'content' => $validated['content']
        ]);
        $conversation->touch();

        return response()->json($message);
    }

    public function addNote(Request $request, $id)
    {
        $validated = $request->validate([
            'content' => 'required|string'
        ]);

        $conversation = $request->user()->conversations()->findOrFail($id);
        $message = $conversation->messages()->create([
            'role' => 'system',
            'content' => $validated['content'],
            'metadata' => ['type' => 'note']
        ]);

        return response()->json($message);
    }

    public function assign(Request $request, $id)
    {
        $validated = $request->validate([
            'team_member_id' => 'required|exists:team_members,id'
        ]);

        $conversation = $request->user()->conversations()->findOrFail($id);
        $conversation->update(['assigned_to' => $validated['team_member_id']]);

        return response()->json($conversation);
    }
}
