<?php

namespace App\Services;

use App\Models\KnowledgeSource;
use Illuminate\Support\Collection;

class KnowledgeSearchService
{
    /**
     * Stop words to filter from search queries.
     */
    protected array $stopWords = [
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'do', 'does', 'did',
        'what', 'how', 'can', 'could', 'would', 'should', 'i', 'my', 'your',
        'you', 'we', 'they', 'to', 'and', 'or', 'in', 'for', 'of', 'on',
        'at', 'it', 'its', 'this', 'that', 'with', 'from', 'by', 'as',
        'be', 'been', 'being', 'have', 'has', 'had', 'not', 'but', 'if',
        'about', 'me', 'him', 'her', 'them', 'our', 'their', 'will',
    ];

    /**
     * Search knowledge sources for a business by keyword matching.
     *
     * @return array Array of matching sources with scores
     */
    public function searchSources(int $businessId, string $query): array
    {
        $keywords = $this->extractKeywords($query);

        if (empty($keywords)) {
            return [];
        }

        $sources = KnowledgeSource::where('business_id', $businessId)
            ->where('status', 'active')
            ->get();

        $scored = [];
        foreach ($sources as $source) {
            $score = $this->calculateScore($source, $keywords);
            if ($score > 0) {
                $scored[] = [
                    'id' => $source->id,
                    'title' => $source->title,
                    'type' => $source->type,
                    'content' => $source->content,
                    'score' => $score,
                ];
            }
        }

        // Sort by score descending
        usort($scored, fn($a, $b) => $b['score'] <=> $a['score']);

        // Return top 3 matches
        return array_slice($scored, 0, 3);
    }

    /**
     * Extract meaningful keywords from a query string.
     */
    protected function extractKeywords(string $query): array
    {
        // Normalize: lowercase, remove punctuation
        $normalized = strtolower(preg_replace('/[^a-z0-9\s]/i', '', $query));
        
        // Split into words
        $words = preg_split('/\s+/', $normalized, -1, PREG_SPLIT_NO_EMPTY);
        
        // Filter stop words and short words
        $keywords = array_filter($words, function ($word) {
            return strlen($word) > 2 && !in_array($word, $this->stopWords);
        });

        return array_values($keywords);
    }

    /**
     * Calculate relevance score for a source against keywords.
     */
    protected function calculateScore(KnowledgeSource $source, array $keywords): int
    {
        $score = 0;
        $titleLower = strtolower($source->title);
        $contentLower = strtolower($source->content);

        foreach ($keywords as $keyword) {
            // Title matches worth 3 points
            if (str_contains($titleLower, $keyword)) {
                $score += 3;
            }
            // Content matches worth 1 point
            if (str_contains($contentLower, $keyword)) {
                $score += 1;
            }
        }

        return $score;
    }

    /**
     * Compose a simple answer from the best matching source.
     */
    public function composeAnswer(array $sources, string $query): string
    {
        if (empty($sources)) {
            return "I don't have specific information about that in my knowledge base. Would you like me to connect you with a team member who can help?";
        }

        return $sources[0]['content'];
    }
}
