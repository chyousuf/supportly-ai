<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KnowledgeSource;
use App\Services\KnowledgeSearchService;
use Illuminate\Http\Request;

class KnowledgeSourceController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->knowledgeSources();
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:faq,url,document',
            'title' => 'required|string',
            'content' => 'required_if:type,faq|string|nullable',
            'url' => 'required_if:type,url|url|nullable',
        ]);

        if ($request->file('document')) {
            $path = $request->file('document')->store('documents');
            $validated['file_path'] = $path;
            $validated['content'] = file_get_contents($request->file('document')->getRealPath());
        }

        $source = $request->user()->knowledgeSources()->create($validated);
        return response()->json($source, 201);
    }

    public function show(Request $request, $id)
    {
        $source = $request->user()->knowledgeSources()->findOrFail($id);
        return response()->json($source);
    }

    public function update(Request $request, $id)
    {
        $source = $request->user()->knowledgeSources()->findOrFail($id);
        $validated = $request->validate([
            'title' => 'sometimes|string',
            'content' => 'sometimes|string|nullable',
            'url' => 'sometimes|url|nullable',
            'status' => 'sometimes|in:active,processing,error',
        ]);
        $source->update($validated);
        return response()->json($source);
    }

    public function destroy(Request $request, $id)
    {
        $request->user()->knowledgeSources()->findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    public function test(Request $request, KnowledgeSearchService $searchService)
    {
        $request->validate(['question' => 'required|string']);
        $sources = $searchService->searchSources($request->user()->id, $request->question);
        $answer = $searchService->composeAnswer($sources, $request->question);
        return response()->json(['sources' => $sources, 'answer' => $answer]);
    }
}
