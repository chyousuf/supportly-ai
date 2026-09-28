export interface Business {
  id: number;
  name: string;
  email: string;
  domain: string;
  logo_url: string | null;
  timezone: string;
  created_at: string;
}

export interface AuthResponse {
  user: Business;
  token: string;
}

export interface KnowledgeSource {
  id: number;
  business_id: number;
  type: 'faq' | 'url' | 'document';
  title: string;
  content: string;
  url: string | null;
  file_path: string | null;
  status: 'active' | 'processing' | 'error';
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  business_id: number;
  customer_name: string | null;
  customer_email: string | null;
  status: 'ai_active' | 'needs_human' | 'human_active' | 'closed';
  channel: string;
  assigned_to: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  messages?: Message[];
  latest_message?: Message;
}

export interface Message {
  id: number;
  conversation_id: string;
  role: 'customer' | 'assistant' | 'agent' | 'system';
  content: string;
  sources: SourceReference[] | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface SourceReference {
  title: string;
  type: string;
}

export interface Feedback {
  id: number;
  message_id: number | null;
  conversation_id: string;
  business_id: number;
  rating: 'helpful' | 'unhelpful';
  comment: string | null;
  created_at: string;
}

export interface TeamMember {
  id: number;
  business_id: number;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  created_at: string;
}

export interface WidgetConfig {
  id: number;
  business_id: number;
  assistant_name: string;
  welcome_message: string;
  brand_color: string;
  position: 'left' | 'right';
  logo_url: string | null;
  suggested_questions: string[] | null;
  business_hours: BusinessHours | null;
}

export interface BusinessHours {
  enabled: boolean;
  timezone: string;
  hours: Record<string, { open: string; close: string } | null>;
}

export interface AnalyticsOverview {
  total_conversations: number;
  total_messages: number;
  ai_answered: number;
  human_handoffs: number;
  avg_satisfaction: number;
  conversations_by_day: { date: string; count: number }[];
  recent_conversations: Conversation[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export type UserRole = 'super_admin' | 'admin' | 'agent' | 'viewer';

export interface AIRule {
  id: number;
  business_id: number;
  name: string;
  category: 'guardrail' | 'policy' | 'routing' | 'compliance';
  description: string;
  prompt_directive: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionDefinition {
  id: string;
  name: string;
  description: string;
  category: 'Knowledge' | 'Inbox' | 'Settings' | 'Team' | 'System';
}

export interface RolePermissions {
  role: UserRole;
  displayName: string;
  description: string;
  permissions: string[];
}

export interface Tenant {
  id: number;
  name: string;
  email: string;
  domain: string;
  plan: 'Starter' | 'Growth' | 'Business' | 'Enterprise';
  status: 'active' | 'suspended';
  conversations_count: number;
  sources_count: number;
  monthly_messages: number;
  message_limit: number;
  created_at: string;
}

