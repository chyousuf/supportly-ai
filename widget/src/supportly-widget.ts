// === TYPES ===
interface WidgetConfig {
  assistant_name: string;
  welcome_message: string;
  brand_color: string;
  position: 'left' | 'right';
  logo_url: string | null;
  suggested_questions: string[] | null;
  business_hours: {
    enabled: boolean;
    timezone: string;
    hours: Record<string, { open: string; close: string } | null>;
  } | null;
}

interface Message {
  id?: number;
  role: 'customer' | 'assistant' | 'system';
  content: string;
  sources?: { title: string; type: string }[] | null;
  created_at?: string;
}

// === WIDGET CLASS ===
class SupportlyWidget {
  private businessId: string;
  private apiBase: string;
  private config: WidgetConfig | null = null;
  private conversationId: string | null = null;
  private messages: Message[] = [];
  private isOpen: boolean = false;
  private isLoading: boolean = false;
  private container: HTMLDivElement;
  
  // DOM references
  private chatWindow: HTMLDivElement | null = null;
  private messagesContainer: HTMLDivElement | null = null;
  private inputField: HTMLInputElement | null = null;
  private inputArea: HTMLDivElement | null = null;
  private suggestedQuestionsContainer: HTMLDivElement | null = null;
  private fab: HTMLButtonElement | null = null;
  private unreadBadge: HTMLSpanElement | null = null;
  private unreadCount: number = 0;
  
  private typingIndicatorId: string | null = null;

  constructor(businessId: string, apiBase: string) {
    this.businessId = businessId;
    this.apiBase = apiBase.replace(/\/$/, ''); // Remove trailing slash
    
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'supportly-widget';
    document.body.appendChild(this.container);
    
    this.init();
  }

  private async init() {
    this.injectStyles();
    
    try {
      const response = await fetch(`${this.apiBase}/api/widget/${this.businessId}/config`);
      if (!response.ok) {
        throw new Error('Failed to load widget config');
      }
      const data = await response.json();
      this.config = data.data || data; // Handle depending on API response format
      
      // Load saved conversation
      const savedSession = sessionStorage.getItem(`supportly_session_${this.businessId}`);
      if (savedSession) {
        this.conversationId = savedSession;
      }

      this.buildUI();
    } catch (error) {
      console.error('Supportly Widget initialization failed:', error);
    }
  }

  private injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .supportly-widget * {
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      }
      
      .supportly-widget .su-fab {
        position: fixed;
        bottom: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background-color: var(--su-brand-color, #2563eb);
        color: white;
        border: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease, background-color 0.2s ease;
      }
      
      .supportly-widget .su-fab:hover {
        transform: scale(1.05);
      }
      
      .supportly-widget .su-fab.su-right { right: 24px; }
      .supportly-widget .su-fab.su-left { left: 24px; }
      
      .supportly-widget .su-fab-icon {
        width: 28px;
        height: 28px;
        fill: currentColor;
      }
      
      .supportly-widget .su-unread-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background-color: #ef4444;
        color: white;
        font-size: 12px;
        font-weight: bold;
        min-width: 20px;
        height: 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 6px;
        border: 2px solid white;
      }
      
      .supportly-widget .su-window {
        position: fixed;
        bottom: 96px;
        width: 380px;
        height: min(600px, calc(100vh - 120px));
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        z-index: 10001;
        overflow: hidden;
        border: 1px solid #e2e8f0;
        opacity: 0;
        pointer-events: none;
        transform: translateY(20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      
      .supportly-widget .su-window.su-right { right: 24px; transform-origin: bottom right; }
      .supportly-widget .su-window.su-left { left: 24px; transform-origin: bottom left; }
      
      .supportly-widget .su-window.su-open {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0);
      }
      
      .supportly-widget .su-header {
        background-color: var(--su-brand-color, #2563eb);
        color: white;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .supportly-widget .su-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .supportly-widget .su-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      
      .supportly-widget .su-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .supportly-widget .su-avatar-text {
        font-weight: bold;
        font-size: 16px;
      }
      
      .supportly-widget .su-header-title {
        font-weight: 600;
        font-size: 16px;
        line-height: 1.2;
      }
      
      .supportly-widget .su-header-subtitle {
        font-size: 12px;
        opacity: 0.9;
        margin-top: 2px;
      }
      
      .supportly-widget .su-close-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.2s;
      }
      
      .supportly-widget .su-close-btn:hover {
        opacity: 1;
      }
      
      .supportly-widget .su-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        background-color: #f8fafc;
        scroll-behavior: smooth;
      }
      
      .supportly-widget .su-msg-row {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      
      .supportly-widget .su-msg-row.su-customer {
        align-items: flex-end;
      }
      
      .supportly-widget .su-msg-row.su-assistant {
        align-items: flex-start;
      }
      
      .supportly-widget .su-msg-bubble {
        max-width: 85%;
        padding: 12px 16px;
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word;
      }
      
      .supportly-widget .su-customer .su-msg-bubble {
        background-color: var(--su-brand-color, #2563eb);
        color: white;
        border-radius: 16px 16px 4px 16px;
      }
      
      .supportly-widget .su-assistant .su-msg-bubble {
        background-color: white;
        color: #1e293b;
        border-radius: 16px 16px 16px 4px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }
      
      .supportly-widget .su-msg-bubble p {
        margin: 0 0 8px 0;
      }
      .supportly-widget .su-msg-bubble p:last-child {
        margin-bottom: 0;
      }
      .supportly-widget .su-msg-bubble ul, .supportly-widget .su-msg-bubble ol {
        margin: 0 0 8px 0;
        padding-left: 20px;
      }
      .supportly-widget .su-msg-bubble a {
        color: inherit;
        text-decoration: underline;
      }
      
      .supportly-widget .su-msg-sources {
        margin-top: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      
      .supportly-widget .su-source-badge {
        font-size: 11px;
        background-color: #f1f5f9;
        color: #64748b;
        padding: 2px 8px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      
      .supportly-widget .su-msg-actions {
        display: flex;
        gap: 8px;
        margin-top: 6px;
        padding-left: 4px;
      }
      
      .supportly-widget .su-feedback-btn {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      }
      
      .supportly-widget .su-feedback-btn:hover, .supportly-widget .su-feedback-btn.su-active {
        color: var(--su-brand-color, #2563eb);
      }
      
      .supportly-widget .su-suggestions {
        padding: 12px 16px;
        background-color: white;
        border-top: 1px solid #e2e8f0;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .supportly-widget .su-suggestion-chip {
        background-color: #f1f5f9;
        color: var(--su-brand-color, #2563eb);
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 6px 12px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
      }
      
      .supportly-widget .su-suggestion-chip:hover {
        background-color: #e2e8f0;
      }
      
      .supportly-widget .su-input-area {
        padding: 16px;
        background-color: white;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 12px;
        align-items: flex-end;
      }
      
      .supportly-widget .su-input {
        flex: 1;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 10px 14px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
        resize: none;
        max-height: 120px;
        overflow-y: auto;
        font-family: inherit;
        background-color: #f8fafc;
      }
      
      .supportly-widget .su-input:focus {
        border-color: var(--su-brand-color, #2563eb);
        background-color: white;
      }
      
      .supportly-widget .su-send-btn {
        background-color: var(--su-brand-color, #2563eb);
        color: white;
        border: none;
        border-radius: 12px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s, opacity 0.2s;
        flex-shrink: 0;
      }
      
      .supportly-widget .su-send-btn:hover {
        opacity: 0.9;
      }
      
      .supportly-widget .su-send-btn:disabled {
        background-color: #cbd5e1;
        cursor: not-allowed;
      }
      
      .supportly-widget .su-footer {
        text-align: center;
        padding: 0 0 12px 0;
        background-color: white;
      }
      
      .supportly-widget .su-footer-text {
        font-size: 11px;
        color: #94a3b8;
        text-decoration: none;
      }
      
      .supportly-widget .su-typing {
        display: flex;
        gap: 4px;
        padding: 4px;
      }
      
      .supportly-widget .su-dot {
        width: 6px;
        height: 6px;
        background-color: #94a3b8;
        border-radius: 50%;
        animation: su-bounce 1.4s infinite ease-in-out both;
      }
      
      .supportly-widget .su-dot:nth-child(1) { animation-delay: -0.32s; }
      .supportly-widget .su-dot:nth-child(2) { animation-delay: -0.16s; }
      
      @keyframes su-bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }

      /* Handoff Form Styles */
      .supportly-widget .su-handoff-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
      }
      
      .supportly-widget .su-handoff-title {
        font-weight: 600;
        font-size: 14px;
        color: #1e293b;
        margin: 0;
      }
      
      .supportly-widget .su-handoff-input {
        width: 100%;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 13px;
        outline: none;
      }
      
      .supportly-widget .su-handoff-input:focus {
        border-color: var(--su-brand-color, #2563eb);
      }
      
      .supportly-widget .su-handoff-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 4px;
      }
      
      .supportly-widget .su-btn {
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border: none;
      }
      
      .supportly-widget .su-btn-primary {
        background-color: var(--su-brand-color, #2563eb);
        color: white;
      }
      
      .supportly-widget .su-btn-secondary {
        background-color: #f1f5f9;
        color: #475569;
      }
      
      @media (max-width: 480px) {
        .supportly-widget .su-window {
          bottom: 0;
          right: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          max-height: 100vh;
          border-radius: 0;
          border: none;
        }
        .supportly-widget .su-header {
          border-radius: 0;
        }
      }
      
      @media (prefers-reduced-motion: reduce) {
        .supportly-widget .su-window {
          transition: none;
        }
        .supportly-widget .su-dot {
          animation: none;
        }
      }
    `;
    
    // Set CSS variable for brand color
    if (this.config && this.config.brand_color) {
      this.container.style.setProperty('--su-brand-color', this.config.brand_color);
    }
    
    document.head.appendChild(style);
  }

  private buildUI() {
    if (!this.config) return;
    
    const positionClass = this.config.position === 'left' ? 'su-left' : 'su-right';
    
    // FAB
    this.fab = document.createElement('button');
    this.fab.className = `su-fab ${positionClass}`;
    this.fab.setAttribute('aria-label', 'Open chat');
    this.fab.innerHTML = `
      <svg class="su-fab-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" />
      </svg>
    `;
    this.fab.addEventListener('click', () => this.toggleChat());
    
    this.unreadBadge = document.createElement('span');
    this.unreadBadge.className = 'su-unread-badge';
    this.unreadBadge.style.display = 'none';
    this.fab.appendChild(this.unreadBadge);
    
    this.container.appendChild(this.fab);
    
    // Chat Window
    this.chatWindow = document.createElement('div');
    this.chatWindow.className = `su-window ${positionClass}`;
    this.chatWindow.innerHTML = `
      <div class="su-header">
        <div class="su-header-info">
          <div class="su-avatar">
            ${this.config.logo_url ? `<img src="${this.config.logo_url}" alt="Assistant" />` : `<span class="su-avatar-text">${this.config.assistant_name.charAt(0)}</span>`}
          </div>
          <div>
            <div class="su-header-title">${this.escapeHTML(this.config.assistant_name)}</div>
            <div class="su-header-subtitle">AI Assistant</div>
          </div>
        </div>
        <button class="su-close-btn" aria-label="Close chat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="su-messages"></div>
      <div class="su-suggestions" style="display: none;"></div>
      <div class="su-input-area">
        <input type="text" class="su-input" placeholder="Type your message..." aria-label="Message input" />
        <button class="su-send-btn" aria-label="Send message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <div class="su-footer">
        <a href="https://supportly.ai" target="_blank" class="su-footer-text">Powered by Supportly AI</a>
      </div>
    `;
    
    this.container.appendChild(this.chatWindow);
    
    // Assign DOM references
    this.messagesContainer = this.chatWindow.querySelector('.su-messages');
    this.suggestedQuestionsContainer = this.chatWindow.querySelector('.su-suggestions');
    this.inputArea = this.chatWindow.querySelector('.su-input-area');
    this.inputField = this.chatWindow.querySelector('.su-input');
    const sendBtn = this.chatWindow.querySelector('.su-send-btn');
    const closeBtn = this.chatWindow.querySelector('.su-close-btn');
    
    // Bind events
    closeBtn?.addEventListener('click', () => this.toggleChat());
    sendBtn?.addEventListener('click', () => this.handleSend());
    this.inputField?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleSend();
      }
    });
    
    // Keyboard accessibility
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.toggleChat();
      }
    });
    
    // Populate suggestions
    if (this.config.suggested_questions && this.config.suggested_questions.length > 0) {
      this.suggestedQuestionsContainer!.style.display = 'flex';
      this.config.suggested_questions.forEach(q => {
        const chip = document.createElement('button');
        chip.className = 'su-suggestion-chip';
        chip.textContent = q;
        chip.addEventListener('click', () => {
          if (this.inputField) {
            this.inputField.value = q;
            this.handleSend();
          }
        });
        this.suggestedQuestionsContainer!.appendChild(chip);
      });
    }
  }

  private toggleChat() {
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      this.chatWindow?.classList.add('su-open');
      this.unreadCount = 0;
      this.updateUnreadBadge();
      
      // Start conversation if not already started
      if (!this.conversationId) {
        this.startConversation();
      }
      
      // Focus input
      setTimeout(() => {
        this.inputField?.focus();
      }, 100);
    } else {
      this.chatWindow?.classList.remove('su-open');
    }
  }

  private updateUnreadBadge() {
    if (!this.unreadBadge) return;
    
    if (this.unreadCount > 0 && !this.isOpen) {
      this.unreadBadge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount.toString();
      this.unreadBadge.style.display = 'flex';
    } else {
      this.unreadBadge.style.display = 'none';
    }
  }

  private async startConversation() {
    if (!this.config) return;

    try {
      // Show welcome message immediately locally
      this.addMessageToUI({
        role: 'assistant',
        content: this.config.welcome_message
      });

      // API Call to create conversation
      const response = await fetch(`${this.apiBase}/api/widget/${this.businessId}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          url: window.location.href,
          title: document.title
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const conv = data.data || data;
        this.conversationId = conv.id;
        sessionStorage.setItem(`supportly_session_${this.businessId}`, this.conversationId as string);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  }

  private async handleSend() {
    if (!this.inputField || this.isLoading) return;
    
    const text = this.inputField.value.trim();
    if (!text) return;
    
    // Clear input
    this.inputField.value = '';
    
    await this.sendMessage(text);
  }

  private async sendMessage(content: string) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    // Hide suggestions after first message
    if (this.suggestedQuestionsContainer) {
      this.suggestedQuestionsContainer.style.display = 'none';
    }
    
    // Add customer message
    this.addMessageToUI({ role: 'customer', content });
    
    // Show typing
    this.showTypingIndicator();
    
    try {
      // Check business hours if configured
      if (!this.isWithinBusinessHours()) {
        this.removeTypingIndicator();
        this.addMessageToUI({
          role: 'assistant',
          content: "We're currently outside of our business hours. Please leave your details and we'll get back to you soon."
        });
        this.showHandoffForm();
        this.isLoading = false;
        return;
      }
      
      // Ensure we have a conversation ID
      if (!this.conversationId) {
        await this.startConversation();
      }
      
      const response = await fetch(`${this.apiBase}/api/widget/${this.businessId}/conversations/${this.conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      
      this.removeTypingIndicator();
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      const msg = data.data || data;
      
      this.addMessageToUI({
        id: msg.id,
        role: 'assistant',
        content: msg.content,
        sources: msg.sources
      });
      
      // Check for handoff flag in response
      if (msg.handoff_requested) {
        this.showHandoffForm();
      }
      
      if (!this.isOpen) {
        this.unreadCount++;
        this.updateUnreadBadge();
      }
      
    } catch (error) {
      this.removeTypingIndicator();
      this.addMessageToUI({
        role: 'system',
        content: "Sorry, there was an error sending your message. Please try again."
      });
      console.error('Send error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private addMessageToUI(msg: Message) {
    if (!this.messagesContainer) return;
    
    this.messages.push(msg);
    
    const row = document.createElement('div');
    row.className = `su-msg-row su-${msg.role}`;
    
    let contentHtml = '';
    
    if (msg.role === 'system') {
      contentHtml = `<div style="font-size: 12px; color: #ef4444; margin: 8px 0; text-align: center;">${this.escapeHTML(msg.content)}</div>`;
    } else {
      const bubble = document.createElement('div');
      bubble.className = 'su-msg-bubble';
      bubble.innerHTML = this.renderMarkdown(msg.content);
      
      // Add sources if present
      if (msg.sources && msg.sources.length > 0) {
        const sourcesDiv = document.createElement('div');
        sourcesDiv.className = 'su-msg-sources';
        msg.sources.forEach((source, index) => {
          const badge = document.createElement('span');
          badge.className = 'su-source-badge';
          badge.textContent = `[${index + 1}] ${source.title}`;
          sourcesDiv.appendChild(badge);
        });
        bubble.appendChild(sourcesDiv);
      }
      
      row.appendChild(bubble);
      
      // Add feedback buttons for assistant messages
      if (msg.role === 'assistant' && msg.id) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'su-msg-actions';
        
        const upBtn = document.createElement('button');
        upBtn.className = 'su-feedback-btn';
        upBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`;
        upBtn.setAttribute('aria-label', 'Helpful');
        
        const downBtn = document.createElement('button');
        downBtn.className = 'su-feedback-btn';
        downBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>`;
        downBtn.setAttribute('aria-label', 'Unhelpful');
        
        upBtn.addEventListener('click', () => {
          this.submitFeedback(msg.id!, 'helpful');
          upBtn.classList.add('su-active');
          downBtn.disabled = true;
        });
        
        downBtn.addEventListener('click', () => {
          this.submitFeedback(msg.id!, 'unhelpful');
          downBtn.classList.add('su-active');
          upBtn.disabled = true;
        });
        
        actionsDiv.appendChild(upBtn);
        actionsDiv.appendChild(downBtn);
        row.appendChild(actionsDiv);
      }
    }
    
    if (msg.role === 'system') {
      row.innerHTML = contentHtml;
    }
    
    // Animation setup
    row.style.opacity = '0';
    row.style.transform = 'translateY(10px)';
    row.style.transition = 'opacity 0.3s, transform 0.3s';
    
    this.messagesContainer.appendChild(row);
    
    // Trigger animation
    requestAnimationFrame(() => {
      row.style.opacity = '1';
      row.style.transform = 'translateY(0)';
      this.scrollToBottom();
    });
  }

  private showTypingIndicator() {
    if (!this.messagesContainer) return;
    
    this.typingIndicatorId = 'typing-' + Date.now();
    
    const row = document.createElement('div');
    row.id = this.typingIndicatorId;
    row.className = 'su-msg-row su-assistant';
    
    const bubble = document.createElement('div');
    bubble.className = 'su-msg-bubble';
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'su-typing';
    typingDiv.innerHTML = `
      <div class="su-dot"></div>
      <div class="su-dot"></div>
      <div class="su-dot"></div>
    `;
    
    bubble.appendChild(typingDiv);
    row.appendChild(bubble);
    
    this.messagesContainer.appendChild(row);
    this.scrollToBottom();
  }

  private removeTypingIndicator() {
    if (!this.typingIndicatorId) return;
    const el = document.getElementById(this.typingIndicatorId);
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
    this.typingIndicatorId = null;
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  private async submitFeedback(messageId: number, rating: 'helpful' | 'unhelpful') {
    if (!this.conversationId) return;
    
    try {
      await fetch(`${this.apiBase}/api/widget/${this.businessId}/conversations/${this.conversationId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message_id: messageId, rating })
      });
    } catch (e) {
      console.error('Failed to submit feedback');
    }
  }

  private showHandoffForm() {
    if (!this.inputArea) return;
    
    // Save original input area content
    const originalInputHTML = this.inputArea.innerHTML;
    
    this.inputArea.innerHTML = '';
    this.inputArea.style.flexDirection = 'column';
    this.inputArea.style.alignItems = 'stretch';
    
    const form = document.createElement('form');
    form.className = 'su-handoff-form';
    
    form.innerHTML = `
      <h3 class="su-handoff-title">Connect with our team</h3>
      <input type="text" id="su-handoff-name" class="su-handoff-input" placeholder="Your Name" required />
      <input type="email" id="su-handoff-email" class="su-handoff-input" placeholder="Email Address" required />
      <textarea id="su-handoff-issue" class="su-handoff-input" placeholder="How can we help?" rows="3" required></textarea>
      <div class="su-handoff-actions">
        <button type="button" class="su-btn su-btn-secondary" id="su-handoff-cancel">Cancel</button>
        <button type="submit" class="su-btn su-btn-primary">Submit</button>
      </div>
    `;
    
    this.inputArea.appendChild(form);
    
    const cancelBtn = form.querySelector('#su-handoff-cancel');
    cancelBtn?.addEventListener('click', () => {
      this.restoreInputArea(originalInputHTML);
    });
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = (form.querySelector('#su-handoff-name') as HTMLInputElement).value;
      const email = (form.querySelector('#su-handoff-email') as HTMLInputElement).value;
      const issue = (form.querySelector('#su-handoff-issue') as HTMLTextAreaElement).value;
      
      const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;
      
      try {
        await fetch(`${this.apiBase}/api/widget/${this.businessId}/conversations/${this.conversationId}/handoff`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, issue })
        });
        
        this.addMessageToUI({
          role: 'system',
          content: 'Thank you! Your request has been sent to our team.'
        });
        
        this.restoreInputArea(originalInputHTML);
      } catch (err) {
        submitBtn.textContent = 'Submit';
        submitBtn.disabled = false;
        alert('Failed to submit. Please try again.');
      }
    });
    
    this.scrollToBottom();
  }
  
  private restoreInputArea(originalHTML: string) {
    if (!this.inputArea) return;
    
    this.inputArea.style.flexDirection = 'row';
    this.inputArea.style.alignItems = 'flex-end';
    this.inputArea.innerHTML = originalHTML;
    
    // Rebind events
    this.inputField = this.inputArea.querySelector('.su-input');
    const sendBtn = this.inputArea.querySelector('.su-send-btn');
    
    sendBtn?.addEventListener('click', () => this.handleSend());
    this.inputField?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleSend();
      }
    });
  }

  private isWithinBusinessHours(): boolean {
    if (!this.config?.business_hours?.enabled) return true;
    
    const { timezone, hours } = this.config.business_hours;
    if (!hours || Object.keys(hours).length === 0) return true;
    
    try {
      const now = new Date();
      
      // Get day of week in target timezone (0 = Sunday, 1 = Monday, etc.)
      const options = { timeZone: timezone, weekday: 'long' as const };
      const dayName = new Intl.DateTimeFormat('en-US', options).format(now).toLowerCase();
      
      const todayHours = hours[dayName];
      
      if (!todayHours || todayHours === null) return false; // Closed today
      
      // Get current time in target timezone
      const timeStr = now.toLocaleTimeString('en-US', { 
        timeZone: timezone, 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return timeStr >= todayHours.open && timeStr <= todayHours.close;
    } catch (e) {
      console.error('Error calculating business hours', e);
      return true; // Fallback to true if date parsing fails
    }
  }

  private escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private renderMarkdown(text: string): string {
    let html = this.escapeHTML(text);
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Links [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Bullet lists
    if (html.match(/^[\s]*[-•*]\s/m)) {
      const lines = html.split('\n');
      let inList = false;
      let newHtml = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/^[\s]*[-•*]\s(.*)/)) {
          if (!inList) {
            newHtml += '<ul>';
            inList = true;
          }
          newHtml += '<li>' + line.replace(/^[\s]*[-•*]\s(.*)/, '$1') + '</li>';
        } else {
          if (inList) {
            newHtml += '</ul>';
            inList = false;
          }
          newHtml += line + (i < lines.length - 1 ? '\n' : '');
        }
      }
      
      if (inList) {
        newHtml += '</ul>';
      }
      html = newHtml;
    }
    
    // Numbered lists
    if (html.match(/^[\s]*\d+\.\s/m)) {
      const lines = html.split('\n');
      let inList = false;
      let newHtml = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/^[\s]*\d+\.\s(.*)/)) {
          if (!inList) {
            newHtml += '<ol>';
            inList = true;
          }
          newHtml += '<li>' + line.replace(/^[\s]*\d+\.\s(.*)/, '$1') + '</li>';
        } else {
          if (inList) {
            newHtml += '</ol>';
            inList = false;
          }
          newHtml += line + (i < lines.length - 1 ? '\n' : '');
        }
      }
      
      if (inList) {
        newHtml += '</ol>';
      }
      html = newHtml;
    }
    
    // Newlines to <br> for non-list items
    html = html.replace(/\n/g, '<br/>');
    
    // Cleanup empty paragraphs or extra brs if needed
    html = html.replace(/<br\/><ul/g, '<ul');
    html = html.replace(/<br\/><ol/g, '<ol');
    html = html.replace(/<\/ul><br\/>/g, '</ul>');
    html = html.replace(/<\/ol><br\/>/g, '</ol>');
    
    return html;
  }
}

// === INITIALIZATION ===
(function() {
  // Find the script tag
  const scripts = document.getElementsByTagName('script');
  let currentScript: HTMLScriptElement | null = null;
  
  for (let i = scripts.length - 1; i >= 0; i--) {
    if (scripts[i].src && scripts[i].src.includes('supportly-widget')) {
      currentScript = scripts[i];
      break;
    }
  }
  
  if (!currentScript) {
    // Also try to find by data-business-id if name check fails
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].hasAttribute('data-business-id')) {
        currentScript = scripts[i];
        break;
      }
    }
    
    if (!currentScript) return;
  }
  
  const businessId = currentScript.getAttribute('data-business-id');
  if (!businessId) {
    console.error('Supportly Widget: data-business-id attribute is required');
    return;
  }
  
  // Determine API base from script src if possible, otherwise try dataset or default
  let apiBase = '';
  if (currentScript.src) {
    const scriptUrl = new URL(currentScript.src);
    apiBase = scriptUrl.origin;
  } else {
    apiBase = window.location.origin; // Fallback
  }
  
  // Allow override via data-api-base
  if (currentScript.hasAttribute('data-api-base')) {
    apiBase = currentScript.getAttribute('data-api-base') || apiBase;
  }
  
  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SupportlyWidget(businessId, apiBase));
  } else {
    new SupportlyWidget(businessId, apiBase);
  }
})();
