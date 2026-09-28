<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KnowledgeSourceController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\WidgetController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\SettingsController;

Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:60,1');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:60,1');

Route::middleware('throttle:30,1')->group(function () {
    Route::get('/widget/{businessId}/config', [WidgetController::class, 'getConfig']);
    Route::post('/widget/{businessId}/conversations', [WidgetController::class, 'startConversation']);
    Route::post('/widget/{businessId}/conversations/{conversationId}/handoff', [WidgetController::class, 'requestHandoff']);
    Route::post('/widget/{businessId}/conversations/{conversationId}/feedback', [WidgetController::class, 'submitFeedback']);
});

Route::post('/widget/{businessId}/conversations/{conversationId}/messages', [WidgetController::class, 'sendMessage'])
    ->middleware('throttle:20,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    Route::apiResource('knowledge', KnowledgeSourceController::class);
    Route::post('/knowledge/test', [KnowledgeSourceController::class, 'test']);

    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::get('/conversations/{id}', [ConversationController::class, 'show']);
    Route::put('/conversations/{id}/status', [ConversationController::class, 'updateStatus']);
    Route::post('/conversations/{id}/messages', [ConversationController::class, 'addMessage']);
    Route::post('/conversations/{id}/notes', [ConversationController::class, 'addNote']);
    Route::post('/conversations/{id}/assign', [ConversationController::class, 'assign']);

    Route::get('/analytics/overview', [AnalyticsController::class, 'overview']);
    Route::get('/analytics/questions', [AnalyticsController::class, 'topQuestions']);
    Route::get('/analytics/unanswered', [AnalyticsController::class, 'unanswered']);
    Route::get('/analytics/feedback', [AnalyticsController::class, 'feedbackBreakdown']);

    Route::get('/settings/widget', [SettingsController::class, 'getWidgetConfig']);
    Route::put('/settings/widget', [SettingsController::class, 'updateWidgetConfig']);
    Route::get('/settings/team', [SettingsController::class, 'getTeam']);
    Route::post('/settings/team', [SettingsController::class, 'addTeamMember']);
    Route::delete('/settings/team/{id}', [SettingsController::class, 'removeTeamMember']);

    // Rules & Permissions (RBAC & AI Guardrails)
    Route::get('/rules', [SettingsController::class, 'getRules']);
    Route::post('/rules', [SettingsController::class, 'createRule']);
    Route::put('/rules/{id}', [SettingsController::class, 'updateRule']);
    Route::delete('/rules/{id}', [SettingsController::class, 'deleteRule']);
    Route::put('/permissions/{role}', [SettingsController::class, 'updatePermissions']);

    // Super Admin Routes (Protected by super_admin gate)
    Route::prefix('admin')->group(function () {
        Route::get('/tenants', [SettingsController::class, 'listTenants']);
        Route::put('/tenants/{id}', [SettingsController::class, 'updateTenant']);
    });
});
