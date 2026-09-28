<?php

namespace App\Services;

use App\Models\KnowledgeSource;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    protected KnowledgeSearchService $searchService;

    public function __construct(KnowledgeSearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    /**
     * Generate a response to a customer query using knowledge sources.
     * Falls back to keyword matching if no AI API key is configured.
     */
    public function generateResponse(string $query, int $businessId, array $conversationHistory = []): array
    {
        // Search knowledge base for relevant sources
        $searchResults = $this->searchService->searchSources($businessId, $query);
        
        // Check if query is a handoff request
        if ($this->isHandoffRequest($query)) {
            return [
                'content' => "Of course! I can connect you with our support team. To get you to the right person, could you briefly describe what you need help with? I'll also need your name and email to create a support request.",
                'sources' => [],
                'needs_handoff' => true,
            ];
        }

        // Try OpenAI if API key is configured
        $apiKey = config('services.openai.api_key');
        if (!empty($apiKey)) {
            try {
                return $this->generateWithOpenAI($query, $searchResults, $conversationHistory, $businessId, $apiKey);
            } catch (\Exception $e) {
                Log::error('OpenAI API error: ' . $e->getMessage());
                // Fall back to keyword matching
            }
        }

        // Fallback: compose answer from search results
        return $this->composeFromSearchResults($query, $searchResults);
    }

    /**
     * Check if the query is requesting human support.
     */
    protected function isHandoffRequest(string $query): bool
    {
        $handoffPhrases = [
            'speak to a person', 'talk to a person', 'talk to a human',
            'speak to a human', 'real person', 'human agent', 'live agent',
            'talk to someone', 'speak to someone', 'customer service',
            'speak to a representative', 'talk to support', 'human support',
            'can i speak', 'can i talk', 'live chat', 'real agent',
        ];
        $lowerQuery = strtolower($query);
        foreach ($handoffPhrases as $phrase) {
            if (str_contains($lowerQuery, $phrase)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generate response using OpenAI API.
     */
    protected function generateWithOpenAI(string $query, array $searchResults, array $conversationHistory, int $businessId, string $apiKey): array
    {
        $business = \App\Models\Business::find($businessId);
        $businessName = $business ? $business->name : 'our business';

        $contextParts = [];
        $sourceReferences = [];
        foreach ($searchResults as $result) {
            $contextParts[] = "--- Source: {$result['title']} (Type: {$result['type']}) ---\n{$result['content']}";
            $sourceReferences[] = ['title' => $result['title'], 'type' => $result['type']];
        }
        $context = implode("\n\n", $contextParts);

        $systemPrompt = "You are a helpful customer support assistant for {$businessName}. "
            . "Answer questions ONLY using the provided knowledge base content below. "
            . "Never invent prices, policies, product availability, or order details. "
            . "If the knowledge base doesn't contain the answer, honestly say you don't have that information and offer to connect the customer with a human agent. "
            . "Be friendly, concise, and professional. Use bullet points and formatting where helpful.\n\n"
            . "KNOWLEDGE BASE:\n{$context}";

        $messages = [['role' => 'system', 'content' => $systemPrompt]];
        
        // Add conversation history (last 10 messages)
        $recentHistory = array_slice($conversationHistory, -10);
        foreach ($recentHistory as $msg) {
            $role = $msg['role'] === 'customer' ? 'user' : 'assistant';
            $messages[] = ['role' => $role, 'content' => $msg['content']];
        }
        
        $messages[] = ['role' => 'user', 'content' => $query];

        $model = config('services.openai.model', 'gpt-4o-mini');

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$apiKey}",
            'Content-Type' => 'application/json',
        ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
            'model' => $model,
            'messages' => $messages,
            'max_tokens' => 500,
            'temperature' => 0.3,
        ]);

        if ($response->successful()) {
            $content = $response->json('choices.0.message.content', '');
            return [
                'content' => $content,
                'sources' => $sourceReferences,
                'needs_handoff' => false,
            ];
        }

        throw new \Exception('OpenAI API returned status: ' . $response->status());
    }

    /**
     * Compose answer from keyword search results (fallback when no AI API key).
     */
    protected function composeFromSearchResults(string $query, array $searchResults): array
    {
        if (empty($searchResults)) {
            return [
                'content' => "I don't have specific information about that in my knowledge base. Would you like me to connect you with a team member who can help?",
                'sources' => [],
                'needs_handoff' => false,
            ];
        }

        $bestMatch = $searchResults[0];
        $sourceReferences = array_map(fn($r) => ['title' => $r['title'], 'type' => $r['type']], $searchResults);

        return [
            'content' => $bestMatch['content'],
            'sources' => $sourceReferences,
            'needs_handoff' => false,
        ];
    }
}
